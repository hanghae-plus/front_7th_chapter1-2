# Kent Beck의 TDD 철학 - AI 테스트 설계 가이드

> **목적**: AI가 Kent Beck의 TDD 사상을 기반으로 테스트를 설계할 수 있도록 실용적인 가이드를 제공합니다.
>
> **대상**: 테스트 설계 에이전트, 테스트 구현 에이전트
>
> **버전**: 1.0.0
>
> **작성일**: 2025-10-28

---

## 목차

1. [Kent Beck의 TDD 핵심 원칙](#kent-beck의-tdd-핵심-원칙)
2. [Red-Green-Refactor 사이클](#red-green-refactor-사이클)
3. [TODO List First](#todo-list-first)
4. [Baby Steps (작은 단계)](#baby-steps-작은-단계)
5. [세 가지 구현 전략](#세-가지-구현-전략)
6. [테스트 우선순위 결정](#테스트-우선순위-결정)
7. [Simple Design 4원칙](#simple-design-4원칙)
8. [실전 적용 가이드](#실전-적용-가이드)
9. [안티패턴 (피해야 할 것)](#안티패턴-피해야-할-것)

---

## Kent Beck의 TDD 핵심 원칙

### 1. 테스트가 코드를 주도한다

**원칙**:

- 코드를 작성하기 전에 테스트를 먼저 작성한다
- 테스트는 "무엇을" 해야 하는지 명세한다
- 코드는 "어떻게" 할 것인지 구현한다

**테스트 설계에 적용**:

```markdown
단계 1: 명세 읽기
"사용자가 제목을 입력하고 저장하면 이벤트가 생성된다"

단계 2: 테스트 설계 (What)

- [ ] 제목을 입력하면 입력 필드에 표시된다
- [ ] 저장 버튼을 클릭하면 이벤트가 생성된다
- [ ] 생성된 이벤트가 목록에 표시된다

단계 3: 구현 (How) - 구현자가 담당
```

**핵심**: 테스트 설계자는 "What"에만 집중, "How"는 구현자에게 맡긴다.

---

### 2. 테스트는 명세서다

**원칙**:

- 테스트는 시스템이 어떻게 동작해야 하는지 문서화한다
- 누구나 테스트를 읽고 시스템 동작을 이해할 수 있어야 한다
- 기술 용어보다 도메인 언어를 사용한다

**좋은 예**:

```typescript
describe('이벤트 생성', () => {
  it('제목과 날짜를 입력하고 저장하면 캘린더에 표시된다', () => {
    // 사용자 관점의 명확한 설명
  });
});
```

**나쁜 예**:

```typescript
describe('EventService', () => {
  it('addEvent 함수가 state를 업데이트한다', () => {
    // 구현 세부사항에 집중
  });
});
```

---

### 3. 실패하는 테스트부터 시작한다

**원칙**:

- Red(실패) → Green(성공) → Refactor(개선)
- 실패하는 테스트 없이는 코드를 작성하지 않는다
- 테스트가 처음부터 성공하면 뭔가 잘못된 것

**테스트 설계에 적용**:

```markdown
1. 명세 요구사항을 TODO로 변환

   - [ ] 매일 반복 일정 생성

2. 가장 간단한 케이스부터 시작
   - [ ] 내일부터 3일간 매일 반복 (가장 간단)
3. 점진적으로 복잡도 증가
   - [ ] 1년간 매일 반복 (기간 증가)
   - [ ] 윤년을 포함한 매일 반복 (Edge Case)
```

---

## Red-Green-Refactor 사이클

### 사이클 흐름

```
1. RED (빨강)
   ↓
   실패하는 테스트 작성
   ↓

2. GREEN (초록)
   ↓
   테스트를 통과하는 최소한의 코드 작성
   ↓

3. REFACTOR (리팩토링)
   ↓
   중복 제거, 코드 개선
   ↓

4. 다음 테스트로 → RED
```

### 각 단계별 상세

#### Phase 1: RED (실패하는 테스트)

**목표**: 무엇을 구현할지 명확히 한다

```typescript
// TODO: 매일 반복 일정이 종료일까지 생성된다

it('시작일부터 종료일까지 매일 이벤트가 생성된다', () => {
  // Arrange: 테스트 데이터 준비
  const startDate = '2025-01-01';
  const endDate = '2025-01-03';

  // Act: 반복 일정 생성
  createRecurringEvent({ title: '회의', repeat: 'daily', startDate, endDate });

  // Assert: 3일간 이벤트 존재 확인
  expect(screen.getByText('2025-01-01 회의')).toBeInTheDocument();
  expect(screen.getByText('2025-01-02 회의')).toBeInTheDocument();
  expect(screen.getByText('2025-01-03 회의')).toBeInTheDocument();
});

// 결과: FAIL (아직 구현 안 됨)
```

#### Phase 2: GREEN (통과하는 코드)

**목표**: 테스트를 통과하는 최소한의 코드

**Kent Beck의 조언**:

> "Make it work, then make it right, then make it fast"
> (먼저 동작하게 하고, 그 다음 올바르게 하고, 마지막으로 빠르게 한다)

```typescript
// 가장 간단한 구현 (하드코딩도 OK)
function createRecurringEvent(data) {
  if (data.repeat === 'daily') {
    return [
      { date: '2025-01-01', title: '회의' },
      { date: '2025-01-02', title: '회의' },
      { date: '2025-01-03', title: '회의' },
    ];
  }
}

// 결과: PASS
```

#### Phase 3: REFACTOR (개선)

**목표**: 중복 제거, 설계 개선

```typescript
// 더 일반화된 구현
function createRecurringEvent({ title, repeat, startDate, endDate }) {
  const events = [];
  let current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    events.push({
      date: formatDate(current),
      title,
    });
    current.setDate(current.getDate() + 1);
  }

  return events;
}

// 결과: 여전히 PASS, 하지만 더 나은 코드
```

---

## TODO List First

### 원칙

Kent Beck은 TDD를 시작할 때 항상 TODO List를 먼저 작성하라고 강조합니다.

**이유**:

1. 전체 그림을 먼저 본다
2. 작은 단계로 나눈다
3. 진행 상황을 추적한다
4. 놓친 케이스를 발견한다

### TODO List 작성 전략

#### 1단계: 명세에서 TODO 추출

```markdown
명세: "사용자는 매일, 매주, 매월, 매년 반복 일정을 생성할 수 있다"

초기 TODO List:

- [ ] 매일 반복 일정 생성
- [ ] 매주 반복 일정 생성
- [ ] 매월 반복 일정 생성
- [ ] 매년 반복 일정 생성
```

#### 2단계: 각 항목을 더 작은 단위로 분할

```markdown
- [ ] 매일 반복 일정 생성
  - [ ] 3일간 매일 반복 (가장 간단)
  - [ ] 1개월간 매일 반복
  - [ ] 윤년 포함 1년간 매일 반복
  - [ ] 종료일 검증 (시작일 이후)
  - [ ] 최대 종료일 검증 (2025-12-31)
```

#### 3단계: 간단한 것부터 복잡한 순서로 정렬

```markdown
1. [ ] 3일간 매일 반복 (가장 간단, 로직 검증)
2. [ ] 7일간 매주 반복 (주간 반복 로직)
3. [ ] 2개월간 매월 반복 (월간 반복 로직)
4. [ ] 2년간 매년 반복 (연간 반복 로직)
5. [ ] 31일 월간 반복 - 31일 있는 달 (Edge Case 시작)
6. [ ] 31일 월간 반복 - 30일 달 건너뛰기
7. [ ] 윤년 2월 29일 연간 반복 (가장 복잡한 Edge Case)
```

### TODO List 작성 규칙

#### 규칙 1: 5~15분 단위로 분할

**너무 큰 TODO (BAD)**:

```markdown
- [ ] 반복 일정 기능 구현 (3시간)
```

**적절한 크기 (GOOD)**:

```markdown
- [ ] 매일 반복 이벤트 생성 확인 (10분)
- [ ] 생성된 이벤트가 캘린더에 표시 (10분)
- [ ] 반복 아이콘 표시 확인 (10분)
```

#### 규칙 2: 사용자 언어 사용

**기술 용어 (BAD)**:

```markdown
- [ ] RecurringEvent 클래스 구현
- [ ] generateEvents() 메서드 테스트
- [ ] state.events 배열 업데이트 확인
```

**사용자 언어 (GOOD)**:

```markdown
- [ ] 반복 일정을 저장하면 여러 날짜에 생성된다
- [ ] 생성된 일정들이 캘린더에 표시된다
- [ ] 각 일정에 반복 아이콘이 표시된다
```

#### 규칙 3: 명세 ID 참조

```markdown
- [ ] 매일 반복 선택 시 매일 이벤트 생성 (명세: RT-001)
- [ ] 31일 월간 반복이 30일 달에 건너뛰기 (명세: EDGE-001)
- [ ] 반복 아이콘 표시 (명세: ICON-001)
```

---

## Baby Steps (작은 단계)

### 원칙

Kent Beck의 핵심 철학:

> "Take small steps. You're writing a program, not carving the Declaration of Independence into the side of a mountain."
> (작은 단계로 나아가라. 당신은 프로그램을 작성하는 것이지, 산 옆면에 독립선언문을 새기는 게 아니다.)

### 왜 작은 단계인가?

1. **빠른 피드백**: 5분마다 성공/실패를 확인
2. **명확한 진행 상황**: 어디까지 했는지 명확
3. **쉬운 디버깅**: 문제가 생기면 마지막 5분만 보면 됨
4. **성취감**: 작은 성공들이 모여 동기 부여

### Baby Steps 적용 방법

#### 예시: "31일 월간 반복" 기능

**큰 단계 (BAD)**:

```markdown
- [ ] 31일 월간 반복 기능 전체 구현 (2시간)
```

**작은 단계 (GOOD)**:

```markdown
1. [ ] 31일에 매월 반복 선택 가능 (5분)
2. [ ] 1월 31일 → 3월 31일 이벤트 생성 확인 (10분)
3. [ ] 1월 31일 → 2월은 건너뛰기 확인 (10분)
4. [ ] 1월 31일 → 4월은 건너뛰기 확인 (10분)
5. [ ] 31일 있는 모든 달 확인 (15분)
```

**각 단계가**:

- 5~15분 안에 완료 가능
- 독립적으로 테스트 가능
- 실패 시 빠르게 원인 파악 가능

### 간단한 것부터 복잡한 순서

#### 복잡도 기준 정렬

```markdown
Level 1: 가장 간단 (예외 없음)
├─ [ ] 매일 반복 3일 (단순 날짜 증가)
└─ [ ] 매주 반복 2주 (7일 간격)

Level 2: 약간 복잡 (기본 로직)
├─ [ ] 매월 반복 3개월 (달 수 다름)
└─ [ ] 매년 반복 2년 (윤년 고려 시작)

Level 3: 복잡 (Edge Case)
├─ [ ] 31일 월간 반복 - 31일 있는 달
├─ [ ] 31일 월간 반복 - 30일 달
└─ [ ] 31일 월간 반복 - 2월

Level 4: 가장 복잡 (특수 Edge Case)
├─ [ ] 윤년 2월 29일 연간 반복 - 윤년
└─ [ ] 윤년 2월 29일 연간 반복 - 평년
```

---

## 세 가지 구현 전략

Kent Beck은 "Test-Driven Development: By Example"에서 세 가지 구현 전략을 제시합니다.

### 1. Fake It (가짜로 만들기)

**전략**: 테스트를 통과하는 가장 간단한 값을 리턴한다 (하드코딩도 OK)

**언제 사용**:

- 처음 시작할 때
- 어떻게 구현할지 막막할 때
- 테스트가 실패하는 것을 먼저 확인하고 싶을 때

**예시**:

```typescript
// Step 1: 실패하는 테스트
it('매일 반복 일정이 3일간 생성된다', () => {
  const events = createDailyRecurring('2025-01-01', '2025-01-03');
  expect(events).toHaveLength(3);
});

// Step 2: Fake It - 하드코딩으로 통과
function createDailyRecurring(start, end) {
  return [{ date: '2025-01-01' }, { date: '2025-01-02' }, { date: '2025-01-03' }];
}

// Step 3: 두 번째 테스트 추가 (다른 날짜)
it('매일 반복 일정이 2일간 생성된다', () => {
  const events = createDailyRecurring('2025-02-01', '2025-02-02');
  expect(events).toHaveLength(2);
});

// Step 4: 이제 일반화 필요 (Triangulation)
```

**Kent Beck의 조언**:

> "It's supposed to feel like cheating. But it's not."
> (치팅처럼 느껴질 수 있다. 하지만 아니다.)

---

### 2. Triangulation (삼각측량)

**전략**: 두 개 이상의 테스트 케이스로 일반화된 구현을 유도한다

**언제 사용**:

- Fake It으로 하드코딩한 후
- 올바른 추상화를 찾고 싶을 때
- 구현 방향이 확실하지 않을 때

**예시**:

```typescript
// Test 1: 3일간 반복
it('2025-01-01부터 3일간 매일 반복', () => {
  const events = createDailyRecurring('2025-01-01', '2025-01-03');
  expect(events).toHaveLength(3);
  expect(events[0].date).toBe('2025-01-01');
  expect(events[2].date).toBe('2025-01-03');
});

// Test 2: 2일간 반복 (다른 케이스)
it('2025-02-10부터 2일간 매일 반복', () => {
  const events = createDailyRecurring('2025-02-10', '2025-02-11');
  expect(events).toHaveLength(2);
  expect(events[0].date).toBe('2025-02-10');
  expect(events[1].date).toBe('2025-02-11');
});

// 두 테스트를 만족하려면 일반화된 구현 필요
function createDailyRecurring(startDate, endDate) {
  const events = [];
  let current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    events.push({ date: formatDate(current) });
    current.setDate(current.getDate() + 1);
  }

  return events;
}
```

**핵심**: 하나의 테스트만으로는 일반화하지 않는다. 최소 2개 이상의 예시가 있어야 패턴을 찾는다.

---

### 3. Obvious Implementation (명백한 구현)

**전략**: 구현 방법이 명확하면 바로 작성한다

**언제 사용**:

- 구현이 너무 간단하고 명확할 때
- 이미 유사한 패턴을 여러 번 구현했을 때
- Fake It이나 Triangulation이 오히려 시간 낭비일 때

**예시**:

```typescript
// 매주 반복은 매일 반복과 유사하고 명확
it('매주 반복 일정이 3주간 생성된다', () => {
  const events = createWeeklyRecurring('2025-01-01', '2025-01-15');
  expect(events).toHaveLength(3);
});

// 명백한 구현 (Fake It 없이 바로 작성)
function createWeeklyRecurring(startDate, endDate) {
  const events = [];
  let current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    events.push({ date: formatDate(current) });
    current.setDate(current.getDate() + 7); // 7일씩 증가
  }

  return events;
}
```

**주의**: Obvious Implementation이 막히면 즉시 Fake It으로 돌아간다.

---

### 전략 선택 가이드

```
시작 시:
  구현이 명확한가?
    YES → Obvious Implementation
    NO  → Fake It
           ↓
         테스트 통과
           ↓
         일반화 필요?
           YES → Triangulation (두 번째 테스트 추가)
           NO  → 다음 TODO로
```

---

## 테스트 우선순위 결정

### Kent Beck의 우선순위 원칙

1. **가장 간단한 것부터**
2. **가장 중요한 것 먼저**
3. **가장 배울 게 많은 것**

### 우선순위 매트릭스

```
          │ 간단함               │ 복잡함
─────────┼─────────────────────┼─────────────────────
중요함    │ 1순위: 여기서 시작   │ 2순위: 기본 후 진행
          │ (Quick Win)         │ (점진적 접근)
─────────┼─────────────────────┼─────────────────────
덜 중요함 │ 3순위: 시간 남으면   │ 4순위: 건너뛰기
          │                     │ (YAGNI)
```

### 실전 예시: 반복 일정 기능

#### 우선순위 1: 간단 + 중요

```markdown
- [ ] 매일 반복 3일간 생성 (가장 간단한 반복)
- [ ] 생성된 이벤트 캘린더에 표시 (핵심 기능)
- [ ] 반복 아이콘 표시 (시각적 구분 필수)
```

**이유**:

- 빠르게 구현 가능
- 핵심 가치 전달
- 나머지 기능의 기반

#### 우선순위 2: 복잡 + 중요

```markdown
- [ ] 31일 월간 반복 처리 (복잡하지만 명세 필수)
- [ ] 윤년 2월 29일 처리 (복잡하지만 명세 필수)
- [ ] 종료일 검증 (비즈니스 로직)
```

**이유**:

- 명세에서 명시적 요구
- 사용자에게 직접 영향
- Edge Case지만 피할 수 없음

#### 우선순위 3: 간단 + 덜 중요

```markdown
- [ ] 반복 아이콘 툴팁 표시
- [ ] 이벤트 생성 애니메이션
```

**이유**:

- UX 개선
- 없어도 기능 동작
- 시간 남으면 추가

#### 우선순위 4: 복잡 + 덜 중요 (YAGNI)

```markdown
- [ ] 타임존 처리 (명세에 없음)
- [ ] 예외 날짜 설정 (명세에 없음)
- [ ] 반복 간격 커스터마이징 (명세에 없음)
```

**이유**:

- 명세에 없음
- 구현 복잡
- **YAGNI (You Aren't Gonna Need It)**

---

## Simple Design 4원칙

Kent Beck의 Simple Design 4원칙 (중요도 순):

### 1. 모든 테스트를 통과한다

**의미**: 테스트가 통과하지 않으면 설계가 아무리 아름다워도 쓸모없다

**테스트 설계에 적용**:

```markdown
설계 완료 체크리스트:

- [ ] 명세의 모든 필수 요구사항이 TODO에 있는가?
- [ ] 각 TODO가 테스트 가능한가?
- [ ] Coverage Map이 100%인가?
```

---

### 2. 의도를 드러낸다

**의미**: 코드(테스트)를 읽는 사람이 무엇을 하는지 즉시 이해할 수 있어야 한다

**좋은 테스트 (의도가 명확)**:

```typescript
describe('반복 일정 생성', () => {
  describe('매일 반복', () => {
    it('시작일부터 종료일까지 매일 이벤트가 생성된다', () => {
      // 명확한 의도
    });

    it('종료일 다음 날에는 이벤트가 생성되지 않는다', () => {
      // 경계 조건 명확
    });
  });

  describe('31일 월간 반복', () => {
    it('31일이 있는 달에만 이벤트가 생성된다', () => {
      // Edge Case 의도 명확
    });
  });
});
```

**나쁜 테스트 (의도 불명확)**:

```typescript
describe('RecurringService', () => {
  it('test1', () => {
    // 무엇을 테스트하는지 알 수 없음
  });

  it('작동 확인', () => {
    // 너무 모호함
  });
});
```

---

### 3. 중복이 없다

**의미**: 같은 지식이 여러 곳에 표현되면 안 된다

**테스트 설계에 적용**:

```typescript
// BAD: 중복된 Setup
describe('반복 일정', () => {
  it('매일 반복 생성', () => {
    render(<Calendar />);
    const titleInput = screen.getByLabelText('제목');
    const startInput = screen.getByLabelText('시작일');
    // ... 긴 setup
  });

  it('매주 반복 생성', () => {
    render(<Calendar />);
    const titleInput = screen.getByLabelText('제목');
    const startInput = screen.getByLabelText('시작일');
    // ... 동일한 setup 반복
  });
});

// GOOD: beforeEach로 중복 제거
describe('반복 일정', () => {
  let titleInput, startInput;

  beforeEach(() => {
    render(<Calendar />);
    titleInput = screen.getByLabelText('제목');
    startInput = screen.getByLabelText('시작일');
  });

  it('매일 반복 생성', () => {
    // setup 없이 바로 테스트
  });

  it('매주 반복 생성', () => {
    // setup 없이 바로 테스트
  });
});
```

---

### 4. 요소를 최소화한다

**의미**: 목적을 달성하는 가장 적은 수의 클래스, 메서드, 테스트

**테스트 설계에 적용**:

```markdown
BAD: 과도한 테스트

- [ ] 매일 반복 1일 (불필요)
- [ ] 매일 반복 2일
- [ ] 매일 반복 3일
- [ ] 매일 반복 4일
- [ ] 매일 반복 5일 (너무 많음)

GOOD: 필요충분한 테스트

- [ ] 매일 반복 3일간 생성 (기본 케이스)
- [ ] 매일 반복 30일간 생성 (긴 기간)
- [ ] 윤년 포함 매일 반복 (Edge Case)
```

**원칙**: 각 테스트는 새로운 것을 검증해야 한다. 중복 검증은 제거한다.

---

## 실전 적용 가이드

### 시나리오: "반복 일정 생성" 기능 설계

#### Step 1: 명세 읽고 TODO List 작성

```markdown
명세:

- 사용자는 매일, 매주, 매월, 매년 반복 일정을 생성할 수 있다
- 31일에 매월 반복 선택 시 31일이 있는 달에만 생성된다
- 윤년 2월 29일에 매년 반복 선택 시 윤년에만 생성된다
- 종료일은 최대 2025-12-31까지 가능하다

초기 TODO List (큰 단위):

- [ ] 매일 반복 일정 생성
- [ ] 매주 반복 일정 생성
- [ ] 매월 반복 일정 생성
- [ ] 매년 반복 일정 생성
- [ ] 31일 월간 반복 Edge Case
- [ ] 2월 29일 연간 반복 Edge Case
- [ ] 종료일 검증
```

#### Step 2: Baby Steps로 분할

```markdown
세분화된 TODO List:

매일 반복 (가장 간단 - 여기서 시작)

- [ ] 3일간 매일 반복 생성 (10분) - 기본 로직 검증
- [ ] 종료일 다음 날 이벤트 없음 확인 (10분) - 경계 조건

매주 반복 (약간 복잡)

- [ ] 2주간 매주 반복 생성 (10분) - 7일 간격
- [ ] 종료일이 주 중간이면 마지막 주 생성 안 됨 (15분) - 경계 조건

매월 반복 (복잡도 증가)

- [ ] 3개월간 매월 반복 생성 (10분) - 기본
- [ ] 15일 매월 반복 (10분) - 모든 달에 15일 있음
- [ ] 31일 매월 반복 - 1, 3, 5, 7, 8, 10, 12월 (15분) - Edge Case 1
- [ ] 31일 매월 반복 - 4, 6, 9, 11월 건너뛰기 (15분) - Edge Case 2
- [ ] 31일 매월 반복 - 2월 건너뛰기 (15분) - Edge Case 3

매년 반복 (가장 복잡)

- [ ] 2년간 매년 반복 생성 (10분) - 기본
- [ ] 윤년 2월 29일 연간 반복 - 윤년 생성 (15분) - Edge Case 1
- [ ] 윤년 2월 29일 연간 반복 - 평년 건너뛰기 (15분) - Edge Case 2

종료일 검증

- [ ] 종료일 2025-12-31 허용 (10분)
- [ ] 종료일 2026-01-01 거부 (10분)
- [ ] 종료일이 시작일 이전이면 거부 (10분)
- [ ] 종료일과 시작일 동일하면 거부 (10분)
```

#### Step 3: 우선순위 부여

```markdown
Critical (빠른 가치 전달):

1. [ ] 3일간 매일 반복 생성 (첫 번째 성공)
2. [ ] 종료일 다음 날 이벤트 없음 확인
3. [ ] 2주간 매주 반복 생성
4. [ ] 3개월간 매월 반복 생성
5. [ ] 2년간 매년 반복 생성

High (명세 필수 Edge Case): 6. [ ] 31일 매월 반복 - 31일 있는 달 7. [ ] 31일 매월 반복 - 30일 달 건너뛰기 8. [ ] 31일 매월 반복 - 2월 건너뛰기 9. [ ] 윤년 2월 29일 연간 반복 - 윤년 10. [ ] 윤년 2월 29일 연간 반복 - 평년 11. [ ] 종료일 검증 4가지
```

#### Step 4: 첫 번째 테스트 선택

**Kent Beck의 질문**:

1. 이것이 가장 간단한가? → YES (3일간 매일 반복)
2. 이것이 가치를 전달하는가? → YES (핵심 기능)
3. 이것으로 배울 게 있는가? → YES (반복 로직 기반)

**결정**: "3일간 매일 반복 생성"부터 시작

```typescript
// Red: 실패하는 테스트
it('시작일부터 3일간 매일 이벤트가 생성된다', () => {
  // Arrange
  render(<Calendar />);
  fireEvent.click(screen.getByText('일정 추가'));

  // Act
  fireEvent.change(screen.getByLabelText('제목'), { target: { value: '회의' } });
  fireEvent.change(screen.getByLabelText('시작일'), { target: { value: '2025-01-01' } });
  fireEvent.change(screen.getByLabelText('종료일'), { target: { value: '2025-01-03' } });
  fireEvent.click(screen.getByLabelText('매일 반복'));
  fireEvent.click(screen.getByText('저장'));

  // Assert
  expect(screen.getByText('2025-01-01 회의')).toBeInTheDocument();
  expect(screen.getByText('2025-01-02 회의')).toBeInTheDocument();
  expect(screen.getByText('2025-01-03 회의')).toBeInTheDocument();
});

// 결과: RED (아직 구현 안 됨)
```

#### Step 5: Green - 통과하는 코드

**전략 선택**: Fake It (처음이니까)

```typescript
function handleSaveEvent(formData) {
  if (formData.repeat === 'daily') {
    return [
      { date: '2025-01-01', title: '회의' },
      { date: '2025-01-02', title: '회의' },
      { date: '2025-01-03', title: '회의' },
    ];
  }
}

// 결과: GREEN
```

#### Step 6: Refactor (아직 안 함)

**이유**: 테스트가 하나뿐. Triangulation 필요.

#### Step 7: 두 번째 테스트 (Triangulation)

```typescript
it('시작일부터 2일간 매일 이벤트가 생성된다', () => {
  // ... (다른 날짜)
  expect(screen.getByText('2025-02-10 운동')).toBeInTheDocument();
  expect(screen.getByText('2025-02-11 운동')).toBeInTheDocument();
});

// 하드코딩으로는 통과 불가 → 일반화 필요
```

#### Step 8: Refactor - 일반화

```typescript
function handleSaveEvent({ title, startDate, endDate, repeat }) {
  if (repeat === 'daily') {
    const events = [];
    let current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
      events.push({
        date: formatDate(current),
        title,
      });
      current.setDate(current.getDate() + 1);
    }

    return events;
  }
}

// 결과: 두 테스트 모두 GREEN
```

#### Step 9: 다음 TODO로

```markdown
✅ 3일간 매일 반복 생성 (완료!)
✅ 다른 날짜 2일간 매일 반복 (완료!)

- [ ] 종료일 다음 날 이벤트 없음 확인 (다음)
```

---

## 안티패턴 (피해야 할 것)

### 1. Big Design Up Front (BDUF)

**나쁜 예**:

```markdown
모든 설계를 완벽하게 해놓고 시작하기

1주차: 완벽한 아키텍처 설계
2주차: 완벽한 데이터 모델 설계
3주차: 완벽한 테스트 케이스 작성
4주차: 구현 시작 (너무 늦음)
```

**Kent Beck의 방식**:

```markdown
간단한 것부터 시작하고 점진적으로 발전

1일차: 가장 간단한 케이스 구현 (매일 반복 3일)
2일차: 조금 복잡한 케이스 (매주 반복)
3일차: Edge Case (31일 반복)
...
설계는 구현하면서 발전한다
```

---

### 2. Testing Implementation Details

**나쁜 예 (구현 세부사항 테스트)**:

```typescript
it('saveEvent 함수가 state.events를 업데이트한다', () => {
  const component = render(<Calendar />);

  // 내부 state에 직접 접근
  expect(component.state.events).toHaveLength(0);

  component.instance().saveEvent({ title: '회의' });

  // 내부 state 변경 확인
  expect(component.state.events).toHaveLength(1);
  expect(component.state.events[0].title).toBe('회의');
});
```

**문제점**:

- 리팩토링 시 테스트 깨짐
- 사용자 관점이 아님
- 내부 구현에 종속

**좋은 예 (사용자 관점 테스트)**:

```typescript
it('이벤트를 저장하면 캘린더에 표시된다', () => {
  render(<Calendar />);

  // 사용자가 하는 행동
  await userEvent.type(screen.getByLabelText('제목'), '회의');
  await userEvent.click(screen.getByText('저장'));

  // 사용자가 보는 것
  expect(screen.getByText('회의')).toBeInTheDocument();
});
```

---

### 3. Testing Too Much at Once

**나쁜 예 (한 번에 너무 많이)**:

```markdown
- [ ] 반복 일정 전체 기능 구현 (5시간)
  - 매일, 매주, 매월, 매년 반복
  - 31일, 2월 29일 Edge Case
  - 종료일 검증
  - UI 표시
  - 수정/삭제 기능
```

**문제점**:

- 실패하면 어디가 문제인지 모름
- 5시간 후에야 피드백
- 중간에 막히면 진도 안 나감

**좋은 예 (Baby Steps)**:

```markdown
- [ ] 3일간 매일 반복 생성 (10분)
      → 성공! 다음으로
- [ ] 2주간 매주 반복 생성 (10분)
      → 성공! 다음으로
- [ ] 31일 월간 반복 - 31일 있는 달 (15분)
      → 성공! 다음으로
```

---

### 4. Skipping Refactor

**나쁜 예**:

```
Red → Green → Red → Green → Red → Green
(Refactor 없이 계속 기능만 추가)

결과:
- 중복 코드 가득
- 이해하기 어려운 구조
- 나중에 손댈 수 없는 코드
```

**좋은 예**:

```
Red → Green → Refactor → Red → Green → Refactor
(리듬을 유지)

결과:
- 깔끔한 코드 유지
- 새 기능 추가 쉬움
- 항상 배포 가능한 상태
```

**Kent Beck의 조언**:

> "For each desired change, make the change easy (warning: this may be hard), then make the easy change."
> (원하는 변경을 하기 전에, 변경을 쉽게 만들어라 (주의: 이게 어려울 수 있다). 그 다음 쉬운 변경을 하라.)

---

### 5. Test After (구현 후 테스트)

**나쁜 예**:

```
1. 전체 기능 구현 (3일)
2. 테스트 작성 시작 (1일)
3. 테스트가 기존 구현에 맞춰짐
4. 버그 발견 안 됨
```

**좋은 예 (TDD)**:

```
1. 테스트 작성 (Red)
2. 구현 (Green)
3. 개선 (Refactor)
반복...

결과: 테스트가 명세를 반영, 버그 빠르게 발견
```

---

## 체크리스트

### 테스트 설계 체크리스트

설계를 완료한 후 다음을 확인하세요:

#### Kent Beck의 TDD 원칙

- [ ] TODO List를 먼저 작성했는가?
- [ ] 각 TODO가 5~15분 크기인가?
- [ ] 간단한 것부터 복잡한 순서로 정렬했는가?
- [ ] 사용자 언어로 작성했는가? (구현 용어 제외)
- [ ] 명세에 없는 것을 테스트하려 하지 않는가? (YAGNI)

#### Red-Green-Refactor

- [ ] 각 TODO가 독립적으로 Red → Green이 가능한가?
- [ ] Refactor 시점을 명시했는가? (예: "TODO 3개 완료 후 중복 제거")

#### Simple Design

- [ ] 모든 명세 요구사항이 TODO에 매핑되는가? (Coverage 100%)
- [ ] 각 테스트의 의도가 명확한가?
- [ ] 중복된 테스트가 없는가?
- [ ] 필요충분한 테스트만 있는가? (과도하지 않은가)

#### Baby Steps

- [ ] 첫 번째 TODO가 가장 간단한가?
- [ ] 각 단계가 이전 단계 위에 쌓이는가?
- [ ] Edge Case를 나중으로 미뤘는가?

#### 우선순위

- [ ] Critical이 정말 핵심 기능인가?
- [ ] High는 명세 필수 요구사항인가?
- [ ] 명세 외 항목을 명시하고 제외했는가?

---

## 참고 자료

### Kent Beck의 저서

1. **"Test-Driven Development: By Example"** (2002)

   - TDD의 바이블
   - Fake It, Triangulation, Obvious Implementation 설명
   - 실전 예제 중심

2. **"Extreme Programming Explained"** (1999, 2004)
   - TDD를 포함한 XP 실천법
   - Simple Design 4원칙
   - YAGNI 원칙

### 핵심 인용구

> "I'm not a great programmer; I'm just a good programmer with great habits."
> (나는 위대한 프로그래머가 아니다. 나는 단지 위대한 습관을 가진 좋은 프로그래머일 뿐이다.)

> "Make it work, make it right, make it fast."
> (먼저 동작하게 하고, 그 다음 올바르게 하고, 마지막으로 빠르게 한다.)

> "Test-driven development is a way of managing fear during programming."
> (테스트 주도 개발은 프로그래밍 중 두려움을 관리하는 방법이다.)

---

## 마치며

이 문서의 핵심 메시지:

1. **TODO List First**: 전체를 보고, 작게 나누고, 하나씩 완성한다
2. **Baby Steps**: 5~15분 단위로, 간단한 것부터, 빠른 피드백
3. **Red-Green-Refactor**: 리듬을 유지한다
4. **Simple Design**: 테스트 통과, 의도 명확, 중복 없음, 최소 요소
5. **YAGNI**: 명세에 없으면 만들지 않는다

Kent Beck의 TDD는 **두려움을 관리하는 방법**입니다.
작은 단계로 나아가면, 언제든 돌아갈 수 있고, 항상 동작하는 코드를 유지할 수 있습니다.

**이것이 Kent Beck의 TDD입니다.**

---
