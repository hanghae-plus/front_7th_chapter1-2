# 📋 프로젝트 구조 분석 산출물

**작성일**: 2025-10-28  
**버전**: v1.0  
**목적**: 반복 일정 기능 구현을 위한 프로젝트 전체 구조 파악

---

## 🎯 프로젝트 개요

### 📌 프로젝트명

React/TypeScript 기반 캘린더 애플리케이션

### 🎯 주요 목표

일정 관리 애플리케이션에 반복 일정(Recurring Events) 기능 추가

### 🛠️ 기술 스택

- **Frontend**: React 19.1.0, TypeScript
- **UI Library**: Material-UI (MUI) 7.2.0
- **State Management**: React Hooks
- **Testing**: Vitest, React Testing Library
- **Build Tool**: Vite
- **Backend**: Express.js (간단한 Mock API)

---

## 📁 프로젝트 구조

### 🗂️ 디렉토리 구조

```
front_7th_chapter1-2/
├── .github/
│   └── PULL_REQUEST_TEMPLATE.md          # 과제 요구사항 체크리스트
├── agents/                               # BMAD 에이전트 명세 파일들
│   ├── analyst.md
│   ├── architect.md
│   ├── dev.md
│   ├── orchestrator.md
│   ├── pm.md
│   ├── qa.md
│   └── scrum-master.md
├── mockdowns/
│   ├── artifacts/                        # 에이전트 산출물 저장 위치
│   │   └── process/
│   │       ├── ai-coding-guidelines.md   # AI 코딩 가이드라인
│   │       └── testing-rules.md          # 테스트 작성 규칙
│   └── templates/                        # 산출물 템플릿
│       ├── analyst-prd.md
│       ├── architect-design.md
│       ├── dev-implementation.md
│       ├── orchestrator-architecture-summary.md
│       ├── orchestrator-prd-summary.md
│       ├── pm-roadmap.md
│       ├── qa-verification.md
│       └── scrum-master-story.md
├── src/
│   ├── __mocks__/                        # Mock 데이터
│   │   ├── handlers.ts
│   │   ├── handlersUtils.ts
│   │   └── response/
│   │       ├── events.json
│   │       └── realEvents.json
│   ├── __tests__/                        # 테스트 파일
│   │   ├── hooks/                        # 커스텀 훅 테스트
│   │   │   ├── easy.useCalendarView.spec.ts
│   │   │   ├── easy.useSearch.spec.ts
│   │   │   ├── medium.useEventOperations.spec.ts
│   │   │   └── medium.useNotifications.spec.ts
│   │   ├── unit/                         # 유닛 테스트
│   │   │   ├── easy.dateUtils.spec.ts
│   │   │   ├── easy.eventOverlap.spec.ts
│   │   │   ├── easy.eventUtils.spec.ts
│   │   │   ├── easy.fetchHolidays.spec.ts
│   │   │   ├── easy.notificationUtils.spec.ts
│   │   │   └── easy.timeValidation.spec.ts
│   │   ├── medium.integration.spec.tsx   # 통합 테스트
│   │   └── utils.ts                      # 테스트 유틸리티
│   ├── apis/
│   │   └── fetchHolidays.ts              # 공휴일 API
│   ├── hooks/                            # 커스텀 훅
│   │   ├── useCalendarView.ts            # 캘린더 뷰 관리
│   │   ├── useEventForm.ts               # 이벤트 폼 상태 관리
│   │   ├── useEventOperations.ts         # 이벤트 CRUD 작업
│   │   ├── useNotifications.ts           # 알림 관리
│   │   └── useSearch.ts                  # 검색 기능
│   ├── utils/                            # 유틸리티 함수
│   │   ├── dateUtils.ts                  # 날짜 관련 유틸리티
│   │   ├── eventOverlap.ts               # 이벤트 겹침 검증
│   │   ├── eventUtils.ts                 # 이벤트 필터링/검색
│   │   ├── notificationUtils.ts          # 알림 유틸리티
│   │   └── timeValidation.ts             # 시간 유효성 검증
│   ├── App.tsx                           # 메인 애플리케이션 컴포넌트
│   ├── main.tsx                          # 애플리케이션 진입점
│   ├── setupTests.ts                     # 테스트 설정
│   ├── types.ts                          # TypeScript 타입 정의
│   └── vite-env.d.ts                     # Vite 환경 타입
├── server.js                             # Express Mock 서버
├── .cursorrules                          # Cursor AI 규칙
├── package.json
└── vite.config.ts
```

---

## 🔑 핵심 파일 분석

### 📄 types.ts

```typescript
// 반복 유형 (이미 정의됨)
export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

// 반복 정보 (이미 정의됨)
export interface RepeatInfo {
  type: RepeatType;
  interval: number;
  endDate?: string;
}

// 이벤트 폼 데이터 (repeat 필드 포함)
export interface EventForm {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  location: string;
  category: string;
  repeat: RepeatInfo; // ✅ 이미 포함됨
  notificationTime: number;
}

// 이벤트 (ID 추가)
export interface Event extends EventForm {
  id: string;
}
```

**현재 상태**: 반복 일정을 위한 타입이 이미 정의되어 있으나, 실제 기능은 구현되지 않음.

---

### 🎣 Hooks 분석

#### 1️⃣ useEventForm.ts

**역할**: 이벤트 폼 상태 관리

**현재 반복 관련 상태**:

```typescript
- isRepeating: boolean           // 반복 일정 활성화 여부
- repeatType: RepeatType         // 반복 유형
- repeatInterval: number         // 반복 간격
- repeatEndDate: string          // 반복 종료일
- setRepeatType                  // ✅ 이미 구현됨
- setRepeatInterval              // ✅ 이미 구현됨
- setRepeatEndDate               // ✅ 이미 구현됨
```

**구현 상태**:

- ✅ 상태 관리는 구현됨
- ❌ UI는 주석 처리됨 (App.tsx 441-478 라인)

#### 2️⃣ useEventOperations.ts

**역할**: 이벤트 CRUD 작업

**현재 기능**:

- `fetchEvents()`: 이벤트 목록 로드
- `saveEvent()`: 이벤트 생성/수정
- `deleteEvent()`: 이벤트 삭제

**필요한 개선**:

- ❌ 반복 일정 생성 로직 추가 필요
- ❌ 반복 일정 수정 (단일/전체) 로직 필요
- ❌ 반복 일정 삭제 (단일/전체) 로직 필요

#### 3️⃣ useCalendarView.ts

**역할**: 캘린더 뷰 관리 (week/month)

**현재 기능**:

- 뷰 타입 관리 (week/month)
- 현재 날짜 관리
- 공휴일 데이터
- 네비게이션 (이전/다음)

**필요한 개선**:

- ❌ 반복 일정 표시 로직 추가 필요

#### 4️⃣ useSearch.ts

**역할**: 이벤트 검색 및 필터링

**현재 기능**:

- 검색어 기반 필터링
- 날짜 범위 기반 필터링

**필요한 개선**:

- ❌ 반복 일정이 확장된 이벤트 목록에서 검색 지원 필요

#### 5️⃣ useNotifications.ts

**역할**: 알림 관리

**현재 기능**:

- 예정된 이벤트 알림 표시
- 알림 목록 관리

**필요한 개선**:

- ❌ 반복 일정의 알림 처리 필요

---

### 🛠️ Utils 분석

#### 1️⃣ dateUtils.ts

**주요 함수**:

- `getDaysInMonth()`: 특정 월의 일수 반환
- `getWeekDates()`: 주의 모든 날짜 반환
- `getWeeksAtMonth()`: 월의 모든 주 반환
- `getEventsForDay()`: 특정 날짜의 이벤트 필터링
- `formatWeek()`, `formatMonth()`: 날짜 포맷팅
- `isDateInRange()`: 날짜 범위 확인
- `formatDate()`: 날짜 문자열 생성

**추가 필요 함수**:

- ❌ `generateRecurringDates()`: 반복 일정 날짜 생성
- ❌ `isValidRecurringDate()`: 반복 일정 날짜 유효성 검증
- ❌ `calculateNextRecurringDate()`: 다음 반복 날짜 계산

#### 2️⃣ eventUtils.ts

**주요 함수**:

- `filterEventsByDateRange()`: 날짜 범위로 필터링
- `searchEvents()`: 검색어로 필터링
- `getFilteredEvents()`: 통합 필터링 (검색 + 날짜 범위)

**추가 필요 함수**:

- ❌ `expandRecurringEvents()`: 반복 일정을 개별 이벤트로 확장
- ❌ `groupRecurringEvents()`: 반복 일정 그룹화

#### 3️⃣ eventOverlap.ts

**주요 함수**:

- `parseDateTime()`: 날짜/시간 파싱
- `convertEventToDateRange()`: 이벤트를 날짜 범위로 변환
- `isOverlapping()`: 두 이벤트 겹침 확인
- `findOverlappingEvents()`: 겹치는 이벤트 찾기

**현재 상태**:

- ✅ 기본 기능 구현됨
- ℹ️ 과제 요구사항: 반복 일정은 겹침을 고려하지 않음

#### 4️⃣ timeValidation.ts

**주요 함수**:

- `getTimeErrorMessage()`: 시작/종료 시간 유효성 검증

**현재 상태**: ✅ 기본 기능 구현됨

#### 5️⃣ notificationUtils.ts

**주요 함수**:

- `getUpcomingEvents()`: 예정된 이벤트 필터링
- `createNotificationMessage()`: 알림 메시지 생성

**추가 필요 기능**:

- ❌ 반복 일정의 알림 처리

---

### 🖥️ App.tsx

**현재 상태**:

- ✅ 이벤트 폼 UI 구현됨
- ✅ 캘린더 뷰 (week/month) 구현됨
- ✅ 이벤트 목록 표시 구현됨
- ❌ 반복 일정 UI는 주석 처리됨 (라인 441-478)

**반복 일정 UI (주석 처리된 부분)**:

```typescript
{
  isRepeating && (
    <Stack spacing={2}>
      <FormControl fullWidth>
        <FormLabel>반복 유형</FormLabel>
        <Select
          size="small"
          value={repeatType}
          onChange={(e) => setRepeatType(e.target.value as RepeatType)}
        >
          <MenuItem value="daily">매일</MenuItem>
          <MenuItem value="weekly">매주</MenuItem>
          <MenuItem value="monthly">매월</MenuItem>
          <MenuItem value="yearly">매년</MenuItem>
        </Select>
      </FormControl>
      <Stack direction="row" spacing={2}>
        <FormControl fullWidth>
          <FormLabel>반복 간격</FormLabel>
          <TextField
            size="small"
            type="number"
            value={repeatInterval}
            onChange={(e) => setRepeatInterval(Number(e.target.value))}
          />
        </FormControl>
        <FormControl fullWidth>
          <FormLabel>반복 종료일</FormLabel>
          <TextField
            size="small"
            type="date"
            value={repeatEndDate}
            onChange={(e) => setRepeatEndDate(e.target.value)}
          />
        </FormControl>
      </Stack>
    </Stack>
  );
}
```

**필요한 개선**:

- ❌ 반복 일정 UI 활성화
- ❌ 반복 일정 아이콘 표시 추가
- ❌ 반복 일정 수정 시 확인 다이얼로그 추가
- ❌ 반복 일정 삭제 시 확인 다이얼로그 추가

---

## 📋 과제 요구사항 분석

### ✅ 필수 스펙

#### 1️⃣ 반복 유형 선택

- [ ] 일정 생성 또는 수정 시 반복 유형 선택 가능
- [ ] 반복 유형: 매일, 매주, 매월, 매년
  - [ ] 31일에 매월 선택 → 31일에만 생성
  - [ ] 윤년 29일에 매년 선택 → 29일에만 생성
- [ ] 반복일정은 일정 겹침을 고려하지 않음

#### 2️⃣ 반복 일정 표시

- [ ] 캘린더 뷰에서 반복 일정을 아이콘으로 구분 표시
- [ ] 반복 주기에 맞게 달력에 여러 개 표시
  - 예: 1일 반복이면 23, 24, 25일에 일정 표기

#### 3️⃣ 반복 종료

- [ ] 반복 종료 조건 지정 가능
- [ ] 옵션: 특정 날짜까지
  - 최대 일자: 2025-12-31

#### 4️⃣ 반복 일정 수정

- [ ] "해당 일정만 수정하시겠어요?" 다이얼로그 표시
  - **"예"**: 단일 수정
    - [ ] 반복일정을 단일 일정으로 변경
    - [ ] 반복일정 아이콘 사라짐
  - **"아니오"**: 전체 수정
    - [ ] 반복 일정 유지
    - [ ] 반복일정 아이콘 유지

#### 5️⃣ 반복 일정 삭제

- [ ] "해당 일정만 삭제하시겠어요?" 다이얼로그 표시
  - **"예"**: 단일 삭제
    - [ ] 해당 일정만 삭제
  - **"아니오"**: 전체 삭제
    - [ ] 반복 일정의 모든 일정 삭제

---

## 🎯 구현 전략

### 📌 Phase 1: 기본 반복 일정 생성

1. 반복 일정 UI 활성화
2. 반복 날짜 생성 로직 구현
3. 특수 케이스 처리 (31일, 윤년 29일)

### 📌 Phase 2: 캘린더 뷰 표시

1. 반복 일정 확장 로직 구현
2. 반복 일정 아이콘 추가
3. 캘린더에 반복 일정 렌더링

### 📌 Phase 3: 반복 일정 수정

1. 수정 확인 다이얼로그 추가
2. 단일 수정 로직 구현
3. 전체 수정 로직 구현

### 📌 Phase 4: 반복 일정 삭제

1. 삭제 확인 다이얼로그 추가
2. 단일 삭제 로직 구현
3. 전체 삭제 로직 구현

### 📌 Phase 5: 테스트 및 검증

1. 유닛 테스트 작성
2. 통합 테스트 작성
3. QA 검증

---

## 🔧 기술적 고려사항

### 🗄️ 데이터 모델

#### 기존 Event 타입

```typescript
interface Event {
  id: string;
  title: string;
  date: string; // 기준 날짜
  startTime: string;
  endTime: string;
  description: string;
  location: string;
  category: string;
  repeat: RepeatInfo; // 반복 정보
  notificationTime: number;
}
```

#### 반복 일정 식별 방법

- **Option 1**: `parentEventId` 추가하여 반복 그룹 식별
- **Option 2**: 반복 일정을 동적으로 생성 (저장하지 않음)
- **Option 3**: `repeatGroupId` 추가하여 그룹 관리

**권장**: Option 1 (parentEventId 사용)

- 장점: 단일 이벤트 수정/삭제 구현 용이
- 장점: 기존 구조와 호환성 좋음
- 단점: 데이터베이스 저장 필요

### 🎨 UI/UX 고려사항

1. **반복 아이콘**: Material-UI의 `Repeat` 아이콘 사용
2. **다이얼로그 텍스트**: 명확하고 직관적인 안내 메시지
3. **에러 처리**: 반복 날짜 생성 실패 시 사용자 알림

### ⚡ 성능 고려사항

1. 반복 일정 확장은 현재 뷰 범위만 처리
2. 메모이제이션 활용 (useMemo, useCallback)
3. 대량 반복 일정 처리 시 가상화 고려

---

## 📊 테스트 전략

### 🧪 Unit Tests

- `utils/dateUtils.ts`: 반복 날짜 생성 함수
- `utils/eventUtils.ts`: 반복 일정 확장 함수
- `hooks/useEventOperations.ts`: 반복 일정 CRUD 로직

### 🔄 Integration Tests

- 반복 일정 생성 플로우
- 반복 일정 수정 플로우 (단일/전체)
- 반복 일정 삭제 플로우 (단일/전체)
- 캘린더 뷰에서 반복 일정 표시

### ✅ Acceptance Tests

- 과제 요구사항의 모든 체크리스트 검증

---

## 📝 참조 문서

1. **테스트 규칙**: `mockdowns/artifacts/process/testing-rules.md`
2. **코딩 가이드라인**: `mockdowns/artifacts/process/ai-coding-guidelines.md`
3. **과제 요구사항**: `.github/PULL_REQUEST_TEMPLATE.md`
4. **에이전트 명세**: `agents/` 폴더

---

## ⚠️ 주의사항

### 🚫 수정 금지 영역

- `// No Ai` 주석이 있는 코드
- 기존 함수, Type, 컴포넌트 (반복 관련 신규 추가는 가능)
- `GEMINI.md`, `.cursorrules`, `agents/` 폴더

### ✅ 준수 사항

- TDD 원칙 (테스트 먼저 작성)
- Given-When-Then 패턴
- 한국어 주석
- 명확한 변수명/함수명
- 에러 처리 및 유효성 검사
- 'Ai Edit' 주석 추가 (AI가 작성한 코드)

---

## 📈 점수 현황 (Score Status)

- **획득 점수 (Acquired Score):** 0점
- **누적 점수 (Cumulative Score):** 0점
- **총점 (Total Score):** 예상 총점 100점

---

## ✅ 체크리스트

- [x] 프로젝트 구조 파악
- [x] 핵심 파일 분석
- [x] 과제 요구사항 분석
- [x] 구현 전략 수립
- [x] 기술적 고려사항 정리
- [x] 테스트 전략 수립
- [x] 참조 문서 정리
- [x] 주의사항 확인

---

**문서 작성자**: Cursor Pro (AI Agent)  
**다음 단계**: Orchestrator 에이전트로 이관
