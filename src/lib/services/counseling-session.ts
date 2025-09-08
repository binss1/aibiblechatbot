import { CounselingSession, CounselingStep } from '@/features/chat/constants/schema';
import { connectToDatabase } from '@/lib/mongodb';
import { Schema, model, Document } from 'mongoose';

// MongoDB 스키마 정의
const counselingSessionSchema = new Schema({
  sessionId: { type: String, required: true, unique: true },
  step: { 
    type: String, 
    enum: ['initial', 'exploration', 'analysis', 'followup'],
    default: 'initial'
  },
  initialConcern: { type: String },
  explorationQuestions: [{ type: String }],
  explorationAnswers: [{ type: String }],
  currentQuestionIndex: { type: Number, default: 0 },
  isComplete: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// 인덱스 설정
counselingSessionSchema.index({ sessionId: 1 });
counselingSessionSchema.index({ createdAt: -1 });

// 업데이트 시 updatedAt 자동 갱신
counselingSessionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const CounselingSessionModel = model('CounselingSession', counselingSessionSchema);

export class CounselingSessionService {
  /**
   * 상담 세션 생성 또는 가져오기
   */
  static async getOrCreateSession(sessionId: string): Promise<CounselingSession> {
    await connectToDatabase();
    
    let session = await CounselingSessionModel.findOne({ sessionId });
    
    if (!session) {
      session = new CounselingSessionModel({
        sessionId,
        step: 'initial',
        explorationQuestions: [],
        explorationAnswers: [],
        currentQuestionIndex: 0,
        isComplete: false,
      });
      await session.save();
    }
    
    return session.toObject();
  }

  /**
   * 초기 고민 저장
   */
  static async saveInitialConcern(sessionId: string, concern: string): Promise<CounselingSession> {
    await connectToDatabase();
    
    const session = await CounselingSessionModel.findOneAndUpdate(
      { sessionId },
      { 
        initialConcern: concern,
        step: 'exploration',
        updatedAt: new Date()
      },
      { new: true, upsert: true }
    );
    
    return session.toObject();
  }

  /**
   * 탐색 질문들 저장
   */
  static async saveExplorationQuestions(sessionId: string, questions: string[]): Promise<CounselingSession> {
    await connectToDatabase();
    
    const session = await CounselingSessionModel.findOneAndUpdate(
      { sessionId },
      { 
        explorationQuestions: questions,
        step: 'exploration',
        currentQuestionIndex: 0,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    return session.toObject();
  }

  /**
   * 탐색 질문에 대한 답변 저장
   */
  static async saveExplorationAnswer(sessionId: string, answer: string): Promise<CounselingSession> {
    await connectToDatabase();
    
    const session = await CounselingSessionModel.findOne({ sessionId });
    if (!session) {
      throw new Error('Session not found');
    }

    // 답변 추가
    session.explorationAnswers.push(answer);
    session.currentQuestionIndex += 1;
    
    // 모든 질문에 답변했는지 확인
    if (session.currentQuestionIndex >= session.explorationQuestions.length) {
      session.step = 'analysis';
    }
    
    session.updatedAt = new Date();
    await session.save();
    
    return session.toObject();
  }

  /**
   * 상담 완료 처리
   */
  static async completeCounseling(sessionId: string): Promise<CounselingSession> {
    await connectToDatabase();
    
    const session = await CounselingSessionModel.findOneAndUpdate(
      { sessionId },
      { 
        step: 'followup',
        isComplete: true,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    return session.toObject();
  }

  /**
   * 상담 세션 삭제
   */
  static async deleteSession(sessionId: string): Promise<void> {
    await connectToDatabase();
    await CounselingSessionModel.deleteOne({ sessionId });
  }

  /**
   * 오래된 세션 정리 (24시간 이상)
   */
  static async cleanupOldSessions(): Promise<number> {
    await connectToDatabase();
    
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const result = await CounselingSessionModel.deleteMany({
      createdAt: { $lt: oneDayAgo }
    });
    
    return result.deletedCount || 0;
  }
}
