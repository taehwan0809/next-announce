# 다음 순서는 (Next Announce)

발표 연습을 위한 AI 기반 음성 분석 및 피드백 서비스

## 주요 기능

- 🎤 **음성 녹음 및 분석**: 브라우저에서 바로 발표를 녹음하고 분석
- 📊 **말하기 분석**: 속도, 추임새, 침묵 구간 등을 자동으로 분석
- 🗣️ **발음 피드백**: 대본 입력 시 발음 정확도 분석 및 오류 지적
- 💡 **AI 피드백**: GPT를 활용한 구체적이고 실용적인 개선 방안 제안
- ❓ **예상 질문 생성**: 발표 내용을 바탕으로 청중 질문 자동 생성

## 기술 스택

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Audio**: Web Audio API, MediaRecorder API

### Backend
- **Runtime**: Node.js
- **Database**: MySQL + Prisma ORM
- **Storage**: AWS S3
- **AI**: OpenAI API (Whisper, GPT-4)

## 시작하기

### 1. 필수 요구사항

- Node.js 18+
- MySQL 8.0+
- AWS 계정 (S3 사용)
- OpenAI API 키

### 2. 설치

```bash
# 저장소 클론
git clone <repository-url>
cd next-announce

# 의존성 설치
npm install
```

### 3. 환경 변수 설정

`.env.example` 파일을 `.env`로 복사하고 값을 설정하세요:

```bash
cp .env.example .env
```

`.env` 파일 내용:

```env
# Database
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/next_announce"

# AWS S3
AWS_ACCESS_KEY_ID="your-access-key-id"
AWS_SECRET_ACCESS_KEY="your-secret-access-key"
AWS_REGION="ap-northeast-2"
AWS_S3_BUCKET_NAME="your-bucket-name"

# OpenAI API
OPENAI_API_KEY="sk-..."

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. 데이터베이스 설정

#### MySQL 데이터베이스 생성

```sql
CREATE DATABASE next_announce CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### Prisma 마이그레이션 실행

```bash
# Prisma Client 생성
npx prisma generate

# 마이그레이션 생성 및 실행
npx prisma migrate dev --name init

# (선택사항) Prisma Studio로 데이터 확인
npx prisma studio
```

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어주세요.

## 데이터베이스 스키마

### 주요 테이블

- **users**: 사용자 정보
- **presentations**: 발표 기록 (제목, 대본, 음성 파일 URL)
- **transcripts**: 음성 인식 결과
- **analysis_results**: 음성 분석 결과 (속도, 추임새, 침묵)
- **pronunciation_analyses**: 발음 분석 결과
- **pronunciation_mistakes**: 발음 오류 상세
- **feedbacks**: AI 피드백
- **questions**: 예상 질문

자세한 스키마는 `prisma/schema.prisma`를 참고하세요.

## AWS S3 설정

1. AWS S3 버킷 생성
2. 버킷 CORS 설정:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:3000"],
    "ExposeHeaders": ["ETag"]
  }
]
```

3. IAM 사용자 생성 및 권한 부여 (S3 읽기/쓰기)

## OpenAI API 설정

1. [OpenAI Platform](https://platform.openai.com/)에서 API 키 발급
2. `.env` 파일에 `OPENAI_API_KEY` 설정
3. 사용 모델:
   - **Whisper**: 음성 → 텍스트 변환
   - **GPT-4**: 발표 분석 및 피드백 생성

## 프로젝트 구조

```
next-announce/
├── app/                    # Next.js App Router 페이지
│   ├── page.tsx           # 홈 화면
│   └── practice/          # 발표 연습 페이지
├── components/            # React 컴포넌트
│   ├── RecordingControls.tsx
│   ├── AnalysisResults.tsx
│   ├── FeedbackSection.tsx
│   ├── PronunciationFeedback.tsx
│   └── QuestionsSection.tsx
├── lib/                   # 유틸리티 및 설정
│   └── prisma.ts         # Prisma 클라이언트
├── prisma/               # Prisma 스키마
│   └── schema.prisma
├── types/                # TypeScript 타입 정의
│   └── index.ts
└── .env                  # 환경 변수 (gitignore)
```

## 개발 가이드

### Prisma 명령어

```bash
# 스키마 변경 후 마이그레이션 생성
npx prisma migrate dev --name <migration-name>

# Prisma Client 재생성
npx prisma generate

# 데이터베이스 GUI 열기
npx prisma studio

# 데이터베이스 초기화 (주의: 모든 데이터 삭제)
npx prisma migrate reset
```

## 라이선스

MIT

## 기여

이슈 및 PR은 언제나 환영합니다!
