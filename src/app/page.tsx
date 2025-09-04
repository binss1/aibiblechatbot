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
  ChevronRight
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
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section with Warm Gradient Background */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-amber-50 to-blue-100">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="flex-1 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 bg-blue-100/80 text-blue-800 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm border border-blue-200/50">
                <Sparkle className="w-4 h-4" />
                성경 기반 AI 상담
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                당신의 고민에
                <br />
                <span className="text-blue-700 relative">
                  성경적 답변
                  <span className="absolute bottom-1 left-0 w-full h-3 bg-blue-100/60 -z-10 rounded-full"></span>
                </span>을
              </h1>
              
              <p className="text-xl text-gray-700 max-w-2xl">
                30대 이상 직장인·가정을 위한 AI 상담 챗봇. 
                성경 말씀을 바탕으로 한 따뜻한 조언과 기도 제목을 제공합니다.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-6 rounded-xl shadow-md shadow-blue-700/20"
                  onClick={scrollToChat}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  지금 상담 시작하기
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-blue-300 text-blue-700 hover:bg-blue-50 px-8 py-6 rounded-xl"
                  onClick={() => window.location.href = '/history'}
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  상담 기록 보기
                </Button>
              </div>
            </div>
            
            <div className="flex-1 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/10 border border-white/50 backdrop-blur-sm bg-white/30">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
                <div className="w-full h-80 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <div className="text-center p-6 bg-white/80 backdrop-blur-md rounded-xl shadow-lg max-w-xs">
                    <h3 className="text-xl font-semibold text-blue-800">성경적 지혜</h3>
                    <p className="text-gray-700 mt-2">
                      "내가 네게 지혜의 길을 보이고 정직한 길을 인도하였은즉"
                      <br />
                      <span className="text-sm">- 잠언 4:11</span>
                    </p>
                  </div>
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
                개인정보 없이 안전하게 상담받으세요. 
                심리적 부담 없이 마음을 열어보세요.
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
                언제든지 고민을 털어놓으세요. 
                AI가 24시간 대기하고 있습니다.
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
                성경 말씀을 바탕으로 한 정확한 조언과 
                오늘의 기도 제목을 제공합니다.
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              사용자들의 이야기
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              성경 기반 AI 상담을 통해 위로와 지혜를 얻은 분들의 소중한 경험
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "직장에서의 갈등으로 힘들었는데, 성경적 지혜를 통해 새로운 관점을 얻었습니다.",
                name: "김민수",
                role: "회사원, 35세"
              },
              {
                quote: "자녀 양육의 어려움 속에서 성경적 원리를 적용할 수 있는 실질적인 조언을 받았습니다.",
                name: "이지영",
                role: "주부, 42세"
              },
              {
                quote: "신앙 생활의 고민을 나눌 곳이 없었는데, 이 서비스를 통해 큰 위로를 받았습니다.",
                name: "박준호",
                role: "자영업자, 38세"
              }
            ].map((testimonial, index) => (
              <Card key={index} className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-md p-6">
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              지금 바로 상담을 시작해보세요
            </h2>
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
          <h2 className="text-3xl font-bold mb-6">
            성경적 지혜로 더 나은 삶을 살아가세요
          </h2>
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
            <a href="#" className="hover:text-blue-600 transition-colors">이용약관</a>
            <a href="#" className="hover:text-blue-600 transition-colors">개인정보처리방침</a>
            <a href="#" className="hover:text-blue-600 transition-colors">자주 묻는 질문</a>
            <a href="#" className="hover:text-blue-600 transition-colors">문의하기</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

