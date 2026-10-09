import 'dotenv/config';
import mongoose from 'mongoose';
import Project from './models/Project.js';
import { projects } from '../shared/projects.js';

if (!process.env.MONGODB_URI) {
  console.error('Set MONGODB_URI in .env before seeding.');
  process.exit(1);
}
try {
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    ...(process.env.MONGODB_DB_NAME ? { dbName: process.env.MONGODB_DB_NAME } : {}),
  });
  // Non-destructive, repeatable seeding. No deleteMany: other projects are kept.
  for (const project of projects) {
    await Project.updateOne(
      { slug: project.slug },
      { $set: project },
      { upsert: true, runValidators: true },
    );
  }
  console.log(`Upserted ${projects.length} projects. Existing unrelated projects were preserved.`);
} catch (error) {
  console.error('Seed failed. Check MongoDB configuration and document validation.');
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
