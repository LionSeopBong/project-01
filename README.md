# WODX 🏋️

> 크로스핏 박스 회원 및 개인 운동자를 위한 모바일 퍼스트 웹앱

---

## 🛠 기술 스택

| 구분       | 기술                    | 역할                         |
| ---------- | ----------------------- | ---------------------------- |
| Frontend   | Next.js 14 (App Router) | UI 및 라우팅                 |
| Styling    | Tailwind CSS            | 스타일링                     |
| Backend/DB | Firebase (Firestore)    | 데이터 저장 및 실시간 동기화 |
| 인증       | Firebase Auth           | 소셜 로그인                  |
| 배포       | Vercel                  | 호스팅 및 CI/CD              |

---

## 📱 페이지 구성

하단 네비게이션 바 고정: `Home` / `WOD` / `Record` / `Timer` / `Profile`

### 🏠 Home

- 오늘의 WOD 요약 (제목, 타입, 무브먼트 미리보기)
- 이번 주 출석 달력
- 주간 볼륨 / 칼로리 통계 카드
- START 버튼 → WOD 바로 시작 → WOD 종료 후 자동 기록 저장

### 💪 WOD

- 오늘의 WOD 상세 (라운드, 무브먼트 전체 목록)
- Start Workout → 타이머 자동 연동
- 현재 진행 중인 무브먼트 강조
- End Workout → 기록 저장

### 📊 Record

- 개인 최고 기록 (PR) — 3RM Squat, 1RM Deadlift 등
- 오늘의 WOD 완료 기록 (시간, 칼로리)
- 날짜별 운동 히스토리 (WOD, Running 등)

### ⏱ Timer

- 타이머 모드 선택: `AMRAP` / `For Time` / `EMOM`
- 분/초 직접 입력
- Start / Pause / Reset 컨트롤
- 설정한 시간안에 WOD 종료 시 Round, Rep, 무게 등 입력 데이터 폼 작성
- 작성한 데이터는 바로 오늘의 운동 히스토리 data로 저장

### 👤 Profile

- 유저 정보 (이름, 성별, 체중, 신장)
- PR 통계 요약 (3대, 러닝페이스)
- 주간 / 월간 통계
- 단위 설정 (kg / lbs)

---

## 🗄 Firebase DB 설계

### `users`

```
id            string     Firebase Auth UID
name          string     이름
gender        string     MALE / FEMALE
weight        number     체중 (kg)
height        number     신장 (cm)
profileImage  string     이미지 URL
unit          string     kg / lbs (기본값: kg)
createdAt     timestamp  가입일
```

### `wods`

```
id          string     자동 생성 ID
title       string     WOD 이름 (예: MUSCLE RUN)
date        string     날짜 (YYYY-MM-DD)
type        string     AMRAP / For Time / EMOM
rounds      number     라운드 수
timeCap     number     제한 시간 (초, For Time용)
movements   array      [{ name, reps, distance, unit }]
createdAt   timestamp  등록일
```

### `workoutRecords`

```
id            string     자동 생성 ID
userId        string     users 참조
wodId         string     wods 참조
wodTitle      string     중복 저장 (쿼리 최적화)
timeSeconds   number     완료 시간 (초)
calories      number     소모 칼로리
Reps          number     진행 횟수
waight        number     진행 무게
Level         string     진행 레벨(Beginer,Rxd,Athlete)
completedAt   timestamp  완료 일시
```

### `prRecords`

```
id           string     자동 생성 ID
userId       string     users 참조
movement     string     무브먼트명 (예: 3RM Squat)
value        number     기록 값
unit         string     kg(lb) / reps / sec
recordedAt   timestamp  기록일
```

### `weeklyStats`

```
id               string     자동 생성 ID
userId           string     users 참조
weekStart        string     주 시작일 (YYYY-MM-DD)
attendance       number     출석 횟수
attendanceGoal   number     목표 출석 횟수
totalVolume      number     총 볼륨 (kg)
totalCalories    number     총 칼로리
```

---

## 📁 컴포넌트 구조

```
app/
├── page.tsx                    # Home
├── wod/page.tsx                # WOD 상세
├── record/page.tsx             # 기록
├── timer/page.tsx              # 타이머
├── profile/page.tsx            # 프로필
└── layout.tsx                  # 공통 레이아웃 (BottomNav 포함)

components/
└── ui/
    ├── GlowButton.tsx          # 발광 버튼 (재사용)
    ├── BottomNav.tsx           # 하단 네비게이션 바
    ├── WodCard.tsx             # WOD 카드
    ├── TimerWidget.tsx         # 타이머 위젯
    └── StatCard.tsx            # 통계 카드

lib/
├── firebase.ts                 # Firebase 초기화
└── firestore.ts                # Firestore 쿼리 함수 모음
```

---

## 🚀 개발 순서

| 단계  | 작업                                  | 비고                    |
| ----- | ------------------------------------- | ----------------------- |
| 1단계 | Firebase 프로젝트 세팅 + Next.js 연동 | 환경변수 설정 포함      |
| 2단계 | Firebase Auth 로그인 구현             | Google 소셜 로그인      |
| 3단계 | BottomNav + 공통 레이아웃 구성        | app/layout.tsx          |
| 4단계 | Home + WOD 화면 개발                  | 핵심 기능               |
| 5단계 | Timer 기능 개발                       | AMRAP / For Time / EMOM |
| 6단계 | Record + PR 기록 저장                 | Firestore 연동          |
| 7단계 | Profile + 통계 화면                   | weeklyStats 집계        |
| 8단계 | UI 다듬기 + 반응형 최적화             | 모바일 퍼스트           |

---

## ⚙️ 시작하기

```bash
# 패키지 설치
npm install

# 환경변수 설정
cp .env.example .env.local
# .env.local에 Firebase 설정값 입력

# 개발 서버 실행
npm run dev
```

### 환경변수 (.env.local)

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

---

_WODX — Build The Athlete_ 🔥
