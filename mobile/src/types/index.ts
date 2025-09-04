export interface Message {
  role: 'user' | 'assistant';
  content: string;
  verses?: Array<{
    book: string;
    chapter: string;
    verse: string;
  }>;
  prayer?: string;
}

export interface ChatResponse {
  content: string;
  verses?: Array<{
    book: string;
    chapter: string;
    verse: string;
  }>;
  prayer?: string;
}

export interface ChatRequest {
  sessionId: string;
  message: string;
}

export interface Session {
  sessionId: string;
  createdAt: string;
  updatedAt: string;
  userAgent?: string;
  locale?: string;
}

export interface ChatRecord {
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  verses?: Array<{
    book: string;
    chapter: number;
    verse: number;
    text: string;
  }>;
  prayer?: string;
  createdAt: string;
}
