'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Chat from '@/features/chat/components/Chat';
import {
  BookOpen,
  Heart,
  MessageCircle,
  Shield,
  Clock,
  Users,
  Sparkle,
  ChevronRight,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToChat = () => {
    const chatSection = document.getElementById('chat-section');
    chatSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Floating Chat Bubble Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Hero Section with Modern Chat Interface */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Left Content */}
            <div className="flex-1 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm text-blue-700 px-6 py-3 rounded-full text-sm font-semibold shadow-lg border border-blue-200/50">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <Sparkle className="w-4 h-4" />
                AI 상담사가 온라인입니다
              </div>

              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight">
                당신의 고민을
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  성경으로 해결
                </span>
                하세요
              </h1>

              <p className="text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                30대 이상 직장인·가정을 위한 전문 AI 상담사가<br />
                성경 말씀을 바탕으로 개인 맞춤형 조언을 제공합니다.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl shadow-xl shadow-blue-500/25 text-lg font-semibold transition-all duration-300 hover:scale-105"
                  onClick={scrollToChat}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  무료 상담 시작하기
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-blue-200 text-blue-700 hover:bg-blue-50 px-8 py-4 rounded-2xl text-lg font-semibold backdrop-blur-sm bg-white/50"
                  onClick={() => (window.location.href = '/history')}
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  상담 기록 보기
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>100% 익명 보장</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>24시간 상담 가능</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span>1,000+ 만족한 사용자</span>
                </div>
              </div>
            </div>

            {/* Right Content - Chat Preview */}
            <div className="flex-1 max-w-lg">
              <div className="relative">
                {/* Chat Window */}
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
                  {/* Chat Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">AI 성경 상담사</h3>
                        <p className="text-blue-100 text-sm">온라인</p>
                      </div>
                      <div className="ml-auto w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="p-6 space-y-4 h-80 overflow-y-auto">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 max-w-xs">
                        <p className="text-sm text-gray-800">안녕하세요! 무엇이든 편하게 말씀해주세요. 성경적 관점에서 답변해 드리겠습니다.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 justify-end">
                      <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-xs">
                        <p className="text-sm">요즘 너무 지쳐요. 성경적 위로가 필요해요.</p>
                      </div>
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-semibold">나</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 max-w-xs">
                        <p className="text-sm text-gray-800">고민을 나눠주셔서 감사합니다. 더 나은 도움을 드리기 위해 몇 가지 질문을 드릴게요...</p>
                        <div className="mt-2 flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Chat Input */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3">
                      <input 
                        type="text" 
                        placeholder="메시지를 입력하세요..." 
                        className="flex-1 bg-transparent text-sm outline-none"
                        disabled
                      />
                      <button className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <ChevronRight className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section with Cards */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            성경적 지혜로 당신의 고민을 해결하세요
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            성경 말씀을 바탕으로 한 AI 상담 서비스는 당신의 일상에 실질적인 도움을 드립니다
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="overflow-hidden border-blue-100 shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-600"></div>
            <div className="p-6 space-y-4">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-center text-gray-900">익명 상담</h3>
              <Separator className="bg-blue-100" />
              <p className="text-gray-600 text-center">
                개인정보 없이 안전하게 상담받으세요. 심리적 부담 없이 마음을 열어보세요.
              </p>
            </div>
          </Card>

          <Card className="overflow-hidden border-green-100 shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="h-2 bg-gradient-to-r from-green-400 to-green-600"></div>
            <div className="p-6 space-y-4">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Clock className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-center text-gray-900">24시간 상담</h3>
              <Separator className="bg-green-100" />
              <p className="text-gray-600 text-center">
                언제든지 고민을 털어놓으세요. AI가 24시간 대기하고 있습니다.
              </p>
            </div>
          </Card>

          <Card className="overflow-hidden border-purple-100 shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="h-2 bg-gradient-to-r from-purple-400 to-purple-600"></div>
            <div className="p-6 space-y-4">
              <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-center text-gray-900">성경적 조언</h3>
              <Separator className="bg-purple-100" />
              <p className="text-gray-600 text-center">
                성경 말씀을 바탕으로 한 정확한 조언과 오늘의 기도 제목을 제공합니다.
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">사용자들의 이야기</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              성경 기반 AI 상담을 통해 위로와 지혜를 얻은 분들의 소중한 경험
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  '직장에서의 갈등으로 힘들었는데, 성경적 지혜를 통해 새로운 관점을 얻었습니다.',
                name: '김민수',
                role: '회사원, 35세',
              },
              {
                quote:
                  '자녀 양육의 어려움 속에서 성경적 원리를 적용할 수 있는 실질적인 조언을 받았습니다.',
                name: '이지영',
                role: '주부, 42세',
              },
              {
                quote:
                  '신앙 생활의 고민을 나눌 곳이 없었는데, 이 서비스를 통해 큰 위로를 받았습니다.',
                name: '박준호',
                role: '자영업자, 38세',
              },
            ].map((testimonial, index) => (
              <Card
                key={index}
                className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-md p-6"
              >
                <div className="space-y-4">
                  <div className="text-blue-600">
                    <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 32 32">
                      <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                    </svg>
                  </div>
                  <p className="text-gray-700">{testimonial.quote}</p>
                  <div className="pt-4 border-t border-blue-100">
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Section with Enhanced Design */}
      <div id="chat-section" className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">지금 바로 상담을 시작해보세요</h2>
            <p className="text-xl text-gray-600">
              아래에 고민을 입력하면 AI가 성경적 조언을 제공합니다
            </p>
          </div>

          <Card className="border-blue-100 shadow-xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600"></div>
            <div className="p-6">
              <Chat />
            </div>
          </Card>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">성경적 지혜로 더 나은 삶을 살아가세요</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            매일의 고민과 결정에 성경의 지혜를 적용하여 더 풍요로운 삶을 경험하세요
          </p>
          <Button
            size="lg"
            className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-6 rounded-xl shadow-lg"
            onClick={scrollToChat}
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            무료로 상담 시작하기
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p className="mb-4">© 2023 성경 기반 AI 상담. 모든 권리 보유.</p>
          <div className="flex justify-center gap-6">
            <a href="#" className="hover:text-blue-600 transition-colors">
              이용약관
            </a>
            <a href="#" className="hover:text-blue-600 transition-colors">
              개인정보처리방침
            </a>
            <a href="#" className="hover:text-blue-600 transition-colors">
              자주 묻는 질문
            </a>
            <a href="#" className="hover:text-blue-600 transition-colors">
              문의하기
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
