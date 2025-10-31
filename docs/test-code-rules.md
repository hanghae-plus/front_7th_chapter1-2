# 테스트 코드 작성 규칙 (Test Code Rules)

> **Version**: 1.0.0  
> **Last Updated**: 2025-10-28  
> **Status**: Enforced ✅

이 문서는 프로젝트의 테스트 코드 작성 시 반드시 준수해야 하는 규칙을 정의합니다.

---

## 📋 목차

1. [테스트 케이스 작성 규칙](#테스트-케이스-작성-규칙)
2. [테스트 구조 및 Setup 규칙](#테스트-구조-및-setup-규칙)
3. [Mocking 규칙](#mocking-규칙)
4. [쿼리 및 Assertion 규칙](#쿼리-및-assertion-규칙)
5. [비동기 처리 규칙](#비동기-처리-규칙)
6. [테스트 데이터 규칙](#테스트-데이터-규칙)
7. [파일 구조 및 네이밍 규칙](#파일-구조-및-네이밍-규칙)
8. [금지 사항 (Forbidden)](#금지-사항-forbidden)

---

## 테스트 케이스 작성 규칙

### ✅ 해야 할 것

#### 1. **기존 테스트 케이스만 구현**

- 이미 정의된 테스트 케이스의 구현부를 채우는 것만 허용
- `it.todo()` 또는 빈 `it()` 블록을 찾아서 구현

```typescript
// ✅ GOOD: 기존 테스트 케이스 구현
describe('useEventOperations', () => {
  it('should create new event when saveEvent called with valid data', async () => {
    // 이미 정의된 테스트 케이스 - 구현만 추가
    const { result } = renderHook(() => useEventOperations());

    await act(async () => {
      await result.current.saveEvent(validEventData);
    });

    expect(result.current.events).toHaveLength(1);
  });
});
```

```typescript
// ❌ BAD: 새로운 테스트 케이스 추가
describe('useEventOperations', () => {
  // 기존에 없던 새로운 테스트 케이스 추가 금지
  it('should validate event title length', async () => {
    // ...
  });
});
```

#### 2. **명세(Specification)에 정의된 내용만 테스트**

- `docs/specification.md` 또는 테스트 계획서에 명시된 요구사항만 검증
- 추측이나 임의의 요구사항 추가 금지

```typescript
// ✅ GOOD: 명세에 정의된 내용 테스트
// 명세: "반복 종료일은 최대 2025-12-31까지 설정 가능"
it('should reject end dates after 2025-12-31', async () => {
  const invalidDate = '2026-01-01';
  // ...
});

// ❌ BAD: 명세에 없는 내용 테스트
// 명세에 언급 없음: 이벤트 제목 최대 길이
it('should limit event title to 100 characters', async () => {
  // 명세에 없는 요구사항 테스트 금지
});
```

### ❌ 하면 안 되는 것

1. **새로운 `describe` 블록 추가**
2. **새로운 `it` 블록 추가**
3. **명세에 없는 요구사항 테스트**
4. **테스트 케이스 순서 변경**
5. **기존 테스트 케이스 삭제**

---

## 테스트 구조 및 Setup 규칙

### ✅ 해야 할 것

#### 1. **공통 Setup은 `beforeEach`로 관리**

3번 이상 반복되는 코드는 반드시 setup으로 추출

```typescript
// ✅ GOOD: 공통 setup 추출
describe('Calendar Component', () => {
  let user: ReturnType<typeof userEvent.setup>;
  let mockOnDateSelect: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    user = userEvent.setup();
    mockOnDateSelect = vi.fn();
    vi.setSystemTime(new Date('2025-10-01'));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should select date when user clicks', async () => {
    render(<Calendar onDateSelect={mockOnDateSelect} />);
    // user와 mockOnDateSelect 재사용
  });

  it('should navigate to next month', async () => {
    render(<Calendar onDateSelect={mockOnDateSelect} />);
    // user와 mockOnDateSelect 재사용
  });
});
```

```typescript
// ❌ BAD: 중복 코드 반복
describe('Calendar Component', () => {
  it('should select date when user clicks', async () => {
    const user = userEvent.setup(); // 중복 1
    const mockOnDateSelect = vi.fn(); // 중복 1
    vi.setSystemTime(new Date('2025-10-01')); // 중복 1
    render(<Calendar onDateSelect={mockOnDateSelect} />);
  });

  it('should navigate to next month', async () => {
    const user = userEvent.setup(); // 중복 2
    const mockOnDateSelect = vi.fn(); // 중복 2
    vi.setSystemTime(new Date('2025-10-01')); // 중복 2
    render(<Calendar onDateSelect={mockOnDateSelect} />);
  });
});
```

#### 2. **AAA 패턴 준수 (Arrange-Act-Assert)**

모든 테스트는 명확한 3단계 구조로 작성

```typescript
// ✅ GOOD: 명확한 AAA 구조
it('should display error when invalid date selected', async () => {
  // ===== ARRANGE =====
  const user = userEvent.setup();
  render(<DatePicker minDate="2025-01-01" />);

  // ===== ACT =====
  const dateInput = screen.getByLabelText(/date/i);
  await user.type(dateInput, '2024-12-31');
  await user.click(screen.getByRole('button', { name: /submit/i }));

  // ===== ASSERT =====
  expect(screen.getByRole('alert')).toHaveTextContent('Please select a valid date');
});
```

#### 3. **헬퍼 함수는 테스트 파일 하단 또는 별도 파일로 분리**

```typescript
// ✅ GOOD: 헬퍼 함수 분리
describe('Event Operations', () => {
  it('should create recurring event', async () => {
    const user = userEvent.setup();
    render(<Calendar />);

    await createRecurringEvent(user, {
      title: 'Daily Meeting',
      repeatType: 'daily',
      startDate: '2025-01-01',
      endDate: '2025-01-07',
    });

    expect(screen.getByText('Daily Meeting')).toBeInTheDocument();
  });
});

// 헬퍼 함수는 하단에
async function createRecurringEvent(
  user: ReturnType<typeof userEvent.setup>,
  data: EventData
): Promise<void> {
  await user.click(screen.getByRole('button', { name: /create/i }));
  await user.type(screen.getByLabelText(/title/i), data.title);
  // ... 공통 로직
}
```

### ❌ 하면 안 되는 것

1. **중복 코드 방치** (3회 이상 반복 시 반드시 추출)
2. **Setup 없이 각 테스트에서 반복 초기화**
3. **AAA 패턴 무시** (Arrange/Act/Assert 섞여있는 구조)
4. **헬퍼 함수를 테스트 블록 중간에 선언**

---

## Mocking 규칙

### ✅ 해야 할 것

#### 1. **Mocking은 최소화 - 실제 코드 사용 우선**

```typescript
// ✅ GOOD: 실제 dateUtils 함수 사용
import { formatDate, isWeekend } from '@/utils/dateUtils';

it('should format date correctly', () => {
  const result = formatDate(new Date('2025-01-15'));
  expect(result).toBe('2025-01-15');
});

// ❌ BAD: 불필요한 mocking
vi.mock('@/utils/dateUtils', () => ({
  formatDate: vi.fn(() => '2025-01-15'), // 실제 함수 사용 가능한데 mocking
  isWeekend: vi.fn(() => false),
}));
```

#### 2. **API 호출은 MSW Handler 사용 (Mock 금지)**

```typescript
// ✅ GOOD: MSW handler 활용
// src/__mocks__/handlers.ts 에 정의된 handler 사용
import { server } from '@/setupTests';
import { http, HttpResponse } from 'msw';

it('should fetch events from API', async () => {
  // handler는 이미 setupTests.ts에서 설정됨
  render(<EventList />);

  // handlers.ts의 GET /api/events handler가 자동으로 응답
  expect(await screen.findByText('Team Meeting')).toBeInTheDocument();
});

// 특정 테스트에서만 다른 응답이 필요할 경우
it('should handle API error', async () => {
  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ error: 'Server error' }, { status: 500 });
    })
  );

  render(<EventList />);
  expect(await screen.findByText('Failed to load events')).toBeInTheDocument();
});
```

```typescript
// ❌ BAD: API를 직접 mocking
vi.mock('@/api/events', () => ({
  fetchEvents: vi.fn(() => Promise.resolve([...])) // MSW handler 있는데 직접 mock
}));
```

#### 3. **외부 의존성만 Mocking**

Mocking이 허용되는 경우:

- 시간/날짜 (`vi.setSystemTime`, `vi.useFakeTimers`)
- 브라우저 API (`localStorage`, `window.location`)
- 외부 라이브러리의 특정 기능 (예: 랜덤 함수)

```typescript
// ✅ GOOD: 시간 고정 (테스트 일관성)
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-10-01'));
});

afterEach(() => {
  vi.useRealTimers();
});

// ✅ GOOD: localStorage mocking
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});
```

#### 4. **Mock 데이터는 `src/__mocks__/response/` 참조**

```typescript
// ✅ GOOD: 기존 mock 데이터 활용
import mockEvents from '@/__mocks__/response/events.json';

it('should display events from mock data', () => {
  // mockEvents 사용
  render(<EventList events={mockEvents.events} />);
});

// ❌ BAD: 인라인으로 새로운 mock 데이터 생성
it('should display events', () => {
  const events = [
    { id: 1, title: 'Test' }, // 기존 mock 파일 있는데 새로 생성
    { id: 2, title: 'Test 2' },
  ];
  render(<EventList events={events} />);
});
```

### ❌ 하면 안 되는 것

1. **내부 유틸 함수/훅 mocking** (실제 코드 사용)
2. **API 직접 mocking** (MSW handler 사용)
3. **컴포넌트 mocking** (통합 테스트 시 실제 컴포넌트 사용)
4. **Mock 데이터 인라인 생성** (기존 파일 활용)

---

## 쿼리 및 Assertion 규칙

### ✅ 해야 할 것

#### 1. **쿼리 우선순위 준수** (접근성 우선)

```typescript
// ✅ GOOD: 우선순위 준수
// 1순위: getByRole (가장 선호)
screen.getByRole('button', { name: /submit/i });
screen.getByRole('textbox', { name: /email/i });

// 2순위: getByLabelText (폼 요소)
screen.getByLabelText(/password/i);

// 3순위: getByPlaceholderText
screen.getByPlaceholderText(/enter your name/i);

// 4순위: getByText
screen.getByText(/welcome back/i);

// 최후: getByTestId (다른 방법이 불가능할 때만)
screen.getByTestId('complex-calendar-grid');
```

```typescript
// ❌ BAD: 우선순위 무시
screen.getByTestId('submit-button'); // getByRole 사용 가능한데 testId 사용
document.querySelector('.submit-btn'); // querySelector 절대 금지
```

#### 2. **명확한 Matcher 사용**

```typescript
// ✅ GOOD: 구체적인 matcher
expect(button).toBeDisabled();
expect(input).toHaveValue('test@example.com');
expect(element).toHaveAttribute('aria-label', 'Close dialog');
expect(list).toHaveLength(5);
expect(mock).toHaveBeenCalledWith({ id: 1, name: 'test' });

// ❌ BAD: 모호한 matcher
expect(button.disabled).toBe(true); // toBeDisabled() 사용
expect(input.value === 'test').toBeTruthy(); // toHaveValue() 사용
expect(mock).toHaveBeenCalled(); // toHaveBeenCalledWith() 사용
```

#### 3. **비동기 테스트는 항상 `expect.hasAssertions()` 포함**

```typescript
// ✅ GOOD: hasAssertions로 안전성 확보
it('should load data from API', async () => {
  expect.hasAssertions(); // 반드시 포함

  render(<DataList />);

  expect(await screen.findByText('Loaded')).toBeInTheDocument();
});

// ❌ BAD: hasAssertions 누락
it('should load data from API', async () => {
  // expect.hasAssertions() 없음 - 위험!
  render(<DataList />);
  await screen.findByText('Loaded');
});
```

### ❌ 하면 안 되는 것

1. **`querySelector`, `getElementById` 사용 절대 금지**
2. **`getByTestId` 남발** (다른 방법이 있을 때)
3. **모호한 matcher 사용** (`toBe(true)` 대신 `toBeDisabled()`)
4. **비동기 테스트에서 `expect.hasAssertions()` 누락**

---

## 비동기 처리 규칙

### ✅ 해야 할 것

#### 1. **`userEvent`는 항상 `await` 사용**

```typescript
// ✅ GOOD: userEvent는 async
const user = userEvent.setup();
await user.click(button);
await user.type(input, 'text');
await user.selectOptions(select, 'option1');
```

```typescript
// ❌ BAD: await 누락
const user = userEvent.setup();
user.click(button); // await 누락!
user.type(input, 'text'); // await 누락!
```

#### 2. **비동기 쿼리 우선순위**

```typescript
// ✅ GOOD: findBy (자동 대기 + 쿼리)
const element = await screen.findByText('Loaded');

// ✅ GOOD: waitFor (복잡한 조건)
await waitFor(() => {
  expect(screen.getByText('Success')).toBeInTheDocument();
});

// ✅ GOOD: waitForElementToBeRemoved (제거 대기)
await waitForElementToBeRemoved(() => screen.queryByText('Loading...'));

// ❌ BAD: setTimeout 사용 금지
setTimeout(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
}, 1000); // 절대 금지!
```

#### 3. **`act()` 는 React Testing Library가 자동 처리**

```typescript
// ✅ GOOD: act() 불필요 (userEvent가 자동 처리)
await user.click(button);
expect(screen.getByText('Clicked')).toBeInTheDocument();

// ❌ BAD: 불필요한 act() 래핑
await act(async () => {
  await user.click(button); // userEvent는 이미 act() 처리됨
});
```

**단, Hook 테스트에서는 명시적 사용:**

```typescript
// ✅ GOOD: Hook 테스트에서는 act() 필요
const { result } = renderHook(() => useCounter());

await act(async () => {
  result.current.increment();
});

expect(result.current.count).toBe(1);
```

### ❌ 하면 안 되는 것

1. **`setTimeout` 사용 절대 금지**
2. **`userEvent` 호출 시 `await` 누락**
3. **`getBy` 로 비동기 요소 찾기** (`findBy` 사용)
4. **불필요한 `act()` 래핑**

---

## 테스트 데이터 규칙

### ✅ 해야 할 것

#### 1. **테스트 데이터는 명확하고 의미있게**

```typescript
// ✅ GOOD: 명확한 테스트 데이터
const validEvent = {
  title: 'Team Meeting',
  date: '2025-01-15',
  startTime: '10:00',
  endTime: '11:00',
  description: 'Weekly sync',
  location: 'Conference Room A',
};

const invalidEvent = {
  title: '', // 의도적으로 비어있음 - 유효성 검사 테스트용
  date: '2025-01-15',
  startTime: '10:00',
  endTime: '09:00', // 종료시간이 시작시간보다 빠름 - 에러 케이스
};
```

```typescript
// ❌ BAD: 의미 없는 테스트 데이터
const event = {
  title: 'test',
  date: 'asdf',
  startTime: 'xxx',
  endTime: 'yyy',
};
```

#### 2. **Edge Case는 명시적으로**

```typescript
// ✅ GOOD: Edge case 명확히 표현
const edgeCases = {
  monthlyOn31st: {
    title: 'Month End Meeting',
    date: '2025-01-31', // 31일 - 일부 월에는 없음
    repeatType: 'monthly',
  },
  leapYearFeb29: {
    title: 'Leap Day Event',
    date: '2024-02-29', // 윤년에만 존재
    repeatType: 'yearly',
  },
  maxEndDate: {
    title: 'Long Term Event',
    endDate: '2025-12-31', // 명세상 최대 날짜
  },
};
```

#### 3. **기존 Mock 데이터 파일 활용**

```typescript
// ✅ GOOD: 기존 파일 참조
import events from '@/__mocks__/response/events.json';
import realEvents from '@/__mocks__/response/realEvents.json';

it('should display all events', () => {
  render(<Calendar events={events.events} />);
  expect(screen.getAllByRole('article')).toHaveLength(events.events.length);
});
```

### ❌ 하면 안 되는 것

1. **무의미한 테스트 데이터** (`'test'`, `'asdf'`, `123` 등)
2. **기존 Mock 파일 무시하고 중복 생성**
3. **Edge Case를 일반 데이터처럼 사용**

---

## 파일 구조 및 네이밍 규칙

### ✅ 해야 할 것

#### 1. **파일 위치 규칙 준수**

```
src/
├── __tests__/
│   ├── unit/                     # 순수 함수 테스트
│   │   ├── easy.dateUtils.spec.ts
│   │   ├── medium.eventOverlap.spec.ts
│   │   └── hard.edgeCases.spec.ts
│   ├── hooks/                    # 커스텀 훅 테스트
│   │   ├── easy.useSearch.spec.ts
│   │   └── medium.useEventOperations.spec.ts
│   └── medium.integration.spec.tsx  # 통합 테스트
```

#### 2. **네이밍 규칙**

```
[feature].spec.{ts|tsx}
```

- `feature`: 테스트 대상 (파일명 또는 기능명)
- `spec`: 필수 (test보다 spec 사용)
- 확장자: `.ts` (유틸/훅) | `.tsx` (컴포넌트)

```typescript
// ✅ GOOD
dateUtils.spec.ts;
meuseEventForm.spec.ts;
recurringEvents.spec.tsx;
meintegration.spec.tsx;

// ❌ BAD
useEventForm.spec.js; // .js 대신 .ts
RecurringEvents.spec.tsx; // PascalCase 금지
integration - test.tsx; // spec 누락
```

#### 3. **Import 순서**

```typescript
// ✅ GOOD: Import 순서 규칙
// 1. 테스트 프레임워크
import { describe, it, expect, beforeEach, vi } from 'vitest';

// 2. React Testing Library
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// 3. 테스트 대상 (알파벳순)
import { formatDate } from '@/utils/dateUtils';
import { useEventForm } from '@/hooks/useEventForm';

// 4. Mock 데이터
import mockEvents from '@/__mocks__/response/events.json';

// 5. 타입 (별도 블록)
import type { Event } from '@/types';
```

### BAD

1. **잘못된 디렉토리에 테스트 파일 배치**
2. **네이밍 규칙 위반**
3. **Import 순서 무시**
4. **`.test.` 사용** (`.spec.` 사용)

---

## 금지 사항 (Forbidden)

### 🚫 절대 금지 목록

| 금지 사항                          | 이유                                      |
| ---------------------------------- | ----------------------------------------- |
| `querySelector` / `getElementById` | 접근성 무시, 구현 세부사항 의존           |
| `setTimeout` / `setInterval`       | 불안정한 테스트, `waitFor` 사용           |
| `fireEvent` (특수한 경우 제외)     | 실제 사용자 행동과 다름, `userEvent` 사용 |
| 새로운 테스트 케이스 추가          | 기존 케이스만 구현                        |
| API 직접 mocking (`vi.mock`)       | MSW handler 사용                          |
| 내부 유틸/훅 mocking               | 실제 코드 테스트                          |
| `.only()` / `.skip()` 커밋         | CI 실패 또는 테스트 누락                  |
| `console.log` 디버깅 코드          | 제거 후 커밋                              |
| 테스트 내 `TODO` 주석              | 완성된 테스트만 커밋                      |
| 명세에 없는 요구사항 테스트        | 명세가 우선                               |

### ⚠️ 주의 사항

```typescript
// ❌ 절대 커밋 금지
describe.only('Feature', () => { ... }); // .only 금지
it.skip('test case', () => { ... });     // .skip 금지

// ❌ 디버깅 코드 제거
console.log('test data:', data);
console.error('error:', error);

// ❌ 미완성 테스트
it('should do something', () => {
  // TODO: 구현 필요
});
```

---

## ✅ 체크리스트

테스트 코드 제출 전 확인:

### 기본 규칙

- [ ] 기존 테스트 케이스만 구현 (새 케이스 추가 안 함)
- [ ] 명세에 정의된 내용만 테스트
- [ ] 공통 작업은 `beforeEach`로 추출 (3회 이상 반복 시)
- [ ] AAA 패턴 준수 (Arrange-Act-Assert)

### Mocking 규칙

- [ ] Mocking 최소화 (실제 코드 우선)
- [ ] API는 MSW handler 사용
- [ ] Mock 데이터는 `__mocks__/response/` 활용
- [ ] 외부 의존성만 mocking (시간, localStorage 등)

### 쿼리 및 Assertion

- [ ] 쿼리 우선순위 준수 (getByRole > ... > getByTestId)
- [ ] `querySelector` 사용 안 함
- [ ] 명확한 matcher 사용 (toBeDisabled, toHaveValue 등)
- [ ] 비동기 테스트에 `expect.hasAssertions()` 포함

### 비동기 처리

- [ ] `userEvent` 호출 시 `await` 사용
- [ ] `findBy` 또는 `waitFor` 사용 (setTimeout 금지)
- [ ] 불필요한 `act()` 래핑 안 함

### 코드 품질

- [ ] 파일명/위치 규칙 준수
- [ ] Import 순서 정리
- [ ] `.only()`, `.skip()` 제거
- [ ] `console.log` 디버깅 코드 제거
- [ ] TypeScript 에러 없음
- [ ] ESLint 에러 없음

---

## 📚 참고 문서

- [Test Plan Overview](./test-plan-overview.md)
- [Specification](./specification.md)
- [React Testing Library Best Practices](./react-testing-library-best-practices.md)
- [TDD Test Designer Agent](../.claude/agents/tdd-test-designer.md)
- [TDD Test Implementer Agent](../.claude/agents/tdd-test-implementer.ko.md)

---

**마지막 업데이트**: 2025-10-28  
**문서 버전**: 1.0.0  
**유지보수**: 규칙 변경 시 이 문서를 먼저 업데이트할 것
