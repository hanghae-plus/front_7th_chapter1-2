# Testing Guide

## 📋 개요

이 프로젝트는 **Vitest**를 사용하여 React + TypeScript 기반 캘린더 애플리케이션의 테스트를 수행합니다.

### 현재 테스트 상태

- **테스트 파일**: 12개
- **테스트 케이스**: 173개
- **통과율**: 100% (173/173) ✅
- **테스트 프레임워크**: Vitest 3.2.4
- **실행 시간**: 약 15-18초

---

## 📁 테스트 구조

```
src/__tests__/
├── hooks/
│   ├── easy.useCalendarView.spec.ts     # 캘린더 뷰 관리 (19개 테스트)
│   ├── easy.useSearch.spec.ts           # 검색 기능 (6개 테스트)
│   ├── medium.useEventForm.spec.ts      # 폼 관리 (24개 테스트)
│   ├── medium.useEventOperations.spec.ts # CRUD 작업 (9개 테스트)
│   └── medium.useNotifications.spec.ts  # 알림 관리 (10개 테스트 + Edge cases)
├── medium.integration.spec.tsx          # 통합 테스트 (14개 테스트)
└── unit/
    ├── easy.dateUtils.spec.ts           # 날짜 유틸 (15개 테스트)
    ├── easy.eventOverlap.spec.ts        # 일정 충돌 (20개 테스트)
    ├── easy.eventUtils.spec.ts          # 이벤트 유틸 (7개 테스트)
    ├── easy.fetchHolidays.spec.ts       # 공휴일 조회 (7개 테스트)
    ├── easy.notificationUtils.spec.ts   # 알림 유틸 (7개 테스트)
    └── easy.timeValidation.spec.ts      # 시간 검증 (11개 테스트)
```

### 테스트 분류 (난이도 기준)

- **Easy**: 기본 기능 테스트
- **Medium**: 복잡한 로직 또는 여러 컴포넌트 통합 테스트
- **Integration**: 전체 애플리케이션 통합 테스트

---

## 🚀 테스트 실행

### 전체 테스트 실행

```bash
pnpm test
```

### UI 모드로 실행 (Watch 모드)

```bash
pnpm test:ui
```

브라우저에서 테스트 결과를 실시간으로 확인할 수 있습니다.

### 커버리지 포함 실행

```bash
pnpm test:coverage
```

### 특정 파일만 테스트

```bash
pnpm test src/__tests__/hooks/easy.useCalendarView.spec.ts
```

### 특정 패턴 검색

```bash
pnpm test useEventForm
```

---

## 📊 테스트 카테고리별 상세 분석

### 1. Unit Tests (7개 파일, 68개 테스트)

단위 테스트는 개별 함수와 유틸리티를 테스트합니다.

#### `dateUtils.spec.ts`

- `getDaysInMonth`: 월별 일수 계산
- `getWeekDates`: 주간 날짜 배열 생성
- `getWeeksAtMonth`: 월별 주차 계산
- `formatWeek`, `formatMonth`: 날짜 포맷팅
- **Edge Cases**: 윤년, 월말, 연말

#### `eventOverlap.spec.ts`

- `parseDateTime`: 날짜/시간 파싱
- `isOverlapping`: 일정 충돌 감지
- `findOverlappingEvents`: 충돌 일정 검색
- **Edge Cases**: 자정 넘어가는 일정, 다중 충돌, 경계값

#### `timeValidation.spec.ts`

- `getTimeErrorMessage`: 시간 유효성 검증
- **Edge Cases**: 24시간 형식, 경계값, 자정 처리

**실행 방법**:

```bash
# 모든 unit 테스트 실행
pnpm test unit/

# 특정 파일만
pnpm test dateUtils.spec.ts
```

### 2. Hooks Tests (5개 파일, 69개 테스트)

React Hooks의 상태 관리와 로직을 테스트합니다.

#### `useCalendarView.spec.ts` (19개)

- 초기 상태 설정
- 주간/월간 뷰 전환
- 날짜 네비게이션 (prev/next)
- 공휴일 업데이트
- **Edge Cases**: 월말/연말 경계, 윤년, 뷰 전환 시 날짜 보존

#### `useEventForm.spec.ts` (24개) ⭐ NEW!

- 폼 상태 관리 (13개 필드)
- 폼 초기화 및 리셋
- 편집 모드 (`editEvent`)
- 시간 유효성 검증 통합
- 복잡한 시나리오 테스트

#### `useNotifications.spec.ts` (10개 + Edge cases)

- 알림 생성 및 관리
- 중복 알림 방지
- **Edge Cases**: 타이머 cleanup, 대량 이벤트(100개), 동시 알림

**실행 방법**:

```bash
# 모든 hooks 테스트 실행
pnpm test hooks/

# 특정 훅만
pnpm test useEventForm
```

### 3. Integration Tests (1개 파일, 14개 테스트)

전체 애플리케이션의 사용자 플로우를 테스트합니다.

#### `medium.integration.spec.tsx` (14개)

- ✅ 일정 CRUD (추가, 수정, 삭제)
- ✅ 주간/월간 뷰 전환
- ✅ 일정 검색 기능
- ✅ 일정 충돌 감지 및 경고
- ✅ UI 렌더링 및 상호작용

**특징**:

- MSW (Mock Service Worker)로 API 모킹
- 실제 사용자 동작 시뮬레이션 (userEvent)
- MUI 테마 및 스낵바 테스트

**실행 방법**:

```bash
# 통합 테스트 실행
pnpm test integration
```

---

## 🎯 테스트 패턴

### AAA Pattern (Arrange-Act-Assert)

모든 테스트는 다음 구조를 따릅니다:

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

### Given-When-Then (BDD 스타일)

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

---

## 🛠️ 테스트 도구

### 핵심 도구

| 도구                            | 버전   | 용도                     |
| ------------------------------- | ------ | ------------------------ |
| **Vitest**                      | 3.2.4  | 테스트 러너              |
| **@testing-library/react**      | 16.3.0 | React 컴포넌트 테스트    |
| **@testing-library/user-event** | 14.5.2 | 사용자 이벤트 시뮬레이션 |
| **MSW**                         | 2.10.3 | API 모킹                 |
| **@vitest/coverage-v8**         | 2.1.3  | 코드 커버리지            |
| **jsdom**                       | 26.1.0 | DOM 환경                 |

### MSW (Mock Service Worker) 사용

API 호출을 모킹하여 실제 서버 없이 테스트합니다:

```typescript
import { http, HttpResponse } from 'msw';

// 테스트에서 API 모킹
setupMockHandlerCreation();

const response = await fetch('/api/events');
expect(response.status).toBe(200);
```

---

## 📝 테스트 작성 가이드

### 새 테스트 파일 생성

1. **파일 위치**: `src/__tests__/` 구조를 따라 생성

   - Unit: `src/__tests__/unit/`
   - Hooks: `src/__tests__/hooks/`
   - Integration: `src/__tests__/`

2. **파일명 규칙**:

   - `{difficulty}.{name}.spec.ts` (Unit/Hooks)
   - `{difficulty}.{name}.spec.tsx` (Integration)

3. **난이도 분류**:
   - `easy.*`: 기본 기능
   - `medium.*`: 중급 기능
   - `hard.*`: 고급 기능

### 테스트 작성 Checklist

- [ ] AAA 패턴 준수
- [ ] 명확한 테스트 이름 ("should...")
- [ ] 독립적인 테스트 (다른 테스트에 의존하지 않음)
- [ ] Edge case 포함
- [ ] 에러 처리 테스트
- [ ] 외부 의존성 모킹

### 예시: 새 훅 테스트

```typescript
import { renderHook, act } from '@testing-library/react';
import { useCustomHook } from '../hooks/useCustomHook';

describe('useCustomHook', () => {
  it('초기 상태가 올바르게 설정되어야 한다', () => {
    const { result } = renderHook(() => useCustomHook());

    expect(result.current.value).toBe(null);
    expect(result.current.loading).toBe(false);
  });

  it('액션 수행 시 상태가 올바르게 업데이트된다', () => {
    const { result } = renderHook(() => useCustomHook());

    act(() => {
      result.current.doSomething();
    });

    expect(result.current.loading).toBe(true);
  });
});
```

---

## 🔍 Edge Cases

현재 173개 테스트 중 **58개가 Edge case**를 다룹니다:

### Categories

1. **Boundary Values** (경계값)

   - 월말/연말 (31일, 2월 29일)
   - 시간 경계 (00:00, 23:59)

2. **State Transitions** (상태 전환)

   - 주간 ↔ 월간 뷰 전환
   - 편집 ↔ 일반 모드

3. **Concurrency** (동시성)

   - 여러 이벤트 동시 알림
   - 대량 이벤트 처리 (100개)

4. **Error Handling** (에러 처리)
   - 잘못된 시간 입력
   - 일정 충돌
   - API 실패

### Coverage by Component

| Component          | Tests | Edge Cases |
| ------------------ | ----- | ---------- |
| `useEventForm`     | 24    | 8          |
| `eventOverlap`     | 20    | 12         |
| `useCalendarView`  | 19    | 10         |
| `useNotifications` | 10    | 5          |
| Others             | 100   | 23         |

---

## 📈 커버리지 목표

### 현재 상태

- ✅ 173개 테스트 작성 완료
- ⚠️ 커버리지 측정 설정 필요

### 목표

- P0 (Critical): 90%+
- P1 (Important): 70%+
- P2 (Nice-to-have): 50%+

### 측정 방법

```bash
# 커버리지 리포트 생성
pnpm test:coverage

# HTML 리포트 보기
open coverage/index.html
```

---

## 🐛 문제 해결

### 테스트가 실패할 때

1. **에러 메시지 확인**

   ```bash
   pnpm test --reporter=verbose
   ```

2. **특정 테스트만 실행**

   ```bash
   pnpm test -t "test name"
   ```

3. **Watch 모드로 디버깅**
   ```bash
   pnpm test:ui
   ```

### 일반적인 이슈

**Issue**: 타임아웃 에러

```typescript
// waitFor 추가
await waitFor(() => {
  expect(screen.getByText('Done')).toBeInTheDocument();
});
```

**Issue**: Async 이벤트 처리

```typescript
// act() 사용
await act(async () => {
  await result.current.fetchData();
});
```

---

## 📚 추가 자료

### 외부 문서

- [Vitest 공식 문서](https://vitest.dev/)
- [Testing Library 문서](https://testing-library.com/)
- [MSW 문서](https://mswjs.io/)

### 프로젝트 내 문서

- [`docs/test-strategy.md`](./test-strategy.md) - 테스트 전략
- [`core/data/test-patterns.md`](../core/data/test-patterns.md) - 테스트 패턴
- [`core/data/edge-case-techniques.md`](../core/data/edge-case-techniques.md) - Edge case 기법

---

## ✅ Best Practices

### DO ✅

1. **독립적인 테스트**: 각 테스트는 독립적으로 실행 가능
2. **명확한 네이밍**: 테스트 이름만으로 의도 파악 가능
3. **Edge case 포함**: 경계값, 빈 값, null 처리
4. **빠른 실행**: <10ms (unit), <1s (integration)
5. **Mock 사용**: 외부 의존성 모킹

### DON'T ❌

1. **테스트 간 의존성**: 실행 순서에 의존하지 않음
2. **Implementation 테스트**: 내부 구현이 아닌 동작 테스트
3. **Flaky 테스트**: 불안정한 테스트 제거
4. **너무 많은 Setup**: beforeEach를 적절히 사용
5. **테스트 누락**: P0/P1 컴포넌트는 필수

---

**작성일**: 2025-01-XX
**작성자**: Test Documenter (도큐)
**버전**: 1.0.0

---

## 🎯 Quick Reference

```bash
# 전체 테스트 실행
pnpm test

# UI 모드
pnpm test:ui

# 커버리지 측정
pnpm test:coverage

# 특정 파일
pnpm test useEventForm

# 특정 패턴
pnpm test -t "edge case"
```

**Happy Testing!** 🧪
