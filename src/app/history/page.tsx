"use client";
import { useState } from 'react';
import History from '@/features/chat/components/History';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function HistoryPage() {
  const [sessionId, setSessionId] = useState<string>('');
  const [current, setCurrent] = useState<string>('');

  return (
    <main className="min-h-dvh flex flex-col items-center p-6">
      <div className="w-full max-w-3xl space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">상담 기록 보기</h1>
          <a href="/" className="text-sm underline">홈으로</a>
        </div>

        <div className="flex items-center gap-2">
          <Input
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            placeholder="세션 ID를 입력하세요 (예: web-1725252525)"
          />
          <Button onClick={() => setCurrent(sessionId)} disabled={!sessionId.trim()}>불러오기</Button>
        </div>

        {current ? (
          <div className="mt-4">
            <History sessionId={current} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">세션 ID를 입력하면 기록을 조회합니다.</p>
        )}
      </div>
    </main>
  );
}


