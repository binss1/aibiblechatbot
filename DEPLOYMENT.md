# 🚀 AI Bible Chatbot 배포 가이드

## 📋 개요

이 문서는 AI Bible Chatbot을 Railway, Render, Vercel 등 다양한 플랫폼에 배포하는 방법을 설명합니다.

## 🛠️ 배포 전 준비사항

### 1. 환경 변수 설정

`.env.local` 파일에 다음 변수들을 설정하세요:

```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name

# Application Configuration
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### 2. 데이터베이스 초기화

배포 전에 성경 데이터를 초기화하세요:

```bash
npm run db:init-bible-only  # 임베딩 없이 데이터만 초기화
# 또는
npm run db:init-bible       # 임베딩 포함 전체 초기화 (OpenAI API 키 필요)
```

## 🚂 Railway 배포

### 1. Railway CLI 설치

```bash
npm install -g @railway/cli
```

### 2. Railway 로그인

```bash
railway login
```

### 3. 프로젝트 배포

```bash
railway up
```

### 4. 환경 변수 설정

Railway 대시보드에서 다음 환경 변수를 설정하세요:

- `OPENAI_API_KEY`
- `MONGODB_URI`
- `NODE_ENV=production`

## 🐳 Docker 배포

### 1. Docker 이미지 빌드

```bash
npm run docker:build
```

### 2. Docker 컨테이너 실행

```bash
npm run docker:run
```

### 3. 개발 환경 (Docker Compose)

```bash
npm run docker:dev
```

## 📊 모니터링 및 헬스체크

### 헬스체크 엔드포인트

- **Health Check**: `GET /api/health`
- **Metrics**: `GET /api/metrics`

### 헬스체크 응답 예시

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "responseTime": "45ms",
  "services": {
    "database": "connected",
    "openai": "configured",
    "mongodb": "configured"
  }
}
```

## 🔧 성능 최적화

### 1. Next.js 최적화

- ✅ Standalone 모드 활성화
- ✅ 이미지 최적화 (WebP, AVIF)
- ✅ CSS 최적화
- ✅ 패키지 임포트 최적화
- ✅ 프로덕션에서 console.log 제거

### 2. Docker 최적화

- ✅ Multi-stage 빌드
- ✅ Alpine Linux 사용
- ✅ Non-root 사용자 실행
- ✅ Health check 설정
- ✅ 최소한의 레이어 구성

### 3. Railway 최적화

- ✅ Dockerfile 기반 빌드
- ✅ 헬스체크 설정
- ✅ 자동 재시작 정책
- ✅ 슬립 모드 비활성화

## 🚨 문제 해결

### 일반적인 문제들

#### 1. 빌드 실패

```bash
# 의존성 재설치
rm -rf node_modules package-lock.json
npm install

# 빌드 테스트
npm run build
```

#### 2. 데이터베이스 연결 실패

- MongoDB URI 확인
- 네트워크 접근 권한 확인
- 방화벽 설정 확인

#### 3. OpenAI API 오류

- API 키 유효성 확인
- 사용량 한도 확인
- 모델 이름 확인

### 로그 확인

```bash
# Railway 로그
railway logs

# Docker 로그
docker logs <container_id>
```

## 📈 성능 모니터링

### 메트릭 확인

```bash
curl https://your-domain.railway.app/api/metrics
```

### 주요 메트릭

- 응답 시간
- 메모리 사용량
- 데이터베이스 연결 상태
- 서비스 상태

## 🔄 자동 배포 설정

### GitHub Actions (선택사항)

```yaml
name: Deploy to Railway
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: railway/deploy@v1
        with:
          railway-token: ${{ secrets.RAILWAY_TOKEN }}
```

## 📞 지원

문제가 발생하면 다음을 확인하세요:

1. 환경 변수 설정
2. 데이터베이스 연결
3. API 키 유효성
4. 로그 메시지

---

**배포 성공을 위한 체크리스트:**

- [ ] 환경 변수 설정 완료
- [ ] 데이터베이스 초기화 완료
- [ ] 빌드 테스트 통과
- [ ] 헬스체크 응답 확인
- [ ] 메트릭 엔드포인트 확인
