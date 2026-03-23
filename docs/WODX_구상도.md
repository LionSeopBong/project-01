# WODX 앱 구상도 및 화면 흐름도

## 기술 스택

| 항목       | 기술                        |
| ---------- | --------------------------- |
| 프레임워크 | Next.js 14 (App Router)     |
| 스타일링   | Tailwind CSS                |
| 언어       | TypeScript                  |
| 백엔드     | Firebase (Auth, Firestore)  |
| 배포       | Vercel                      |
| 아이콘     | Font Awesome (@fortawesome) |
| 차트       | Recharts                    |

---

## 프로젝트 폴더 구조

```
app/
  page.tsx                    # 스플래시 페이지
  login/page.tsx              # 로그인 (Google OAuth)
  onboarding/profile/page.tsx # 최초 프로필 설정
  home/page.tsx               # 홈
  wod/page.tsx                # WOD 페이지 (댓글)
  record/
    page.tsx                  # 기록 메인 (달력, 리더보드, 레이더차트)
    add/page.tsx              # 기록 등록c:\Users\user\Desktop\WODX_구상도.md
    edit/[id]/page.tsx        # 기록 수정
  prdata/page.tsx             # PR Board
  profile/page.tsx            # 프로필
  admin/
    wod/page.tsx              # WOD 등록 (관리자)
    wod/edit/[id]/page.tsx    # WOD 수정 (관리자)

components/ui/
  BottomNav.tsx               # 하단 네비게이션
  HomeHeader.tsx              # 상단 헤더 (알림, 메뉴)
  AttendanceCalendar.tsx      # 출석 달력
  WodCard.tsx                 # WOD 카드
  AthleteRadar.tsx            # 레이더 차트

hooks/
  auth/
    useAuthGuard.ts           # 로그인 체크 + 리다이렉트
    useAdminGuard.ts          # 관리자 체크 + 리다이렉트
    useIsAdmin.ts             # 관리자 여부 확인
  wod/
    useWod.ts                 # 특정 WOD ID로 데이터
    useWodByDate.ts           # 날짜별 WOD
    useTodayWod.ts            # 오늘 WOD
  record/
    useMyRecords.ts           # 내 기록 목록
    useMyPrRecords.ts         # 내 PR 기록
    useLeaderboard.ts         # 리더보드
    useRecordForm.ts          # 기록 등록/수정 폼 관리
  user/
    useDate.ts                # 날짜 표시
    useCalendar.ts            # 출석 데이터
    useUserInfo.ts            # 유저 정보
    useNotifications.ts       # 알림 (onSnapshot 실시간)
  social/
    useComments.ts            # 댓글 관리

lib/
  firebase.ts                 # Firebase 초기화
  auth.ts                     # Google 로그인/로그아웃
  firestore.ts                # Firestore CRUD 함수
  utils.ts                    # 유틸 함수
  constants.ts                # 상수 (레벨, 타입, PR 운동 목록 등)

types/
  wod.ts                      # 타입 정의
```

---

## 화면 흐름도

```
[스플래시] → START 버튼
    │
    ▼
[로그인] → Google 로그인
    │
    ├─ 신규 유저 또는 프로필 없음 → [온보딩 - 프로필 설정]
    │                                   │
    │                                   ▼
    │                              이름/성별/몸무게/키 입력 → [홈]
    │
    └─ 기존 유저 → [홈]
```

---

## 페이지별 기능 상세

### 홈 (`/home`)

- 오늘 날짜 표시
- 오늘 WOD 카드 표시
  - 관리자: 수정/삭제 드롭다운
  - 일반 유저: Done 버튼 → 기록 등록 페이지
- 월간 출석 달력
- 공지 카드

### WOD (`/wod`)

- 날짜 네비게이션 (Prev/Next, DatePicker)
  - 다음 날 WOD 가 등록된 경우에만 Next 버튼 활성화
- WOD 카드 (파트별 타입, 무게, 메모, 팀 여부)
- 댓글 섹션 (등록/삭제/좋아요)
  - 좋아요 시 댓글 작성자에게 알림

### 기록 등록 (`/record/add`)

- URL 파라미터로 `wodId` 수신
- 파트 선택 (A/B/C 독립 state 관리)
- 레벨 선택 (Beginner / Scale / R'xd / Athlete)
- WOD 타입별 입력 폼
  - **For Time**: 완료 시간(분/초), DNF 시 라운드+렙수
  - **AMRAP**: 라운드+렙수, 총 렙수만 제출 옵션
  - **EMOM**: 총 렙수 또는 실패 횟수
  - **Every / Strength**: 메모 입력
- 무게 입력 (도구/무게/단위, 권장 무게 참고)
- 팀 WOD 입력 (파트너 이름, 다른 무게 사용 여부)
- 모든 파트 한번에 저장

### 기록 수정 (`/record/edit/[id]`)

- 진입한 파트만 수정 가능 (다른 파트 비활성화)
- 기존 기록 불러와서 수정
- 저장 시 해당 파트 기록 업데이트

### 기록 메인 (`/record`)

- 월간 출석 달력 (날짜 클릭 시 해당 날짜 기록 표시)
- 레이더 차트 (Athlete Profile)
- 탭 구성
  - **내 기록**: 선택한 날짜의 기록 카드 (수정/삭제)
    - 기록 없으면 "+ 기록 추가" 버튼 (WOD 없으면 비활성화)
    - 레벨 표시 (권장 무게보다 낮으면 자동으로 Scale 표시)
  - **리더보드(남)**: 남성 기록, 파트별/레벨별 정렬
  - **리더보드(여)**: 여성 기록, 파트별/레벨별 정렬

### PR Board (`/prdata`)

- 레이더 차트 (Athlete Profile) - Record 페이지와 공유
- 카테고리별 아코디언 (접기/펼치기)
  - **Power**: Snatch, Clean, Push Press, Hang Clean, Hang Snatch, Jerk
  - **Strength**: Back Squat, Deadlift, Front Squat, Bench Press, Shoulder Press
  - **Skill**: Ring Muscle-Up, Bar Muscle-Up, Chest-to-Bar, Pull-Up, HSPU, Wall Walk, Hand Stand Walk
  - **Endurance**: 5km / 10km / 21km Run
  - **Conditioning**: Murph, Grace, Chelsea, Isabel, Fran, Helen, Jackie
- 운동 카드 클릭 시 히스토리 + 라인 차트 표시
- PR 추가 버튼
  - 오늘 기록 있으면 교체 확인 모달
  - 하루에 1개 기록만 저장 (교체 방식)
  - 미래 날짜 선택 불가
- 카테고리별 입력 폼
  - Power/Strength: 무게 (kg/lb)
  - Skill: Max Reps (Hand Stand Walk는 거리)
  - Endurance/Conditioning: 시간 (시/분/초)

### 프로필 (`/profile`)

- 프로필 이미지 (Google 계정 사진)
- 인라인 수정 (이름/성별/몸무게/키/단위)
- 로그아웃

### 관리자 WOD 등록 (`/admin/wod`)

- WOD 제목/날짜 입력
- 파트 추가/삭제 (최대 3개)
- 파트별 설정
  - 타입 선택 (For Time/AMRAP/EMOM/Every/Strength/Accessory)
  - 무게 설정 (도구/남성무게/여성무게/단위)
  - 팀 WOD 설정 (인원수)
  - 메모
- WOD 등록 시 모든 유저에게 알림 전송

---

## 레이더 차트 (Athlete Profile)

### 5가지 능력치

| 항목         | 기준 운동                    | 값 타입 | 정렬          |
| ------------ | ---------------------------- | ------- | ------------- |
| Power        | Snatch, Clean, Push Press 등 | weight  | 높을수록 좋음 |
| Strength     | Back Squat, Deadlift 등      | weight  | 높을수록 좋음 |
| Endurance    | 5km/10km/21km Run            | time    | 낮을수록 좋음 |
| Skill        | Pull-Up, Muscle-Up 등        | reps    | 높을수록 좋음 |
| Conditioning | Fran, Grace 등               | time    | 낮을수록 좋음 |

### 점수 계산

- 각 운동별 최고 기록 기준
- 기록 있는 운동들의 평균으로 카테고리 점수 계산
- 성별별 다른 기준값 (maleMax / femaleMax)
- lb 입력 시 kg 으로 변환 후 계산 (1lb = 0.453592kg)
- 운동별 가중치 적용 (POWER_WEIGHTS / STRENGTH_WEIGHTS / SKILL_WEIGHTS / ENDURANCE_WEIGHTS)
- 총점 = 5개 카테고리 평균

---

## Firestore 컬렉션 구조

### `users`

```
id: string (uid)
name: string
gender: "male" | "female"
weight: number
height: number
unit: "kg" | "lb"
profileImage: string
role: "admin" | "user"
createdAt: Timestamp
```

### `wods`

```
id: string
date: string (YYYY-MM-DD)
title: string
parts: WodPart[]
  - part: "A" | "B" | "C"
  - type: "For Time" | "AMRAP" | "EMOM" | "Every" | "Strength" | "Accessory"
  - weights: WodWeight[]
  - isTeam: boolean
  - teamSize: number
  - note: string
note: string
createdAt: Timestamp
```

### `workoutRecords`

```
id: string
userId: string
userName: string
gender: string
wodId: string
wodName: string
wodPart: "A" | "B" | "C"
wodType: string
level: "Beginner" | "Scale" | "R'xd" | "Athlete"
completedAt: string (YYYY-MM-DD)
isDNF: boolean
weights: RecordWeight[]
finishTime?: number (초)
rounds?: number
reps?: number
totalReps?: number
failCount?: number
hasTotalRepsOnly?: boolean
hasRepsOnly?: boolean
wodTeam: boolean
partnerName: string
memo?: string
createdAt: Timestamp
```

### `prRecords`

```
id: string
userId: string
category: string
exercise: string
weight: number
time: number
reps: number
distance?: number
distanceUnit?: "m" | "ft"
unit: "kg" | "lb"
recordedAt: string (YYYY-MM-DD)
createdAt: Timestamp
```

### `comments`

```
id: string
wodId: string
userId: string
userName: string
profileImage: string
content: string
likes: number
likedBy: string[]
createdAt: Timestamp
```

### `notifications`

```
id: string
userId: string
type: "wod_registered" | "comment_like"
message: string
isRead: boolean
link: string
createdAt: Timestamp
```

---

## 알림 시스템

| 이벤트      | 수신자      | 메시지                               |
| ----------- | ----------- | ------------------------------------ |
| WOD 등록    | 모든 유저   | "오늘의 WOD가 등록되었어요! 📋"      |
| 댓글 좋아요 | 댓글 작성자 | "누군가 회원님의 댓글을 좋아해요 ❤️" |

- `onSnapshot` 으로 실시간 수신
- 읽음/안읽음 처리
- 읽은 알림 전체 삭제
- 시간 표시: 방금 전 / N분 전 / N시간 전 / N일 전

---

## 리더보드 정렬 기준

| WOD 타입 | 정렬 기준                                        |
| -------- | ------------------------------------------------ |
| For Time | finishTime 오름차순, DNF 는 rounds→reps 내림차순 |
| AMRAP    | rounds 내림차순 → reps 내림차순 (또는 totalReps) |
| EMOM     | failCount 오름차순 (또는 totalReps 내림차순)     |
| Every    | 마지막 무게 내림차순                             |

---

## 주요 상수 (constants.ts)

```ts
LEVELS: ["Beginner", "Scale", "R'xd", "Athlete"]
WOD_TYPES: ["For Time", "AMRAP", "EMOM", "Every", "Strength", "Accessory"]
WEIGHT_TOOLS: ["Barbell", "Dumbbell", "Kettlebell", "Other"]
PR_EXERCISES: 카테고리별 운동 목록 (valueType 포함)
PR_RADAR_CONFIG: 레이더 차트 설정 (maleMax, femaleMax, inverse, valueType)
POWER_WEIGHTS: 파워 운동별 가중치
STRENGTH_WEIGHTS: 스트랭스 운동별 가중치
SKILL_WEIGHTS: 스킬 운동별 가중치
ENDURANCE_WEIGHTS: 지구력 운동별 가중치
```
