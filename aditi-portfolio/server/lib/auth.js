import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
export function adminEnabled() {
  return (
    (process.env.ADMIN_PASSWORD?.length || 0) >= 12 && (process.env.JWT_SECRET?.length || 0) >= 32
  );
}
export function passwordMatches(input = '') {
  if (!adminEnabled()) return false;
  const a = crypto.createHash('sha256').update(String(input)).digest();
  const b = crypto.createHash('sha256').update(process.env.ADMIN_PASSWORD).digest();
  return crypto.timingSafeEqual(a, b);
}
export function createToken() {
  return jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, {
    expiresIn: '2h',
    issuer: 'aditi-portfolio',
    audience: 'portfolio-admin',
    algorithm: 'HS256',
  });
}
export function requireAdmin(req, res, next) {
  if (!adminEnabled())
    return res
      .status(503)
      .json({
        error:
          'Admin access is not configured. Set a strong ADMIN_PASSWORD and JWT_SECRET on the server.',
      });
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : '';
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: 'aditi-portfolio',
      audience: 'portfolio-admin',
    });
    if (payload.role !== 'admin') throw new Error('Forbidden');
    next();
  } catch {
    res
      .status(401)
      .json({ error: 'Please sign in again. Your admin session is missing or expired.' });
  }
}
