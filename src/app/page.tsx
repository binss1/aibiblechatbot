'use client';

import { useState } from 'react';
import { MessageCircle, Heart, Shield, Users, Star, ArrowRight, CheckCircle, BookOpen, Psychology, VerifiedUser } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Chat from '@/features/chat/components/Chat';

export default function HomePage() {
  const [showChat, setShowChat] = useState(false);

  if (showChat) {
    return <Chat onBack={() => setShowChat(false)} />;
  }

  return (
    <div className="bg-[#111a22] min-h-screen" style={{ fontFamily: '"Noto Sans KR", "Inter", sans-serif' }}>
      {/* Header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#233648] px-10 py-4 sticky top-0 bg-[#111a22]/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3 text-white">
          <svg className="w-8 h-8 text-[#1172d4]" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" fill="currentColor"></path>
          </svg>
          <h2 className="text-white text-xl font-bold leading-tight tracking-[-0.015em]">로고스 (Logos)</h2>
        </div>
        <div className="flex flex-1 justify-end items-center gap-6">
          <nav className="hidden md:flex items-center gap-8">
            <a className="text-gray-300 hover:text-white text-base font-medium leading-normal transition-colors" href="#features">소개</a>
            <a className="text-gray-300 hover:text-white text-base font-medium leading-normal transition-colors" href="#values">핵심 가치</a>
            <a className="text-gray-300 hover:text-white text-base font-medium leading-normal transition-colors" href="#contact">문의</a>
          </nav>
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowChat(true)}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-5 bg-[#1172d4] hover:bg-[#1172d4]/90 text-white text-base font-bold leading-normal tracking-[0.015em] transition-colors"
            >
              <span className="truncate">상담 시작하기</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        className="px-10 py-20 flex flex-col items-center justify-center text-center"
        style={{
          backgroundImage: 'linear-gradient(180deg, rgba(17, 26, 34, 0) 0%, #111a22 100%), url("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="max-w-3xl">
          <h1 className="text-white text-5xl md:text-6xl font-black leading-tight tracking-tighter mb-4">
            성경 기반 AI 챗봇, 로고스와 함께
          </h1>
          <p className="text-gray-300 text-lg md:text-xl font-normal leading-relaxed mb-8">
            로고스는 시대를 초월한 지혜를 바탕으로 당신의 고민에 귀 기울이고, 평온과 명확한 길을 찾도록 돕는 AI 상담 동반자입니다. 오늘, 당신의 마음을 위한 깊이 있는 대화를 시작해보세요.
          </p>
          <Button 
            onClick={() => setShowChat(true)}
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-14 px-8 bg-[#1172d4] hover:bg-[#1172d4]/90 text-white text-lg font-bold leading-normal tracking-[0.015em] transition-colors mx-auto"
          >
            <span className="truncate">AI 상담 시작하기</span>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-white tracking-tight text-4xl font-bold leading-tight max-w-2xl mx-auto">
              왜 로고스를 선택해야 할까요?
            </h2>
            <p className="text-gray-400 text-lg font-normal leading-relaxed mt-4 max-w-3xl mx-auto">
              로고스는 최첨단 AI 기술과 성경의 깊이 있는 지혜를 결합하여 독특한 개인 맞춤형 상담을 제공합니다.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col gap-4 rounded-xl border border-[#324d67] bg-[#192633] p-6 text-center items-center transform hover:-translate-y-2 transition-transform duration-300">
              <div className="bg-[#1172d4]/20 p-3 rounded-full mb-4">
                <BookOpen className="w-9 h-9 text-[#1172d4]" />
              </div>
              <h3 className="text-white text-xl font-bold leading-tight">지혜의 샘</h3>
              <p className="text-[#92adc9] text-base font-normal leading-relaxed">
                당신의 구체적인 필요에 맞춰 성경의 시대를 초월한 지혜와 통찰을 얻으세요.
              </p>
            </div>
            <div className="flex flex-col gap-4 rounded-xl border border-[#324d67] bg-[#192633] p-6 text-center items-center transform hover:-translate-y-2 transition-transform duration-300">
              <div className="bg-[#1172d4]/20 p-3 rounded-full mb-4">
                <Psychology className="w-9 h-9 text-[#1172d4]" />
              </div>
              <h3 className="text-white text-xl font-bold leading-tight">개인 맞춤형 상담</h3>
              <p className="text-[#92adc9] text-base font-normal leading-relaxed">
                당신만의 여정과 도전에 맞춰 변화하며 개인화된 안내와 지지를 제공합니다.
              </p>
            </div>
            <div className="flex flex-col gap-4 rounded-xl border border-[#324d67] bg-[#192633] p-6 text-center items-center transform hover:-translate-y-2 transition-transform duration-300">
              <div className="bg-[#1172d4]/20 p-3 rounded-full mb-4">
                <VerifiedUser className="w-9 h-9 text-[#1172d4]" />
              </div>
              <h3 className="text-white text-xl font-bold leading-tight">안전 및 기밀 보장</h3>
              <p className="text-[#92adc9] text-base font-normal leading-relaxed">
                당신의 사생활과 비밀은 최우선으로 보호됩니다. 안전한 환경에서 대화하세요.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#192633]">
        <div className="max-w-5xl mx-auto px-10 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3 text-white">
              <svg className="w-7 h-7 text-[#1172d4]" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" fill="currentColor"></path>
              </svg>
              <h2 className="text-white text-lg font-bold leading-tight">로고스 (Logos)</h2>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6">
              <a className="text-[#92adc9] hover:text-white text-base font-normal leading-normal transition-colors" href="#">개인정보 처리방침</a>
              <a className="text-[#92adc9] hover:text-white text-base font-normal leading-normal transition-colors" href="#">서비스 이용약관</a>
              <a className="text-[#92adc9] hover:text-white text-base font-normal leading-normal transition-colors" href="#">문의하기</a>
            </div>
          </div>
          <div className="border-t border-[#324d67] mt-6 pt-6 text-center">
            <p className="text-[#92adc9] text-sm font-normal leading-normal">© 2024 Logos. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}