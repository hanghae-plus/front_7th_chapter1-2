# 일정 관리 캘린더 애플리케이션 PRD (Product Requirements Document)

## 목차

- [개요](#개요)
- [프로젝트 구조](#프로젝트-구조)
- [핵심 기능](#핵심-기능)
- [데이터 모델](#데이터-모델)
- [API 명세](#api-명세)
- [컴포넌트 구조](#컴포넌트-구조)
- [기술 스택](#기술-스택)

---

## 개요

일정 관리 캘린더 애플리케이션은 사용자가 일정을 등록, 수정, 삭제하고 월간/주간 뷰로 확인할 수 있는 웹 애플리케이션입니다. 일정 검색, 중복 확인, 알림 기능을 제공하여 효율적인 일정 관리를 지원합니다.

### 주요 특징

- 월간/주간 캘린더 뷰 제공
- 일정 CRUD (생성, 조회, 수정, 삭제)
- 실시간 일정 검색
- 일정 시간 중복 감지 및 경고
- 일정 시작 전 알림 기능
- 한국 공휴일 표시
- 반응형 UI (Material-UI)

---

## 프로젝트 구조

```
src/
├── apis/
│   └── fetchHolidays.ts          # 공휴일 데이터 조회 API
├── hooks/
│   ├── useCalendarView.ts        # 캘린더 뷰 상태 관리 (월/주 전환, 날짜 네비게이션)
│   ├── useEventForm.ts           # 일정 폼 상태 관리 (입력값, 유효성 검사)
│   ├── useEventOperations.ts    # 일정 CRUD 작업 (생성, 조회, 수정, 삭제)
│   ├── useNotifications.ts       # 알림 시스템 (일정 시작 전 알림)
│   └── useSearch.ts              # 일정 검색 및 필터링
├── utils/
│   ├── dateUtils.ts              # 날짜 관련 유틸리티 (월/주 계산, 포맷팅)
│   ├── eventUtils.ts             # 일정 필터링 및 검색 유틸리티
│   ├── eventOverlap.ts           # 일정 중복 감지 로직
│   ├── notificationUtils.ts      # 알림 메시지 생성 및 upcoming 이벤트 필터
│   └── timeValidation.ts         # 시간 유효성 검사
├── __tests__/
│   ├── hooks/                    # 커스텀 훅 테스트
│   ├── unit/                     # 유틸리티 함수 단위 테스트
│   └── medium.integration.spec.tsx  # 통합 테스트
├── __mocks__/
│   ├── handlers.ts               # MSW 핸들러 (API 모킹)
│   ├── handlersUtils.ts          # 핸들러 유틸리티
│   └── response/                 # 목 데이터
├── App.tsx                       # 메인 애플리케이션 컴포넌트
├── types.ts                      # TypeScript 타입 정의
└── main.tsx                      # 앱 진입점

```

### 폴더별 역할

| 폴더/파일          | 책임                                  | 주요 파일           |
| ------------------ | ------------------------------------- | ------------------- |
| **apis/**          | 외부 API 통신 및 데이터 조회          | `fetchHolidays.ts`  |
| **hooks/**         | 비즈니스 로직 및 상태 관리            | 5개의 커스텀 훅     |
| **utils/**         | 순수 함수 유틸리티 (날짜, 검색, 검증) | 5개의 유틸리티 모듈 |
| \***\*tests**/\*\* | 테스트 코드 (단위/통합 테스트)        | 12개의 테스트 파일  |
| \***\*mocks**/\*\* | API 모킹 및 테스트 데이터             | MSW 핸들러          |

---

## 핵심 기능

### 1. 일정 관리 (CRUD)

#### 1.1 일정 생성

- **기능**: 새로운 일정 추가
- **입력 필드**:
  - 제목 (필수)
  - 날짜 (필수)
  - 시작 시간 (필수)
  - 종료 시간 (필수)
  - 설명 (선택)
  - 위치 (선택)
  - 카테고리 (업무/개인/가족/기타)
  - 반복 설정 (선택, 8주차 과제)
  - 알림 시간 (1분/10분/1시간/2시간/1일 전)
- **유효성 검사**:
  - 필수 필드 검증
  - 시작 시간 < 종료 시간 검증
  - 기존 일정과 시간 중복 검사
- **관련 파일**: `hooks/useEventOperations.ts`, `hooks/useEventForm.ts`, `utils/timeValidation.ts`, `utils/eventOverlap.ts`

#### 1.2 일정 조회

- **기능**: 등록된 일정 목록 표시
- **뷰 모드**:
  - 월간 뷰: 한 달 전체 일정
  - 주간 뷰: 해당 주(일~토) 일정
- **데이터 표시**:
  - 캘린더 그리드에 일정 표시
  - 우측 패널에 상세 목록
  - 알림 설정된 일정 강조 표시
- **관련 파일**: `hooks/useCalendarView.ts`, `App.tsx`, `utils/dateUtils.ts`

#### 1.3 일정 수정

- **기능**: 기존 일정 수정
- **동작**:
  - 일정 클릭 시 폼에 데이터 로드
  - 수정 후 저장
  - 중복 검사 재실행
- **관련 파일**: `hooks/useEventForm.ts`, `hooks/useEventOperations.ts`

#### 1.4 일정 삭제

- **기능**: 일정 삭제
- **동작**: 삭제 버튼 클릭 시 즉시 삭제
- **관련 파일**: `hooks/useEventOperations.ts`

---

### 2. 캘린더 뷰

#### 2.1 월간 뷰

- **표시 내용**:
  - 현재 월의 모든 날짜 (7x5 또는 7x6 그리드)
  - 각 날짜별 일정 목록
  - 공휴일 표시 (빨간색)
- **네비게이션**: 이전/다음 월 이동
- **관련 파일**: `App.tsx` (renderMonthView), `utils/dateUtils.ts`

#### 2.2 주간 뷰

- **표시 내용**:
  - 현재 주의 7일 (일~토)
  - 각 요일별 일정 목록
- **네비게이션**: 이전/다음 주 이동
- **관련 파일**: `App.tsx` (renderWeekView), `utils/dateUtils.ts`

---

### 3. 일정 검색 및 필터링

#### 3.1 검색 기능

- **검색 대상**: 제목, 설명, 위치
- **검색 방식**: 실시간 텍스트 검색 (대소문자 무시)
- **결과 표시**: 현재 뷰(월/주)에 해당하는 일정만 필터링
- **관련 파일**: `hooks/useSearch.ts`, `utils/eventUtils.ts`

#### 3.2 날짜 범위 필터링

- **자동 필터링**: 현재 선택된 뷰(월/주)에 따라 자동으로 날짜 범위 필터링
- **관련 파일**: `utils/eventUtils.ts`

---

### 4. 일정 충돌 감지

#### 4.1 중복 확인 로직

- **검사 시점**: 일정 저장 시
- **검사 조건**: 동일 날짜에 시간 범위가 겹치는 일정
- **알고리즘**: `start1 < end2 && start2 < end1`
- **관련 파일**: `utils/eventOverlap.ts`

#### 4.2 중복 경고

- **UI**: 다이얼로그 표시
- **내용**: 겹치는 일정 목록 표시
- **선택**: 계속 진행 / 취소
- **관련 파일**: `App.tsx` (Dialog 컴포넌트)

---

### 5. 알림 시스템

#### 5.1 알림 설정

- **옵션**:
  - 1분 전
  - 10분 전 (기본값)
  - 1시간 전
  - 2시간 전
  - 1일 전
- **관련 파일**: `hooks/useEventForm.ts`

#### 5.2 알림 트리거

- **동작**:
  - 1초마다 현재 시간과 일정 시작 시간 비교
  - 설정된 알림 시간에 도달하면 알림 표시
  - 이미 알림된 일정은 재알림 방지
- **표시 위치**: 우측 상단 고정 위치
- **관련 파일**: `hooks/useNotifications.ts`, `utils/notificationUtils.ts`

#### 5.3 알림 표시

- **UI**: Material-UI Alert 컴포넌트
- **내용**: `{알림시간}분 후 {제목} 일정이 시작됩니다.`
- **알림된 일정 강조**: 빨간색 배경, 굵은 글씨, 알림 아이콘
- **관련 파일**: `App.tsx`, `utils/notificationUtils.ts`

---

### 6. 공휴일 표시

- **데이터 소스**: 하드코딩된 2025년 한국 공휴일
- **표시**: 월간 뷰에서 빨간색으로 공휴일 이름 표시
- **관련 파일**: `apis/fetchHolidays.ts`

---

## 데이터 모델

### TypeScript 타입 정의 (`types.ts`)

#### RepeatInfo

```typescript
export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RepeatInfo {
  type: RepeatType; // 반복 유형
  interval: number; // 반복 간격
  endDate?: string; // 반복 종료일 (선택)
}
```

#### EventForm

```typescript
export interface EventForm {
  title: string; // 일정 제목 (필수)
  date: string; // 날짜 (YYYY-MM-DD)
  startTime: string; // 시작 시간 (HH:mm)
  endTime: string; // 종료 시간 (HH:mm)
  description: string; // 설명
  location: string; // 위치
  category: string; // 카테고리 (업무/개인/가족/기타)
  repeat: RepeatInfo; // 반복 정보
  notificationTime: number; // 알림 시간 (분 단위)
}
```

#### Event

```typescript
export interface Event extends EventForm {
  id: string; // 고유 식별자
}
```

---

## API 명세

### 기본 정보

- **Base URL**: `/api`
- **Content-Type**: `application/json`

### Endpoints

#### 1. 일정 목록 조회

```
GET /api/events
```

**Response**:

```json
{
  "events": [
    {
      "id": "1",
      "title": "팀 회의",
      "date": "2025-01-15",
      "startTime": "10:00",
      "endTime": "11:00",
      "description": "주간 팀 미팅",
      "location": "회의실 A",
      "category": "업무",
      "repeat": {
        "type": "none",
        "interval": 1
      },
      "notificationTime": 10
    }
  ]
}
```

#### 2. 일정 생성

```
POST /api/events
```

**Request Body**:

```json
{
  "title": "팀 회의",
  "date": "2025-01-15",
  "startTime": "10:00",
  "endTime": "11:00",
  "description": "주간 팀 미팅",
  "location": "회의실 A",
  "category": "업무",
  "repeat": {
    "type": "none",
    "interval": 1
  },
  "notificationTime": 10
}
```

**Response**: 생성된 Event 객체

#### 3. 일정 수정

```
PUT /api/events/:id
```

**Request Body**: Event 객체 (id 포함)
**Response**: 수정된 Event 객체

#### 4. 일정 삭제

```
DELETE /api/events/:id
```

**Response**: 성공 메시지

---

## 컴포넌트 구조

### App.tsx - 메인 컴포넌트

#### 레이아웃 구조

```
┌─────────────────────────────────────────────────────────────┐
│                      일정 관리 애플리케이션                       │
├──────────────┬──────────────────────┬───────────────────────┤
│ 일정 폼      │   캘린더 뷰              │   일정 목록             │
│ (20%)       │   (50%)              │   (30%)               │
│             │                      │                       │
│ - 제목       │ ┌─ 뷰 선택  ───────┐   │ - 검색창              │
│ - 날짜       │ │ ← Week/Month →  │  │ - 일정 카드           │
│ - 시작시간    │ └─────────────────┘  │   (스크롤)            │
│ - 종료시간    │                      │                       │
│ - 설명       │ [캘린더 그리드]         │                       │
│ - 위치       │                      │                       │
│ - 카테고리    │                      │                       │
│ - 반복       │                      │                       │
│ - 알림       │                      │                       │
│              │                      │                       │
│ [일정 추가]   │                      │                       │
└──────────────┴──────────────────────┴───────────────────────┘
```

#### 주요 하위 컴포넌트

1. **일정 입력 폼 (좌측 패널)**

   - FormControl 컴포넌트들로 구성
   - 실시간 유효성 검사
   - 수정 모드 지원

2. **캘린더 뷰 (중앙 패널)**

   - `renderWeekView()`: 주간 테이블 뷰
   - `renderMonthView()`: 월간 테이블 뷰
   - 네비게이션 버튼 (이전/다음)
   - 뷰 타입 선택 드롭다운

3. **일정 목록 (우측 패널)**

   - 검색 입력창
   - 일정 카드 목록 (스크롤 가능)
   - 수정/삭제 버튼

4. **다이얼로그**

   - 일정 중복 경고 다이얼로그

5. **알림 패널 (우측 상단 고정)**
   - Alert 컴포넌트 스택

---

## 커스텀 훅 상세

### 1. useCalendarView

**역할**: 캘린더 뷰 상태 및 네비게이션 관리

**상태**:

- `view`: 'week' | 'month'
- `currentDate`: Date
- `holidays`: { [key: string]: string }

**함수**:

- `setView(view)`: 뷰 모드 변경
- `navigate(direction)`: 이전/다음 월 또는 주로 이동

**의존성**: `apis/fetchHolidays.ts`

---

### 2. useEventForm

**역할**: 일정 입력 폼 상태 관리

**상태**: 모든 폼 필드 (title, date, startTime, endTime, ...)

- 시간 에러 상태 (startTimeError, endTimeError)
- 편집 중인 일정 (editingEvent)

**함수**:

- `handleStartTimeChange()`: 시작 시간 변경 및 유효성 검사
- `handleEndTimeChange()`: 종료 시간 변경 및 유효성 검사
- `resetForm()`: 폼 초기화
- `editEvent(event)`: 편집 모드로 전환

**의존성**: `utils/timeValidation.ts`

---

### 3. useEventOperations

**역할**: 일정 CRUD 작업

**상태**:

- `events`: Event[]

**함수**:

- `fetchEvents()`: 일정 목록 조회
- `saveEvent(eventData)`: 일정 생성/수정
- `deleteEvent(id)`: 일정 삭제

**API 호출**:

- GET /api/events
- POST /api/events
- PUT /api/events/:id
- DELETE /api/events/:id

**의존성**: `notistack` (알림 표시)

---

### 4. useNotifications

**역할**: 알림 시스템 관리

**상태**:

- `notifications`: { id, message }[]
- `notifiedEvents`: string[] (이미 알림된 일정 ID 목록)

**함수**:

- `checkUpcomingEvents()`: 1초마다 실행, upcoming 일정 확인
- `removeNotification(index)`: 알림 제거

**의존성**: `utils/notificationUtils.ts`

---

### 5. useSearch

**역할**: 일정 검색 및 필터링

**상태**:

- `searchTerm`: string
- `filteredEvents`: Event[] (useMemo로 최적화)

**함수**:

- `setSearchTerm(term)`: 검색어 업데이트

**의존성**: `utils/eventUtils.ts`

---

## 유틸리티 함수 상세

### 1. dateUtils.ts

**주요 함수**:

- `getDaysInMonth(year, month)`: 월의 일수 반환
- `getWeekDates(date)`: 해당 주의 모든 날짜 배열 반환
- `getWeeksAtMonth(date)`: 월간 뷰 주 배열 생성 (7x5/6 그리드)
- `getEventsForDay(events, date)`: 특정 날짜의 일정 필터링
- `formatWeek(date)`: "YYYY년 M월 N주" 형식
- `formatMonth(date)`: "YYYY년 M월" 형식
- `formatDate(date, day?)`: "YYYY-MM-DD" 형식
- `isDateInRange(date, start, end)`: 날짜 범위 확인
- `fillZero(value, size)`: 숫자 0 패딩

---

### 2. eventUtils.ts

**주요 함수**:

- `getFilteredEvents(events, searchTerm, currentDate, view)`: 검색 + 날짜 범위 필터링
- `searchEvents(events, term)`: 제목/설명/위치 검색
- `filterEventsByDateRangeAtWeek(events, date)`: 주간 범위 필터링
- `filterEventsByDateRangeAtMonth(events, date)`: 월간 범위 필터링

---

### 3. eventOverlap.ts

**주요 함수**:

- `parseDateTime(date, time)`: 날짜+시간 문자열을 Date 객체로 변환
- `convertEventToDateRange(event)`: 일정을 시작/종료 Date 객체로 변환
- `isOverlapping(event1, event2)`: 두 일정의 시간 중복 여부 확인
- `findOverlappingEvents(newEvent, events)`: 겹치는 일정 목록 반환

---

### 4. notificationUtils.ts

**주요 함수**:

- `getUpcomingEvents(events, now, notifiedEvents)`: 알림 대상 일정 필터링
  - 조건: 시작 시간까지 남은 시간 ≤ 알림 시간 && 아직 알림 안됨
- `createNotificationMessage(event)`: 알림 메시지 생성

---

### 5. timeValidation.ts

**주요 함수**:

- `getTimeErrorMessage(start, end)`: 시작/종료 시간 유효성 검사
  - 반환: `{ startTimeError: string | null, endTimeError: string | null }`

---

## 기술 스택

### Frontend Framework

- **React** (v18+): UI 라이브러리
- **TypeScript**: 타입 안전성

### UI Components

- **Material-UI (MUI)**: 디자인 시스템
  - Table, Dialog, Alert, TextField, Select, Button 등

### State Management

- **React Hooks**: 상태 관리
  - useState, useEffect, useMemo
  - Custom Hooks (5개)

### Notifications

- **notistack**: 토스트 알림 라이브러리

### Testing

- **Vitest**: 테스트 프레임워크
- **Testing Library**: React 컴포넌트 테스트
- **MSW (Mock Service Worker)**: API 모킹

### Build Tool

- **Vite**: 빌드 도구

---

## 주요 비즈니스 로직

### 1. 일정 중복 검사 알고리즘

```typescript
// utils/eventOverlap.ts
function isOverlapping(event1, event2) {
  const { start: start1, end: end1 } = convertEventToDateRange(event1);
  const { start: start2, end: end2 } = convertEventToDateRange(event2);

  // 두 구간이 겹치는 조건: start1 < end2 && start2 < end1
  return start1 < end2 && start2 < end1;
}
```

### 2. 알림 대상 일정 필터링

```typescript
// utils/notificationUtils.ts
function getUpcomingEvents(events, now, notifiedEvents) {
  return events.filter((event) => {
    const eventStart = new Date(`${event.date}T${event.startTime}`);
    const timeDiff = (eventStart.getTime() - now.getTime()) / 분;

    // 조건: 0 < 남은시간 ≤ 알림시간 && 아직 알림안됨
    return timeDiff > 0 && timeDiff <= event.notificationTime && !notifiedEvents.includes(event.id);
  });
}
```

### 3. 검색 및 필터링

```typescript
// utils/eventUtils.ts
function getFilteredEvents(events, searchTerm, currentDate, view) {
  // 1단계: 텍스트 검색
  const searchedEvents = searchEvents(events, searchTerm);

  // 2단계: 날짜 범위 필터링
  if (view === 'week') {
    return filterEventsByDateRangeAtWeek(searchedEvents, currentDate);
  }
  if (view === 'month') {
    return filterEventsByDateRangeAtMonth(searchedEvents, currentDate);
  }

  return searchedEvents;
}
```

---

## 테스트 전략

### 테스트 카테고리

1. **Unit Tests** (`src/__tests__/unit/`)

   - 유틸리티 함수 테스트
   - 순수 함수 로직 검증

2. **Hook Tests** (`src/__tests__/hooks/`)

   - 커스텀 훅 동작 테스트
   - 상태 변경 및 부수 효과 검증

3. **Integration Tests** (`src/__tests__/medium.integration.spec.tsx`)
   - 컴포넌트 통합 테스트
   - 사용자 시나리오 테스트

### 테스트 난이도 구분

- **easy**: 기본 기능 테스트
- **medium**: 복잡한 로직 및 통합 테스트

---

## 향후 확장 가능성

### 현재 미구현 기능

1. **반복 일정** (8주차 과제)
   - 일간/주간/월간/연간 반복
   - 반복 종료일 설정

### 제안 기능

1. **드래그 앤 드롭**: 일정 시간 변경
2. **일정 카테고리별 색상**: 시각적 구분
3. **월간 뷰에서 더보기**: 하루에 많은 일정이 있을 때
4. **엑스포트**: iCal, Google Calendar 연동
5. **다크 모드**: 테마 지원
6. **모바일 최적화**: 반응형 개선

---

## 파일별 주요 책임 요약

| 파일 경로                     | 주요 책임                     | 의존성                    |
| ----------------------------- | ----------------------------- | ------------------------- |
| `App.tsx`                     | 메인 UI 렌더링, 이벤트 핸들링 | 모든 커스텀 훅, MUI       |
| `types.ts`                    | 타입 정의                     | 없음                      |
| `hooks/useCalendarView.ts`    | 캘린더 뷰 상태                | `apis/fetchHolidays`      |
| `hooks/useEventForm.ts`       | 폼 상태 관리                  | `utils/timeValidation`    |
| `hooks/useEventOperations.ts` | CRUD 작업                     | `notistack`               |
| `hooks/useNotifications.ts`   | 알림 시스템                   | `utils/notificationUtils` |
| `hooks/useSearch.ts`          | 검색 기능                     | `utils/eventUtils`        |
| `utils/dateUtils.ts`          | 날짜 계산                     | 없음                      |
| `utils/eventUtils.ts`         | 일정 필터링                   | `utils/dateUtils`         |
| `utils/eventOverlap.ts`       | 중복 검사                     | 없음                      |
| `utils/notificationUtils.ts`  | 알림 로직                     | 없음                      |
| `utils/timeValidation.ts`     | 시간 검증                     | 없음                      |
| `apis/fetchHolidays.ts`       | 공휴일 데이터                 | 없음                      |

---

## 성능 최적화

### 1. useMemo 사용

- `useSearch.ts`에서 filteredEvents 계산 메모이제이션

### 2. 불필요한 리렌더링 방지

- 커스텀 훅으로 관심사 분리
- 상태 관리 최적화

### 3. 알림 체크 최적화

- 1초 간격 체크 (setInterval)
- 이미 알림된 일정 제외 (notifiedEvents 배열)

---

## 에러 처리

### 1. API 에러

- try-catch로 모든 API 호출 래핑
- 에러 발생 시 notistack으로 사용자에게 알림
- 콘솔에 에러 로깅

### 2. 유효성 검사 에러

- 필수 필드 누락: "필수 정보를 모두 입력해주세요."
- 시간 검증 실패: "시간 설정을 확인해주세요."
- 실시간 툴팁으로 에러 메시지 표시

### 3. 일정 중복 경고

- 다이얼로그로 사용자 확인 요청
- 계속 진행 or 취소 선택 가능

---

## 접근성 (Accessibility)

- `aria-label` 속성 사용
- `aria-labelledby` 속성 사용
- 키보드 네비게이션 지원 (Material-UI 기본 지원)
- 시맨틱 HTML (FormControl, FormLabel)

---

## 개발 가이드

### 새로운 기능 추가 시 고려사항

1. **타입 정의**: `types.ts`에 필요한 타입 추가
2. **유틸리티 함수**: 순수 함수는 `utils/` 디렉토리에 추가
3. **API 통신**: `hooks/useEventOperations.ts` 또는 별도 API 파일 사용
4. **상태 관리**: 커스텀 훅으로 분리
5. **테스트 작성**: 단위/통합 테스트 필수

### 코드 스타일

- TypeScript strict mode
- ESLint 규칙 준수
- 함수형 컴포넌트 및 Hooks 사용
- 한글 주석 및 변수명 허용 (UI 텍스트)

---

## 버전 히스토리

- **v1.0**: 초기 버전 (일정 CRUD, 검색, 알림, 중복 검사)
- **v2.0** (예정): 반복 일정 기능 추가

---

## 문의 및 기여

- 이슈 및 버그 리포트: GitHub Issues
- 기능 제안: Pull Request
