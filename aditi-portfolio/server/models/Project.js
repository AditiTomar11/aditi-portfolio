import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    summary: { type: String, required: true, maxlength: 700 },
    highlights: [{ type: String, maxlength: 300 }],
    stack: [{ type: String, maxlength: 60 }],
    category: {
      type: String,
      enum: ['fullstack', 'backend', 'frontend', 'design'],
      default: 'fullstack',
    },
    liveUrl: { type: String, default: '' },
    repoUrl: { type: String, default: '' },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 99, min: 0 },
    // Optional. Existing documents don't need this field; built-in artwork is the fallback.
    imageUrl: { type: String, default: '' },
  },
  { timestamps: true, collection: process.env.PROJECT_COLLECTION || 'projects' },
);
projectSchema.index({ order: 1, createdAt: -1 });
export default mongoose.model('Project', projectSchema);
