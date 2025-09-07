'use client';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { chatRequestSchema, chatResponseSchema } from '@/features/chat/constants/schema';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BookOpen, Heart, MessageCircle, SendIcon, Clock } from 'lucide-react';
import History from './History';
import { cn } from '@/lib/utils';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  verses?: Array<{ book: string; chapter: string; verse: string }>;
  prayer?: string;
};

const request = async (body: z.infer<typeof chatRequestSchema>) => {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || '요청 실패');
  }
  const data = await res.json();
  return chatResponseSchema.parse(data);
};

function MessageLoading() {
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3].map((dot) => (
        <div
          key={dot}
          className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"
          style={{ animationDelay: `${dot * 0.15}s` }}
        />
      ))}
    </div>
  );
}

export default function Chat() {
  const [sessionId] = useState<string>(() => `web-${Date.now()}`);
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: request,
    retry: 2,
  });
  const [cooldownMs, setCooldownMs] = useState<number>(0);

  const canSend = useMemo(() => input.trim().length > 0 && !isPending, [input, isPending]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const onSend = async () => {
    const message = input.trim();
    if (!message) return;
    setMessages((prev) => [...prev, { role: 'user', content: message }]);
    setInput('');
    try {
      const data = await mutateAsync({ sessionId, message });
      const newMessage: Message = {
        role: 'assistant',
        content: data.content,
        verses: (data.verses || []) as Array<{ book: string; chapter: string; verse: string }>,
        prayer: data.prayer,
      };
      setMessages((prev) => [...prev, newMessage]);
    } catch (e: any) {
      // map 429 cooldown if present
      const msg = e instanceof Error ? e.message : '오류가 발생했습니다';
      const body = (() => {
        try {
          return JSON.parse(e.message);
        } catch {
          return undefined;
        }
      })();
      if (body?.retryAfterMs) setCooldownMs(body.retryAfterMs);
      setMessages((prev) => [...prev, { role: 'assistant', content: `에러: ${msg}` }]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && canSend) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <Card className="max-w-4xl mx-auto w-full shadow-lg border border-border/30 bg-background/95 backdrop-blur-sm">
      <CardHeader className="border-b border-border/10 pb-4">
        <CardTitle className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
          <MessageCircle className="w-6 h-6 text-blue-600" />
          AI 성경 상담
        </CardTitle>
        <p className="text-muted-foreground text-sm text-center">
          고민을 털어놓으시면 성경 말씀으로 답변드립니다
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[450px] overflow-y-auto p-4 space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">안녕하세요!</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                무엇이든 편하게 말씀해주세요. 성경적 관점에서 답변해 드리겠습니다.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
                <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
                  &ldquo;요즘 너무 지쳐요. 성경적 위로가 필요해요.&rdquo;
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
                  &ldquo;하나님의 뜻을 어떻게 알 수 있을까요?&rdquo;
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message, idx) => (
                <div
                  key={idx}
                  className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8 mr-2 mt-1">
                      <AvatarFallback className="bg-blue-100 text-blue-600">AI</AvatarFallback>
                    </Avatar>
                  )}

                  <div
                    className={cn(
                      'max-w-[85%] flex flex-col',
                      message.role === 'user' ? 'items-end' : 'items-start',
                    )}
                  >
                    {message.role === 'user' ? (
                      <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      </div>
                    ) : (
                      <div className="bg-card border border-border/50 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                        {isPending && idx === messages.length - 1 ? (
                          <div className="py-2 px-1">
                            <MessageLoading />
                          </div>
                        ) : (
                          <>
                            <div className="whitespace-pre-wrap mb-3 text-foreground leading-relaxed">
                              {message.content}
                            </div>

                            {message.verses && message.verses.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-3">
                                {message.verses.map((verse, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="secondary"
                                    className="text-xs bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                                  >
                                    <BookOpen className="w-3 h-3 mr-1" />
                                    {verse.book} {verse.chapter}:{verse.verse}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {message.prayer && (
                              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
                                <div className="flex items-start gap-2">
                                  <Heart className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <div className="text-sm font-medium text-amber-800 mb-1">
                                      오늘의 기도
                                    </div>
                                    <div className="text-sm text-amber-700 italic">
                                      {message.prayer}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    <div
                      className={cn(
                        'text-xs text-muted-foreground mt-1',
                        message.role === 'user' ? 'text-right' : 'text-left',
                      )}
                    >
                      {message.role === 'user' ? '방금 전' : ''}
                    </div>
                  </div>

                  {message.role === 'user' && (
                    <Avatar className="h-8 w-8 ml-2 mt-1">
                      <AvatarFallback className="bg-blue-600 text-white">나</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {messages.length > 0 && (
          <div className="px-4 py-3 border-t border-border/10 bg-muted/30">
            <History sessionId={sessionId} />
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t border-border/10 p-4 gap-3">
        <div className="relative flex-1">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="고민을 입력하세요..."
            className="min-h-12 resize-none pr-12 bg-background border-border/50 focus-visible:ring-blue-500/20"
            onKeyDown={handleKeyDown}
          />
          {cooldownMs > 0 && (
            <div className="absolute right-3 top-3 flex items-center text-xs text-amber-600">
              <Clock className="w-3 h-3 mr-1" />
              잠시 후 다시 시도하세요
            </div>
          )}
        </div>
        <Button
          onClick={onSend}
          disabled={!canSend || cooldownMs > 0}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 h-12 shadow-sm"
        >
          {isPending ? (
            <div className="flex items-center gap-2">
              <MessageLoading />
              <span>전송 중</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <SendIcon className="w-4 h-4" />
              <span>보내기</span>
            </div>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
