import mongoose from 'mongoose';
const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, maxlength: 100 },
    email: { type: String, required: true, maxlength: 254 },
    interest: { type: String, maxlength: 80 },
    message: { type: String, required: true, maxlength: 5000 },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);
export default mongoose.model('Message', schema);
