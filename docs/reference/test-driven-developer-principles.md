# 구현 원칙

> **참고**: 이 문서는 `test-driven-developer.md`의 일부로, GREEN 단계에서 프로덕션 코드를 작성할 때 따라야 할 핵심 원칙을 상세히 설명합니다.

---

## Principle 1: 테스트가 요구하는 것만 구현

```typescript
// ❌ BAD: 테스트에 없는 기능 추가
export function generateRecurringEvents(eventForm: EventForm): EventForm[] {
  // 테스트에 없는데 캐싱 추가...
  const cache = new Map();

  // 테스트에 없는데 로깅 추가...
  console.log('Generating events...');

  // 테스트에 없는데 검증 추가...
  if (!isValidEventForm(eventForm)) {
    throw new Error('Invalid form');
  }

  // ...
}

// ✅ GOOD: 테스트가 요구하는 것만
export function generateRecurringEvents(eventForm: EventForm): EventForm[] {
  const { repeat } = eventForm;

  if (repeat.type === 'none') {
    return [eventForm];
  }

  // 테스트가 요구하는 각 반복 유형만 구현
  switch (repeat.type) {
    case 'daily':
      return generateDailyEvents(eventForm);
    case 'weekly':
      return generateWeeklyEvents(eventForm);
    case 'monthly':
      return generateMonthlyEvents(eventForm);
    case 'yearly':
      return generateYearlyEvents(eventForm);
    default:
      return [];
  }
}
```

**핵심**:
- 테스트에서 요구하지 않는 기능은 추가하지 않음
- 캐싱, 로깅, 검증 등을 임의로 추가하지 않음
- 테스트가 통과하는 최소한의 코드만 작성

---

## Principle 2: 가장 단순한 구현 선택

```typescript
// ❌ BAD: 과도한 추상화
interface RecurringStrategy {
  generate(eventForm: EventForm): EventForm[];
}

class DailyStrategy implements RecurringStrategy {
  generate(eventForm: EventForm): EventForm[] {
    /* ... */
  }
}

class RecurringEventFactory {
  private strategies: Map<RepeatType, RecurringStrategy>;

  constructor() {
    this.strategies = new Map([
      ['daily', new DailyStrategy()],
      // ...
    ]);
  }

  create(type: RepeatType): RecurringStrategy {
    return this.strategies.get(type)!;
  }
}

// ✅ GOOD: 단순한 함수
function generateDailyEvents(eventForm: EventForm): EventForm[] {
  const events: EventForm[] = [];
  let current = new Date(eventForm.date);
  const end = eventForm.repeat.endDate ? new Date(eventForm.repeat.endDate) : null;

  while (!end || current <= end) {
    events.push({ ...eventForm, date: formatDate(current) });
    current.setDate(current.getDate() + 1);

    // 무한 루프 방지
    if (events.length > 1000) break;
  }

  return events;
}
```

**핵심**:
- 패턴이나 추상화보다 단순한 함수를 선택
- 테스트가 통과하는 가장 단순한 방법 사용
- YAGNI (You Aren't Gonna Need It) 원칙 준수

---

## Principle 3: 중복은 나중에 제거 (Rule of Three)

**Kent Beck의 원칙**: 3번 반복되면 추상화

```typescript
// 1회: 그냥 작성
function generateDailyEvents() {
  let current = new Date(startDate);
  // ...
}

// 2회: 여전히 그냥 작성
function generateWeeklyEvents() {
  let current = new Date(startDate); // 중복이지만 아직 OK
  // ...
}

// 3회: 이제 추상화
function generateMonthlyEvents() {
  let current = new Date(startDate); // 3번째 → 추상화 고려
  // ...
}

// Refactor 단계에서 추출
function createDateRange(start: string, end: string) {
  let current = new Date(start);
  const endDate = new Date(end);
  // ...
}
```

**핵심**:
- 처음 1-2번은 중복을 허용
- 3번째부터 추상화 고려
- Green 단계에서는 중복 허용, Refactor 단계에서 제거

---

## Principle 4: 명확한 의도 표현

```typescript
// ❌ BAD: 의도가 불명확
function generateMonthlyEvents(eventForm: EventForm): EventForm[] {
  const events: EventForm[] = [];
  const d = new Date(eventForm.date);
  const dom = d.getDate();

  while (true) {
    const ldom = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    if (dom <= ldom) {
      events.push({ ...eventForm, date: `${d.getFullYear()}-${d.getMonth() + 1}-${dom}` });
    }
    d.setMonth(d.getMonth() + 1);
    // ...
  }
}

// ✅ GOOD: 명확한 변수명과 함수 분리
function generateMonthlyEvents(eventForm: EventForm): EventForm[] {
  const events: EventForm[] = [];
  const startDate = new Date(eventForm.date);
  const targetDay = startDate.getDate();
  const endDate = eventForm.repeat.endDate ? new Date(eventForm.repeat.endDate) : null;

  let currentDate = new Date(startDate);

  while (!endDate || currentDate <= endDate) {
    if (isValidDayInMonth(currentDate, targetDay)) {
      events.push({
        ...eventForm,
        date: formatDate(currentDate),
      });
    }

    currentDate = addMonths(currentDate, 1);
  }

  return events;
}

function isValidDayInMonth(date: Date, day: number): boolean {
  const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  return day <= lastDayOfMonth;
}

function addMonths(date: Date, months: number): Date {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + months);
  return newDate;
}
```

**핵심**:
- 의미 있는 변수명 사용 (`d` → `startDate`, `dom` → `targetDay`)
- 복잡한 로직을 함수로 분리 (`isValidDayInMonth`, `addMonths`)
- 코드만 봐도 의도가 명확해야 함

---

## 원칙 요약

| 원칙 | 핵심 메시지 | Green 단계 적용 |
|------|------------|----------------|
| **테스트가 요구하는 것만** | 테스트에 없는 기능 추가 금지 | 최소한의 구현만 |
| **가장 단순한 구현** | 추상화보다 단순함 | 함수 사용, 클래스/패턴 피함 |
| **중복 허용** | 3번 반복되기 전까지 허용 | Green 단계에서는 OK |
| **명확한 의도** | 변수명과 함수 분리로 가독성 | 코드가 스스로 설명 |

---

## 적용 순서

1. **테스트 분석** → 무엇을 테스트하는가?
2. **가장 단순한 구현** → 함수로 작성
3. **중복 허용** → 3번 반복될 때까지 추상화 안 함
4. **명확한 의도** → 변수명과 함수명으로 의도 표현
5. **테스트 통과 확인** → 모든 테스트가 통과하는지 확인

---

**원본 문서**: [test-driven-developer.md](../../.claude/agents/test-driven-developer.md)

