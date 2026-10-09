import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ZodError } from 'zod';
import Project from './models/Project.js';
import Message from './models/Message.js';
import { projects as demoProjects } from '../shared/projects.js';
import { projectInput, contactInput } from './lib/validation.js';
import { adminEnabled, passwordMatches, createToken, requireAdmin } from './lib/auth.js';
import { notifyContact } from './lib/mail.js';

export function createApp() {
  const app = express();
  const configured = Boolean(process.env.MONGODB_URI);
  const isConnected = () => mongoose.connection.readyState === 1;
  if (process.env.TRUST_PROXY === 'true') app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          fontSrc: ["'self'"],
          connectSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: null,
          upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
        },
      },
      // Allows the Arena preview to embed the site. No admin auth cookies are used.
      frameguard: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  const origins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim());
  app.use(
    cors((req, callback) => {
      const origin = req.get('origin');
      let sameOrigin = false;
      try {
        const parsed = new URL(origin);
        sameOrigin =
          ['http:', 'https:'].includes(parsed.protocol) && parsed.host === req.get('host');
      } catch {}
      const previewOrigin =
        process.env.NODE_ENV !== 'production' &&
        /^https:\/\/\d+-[a-zA-Z0-9-]+\.e2b\.app$/.test(origin || '');
      if (!origin || sameOrigin || origins.includes(origin) || previewOrigin)
        return callback(null, { origin: origin || false });
      callback(new Error('This origin is not allowed. Add it to CLIENT_ORIGIN.'));
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: '48kb' }));
  const limiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many requests. Please try again in a minute.' },
  });
  app.use('/api', limiter);
  const asyncRoute = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
  const databaseGuard = (req, res, next) => {
    if (!configured)
      return res
        .status(503)
        .json({
          error: 'MongoDB is not configured. Add MONGODB_URI to .env and restart the server.',
        });
    if (!isConnected())
      return res
        .status(503)
        .json({ error: 'The database is temporarily unavailable. Please try again later.' });
    next();
  };

  app.get('/api/health', (req, res) =>
    res.json({
      status: configured && !isConnected() ? 'degraded' : 'ok',
      database: isConnected() ? 'connected' : configured ? 'unavailable' : 'demo',
      adminEnabled: adminEnabled(),
    }),
  );
  app.get(
    '/api/projects',
    asyncRoute(async (req, res) => {
      if (configured && !isConnected())
        return res.status(503).json({ error: 'Projects are temporarily unavailable.' });
      const allowed = ['fullstack', 'backend', 'frontend', 'design'];
      const category = allowed.includes(req.query.category) ? req.query.category : null;
      const query = {};
      if (category) query.category = category;
      if (req.query.featured === 'true') query.featured = true;
      const result = isConnected()
        ? await Project.find(query).sort({ order: 1, createdAt: -1 }).lean()
        : demoProjects
            .filter(
              (p) =>
                (!category || p.category === category) &&
                (req.query.featured !== 'true' || p.featured),
            )
            .sort((a, b) => a.order - b.order);
      res.json({ projects: result, source: isConnected() ? 'mongodb' : 'demo' });
    }),
  );
  app.get(
    '/api/projects/:slug',
    asyncRoute(async (req, res) => {
      if (!/^[a-z0-9-]{2,120}$/.test(req.params.slug))
        return res.status(400).json({ error: 'Invalid project slug.' });
      if (configured && !isConnected())
        return res.status(503).json({ error: 'Projects are temporarily unavailable.' });
      const item = isConnected()
        ? await Project.findOne({ slug: req.params.slug }).lean()
        : demoProjects.find((p) => p.slug === req.params.slug);
      if (!item) return res.status(404).json({ error: 'Project not found.' });
      res.json({ project: item });
    }),
  );

  const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'You have sent several messages. Please try again in 15 minutes.' },
  });
  app.post(
    '/api/contact',
    contactLimiter,
    databaseGuard,
    asyncRoute(async (req, res) => {
      const data = contactInput.parse(req.body);
      const saved = await Message.create({
        name: data.name,
        email: data.email,
        interest: data.interest,
        message: data.message,
      });
      // Saving to MongoDB is the source of truth; optional email delivery never hides a saved inquiry.
      notifyContact(data).catch(() =>
        console.error('Email notification failed. Inquiry is safely stored in MongoDB.'),
      );
      res
        .status(201)
        .json({
          message: 'Your message is in my inbox. Thank you for reaching out!',
          id: saved._id,
        });
    }),
  );

  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 8,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many login attempts. Try again in 15 minutes.' },
  });
  app.post('/api/admin/login', loginLimiter, (req, res) => {
    if (!adminEnabled())
      return res
        .status(503)
        .json({
          error:
            'Admin is disabled. Configure ADMIN_PASSWORD (12+ characters) and JWT_SECRET (32+ characters) on the server.',
        });
    if (
      typeof req.body.password !== 'string' ||
      req.body.password.length > 256 ||
      !passwordMatches(req.body.password)
    )
      return res.status(401).json({ error: 'That password is not correct.' });
    res.json({ token: createToken(), expiresIn: 7200 });
  });
  app.get('/api/admin/me', requireAdmin, (req, res) => res.json({ role: 'admin' }));
  app.post(
    '/api/admin/projects',
    requireAdmin,
    databaseGuard,
    asyncRoute(async (req, res) => {
      const project = await Project.create(projectInput.parse(req.body));
      res.status(201).json({ project });
    }),
  );
  app.put(
    '/api/admin/projects/:id',
    requireAdmin,
    databaseGuard,
    asyncRoute(async (req, res) => {
      if (!mongoose.isValidObjectId(req.params.id))
        return res.status(400).json({ error: 'Invalid project ID.' });
      const project = await Project.findByIdAndUpdate(req.params.id, projectInput.parse(req.body), {
        new: true,
        runValidators: true,
      });
      if (!project) return res.status(404).json({ error: 'Project not found.' });
      res.json({ project });
    }),
  );
  app.delete(
    '/api/admin/projects/:id',
    requireAdmin,
    databaseGuard,
    asyncRoute(async (req, res) => {
      if (!mongoose.isValidObjectId(req.params.id))
        return res.status(400).json({ error: 'Invalid project ID.' });
      const project = await Project.findByIdAndDelete(req.params.id);
      if (!project) return res.status(404).json({ error: 'Project not found.' });
      res.json({ message: 'Project deleted.' });
    }),
  );
  app.get(
    '/api/admin/messages',
    requireAdmin,
    databaseGuard,
    asyncRoute(async (req, res) => {
      res.json({ messages: await Message.find().sort({ createdAt: -1 }).limit(200).lean() });
    }),
  );
  app.patch(
    '/api/admin/messages/:id',
    requireAdmin,
    databaseGuard,
    asyncRoute(async (req, res) => {
      if (!mongoose.isValidObjectId(req.params.id))
        return res.status(400).json({ error: 'Invalid message ID.' });
      if (typeof req.body.read !== 'boolean')
        return res.status(400).json({ error: 'read must be a boolean.' });
      const message = await Message.findByIdAndUpdate(
        req.params.id,
        { read: req.body.read },
        { new: true },
      );
      if (!message) return res.status(404).json({ error: 'Message not found.' });
      res.json({ message });
    }),
  );
  app.delete(
    '/api/admin/messages/:id',
    requireAdmin,
    databaseGuard,
    asyncRoute(async (req, res) => {
      if (!mongoose.isValidObjectId(req.params.id))
        return res.status(400).json({ error: 'Invalid message ID.' });
      const message = await Message.findByIdAndDelete(req.params.id);
      if (!message) return res.status(404).json({ error: 'Message not found.' });
      res.json({ message: 'Message deleted.' });
    }),
  );
  app.use('/api', (req, res) => res.status(404).json({ error: 'API endpoint not found.' }));

  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../client/dist');
  if (existsSync(root)) {
    app.use(express.static(root, { maxAge: '1h' }));
    app.get('*', (req, res) => res.sendFile(path.join(root, 'index.html')));
  } else {
    app.get('/', (req, res) =>
      res.json({
        message:
          'API is running. Frontend development: http://localhost:5173. For production run npm run build first.',
      }),
    );
  }
  app.use((err, req, res, next) => {
    if (err instanceof ZodError)
      return res
        .status(400)
        .json({
          error: err.issues[0]?.message || 'Invalid input.',
          fields: err.flatten().fieldErrors,
        });
    if (err.code === 11000)
      return res.status(409).json({ error: 'That slug is already used by another project.' });
    if (err.type === 'entity.parse.failed')
      return res.status(400).json({ error: 'Invalid JSON body.' });
    if (err.type === 'entity.too.large')
      return res.status(413).json({ error: 'Request is too large.' });
    if (err.message?.includes('origin is not allowed'))
      return res.status(403).json({ error: err.message });
    console.error('Request failed:', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  });
  return app;
}
