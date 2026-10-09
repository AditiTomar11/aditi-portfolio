import 'dotenv/config';
import mongoose from 'mongoose';
import { createApp } from './app.js';

mongoose.set('bufferCommands', false);
const port = Number(process.env.PORT || 3001);
if (process.env.MONGODB_URI) {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      ...(process.env.MONGODB_DB_NAME ? { dbName: process.env.MONGODB_DB_NAME } : {}),
    });
    console.log('MongoDB connected. Using your existing projects collection.');
  } catch {
    console.error(
      'MongoDB connection failed. Check your URI, database name and Atlas network access. Credentials are not logged.',
    );
  }
} else {
  console.log(
    'Demo mode: no MongoDB URI. Seeded project previews are available; contact saving and admin writes are disabled.',
  );
}
const server = createApp().listen(port, '0.0.0.0', () =>
  console.log(`Portfolio API / production website listening on port ${port}`),
);
async function shutdown() {
  server.close();
  await mongoose.disconnect();
  process.exit(0);
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
