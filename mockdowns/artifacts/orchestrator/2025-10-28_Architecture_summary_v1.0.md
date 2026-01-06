# 🏗️ Architecture 요약서 - 반복 일정 기능

## 📋 기본 정보

- **작성일**: 2025-10-28
- **프로젝트명**: 캘린더 애플리케이션 - 반복 일정 기능
- **버전**: v1.0
- **작성자**: BMAD Orchestrator

---

## 🏗️ 시스템 아키텍처

### 📐 전체 구조

현재 시스템은 React 기반의 프론트엔드 애플리케이션으로, Hooks 패턴을 활용한 상태 관리와 유틸리티 함수를 통한 비즈니스 로직 분리가 되어 있습니다. 반복 일정 기능은 기존 구조를 확장하는 방식으로 구현됩니다.

### 🧩 핵심 컴포넌트

#### 1️⃣ Presentation Layer (UI)

- **App.tsx**: 메인 애플리케이션 컴포넌트
  - 역할: 전체 UI 렌더링 및 사용자 인터랙션 처리
  - 반복 일정 추가 사항:
    - [x] 반복 일정 UI 활성화 (현재 주석 처리된 441-478 라인)
    - [x] 반복 일정 아이콘 표시 추가
    - [x] 수정/삭제 확인 다이얼로그 추가

#### 2️⃣ State Management Layer (Hooks)

- **useEventForm.ts**: 이벤트 폼 상태 관리

  - 역할: 폼 입력 데이터 관리, 유효성 검증
  - 현재 상태: 반복 관련 상태는 이미 구현됨
  - 추가 필요: 없음 (기존 로직 활용)

- **useEventOperations.ts**: 이벤트 CRUD 작업

  - 역할: 이벤트 생성/수정/삭제 API 호출
  - 반복 일정 추가 사항:
    - [x] 반복 일정 확장 로직 추가
    - [x] 단일/전체 수정 로직 추가
    - [x] 단일/전체 삭제 로직 추가

- **useCalendarView.ts**: 캘린더 뷰 관리

  - 역할: 뷰 타입, 현재 날짜, 네비게이션
  - 반복 일정 추가 사항:
    - [x] 현재 뷰 범위의 반복 일정 확장 로직 추가

- **useSearch.ts**: 검색 및 필터링

  - 역할: 이벤트 검색 및 날짜 범위 필터링
  - 반복 일정 추가 사항:
    - [x] 확장된 반복 일정에서 검색 지원

- **useNotifications.ts**: 알림 관리
  - 역할: 예정된 이벤트 알림
  - 반복 일정 추가 사항:
    - [x] 반복 일정의 알림 처리

#### 3️⃣ Business Logic Layer (Utils)

- **dateUtils.ts**: 날짜 관련 유틸리티

  - 역할: 날짜 계산, 포맷팅, 범위 검증
  - 반복 일정 추가 함수:
    - [x] `generateRecurringDates()`: 반복 날짜 생성
    - [x] `isValidRecurringDate()`: 특수 날짜 유효성 검증
    - [x] `calculateNextRecurringDate()`: 다음 반복 날짜 계산

- **eventUtils.ts**: 이벤트 관련 유틸리티

  - 역할: 이벤트 필터링, 검색
  - 반복 일정 추가 함수:
    - [x] `expandRecurringEvents()`: 반복 일정을 개별 이벤트로 확장
    - [x] `filterRecurringEvents()`: 반복 일정 필터링

- **eventOverlap.ts**: 이벤트 겹침 검증

  - 역할: 이벤트 시간 겹침 확인
  - 반복 일정 처리: 과제 요구사항에 따라 반복 일정은 겹침 검증 제외

- **timeValidation.ts**: 시간 유효성 검증

  - 역할: 시작/종료 시간 검증
  - 반복 일정 추가 사항: 없음 (기존 로직 활용)

- **notificationUtils.ts**: 알림 유틸리티
  - 역할: 알림 시간 계산, 메시지 생성
  - 반복 일정 추가 사항:
    - [x] 확장된 반복 일정의 알림 처리

#### 4️⃣ Data Layer (Types & API)

- **types.ts**: TypeScript 타입 정의

  - 현재 상태: RepeatType, RepeatInfo 이미 정의됨
  - 추가 필요:
    - [x] `parentEventId?: string`: 반복 그룹 식별 (선택적)
    - [x] `originalDate?: string`: 단일 수정된 원본 날짜 (선택적)

- **server.js**: Express Mock 서버
  - 역할: 이벤트 CRUD API 제공
  - 반복 일정 추가 사항:
    - [x] 반복 일정 확장 로직 (서버 측 또는 클라이언트 측)
    - [x] 단일/전체 수정 API
    - [x] 단일/전체 삭제 API

---

## 🔗 인터페이스 정의

### 📡 API 계약

#### 1️⃣ 기존 API (변경 없음)

```typescript
GET /api/events
- 응답: { events: Event[] }

POST /api/events
- 요청: EventForm
- 응답: Event

PUT /api/events/:id
- 요청: EventForm
- 응답: Event

DELETE /api/events/:id
- 응답: { success: boolean }
```

#### 2️⃣ 반복 일정 관련 추가 고려사항

- 반복 일정 확장은 클라이언트 측에서 처리 (서버 저장은 기준 이벤트만)
- 단일 수정 시: 새로운 이벤트로 저장 (repeat.type = 'none')
- 전체 수정 시: 기준 이벤트 수정
- 단일 삭제 시: 예외 날짜 목록 관리 또는 새로운 이벤트로 분리
- 전체 삭제 시: 기준 이벤트 삭제

### 📊 데이터 모델

#### Event 타입 확장 (선택적)

```typescript
export interface Event extends EventForm {
  id: string;
  // 반복 일정 그룹 식별 (선택적)
  parentEventId?: string;
  // 단일 수정된 원본 날짜 (선택적)
  originalDate?: string;
  // 예외 날짜 목록 (선택적)
  exceptions?: string[];
}
```

#### RecurringEventInstance 타입 (클라이언트 전용)

```typescript
// 확장된 반복 일정 인스턴스 (UI 표시용)
export interface RecurringEventInstance extends Event {
  isRecurring: boolean; // 반복 일정 여부
  instanceDate: string; // 실제 표시 날짜
  originalEventId: string; // 원본 이벤트 ID
}
```

### 🔄 통신 패턴

#### 컴포넌트 간 데이터 흐름

```
App.tsx
  ↓ (이벤트 폼 데이터)
useEventForm
  ↓ (CRUD 요청)
useEventOperations
  ↓ (API 호출)
server.js
  ↓ (이벤트 목록)
useEventOperations
  ↓ (반복 일정 확장)
expandRecurringEvents (utils/eventUtils.ts)
  ↓ (확장된 이벤트 목록)
App.tsx (렌더링)
```

---

## 🛡️ 가드레일 (Guardrails)

### 🔒 구조적 변경 제약

- ❌ 기존 함수, 타입, 컴포넌트는 수정 금지
- ✅ 신규 함수 추가 및 타입 확장은 허용
- ❌ `// No Ai` 주석이 있는 코드는 절대 수정 금지
- ❌ `.cursorrules`, `GEMINI.md`, `agents/` 폴더는 수정 금지

### ⚙️ 행동적 변경 원칙

- ✅ 모든 변경은 테스트를 먼저 작성 (TDD)
- ✅ Given-When-Then 패턴으로 테스트 작성
- ✅ 각 함수는 단일 책임 원칙 준수
- ✅ 에러 처리 및 방어적 프로그래밍 적용

### 🔗 호환성 정책

- ✅ 기존 단일 일정 기능은 그대로 유지
- ✅ 반복 일정 기능은 선택적 (isRepeating 체크박스)
- ✅ 반복 유형이 'none'인 경우 기존 로직 사용
- ✅ 타입 안정성 100% 유지 (any 타입 사용 금지)

---

## 📊 기술 스택

### 🎨 프론트엔드

- **프레임워크**: React 19.1.0
- **언어**: TypeScript 5.2.2
- **UI 라이브러리**: Material-UI (MUI) 7.2.0
- **상태 관리**: React Hooks
- **아이콘**: @mui/icons-material (Repeat 아이콘 활용)

### 🔧 개발 도구

- **빌드 도구**: Vite 7.0.2
- **테스트 프레임워크**: Vitest 3.2.4
- **테스트 라이브러리**: React Testing Library 16.3.0
- **Linter**: ESLint 9.30.0
- **타입 체킹**: TypeScript

### 🗄️ 백엔드

- **서버**: Express.js 4.19.2
- **Mock 데이터**: JSON 파일
- **API**: RESTful API

### 🏗️ 아키텍처 패턴

- **UI 패턴**: Presentational/Container 분리
- **상태 관리**: Custom Hooks 패턴
- **비즈니스 로직**: Pure Function Utils
- **테스트**: TDD (Test-Driven Development)

---

## 🔄 구현 단계

### Phase 1: 데이터 모델 및 유틸리티 (Architect → Dev)

1. `dateUtils.ts`에 반복 날짜 생성 함수 추가
2. `eventUtils.ts`에 반복 일정 확장 함수 추가
3. 특수 케이스(31일, 윤년 29일) 처리 로직
4. 유닛 테스트 작성

### Phase 2: Hooks 확장 (Dev)

1. `useEventOperations.ts`에 반복 일정 처리 로직 추가
2. `useCalendarView.ts`에 뷰 범위 반복 일정 확장 로직 추가
3. Hooks 테스트 작성

### Phase 3: UI 구현 (Dev)

1. App.tsx에서 반복 일정 UI 활성화
2. 반복 아이콘 추가 (MUI Repeat 아이콘)
3. 수정/삭제 확인 다이얼로그 추가
4. 통합 테스트 작성

### Phase 4: QA 검증 (QA)

1. 모든 과제 체크리스트 항목 검증
2. 특수 케이스 시나리오 테스트
3. 사용자 시나리오 기반 E2E 테스트

---

## 🔄 다음 단계

### 📌 Scrum Master

- [x] Story 파일 생성
- [x] 개발 사이클 기동
- [x] 구현 우선순위 조율

### 📌 Dev 에이전트

- [x] Phase 1부터 순차적 구현
- [x] TDD 방식으로 테스트 먼저 작성
- [x] 각 Phase 완료 후 체크리스트 검증

### 📌 QA 에이전트

- [x] 수용 기준 검증
- [x] 과제 요구사항 체크리스트 검증
- [x] 최종 품질 보고서 작성

---

## ✅ Orchestrator 체크리스트

- [x] 모든 컴포넌트의 역할이 명확함
- [x] 인터페이스가 정의됨
- [x] 가드레일이 설정됨
- [x] 기술 스택이 결정됨
- [x] 구현 단계가 명확함
- [x] 다음 에이전트가 구현할 수 있는 충분한 정보 제공
- [x] PRD 요약서 작성 완료
- [x] Architecture 요약서 작성 완료

---

## 📈 점수 현황 (Score Status)

- **획득 점수 (Acquired Score):** 8점 (체크리스트 8개 항목 완료)
- **누적 점수 (Cumulative Score):** 15점 (PRD 7점 + Architecture 8점)
- **총점 (Total Score):** 예상 총점 100점

---

**작성자**: BMAD Orchestrator  
**다음 핸드오프**: Analyst, PM, Architect 에이전트 병렬 작업 시작  
**기획 단계 완료 후**: Scrum Master → Dev → QA 순차 진행
