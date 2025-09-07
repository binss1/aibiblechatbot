import mongoose, { Schema, Document, Model } from 'mongoose';

export interface SessionDocument extends Document {
  sessionId: string;
  createdAt: Date;
  updatedAt: Date;
  userAgent?: string;
  locale?: string;
}

const sessionSchema = new Schema<SessionDocument>(
  {
    sessionId: { type: String, required: true, index: true, unique: true },
    userAgent: { type: String },
    locale: { type: String },
  },
  { timestamps: true },
);

export const Session: Model<SessionDocument> =
  (mongoose.models.Session as Model<SessionDocument>) ||
  mongoose.model<SessionDocument>('Session', sessionSchema);
