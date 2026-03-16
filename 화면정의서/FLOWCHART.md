# WODX 화면 흐름도

> 전체 페이지 흐름 — 로그인부터 각 탭까지

---

## 전체 흐름 개요

```mermaid
flowchart TD
    A([앱 진입]) --> B{로그인 상태?}
    B -- 미로그인 --> C[온보딩 화면]
    B -- 로그인됨 --> H[Home]

    C --> D[Google 로그인]
    D --> E{신규 유저?}
    E -- Yes --> F[프로필 초기 설정\n이름 / 체중 / 신장]
    E -- No --> H
    F --> H

    H --> TAB1[Home 탭]
    H --> TAB2[WOD 탭]
    H --> TAB3[Record 탭]
    H --> TAB4[PR 탭]
    H --> TAB5[Profile 탭]
```

---

## 🏠 Home 탭 흐름

```mermaid
flowchart TD
    H[Home] --> H1[오늘의 WOD 요약 카드]
    H --> H2[이번 주 출석 달력]
    H --> H3[주간 볼륨 / 칼로리 통계]
    H --> H4[START 버튼]

    H1 --> H1A[WOD 탭으로 이동]
    H4 --> H4A[WOD 탭으로 이동\n운동 시작]
    H4A --> H4B[운동 진행]
    H4B --> H4C[End Workout]
    H4C --> H4D[자동 기록 저장\nworkoutRecords]
```

---

## 💪 WOD 탭 흐름

```mermaid
flowchart TD
    W[WOD] --> W1[오늘의 WOD 상세\n타입 / 라운드 / 무브먼트]
    W1 --> W2[Start Workout 버튼]
    W2 --> W3[운동 진행 화면\n현재 무브먼트 강조]
    W2 --> W8[PR 탭 연동\n타이머 자동 시작]
    W3 --> W4{운동 완료?}
    W4 -- 완료 --> W5[End Workout]
    W5 --> W6[기록 저장 팝업\n시간 / 칼로리 확인]
    W6 --> W7[workoutRecords 저장\n시간 / 칼로리 / Reps / 무게 / Level]
    W4 -- 계속 --> W3
```

---

## 📊 Record 탭 흐름

```mermaid
flowchart TD
    R[Record] --> R1[오늘의 WOD 기록\n시간 / 칼로리 / Level]
    R --> R2[개인 PR 기록\n3대 리프트 / 러닝페이스]
    R --> R3[운동 히스토리\n날짜별 목록\nWOD / Running 등]

    R2 --> R2A[PR 수정 / 추가]
    R2A --> R2B[prRecords 저장]

    R3 --> R3A[날짜 선택]
    R3A --> R3B[해당 날짜 기록 상세\nReps / 무게 / Level 확인]
```

---

---

## 👤 Profile 탭 흐름

```mermaid
flowchart TD
    P[Profile] --> P1[유저 정보\n이름 / 성별 / 체중 / 신장]
    P --> P2[PR 통계 요약\n3대 리프트 / 러닝페이스]
    P --> P3[주간 / 월간 통계]
    P --> P4[설정]

    P1 --> P1A[정보 수정]
    P1A --> P1B[users 업데이트]

    P4 --> P4A[단위 변경\nkg / lbs]
    P4 --> P4B[알림 설정]
    P4 --> P4C[로그아웃]
    P4C --> P4D[온보딩 화면으로 이동]
```

---

## 🔄 데이터 흐름 요약

```mermaid
flowchart LR
    User[유저] --> Auth[Firebase Auth]
    Auth --> Firestore[(Firestore)]

    Firestore --> users[(users)]
    Firestore --> wods[(wods)]
    Firestore --> workoutRecords[(workoutRecords\n시간 / 칼로리 / Reps / 무게 / Level)]
    Firestore --> prRecords[(prRecords\n3대 리프트 / 러닝페이스)]
    Firestore --> weeklyStats[(weeklyStats)]

    wods -- 오늘의 WOD --> WODPage[WOD 탭]
    WODPage -- 완료 기록 --> workoutRecords

    workoutRecords -- 통계 집계 --> weeklyStats
    weeklyStats -- 주간 요약 --> HomePage[Home 탭]
    prRecords -- PR 표시 --> RecordPage[Record 탭]
    prRecords -- PR 요약 --> ProfilePage[Profile 탭]
```

---

_WODX — Build The Athlete_ 🔥
