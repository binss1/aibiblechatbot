import { ChatRequest, ChatResponse } from '../types';

const API_BASE_URL = 'https://your-domain.railway.app'; // 배포 후 실제 도메인으로 변경

export const chatApi = {
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || '요청 실패');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Chat API Error:', error);
      throw error;
    }
  },

  async getHistory(sessionId: string, limit: number = 20) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/history?sessionId=${sessionId}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('히스토리 조회 실패');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('History API Error:', error);
      throw error;
    }
  },

  async checkHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
};
