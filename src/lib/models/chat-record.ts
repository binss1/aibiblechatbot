import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ChatRecordDocument extends Document {
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  verses?: Array<{ book: string; chapter: number; verse: number; text?: string }>; // optional attached verses
  createdAt: Date;
  embeddings?: number[];
  prayer?: string;
}

const chatRecordSchema = new Schema<ChatRecordDocument>(
  {
    sessionId: { type: String, required: true, index: true },
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, required: true },
    verses: [
      {
        book: { type: String, required: true },
        chapter: { type: Number, required: true },
        verse: { type: Number, required: true },
        text: { type: String },
        _id: false,
      },
    ],
    embeddings: { type: [Number], default: undefined },
    prayer: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

chatRecordSchema.index({ sessionId: 1, createdAt: 1 });
chatRecordSchema.index({ 'verses.book': 1, 'verses.chapter': 1, 'verses.verse': 1 });

export const ChatRecord: Model<ChatRecordDocument> =
  (mongoose.models.ChatRecord as Model<ChatRecordDocument>) ||
  mongoose.model<ChatRecordDocument>('ChatRecord', chatRecordSchema);


