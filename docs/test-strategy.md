# 테스트 전략 문서 (Test Strategy)

## Executive Summary

이 문서는 React + TypeScript 기반 캘린더 애플리케이션의 테스트 전략을 정의합니다.

현재 프로젝트는 **학습용 캘린더 애플리케이션**으로, 일정 관리 기능을 중심으로 설계되었습니다.

### 현재 상태

- ✅ **11개 테스트 파일**, **115개 테스트 케이스** 작성 완료
- ✅ **Unit Test**: 7개 파일 (dateUtils, eventOverlap, eventUtils, fetchHolidays, notificationUtils, timeValidation)
- ✅ **Hooks Test**: 4개 파일 (useCalendarView, useSearch, useEventOperations, useNotifications)
- ✅ **Integration Test**: 1개 파일 (App 전체 통합 테스트)
- ⚠️ **테스트 커버리지 측정 필요** (coverage 설정 활성화 필요)

### 테스트 목표

1. **히트리**: 핵심 기능(P0)의 포괄적 테스트 커버리지
2. **품질**: 안정적인 일정 관리 기능 보장
3. **유지보수성**: 테스트 코드의 가독성 및 재사용성 향상

### 예상 일정

- Phase 1 (완료): Unit & Hooks 테스트 작성
- Phase 2 (진행 중): Integration 테스트 작성 및 커버리지 개선
- Phase 3 (계획): E2E 테스트 도입 및 CI/CD 통합

---

## 1. Context (맥락)

### 1.1 프로젝트 개요

**애플리케이션 유형**: 웹 기반 캘린더 시스템

- **목적**: 개인 일정 관리 및 조회
- **주요 기능**:
  - 일정 추가/수정/삭제 (CRUD)
  - 주간/월간 캘린더 뷰 전환
  - 일정 검색 기능
  - 일정 충돌 감지 및 경고
  - 일정 알림 기능
  - 공휴일 표시

### 1.2 기술 스택

**프론트엔드**:

- React 19.1.0
- TypeScript 5.2.2
- Material-UI (MUI) 7.2.0
- Notistack (알림)
- Framer Motion (애니메이션)

**테스팅 도구**:

- **Vitest** 3.2.4 (테스트 프레임워크)
- **Testing Library** 16.3.0 (React 테스트)
- **MSW** (Mock Service Worker) 2.10.3 (API 모킹)
- **@vitest/coverage-v8** 2.1.3 (커버리지)

**빌드 도구**:

- Vite 7.0.2
- ESLint + Prettier
- TypeScript

### 1.3 팀 구성

- 프로젝트 규모: 소규모 (개인 학습 프로젝트)
- 개발 경험: 중급
- 테스트 경험: 초급~중급

### 1.4 제약사항

- **시간 제약**: 학습용 프로젝트로 빠른 피드백 필요
- **리소스**: 단일 개발자 환경
- **우선순위**: 핵심 기능 테스트에 집중
- **커버리지 목표**: 최소 70% (P0/P1 기능 중심)

---

## 2. Risk Assessment (위험 평가)

### 2.1 위험 범주

프로젝트의 주요 위험 요소:

| 위험 카테고리        | 설명                                     | 중요도    |
| -------------------- | ---------------------------------------- | --------- |
| **Business Risk**    | 일정 데이터 손실, 시간 충돌, 알림 누락   | 중간      |
| **Technical Risk**   | 날짜 로직 복잡성, 타임존 처리, 상태 관리 | 중간      |
| **Data Risk**        | 데이터 무결성, API 에러 처리             | 낮음~중간 |
| **Integration Risk** | 외부 API 호출, MSW 모킹                  | 낮음      |

### 2.2 컴포넌트별 위험 평가

#### P0 (High Risk) - Critical

**위험도: 7-9점** → 광범위한 테스트 필요

| 컴포넌트                | Business Risk | Technical Risk | Data Risk | Risk Score | 우선순위 |
| ----------------------- | ------------- | -------------- | --------- | ---------- | -------- |
| `useEventOperations`    | High          | High           | High      | **9**      | **P0**   |
| `eventOverlap`          | High          | Medium         | Medium    | **8**      | **P0**   |
| `App.tsx` (Integration) | High          | High           | Medium    | **8**      | **P0**   |

**이유**:

- 일정 CRUD 기능은 애플리케이션의 핵심
- 일정 충돌 감지는 비즈니스 로직의 핵심
- 데이터 손실 위험이 높음

#### P1 (Medium Risk) - Important

**위험도: 4-6점** → 표준 테스트

| 컴포넌트           | Business Risk | Technical Risk | Data Risk | Risk Score | 우선순위 |
| ------------------ | ------------- | -------------- | --------- | ---------- | -------- |
| `useCalendarView`  | Medium        | Medium         | Low       | **5**      | **P1**   |
| `dateUtils`        | Medium        | High           | Low       | **5**      | **P1**   |
| `timeValidation`   | Medium        | Medium         | Low       | **4**      | **P1**   |
| `useEventForm`     | Medium        | Medium         | Low       | **4**      | **P1**   |
| `useNotifications` | Medium        | Medium         | Low       | **4**      | **P1**   |

**이유**:

- UI 동작의 핵심 기능
- 날짜 계산 로직의 복잡성
- 시간 유효성 검증의 중요성

#### P2 (Low Risk) - Nice-to-have

**위험도: 1-3점** → 최소 테스트

| 컴포넌트            | Business Risk | Technical Risk | Data Risk | Risk Score | 우선순위 |
| ------------------- | ------------- | -------------- | --------- | ---------- | -------- |
| `useSearch`         | Low           | Low            | Low       | **2**      | **P2**   |
| `notificationUtils` | Low           | Low            | Low       | **2**      | **P2**   |
| `eventUtils`        | Low           | Low            | Low       | **2**      | **P2**   |
| `fetchHolidays`     | Low           | Low            | Low       | **1**      | **P2**   |

**이유**:

- 단순 유틸리티 함수
- 비즈니스 로직에 낮은 영향
- 실패 시 사용자 경험에 영향 미미

---

## 3. Test Pyramid (테스트 피라미드)

### 3.1 현재 분포

```
        /\
       /E2E\        ← 1개 (Integration Test)
      /------\      8.7% (현재 없음 - 계획 단계)
     /Integration\  (Medium Integration Tests)
    /--------------\  14개 테스트 케이스 (12%)
   /  Unit Tests  \   101개 테스트 케이스 (88%)
  /----------------\
```

### 3.2 권장 목표 분포

```
        /\
       /E2E\        ← 목표: 2-3개 (핵심 시나리오만)
      /------\      10%
     /Integration\  목표: 20%
    /--------------\
   /  Unit Tests  \  목표: 70%
  /----------------\
```

**적용 기준**:

- **Unit Tests (70%)**: 개별 함수/훅 테스트
  - ✅ 현재 101개 테스트 (88%) - **과다**
  - 목표: 70% (약 85개)
  - Focus: 순수 함수, 비즈니스 로직
- **Integration Tests (20%)**: 컴포넌트 간 상호작용
  - ✅ 현재 14개 테스트 (12%) - **부족**
  - 목표: 20% (약 24개)
  - Focus: Hooks 통합, 상태 관리
- **E2E Tests (10%)**: 전체 사용자 워크플로우
  - ❌ 현재 0개
  - 목표: 10% (약 12개)
  - Focus: 핵심 사용자 시나리오 (추가 일정, 날짜 네비게이션)

---

## 4. Coverage Targets (커버리지 목표)

### 4.1 전체 목표

| 커버리지 유형         | 목표 | 현재 상태 | 기타         |
| --------------------- | ---- | --------- | ------------ |
| **Line Coverage**     | 70%  | 측정 필요 | ⚠️ 설정 필요 |
| **Branch Coverage**   | 60%  | 측정 필요 | 조건문 중심  |
| **Function Coverage** | 80%  | 측정 필요 | 함수 중심    |

### 4.2 컴포넌트별 커버리지 목표

#### Critical Components (P0) - 90%+

**대상**:

- `useEventOperations` (일정 CRUD)
- `eventOverlap` (충돌 감지)
- `App.tsx` (전체 통합)

**목표**:

- Line Coverage: **90%+**
- Branch Coverage: **85%+**
- Function Coverage: **100%**

#### Important Components (P1) - 70%+

**대상**:

- `useCalendarView` (뷰 관리)
- `dateUtils` (날짜 유틸)
- `timeValidation` (시간 검증)
- `useEventForm` (폼 관리)
- `useNotifications` (알림)

**목표**:

- Line Coverage: **70%+**
- Branch Coverage: **60%+**
- Function Coverage: **80%+**

#### Standard Components (P2) - 50%+

**대상**:

- `useSearch` (검색)
- `notificationUtils` (알림 유틸)
- `eventUtils` (이벤트 유틸)
- `fetchHolidays` (공휴일)

**목표**:

- Line Coverage: **50%+**
- Branch Coverage: **40%+**
- Function Coverage: **60%+**

---

## 5. Testing Approach by Component

### 5.1 Core Components

#### `App.tsx` (메인 컴포넌트)

**테스트 레벨**: Integration + E2E
**우선순위**: P0
**포커스**: 전체 사용자 플로우
**자동화 수준**: 완전 자동화
**현재 상태**: ✅ 14개 Integration 테스트 작성 완료

**테스트 시나리오**:

1. ✅ 일정 추가 (CRUD 기본 흐름)
2. ✅ 일정 수정 (편집 기능)
3. ✅ 주간/월간 뷰 전환
4. ✅ 일정 검색
5. ✅ 일정 충돌 감지 및 경고

**추가 필요**:

- [ ] 간단한 E2E 테스트 (Playwright/Cypress)
- [ ] 반응형 UI 테스트
- [ ] 접근성 테스트 (a11y)

#### `useEventOperations` (일정 CRUD 훅)

**테스트 레벨**: Unit + Integration
**우선순위**: P0
**포커스**: API 통신, 상태 관리
**자동화 수준**: 완전 자동화
**현재 상태**: ✅ 1개 테스트 파일 존재

**테스트 시나리오**:

1. ✅ fetchEvents (일정 로딩)
2. ✅ saveEvent (일정 저장)
3. ✅ deleteEvent (일정 삭제)
4. ✅ 에러 처리 (네트워크 실패)
5. ✅ 상태 업데이트 (optimistic updates)

#### `eventOverlap` (일정 충돌 감지)

**테스트 레벨**: Unit
**우선순위**: P0
**포커스**: 날짜/시간 로직, Edge cases
**자동화 수준**: 완전 자동화
**현재 상태**: ✅ 테스트 파일 존재

**테스트 시나리오**:

1. ✅ parseDateTime (날짜/시간 파싱)
2. ✅ convertEventToDateRange (이벤트 → Date Range)
3. ✅ isOverlapping (충돌 감지)
4. ✅ findOverlappingEvents (충돌 이벤트 검색)
5. ✅ Edge cases (경계값 테스트)

**추가 필요**:

- [ ] 타임존 처리 테스트
- [ ] 자정을 넘어가는 일정
- [ ] 여러 일정 동시 충돌

---

### 5.2 Hooks Components

#### `useCalendarView` (캘린더 뷰 관리)

**테스트 레벨**: Unit + Integration
**우선순위**: P1
**포커스**: 상태 전환, 날짜 네비게이션
**자동화 수준**: 완전 자동화
**현재 상태**: ✅ 테스트 파일 존재

**테스트 시나리오**:

1. ✅ 초기 상태 (view, currentDate, holidays)
2. ✅ 주간/월간 뷰 전환
3. ✅ 날짜 네비게이션 (prev/next)
4. ✅ 공휴일 로딩

**추가 필요**:

- [ ] 날짜 경계값 테스트 (월말, 연말)
- [ ] 공휴일 API 실패 처리

#### `useEventForm` (일정 폼 관리)

**테스트 레벨**: Unit
**우선순위**: P1
**포커스**: 폼 상태 관리, 유효성 검증
**자동화 수준**: 완전 자동화
**현재 상태**: ❌ 테스트 파일 없음

**우선 추가 필요**:

- [ ] 폼 초기화 (resetForm)
- [ ] 편집 모드 (editEvent)
- [ ] 시간 유효성 검증 통합

#### `useNotifications` (알림 관리)

**테스트 레벨**: Unit
**우선순위**: P1
**포커스**: 실시간 알림, 중복 방지
**자동화 수준**: 완전 자동화
**현재 상태**: ✅ 테스트 파일 존재

**추가 필요**:

- [ ] 타이머 cleanup 테스트
- [ ] 성능 테스트 (대량 일정)

---

### 5.3 Utility Components

#### `dateUtils` (날짜 유틸리티)

**테스트 레벨**: Unit
**우선순위**: P1
**포커스**: 복잡한 날짜 로직
**자동화 수준**: 완전 자동화
**현재 상태**: ✅ 테스트 파일 존재 (포괄적)

**테스트 시나리오**:

1. ✅ getDaysInMonth (월별 일수)
2. ✅ getWeekDates (주 날짜 배열)
3. ✅ getWeeksAtMonth (월 주차 계산)
4. ✅ formatWeek, formatMonth (날짜 포맷팅)
5. ✅ Edge cases (윤년, 월말)

#### `timeValidation` (시간 유효성 검증)

**테스트 레벨**: Unit
**우선순위**: P1
**포커스**: 시간 검증 로직
**자동화 수준**: 완전 자동화
**현재 상태**: ✅ 테스트 파일 존재

**추가 필요**:

- [ ] 24시간 형식 테스트
- [ ] 초과 시간 경계값

#### `useSearch` (검색 기능)

**테스트 레벨**: Unit
**우선순위**: P2
**포커스**: 필터링 로직
**자동화 수준**: 완전 자동화
**현재 상태**: ✅ 테스트 파일 존재

---

## 6. Tools and Frameworks

### 6.1 현재 사용 중인 도구

| 도구                            | 버전   | 용도                     | 상태         |
| ------------------------------- | ------ | ------------------------ | ------------ |
| **Vitest**                      | 3.2.4  | 테스트 러너              | ✅           |
| **@testing-library/react**      | 16.3.0 | React 컴포넌트 테스트    | ✅           |
| **@testing-library/user-event** | 14.5.2 | 사용자 이벤트 시뮬레이션 | ✅           |
| **MSW**                         | 2.10.3 | API 모킹                 | ✅           |
| **@vitest/coverage-v8**         | 2.1.3  | 코드 커버리지            | ⚠️ 설정 필요 |
| **jsdom**                       | 26.1.0 | DOM 환경                 | ✅           |

### 6.2 추가 권장 도구

#### E2E 테스트 (선택적)

| 도구           | 용도       | 언제 사용?                 |
| -------------- | ---------- | -------------------------- |
| **Playwright** | E2E 테스트 | 사용자 전체 플로우 테스트  |
| **Cypress**    | E2E 테스트 | 대안 (Playwright보다 간단) |

**권장 시점**: Phase 3 (현재는 Integration Test로 충분)

### 6.3 커버리지 도구 설정

**필요 작업**:

1. `vite.config.ts`에 커버리지 설정 추가
2. `coverage` 폴더 생성 확인
3. 커버리지 리포팅 자동화

```typescript
// vite.config.ts (추가 필요)
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', '*.config.*'],
    },
  },
});
```

---

## 7. CI/CD Integration

### 7.1 현재 상태

- CI/CD 설정 없음 (로컬 테스트만 실행)
- GitHub Actions 또는 다른 CI 도구 미설정

### 7.2 권장 CI/CD 워크플로우

#### Pre-commit Hooks

```json
// package.json
{
  "scripts": {
    "test:quick": "vitest run --reporter=verbose --coverage=false",
    "lint": "eslint . && prettier --check .",
    "pre-commit": "pnpm lint && pnpm test:quick"
  }
}
```

#### Pull Request Checks

```yaml
# .github/workflows/test.yml (추가 권장)
name: Test Suite
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm test:coverage
```

### 7.3 커버리지 리포팅

**옵션 1**: Codecov (추천)

- GitHub 통합 쉬움
- 무료 플랜 제공
- PR 시 커버리지 댓글 자동 생성

**옵션 2**: GitHub Actions Artifacts

- 설정 간단
- HTML 리포트 다운로드 가능

---

## 8. Timeline and Milestones

### Phase 1 (완료) ✅

**기간**: Week 1-2
**목표**: Unit & Hooks 테스트 기초 구축
**결과**: 115개 테스트 작성 완료

**작성된 테스트**:

- ✅ Unit Tests (7개 파일)
- ✅ Hooks Tests (4개 파일)
- ✅ Integration Test (1개 파일)

### Phase 2 (진행 중) 🔄

**기간**: Week 3-4
**목표**: 커버리지 개선 및 Integration 강화
**현재 상태**: Integration Test 14개 작성 완료

**진행 작업**:

- ⏳ 커버리지 설정 및 측정
- ⏳ `useEventForm` 테스트 추가
- ⏳ Edge case 보강
- ⏳ 성능 테스트 추가

### Phase 3 (계획) 📋

**기간**: Week 5-6
**목표**: E2E 테스트 도입 및 CI/CD 통합

**작업 내용**:

- [ ] E2E 테스트 도입 (Playwright)
  - 핵심 사용자 시나리오 2-3개
  - 일정 추가/수정/삭제 플로우
  - 뷰 전환 테스트
- [ ] CI/CD 파이프라인 구축
  - GitHub Actions 설정
  - Pre-commit hooks
  - 자동 커버리지 리포팅
- [ ] 접근성 테스트 추가
  - `@axe-core/react` 도입
  - ARIA 속성 검증

### Phase 4 (향후 계획) 🚀

**기간**: Week 7+
**목표**: 테스트 품질 지속 개선

**작업 내용**:

- [ ] 시각적 회귀 테스트 (VRT)
- [ ] 성능 모니터링
- [ ] 사용자 동작 데이터 기반 테스트 개선

---

## 9. Best Practices & Guidelines

### 9.1 테스트 작성 원칙

#### AAA 패턴 준수

```typescript
it('should validate time correctly', () => {
  // Arrange (준비)
  const startTime = '14:00';
  const endTime = '15:00';

  // Act (실행)
  const result = getTimeErrorMessage(startTime, endTime);

  // Assert (검증)
  expect(result.startTimeError).toBeNull();
});
```

#### Given-When-Then (BDD 스타일)

```typescript
it('should authenticate user with valid credentials', () => {
  // Given: 유효한 자격증명이 있을 때
  const credentials = { username: 'test', password: 'valid' };

  // When: 로그인 시도 시
  const result = authService.login(credentials);

  // Then: 사용자가 인증되어야 함
  expect(result.isAuthenticated).toBe(true);
});
```

### 9.2 네이밍 컨벤션

**테스트 파일**: `*.spec.ts` 또는 `*.test.ts`

```
src/
  __tests__/
    unit/
      easy.dateUtils.spec.ts    ✅ 명확한 파일명
      easy.eventOverlap.spec.ts  ✅
    hooks/
      medium.useCalendarView.spec.ts  ✅
```

**테스트 케이스**: "should [expected behavior]"

```typescript
describe('getTimeErrorMessage', () => {
  it('should return error when start time is after end time', () => {});
  it('should return null when times are valid', () => {});
});
```

### 9.3 Mock & Stub 가이드

**MSW 사용**:

```typescript
// __mocks__/handlers.ts
export const handlers = [
  http.get('/api/events', () => {
    return HttpResponse.json({ events: mockEvents });
  }),
];
```

**Module Mocking**:

```typescript
vi.mock('../apis/fetchHolidays', () => ({
  fetchHolidays: vi.fn(() => mockHolidays),
}));
```

### 9.4 가독성 원칙

1. **작은 단위**: 하나의 테스트는 하나의 개념만 테스트
2. **명확한 설명**: 테스트 이름만으로 의도 파악 가능
3. **Setup 분리**: beforeEach/afterEach 사용
4. **독립성**: 테스트 간 의존성 없음
5. **빠른 실행**: 테스트는 빠르게 실행되어야 함

---

## 10. Key Metrics & Success Criteria

### 10.1 현재 지표

- **테스트 파일**: 11개
- **테스트 케이스**: 115개
- **통과율**: 100% ✅
- **커버리지**: 측정 필요 ⚠️

### 10.2 목표 지표

| 지표                | 현재    | 목표 | 우선순위 |
| ------------------- | ------- | ---- | -------- |
| Test Pass Rate      | 100% ✅ | 100% | Critical |
| Line Coverage       | -       | 70%  | High     |
| Branch Coverage     | -       | 60%  | High     |
| Function Coverage   | -       | 80%  | High     |
| Test Execution Time | 18s     | <30s | Medium   |

### 10.3 성공 기준

**Phase 2 완료 기준**:

- [x] 모든 테스트 통과 (115/115)
- [ ] P0 컴포넌트 90%+ 커버리지
- [ ] P1 컴포넌트 70%+ 커버리지
- [ ] 테스트 실행 시간 <30초
- [ ] `useEventForm` 테스트 추가

**Phase 3 완료 기준**:

- [ ] E2E 테스트 2-3개 작성
- [ ] CI/CD 파이프라인 구축
- [ ] 자동 커버리지 리포팅
- [ ] Pre-commit hooks 설정

---

## 11. 결론 및 권장사항

### 11.1 강점 ✅

1. **철저한 Unit Test**: 115개 테스트로 핵심 로직 보호
2. **Integration Test**: 실제 사용자 플로우 검증
3. **MSW 활용**: API 모킹으로 안정적 테스트
4. **명확한 구조**: hooks, unit, integration 분리

### 11.2 개선 필요 ⚠️

1. **커버리지 측정**: 설정 필요
2. **useEventForm 테스트**: 누락
3. **E2E 테스트**: 없음 (추가 권장)
4. **CI/CD**: 미설정

### 11.3 다음 단계 📋

1. **즉시**: 커버리지 설정 및 측정
2. **단기**: `useEventForm` 테스트 작성
3. **중기**: E2E 테스트 도입
4. **장기**: CI/CD 자동화

### 11.4 참고 자료

- [Vitest 공식 문서](https://vitest.dev/)
- [Testing Library 문서](https://testing-library.com/)
- [MSW 문서](https://mswjs.io/)

---

**작성일**: 2025-01-XX
**작성자**: Test Strategist (스트라텔)
**버전**: 1.0.0
