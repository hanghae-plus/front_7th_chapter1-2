---
**문서 유형**: [AI/HUMAN]  
**목적**: 테스트 전략 및 작성 가이드  
**주요 내용**: 테스트 피라미드, 테스트 도구, 작성 패턴, 베스트 프랙티스  
**관련 문서**: [function-index.json](./function-index.json), [architecture-guidelines.md](./architecture-guidelines.md)  
**최종 수정일**: 2025-10-29
---

# 테스트 전략

## 테스트 피라미드

### 1. 단위 테스트 (Unit Tests)

**목적**: 유틸리티 함수 및 개별 로직 검증

**위치**: `src/__tests__/unit/`

**특징**:

- 순수 함수 테스트
- 빠른 실행 속도
- 높은 커버리지

**예시**:

- `easy.dateUtils.spec.ts` - 날짜 계산 함수
- `easy.eventOverlap.spec.ts` - 일정 중복 감지 로직
- `easy.timeValidation.spec.ts` - 시간 유효성 검사

---

### 2. 훅 테스트 (Hook Tests)

**목적**: 커스텀 훅의 상태 변경 및 부수 효과 검증

**위치**: `src/__tests__/hooks/`

**특징**:

- React Testing Library의 `renderHook` 사용
- 상태 변화 추적
- 비즈니스 로직 검증

**예시**:

- `easy.useCalendarView.spec.ts` - 캘린더 뷰 상태 관리
- `easy.useSearch.spec.ts` - 검색 로직
- `medium.useEventOperations.spec.ts` - API 호출 및 상태 관리
- `medium.useNotifications.spec.ts` - 알림 시스템

---

### 3. 통합 테스트 (Integration Tests)

**목적**: 컴포넌트 간 상호작용 및 사용자 시나리오 검증

**위치**: `src/__tests__/`

**특징**:

- 실제 사용자 플로우 시뮬레이션
- 여러 레이어 통합 검증
- MSW로 API 모킹

**예시**:

- `medium.integration.spec.tsx` - 일정 CRUD E2E 시나리오

---

## 테스트 범위

### 필수 테스트

- ✅ 모든 유틸리티 함수는 단위 테스트 필수
- ✅ 비즈니스 로직을 포함한 커스텀 훅은 테스트 필수
- ✅ API 호출은 MSW로 모킹하여 독립적 테스트
- ✅ 핵심 사용자 시나리오는 통합 테스트 필수

### 선택 테스트

- 단순 UI 컴포넌트 (로직이 없는 경우)
- 외부 라이브러리 래핑 함수 (라이브러리 자체 테스트에 의존)

---

## 테스트 난이도 분류

### easy

**특징**:

- 기본 기능 테스트
- 순수 함수 테스트
- 동기 처리

**예시**:

- 날짜 포맷팅 함수
- 검색 필터링 로직
- 시간 유효성 검사

### medium

**특징**:

- 복잡한 로직 테스트
- 통합 테스트
- 비동기 처리 (API 호출, setTimeout 등)
- 상태 변화가 많은 로직

**예시**:

- 일정 CRUD 통합 테스트
- 알림 시스템 (setInterval 사용)
- API 호출을 포함한 훅

---

## 테스트 도구

### Vitest

**역할**: 테스트 프레임워크

**특징**:

- Vite 기반으로 빠른 실행
- Jest와 호환되는 API
- ES Module 지원

### Testing Library

**역할**: React 컴포넌트 테스트 유틸리티

**특징**:

- 사용자 관점 테스트
- `render`, `renderHook`, `screen`, `fireEvent`, `waitFor` 등 제공
- 접근성 중심 쿼리

### MSW (Mock Service Worker)

**역할**: API 모킹

**특징**:

- 네트워크 레벨 모킹
- 실제 fetch/axios 호출 인터셉트
- 브라우저/Node 환경 모두 지원

**설정 위치**: `src/__mocks__/handlers.ts`

---

## 테스트 작성 가이드

### 1. 파일 명명

```
[난이도].[테스트대상].spec.[ts|tsx]
```

**예시**:

- `easy.dateUtils.spec.ts`
- `medium.useEventOperations.spec.ts`
- `medium.integration.spec.tsx`

### 2. 테스트 구조

```typescript
describe('모듈/함수명', () => {
  describe('특정 기능/케이스', () => {
    it('should 기대 동작', () => {
      // Arrange (준비)
      // Act (실행)
      // Assert (검증)
    });
  });
});
```

### 3. 훅 테스트 패턴

```typescript
import { renderHook } from '@testing-library/react';

it('should 훅 동작 설명', () => {
  const { result } = renderHook(() => useCustomHook());

  expect(result.current.state).toBe(expected);

  act(() => {
    result.current.action();
  });

  expect(result.current.state).toBe(newExpected);
});
```

### 4. 통합 테스트 패턴

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

it('should 사용자 시나리오 설명', async () => {
  render(<App />);

  // 사용자 액션 시뮬레이션
  const input = screen.getByLabelText('제목');
  fireEvent.change(input, { target: { value: '회의' } });

  const button = screen.getByText('일정 추가');
  fireEvent.click(button);

  // 결과 검증
  await waitFor(() => {
    expect(screen.getByText('회의')).toBeInTheDocument();
  });
});
```

### 5. API 모킹 패턴

```typescript
// handlers.ts에 정의
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/events', () => {
    return HttpResponse.json({ events: mockEvents });
  }),

  http.post('/api/events', async ({ request }) => {
    const newEvent = await request.json();
    return HttpResponse.json(newEvent, { status: 201 });
  }),
];
```

---

## 테스트 실행

### 전체 테스트 실행

```bash
npm test
# 또는
pnpm test
```

### 특정 파일만 실행

```bash
npm test -- dateUtils
```

### 커버리지 확인

```bash
npm test -- --coverage
```

### Watch 모드

```bash
npm test -- --watch
```

---

## 테스트 커버리지 목표

### 최소 커버리지

- **유틸리티 함수**: 90% 이상
- **커스텀 훅**: 80% 이상
- **통합 테스트**: 핵심 시나리오 100%

### 우선순위

1. 비즈니스 로직 (일정 CRUD, 검색, 알림 등)
2. 데이터 변환 로직 (날짜 계산, 포맷팅 등)
3. 유효성 검사 로직
4. 에러 처리

---

## 테스트 베스트 프랙티스

### ✅ DO

- 테스트는 독립적으로 실행 가능해야 함
- 테스트 이름은 기대 동작을 명확히 표현
- Given-When-Then 패턴 사용
- 에지 케이스 테스트 포함
- API 호출은 반드시 모킹

### ❌ DON'T

- 테스트 간 의존성 생성 금지
- 실제 API 호출 금지
- 구현 세부사항 테스트 금지 (내부 상태보다 결과 테스트)
- 테스트에서 복잡한 로직 작성 금지
- 스냅샷 테스트 남용 금지

---

## 테스트 유지보수

### 코드 변경 시

- 관련 테스트 함께 업데이트
- 실패하는 테스트는 즉시 수정
- 테스트가 없는 버그는 테스트 추가 후 수정

### 리팩토링 시

- 테스트가 여전히 통과하는지 확인
- 테스트 코드도 함께 리팩토링
- 불필요한 테스트 제거

### 새 기능 추가 시

- TDD 방식 권장 (테스트 먼저 작성)
- 최소 단위 테스트 + 통합 테스트 필수
