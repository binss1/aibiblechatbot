# 📖 성경 기반 AI 상담 챗봇

> 30대 이상 직장인·가정을 위한 성경 말씀 기반 AI 상담 서비스

[![Next.js](https://img.shields.io/badge/Next.js-15.1.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React Native](https://img.shields.io/badge/React%20Native-Expo-blue?style=flat-square&logo=react)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=flat-square&logo=mongodb)](https://www.mongodb.com/atlas)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-green?style=flat-square&logo=openai)](https://openai.com/)

## 🌟 프로젝트 개요

성경 말씀을 근거로 30대 이상 직장인·가정 기독교 신자의 고민을 실시간으로 상담하고, 관련 구절과 "오늘의 기도제목"을 함께 제시하는 모바일·웹 챗봇 서비스입니다.

### 🎯 주요 특징

- **🤖 AI 기반 상담**: OpenAI GPT-4o-mini를 활용한 지능형 상담
- **📖 성경 구절 검색**: 임베딩 기반 의미론적 성경 구절 매칭
- **📱 크로스 플랫폼**: 웹(Next.js) + 모바일(React Native) 지원
- **🔒 익명 상담**: 개인정보 없이 안전한 상담 환경
- **⏰ 24시간 서비스**: 언제든지 상담 가능
- **📊 상담 기록**: 세션별 상담 기록 저장 및 조회

## 🚀 기술 스택

### 웹 애플리케이션
- **Frontend**: Next.js 15, React 19, TypeScript
- **UI/UX**: Tailwind CSS, shadcn/ui, Lucide Icons
- **State Management**: Zustand, React Query
- **Form Handling**: React Hook Form, Zod

### 모바일 애플리케이션
- **Framework**: React Native + Expo
- **Navigation**: React Navigation Stack
- **UI Components**: Expo Vector Icons, Linear Gradient

### 백엔드 & 데이터베이스
- **API**: Next.js API Routes
- **Database**: MongoDB Atlas
- **AI Service**: OpenAI GPT-4o-mini, OpenAI Embeddings
- **Authentication**: JWT (향후 구현 예정)

### 배포 & 인프라
- **Containerization**: Docker
- **Cloud Platform**: Railway (무료 티어)
- **Environment**: Node.js 18+

## 📁 프로젝트 구조

```
aibiblechatbot/
├── 📱 웹 애플리케이션
│   ├── src/
│   │   ├── app/                 # Next.js App Router
│   │   │   ├── api/            # API 엔드포인트
│   │   │   ├── globals.css     # 전역 스타일
│   │   │   ├── layout.tsx      # 루트 레이아웃
│   │   │   └── page.tsx        # 메인 페이지
│   │   ├── features/chat/      # 채팅 기능
│   │   │   ├── components/     # 채팅 컴포넌트
│   │   │   └── constants/      # 스키마 정의
│   │   ├── lib/                # 유틸리티 및 서비스
│   │   │   ├── models/         # MongoDB 스키마
│   │   │   ├── scripts/        # 데이터베이스 스크립트
│   │   │   └── services/       # 비즈니스 로직
│   │   └── components/ui/      # shadcn UI 컴포넌트
│   ├── public/                 # 정적 파일
│   └── package.json            # 의존성 관리
├── 📱 모바일 애플리케이션
│   ├── mobile/
│   │   ├── src/
│   │   │   ├── screens/        # 화면 컴포넌트
│   │   │   ├── services/       # API 서비스
│   │   │   └── types/          # TypeScript 타입
│   │   ├── App.tsx             # 메인 앱 컴포넌트
│   │   └── package.json        # 모바일 의존성
├── 🐳 배포 설정
│   ├── Dockerfile              # Docker 컨테이너
│   ├── railway.json           # Railway 배포 설정
│   └── .env.local             # 환경 변수 (로컬)
└── 📚 문서 및 설정
    ├── README.md              # 프로젝트 문서
    ├── .gitignore             # Git 무시 파일
    └── next.config.ts         # Next.js 설정
```

## 🛠️ 설치 및 실행

### 사전 요구사항

- Node.js 18.0.0 이상
- npm 또는 yarn
- MongoDB Atlas 계정
- OpenAI API 키

### 1. 저장소 클론

```bash
git clone https://github.com/binss1/aibiblechatbot.git
cd aibiblechatbot
```

### 2. 의존성 설치

```bash
# 웹 애플리케이션
npm install

# 모바일 애플리케이션
cd mobile
npm install --legacy-peer-deps
cd ..
```

### 3. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
OPENAI_API_KEY=sk-proj-your-openai-api-key
```

### 4. 데이터베이스 초기화

```bash
# 성경 데이터 초기화 (임베딩 포함)
npm run db:init-bible

# 또는 임베딩 없이 데이터만 초기화
npm run db:init-bible-only
```

### 5. 개발 서버 실행

```bash
# 웹 애플리케이션
npm run dev

# 모바일 애플리케이션 (별도 터미널)
cd mobile
npm run web      # 웹에서 테스트
npm run android  # Android 에뮬레이터
npm run ios      # iOS 시뮬레이터 (macOS 필요)
```

## 📱 사용법

### 웹 애플리케이션
1. 브라우저에서 `http://localhost:3000` 접속
2. 고민을 입력하고 "지금 상담 시작하기" 클릭
3. AI가 성경적 조언과 관련 구절을 제공
4. 상담 기록은 "상담 기록 보기"에서 확인

### 모바일 애플리케이션
1. Expo Go 앱 설치 (iOS/Android)
2. `npx expo start` 실행 후 QR 코드 스캔
3. 웹과 동일한 기능을 모바일에서 이용

## 🔧 주요 명령어

```bash
# 개발
npm run dev              # 개발 서버 실행
npm run build            # 프로덕션 빌드
npm run start            # 프로덕션 서버 실행

# 데이터베이스
npm run db:check         # DB 연결 확인
npm run db:clear-bible   # 성경 데이터 삭제
npm run db:init-bible    # 성경 데이터 + 임베딩 생성

# 코드 품질
npm run lint             # ESLint 검사
npm run format           # Prettier 포맷팅

# 모바일
cd mobile
npm run web              # 웹에서 모바일 앱 테스트
npm run android          # Android 빌드
npm run ios              # iOS 빌드 (macOS 필요)
```

## 🌐 배포

### Railway 배포

1. [Railway](https://railway.app) 계정 생성
2. Railway CLI 설치: `npm install -g @railway/cli`
3. 로그인: `railway login`
4. 프로젝트 연결: `railway init`
5. 환경 변수 설정 (Railway 대시보드에서)
6. 배포: `railway up`

### Docker 배포

```bash
# Docker 이미지 빌드
docker build -t aibiblechatbot .

# 컨테이너 실행
docker run -p 3000:3000 --env-file .env.local aibiblechatbot
```

## 📊 API 문서

### 채팅 API

```typescript
POST /api/chat
Content-Type: application/json

{
  "sessionId": "web-1234567890",
  "message": "요즘 너무 지쳐요. 성경적 위로가 필요해요."
}

// 응답
{
  "content": "안녕하세요. 지치고 힘든 마음을 이해합니다...",
  "verses": [
    {
      "book": "마태복음",
      "chapter": "11",
      "verse": "28"
    }
  ],
  "prayer": "하나님, 지치고 힘든 마음을 가진 모든 이들에게..."
}
```

### 상담 기록 API

```typescript
GET /api/history?sessionId=web-1234567890&limit=20

// 응답
{
  "records": [
    {
      "sessionId": "web-1234567890",
      "role": "user",
      "content": "요즘 너무 지쳐요...",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 문의

- **GitHub Issues**: [이슈 등록](https://github.com/binss1/aibiblechatbot/issues)
- **이메일**: [연락처 정보]

## 🙏 감사의 말

- [OpenAI](https://openai.com/) - GPT-4o-mini API 제공
- [MongoDB](https://www.mongodb.com/) - Atlas 데이터베이스 서비스
- [Vercel](https://vercel.com/) - Next.js 프레임워크
- [Expo](https://expo.dev/) - React Native 개발 플랫폼
- [Railway](https://railway.app/) - 클라우드 배포 플랫폼

---

⭐ 이 프로젝트가 도움이 되었다면 Star를 눌러주세요!