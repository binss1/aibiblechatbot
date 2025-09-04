import mongoose, { Schema, Document, Model } from 'mongoose';

export interface BibleVerseDocument extends Document {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  translation: string;
  embeddings?: number[];
  createdAt: Date;
  updatedAt: Date;
}

const bibleVerseSchema = new Schema<BibleVerseDocument>(
  {
    book: { type: String, required: true, index: true },
    chapter: { type: Number, required: true, index: true },
    verse: { type: Number, required: true, index: true },
    text: { type: String, required: true },
    translation: { type: String, required: true, default: '개역개정' },
    embeddings: { type: [Number], default: undefined },
  },
  { timestamps: true },
);

// 복합 인덱스
bibleVerseSchema.index({ book: 1, chapter: 1, verse: 1 });
bibleVerseSchema.index({ translation: 1, book: 1, chapter: 1, verse: 1 });

export const BibleVerse: Model<BibleVerseDocument> =
  (mongoose.models.BibleVerse as Model<BibleVerseDocument>) ||
  mongoose.model<BibleVerseDocument>('BibleVerse', bibleVerseSchema);
