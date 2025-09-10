'use client';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { chatRequestSchema, chatResponseSchema, CounselingStep } from '@/features/chat/constants/schema';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BookOpen, Heart, MessageCircle, SendIcon, Clock, HelpCircle, CheckCircle, ArrowLeft, Plus, MessageSquare } from 'lucide-react';
import History from './History';
import { cn } from '@/lib/utils';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  verses?: Array<{ book: string; chapter: string; verse: string }>;
  prayer?: string;
  counselingStep?: CounselingStep;
  isQuestionPhase?: boolean;
  progress?: { current: number; total: number };
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
          className="w-1.5 h-1.5 bg-[#1172d4] rounded-full animate-pulse"
          style={{ animationDelay: `${dot * 0.15}s` }}
        />
      ))}
    </div>
  );
}

interface ChatProps {
  onBack?: () => void;
}

export default function Chat({ onBack }: ChatProps) {
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

  // 현재 상담 단계에 따른 placeholder 텍스트
  const getPlaceholder = () => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.isQuestionPhase) {
      return "질문에 답변해 주세요...";
    }
    if (lastMessage?.counselingStep === 'followup') {
      return "추가 질문이나 고민이 있으시면 말씀해 주세요...";
    }
    return "고민을 입력하세요...";
  };

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
        counselingStep: data.counselingStep,
        isQuestionPhase: data.isQuestionPhase,
        progress: data.progress && typeof data.progress.current === 'number' && typeof data.progress.total === 'number' ? {
          current: data.progress.current,
          total: data.progress.total
        } : undefined,
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
    <div className="flex h-screen w-full bg-[#111a22]" style={{ fontFamily: '"Noto Sans KR", "Inter", sans-serif' }}>
      {/* Sidebar */}
      <aside className="flex h-full w-[280px] flex-col border-r border-[#233648] bg-[#111a22] p-4">
        <div className="flex items-center gap-3 px-2 pb-4">
          <div className="size-6 text-[#1173d4]">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" fill="currentColor"></path>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white">Logos</h1>
        </div>
        <button className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium text-white transition-colors hover:bg-[#233648]">
          <Plus className="w-5 h-5" />
          New Chat
        </button>
        <div className="mt-4 flex-1 space-y-1 overflow-y-auto">
          <h2 className="px-3 text-xs font-semibold uppercase tracking-wider text-[#92adc9]">Past Conversations</h2>
          <nav className="mt-2 space-y-1">
            {[
              'My Faith Journey',
              'Seeking Guidance', 
              'Understanding Scripture',
              'Finding Peace',
              'Dealing with Loss',
              'Relationship Advice',
              'Career Decisions',
              'Personal Growth',
              'Overcoming Challenges'
            ].map((title, index) => (
              <a key={index} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-[#233648]" href="#">
                <MessageSquare className="w-5 h-5 text-[#92adc9]" />
                {title}
              </a>
            ))}
          </nav>
        </div>
        <div className="mt-auto flex items-center gap-3 border-t border-[#233648] pt-4">
          <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" style={{backgroundImage: 'url("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80")'}}></div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">User Name</p>
            <p className="text-xs text-[#92adc9]">user@example.com</p>
          </div>
          <button className="text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-[#233648] px-6">
          <h2 className="text-lg font-semibold text-white">My Faith Journey</h2>
          <button className="text-white lg:hidden">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </header>
        <div className="flex flex-1 overflow-hidden">
          <div className="flex flex-1 flex-col overflow-y-auto p-6">
            <div className="flex-1 space-y-6">
              {messages.length === 0 ? (
                <div className="flex items-start gap-4">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#1173d4]">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">Logos</p>
                    <div className="mt-1 rounded-lg bg-[#233648] p-3 text-white">
                      <p>Hello, I'm Logos. How can I assist you today?</p>
                    </div>
                  </div>
                </div>
              ) : (
                messages.map((message, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    {message.role === 'assistant' ? (
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#1173d4]">
                        <MessageCircle className="w-5 h-5 text-white" />
                      </div>
                    ) : (
                      <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8 shrink-0" style={{backgroundImage: 'url("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80")'}}></div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{message.role === 'assistant' ? 'Logos' : 'You'}</p>
                      <div className="mt-1 rounded-lg bg-[#233648] p-3 text-white">
                        {isPending && idx === messages.length - 1 ? (
                          <MessageLoading />
                        ) : (
                          <>
                            {/* 상담 진행 상황 표시 */}
                            {message.isQuestionPhase && message.progress && (
                              <div className="mb-3 p-3 bg-[#1172d4]/20 border border-[#1172d4]/30 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <HelpCircle className="w-4 h-4 text-[#1172d4]" />
                                  <span className="text-sm font-medium text-[#1172d4]">
                                    상담 진행 중 ({message.progress.current + 1}/{message.progress.total})
                                  </span>
                                </div>
                                <div className="w-full bg-[#1172d4]/20 rounded-full h-2">
                                  <div 
                                    className="bg-[#1172d4] h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${((message.progress.current + 1) / message.progress.total) * 100}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* 상담 완료 표시 */}
                            {message.counselingStep === 'followup' && !message.isQuestionPhase && (
                              <div className="mb-3 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4 text-green-400" />
                                  <span className="text-sm font-medium text-green-400">
                                    상담이 완료되었습니다
                                  </span>
                                </div>
                              </div>
                            )}

                            <div className="whitespace-pre-wrap mb-3 leading-relaxed">
                              {message.content}
                            </div>

                            {message.verses && message.verses.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-3">
                                {message.verses.map((verse, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="secondary"
                                    className="text-xs bg-[#1172d4]/20 text-[#1172d4] border-[#1172d4]/30 hover:bg-[#1172d4]/30"
                                  >
                                    <BookOpen className="w-3 h-3 mr-1" />
                                    {verse.book} {verse.chapter}:{verse.verse}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {message.prayer && (
                              <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-3 mt-3">
                                <div className="flex items-start gap-2">
                                  <Heart className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <div className="text-sm font-medium text-amber-400 mb-1">
                                      오늘의 기도
                                    </div>
                                    <div className="text-sm text-amber-300 italic">
                                      {message.prayer}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="mt-6">
              <div className="relative">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={getPlaceholder()}
                  className="w-full resize-none rounded-md border border-[#233648] bg-[#1c2a38] p-4 pr-16 text-white placeholder:text-[#92adc9] focus:border-[#1173d4] focus:outline-none focus:ring-1 focus:ring-[#1173d4]"
                  rows={3}
                  onKeyDown={handleKeyDown}
                />
                <Button
                  onClick={onSend}
                  disabled={!canSend || cooldownMs > 0}
                  className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-md bg-[#1173d4] text-white transition-colors hover:bg-blue-600"
                >
                  <SendIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          <aside className="hidden w-[320px] flex-col border-l border-[#233648] bg-[#1c2a38] p-6 lg:flex">
            <h3 className="text-lg font-semibold text-white">Scripture Viewer</h3>
            <div className="mt-4 flex-1 space-y-4 overflow-y-auto">
              <div>
                <p className="font-semibold text-white">John 3:16</p>
                <p className="mt-1 text-[#92adc9]">For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.</p>
              </div>
              <div>
                <p className="font-semibold text-white">Proverbs 3:5-6</p>
                <p className="mt-1 text-[#92adc9]">Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.</p>
              </div>
              <div>
                <p className="font-semibold text-white">Philippians 4:13</p>
                <p className="mt-1 text-[#92adc9]">I can do all this through him who gives me strength.</p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}