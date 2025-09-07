import { ChatRequest, ChatResponse } from '../types';

// 환경에 따른 API URL 설정
const getApiBaseUrl = () => {
  if (__DEV__) {
    // 개발 환경에서는 컴퓨터의 IP 주소 사용
    return 'http://192.168.0.10:3000';
  }
  // 프로덕션 환경에서는 배포된 URL 사용
  return 'https://your-domain.railway.app';
};

const API_BASE_URL = getApiBaseUrl();

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
      const response = await fetch(
        `${API_BASE_URL}/api/history?sessionId=${sessionId}&limit=${limit}`,
      );

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
  },
};
