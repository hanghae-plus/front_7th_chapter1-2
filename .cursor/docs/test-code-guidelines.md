---
description: 테스트 코드 작성 가이드라인
globs:
alwaysApply: true
---

# 🧪 테스트 코드 작성 가이드라인

이 문서는 **TDD(Test Driven Development)** 및 **테스트 코드** 작성 시 준수해야 할 원칙을 정의한다.  
Cursor는 테스트 관련 파일(`*.test.ts`, `*.test.tsx`, `*.spec.ts`, `*.spec.tsx`)을 작성하거나 수정할 때 이 문서를 반드시 참조해야 한다.

---

## 1. 테스트의 목적

- 테스트는 **코드의 동작을 명세(specification)** 하기 위한 문서이다.
- 단순히 “통과 여부”가 아니라, **“왜 이 테스트가 필요한가”** 를 코드로 설명해야 한다.

---

## 2. 좋은 테스트의 3대 원칙

### (1) 명확성 (Clarity)

- 테스트 이름만 보고도 무엇을 검증하는지 이해할 수 있어야 한다.

```ts
it("입력값이 음수일 때 오류를 던진다", () => { ... });
```

### (2) 독립성 (Isolation)

- 각 테스트는 서로 영향을 주지 않아야 한다.
- 전역 상태, Date, DB, localStorage 등은 mock 또는 reset 해야 한다.

### (3) 일관성 (Consistency)

- 실행 순서나 환경에 따라 결과가 달라지지 않아야 한다.
- 네트워크, 시간, 랜덤 값 등은 통제 가능한 상태로 만든다.

---

## 3. 좋은 테스트의 3대 원칙

> Arrange → Act → Assert

1. Arrange (준비): 테스트 환경, mock 데이터, 변수 등을 설정한다.
2. Act (실행): 테스트 대상 함수를 호출한다.
3. Assert (검증): 결과가 기대와 일치하는지 확인한다.

```ts
const input = 5;
const expected = 10;

const result = double(input);

expect(result).toBe(expected);
```

---

## 4. 테스트 이름 규칙

- `describe`: 기능 단위로 묶는다.
- `it`: 행동 단위로 명확히 표현한다.

```ts
describe("calculateTotal", () => {
  it("항목의 가격을 모두 더해 반환한다", () => { ... });
  it("빈 배열이면 0을 반환한다", () => { ... });
});
```

---

## 5. 테스트 커버리지보다 중요한 것

- 테스트의 의도(Why) 가 드러나야 한다.
- 커버리지는 참고 지표일 뿐, 테스트 품질의 핵심은 명확한 명세화이다.
- 무의미한 100% 커버리지보다, 핵심 로직에 대한 검증의 깊이가 중요하다.

---

## 6. Mocking & Stub 원칙

- 외부 의존성(API, DB, 훅, 시간 등)은 반드시 Mock 처리한다.
- Mock은 구현 세부사항이 아닌 “행동”을 흉내내는 수준으로 제한한다.
- Mock은 각 테스트마다 독립적으로 초기화해야 한다.

```ts
vi.spyOn(global, 'fetch').mockResolvedValue({
  json: () => Promise.resolve(mockData),
});
```

---

## 7. TDD 사이클

> .cusor/rules/tdd-flow.md 파일을 참고하여 TDD 사이클을 진행한다.

1. Red – 실패하는 테스트 작성
2. Green – 통과하는 최소한의 코드 작성
3. Refactor – 중복 제거 및 리팩토링
4. Repeat – 위 과정을 반복

> 💡 핵심: 테스트가 개발을 이끈다 (Tests drive the development)

---

## 8. 테스트 작성 시 피해야 할 것

- 내부 구현 세부사항에 의존한 테스트
- DOM 구조나 클래스명에 의존하는 테스트
- 한 테스트 내에서 여러 동작을 검증하는 복합 테스트
- 의미 없는 스냅샷 테스트
- 비즈니스 로직이 아닌 UI 디테일(색상, 마진 등)에 대한 테스트

---

## 9. 예시 코드

```ts
describe('add() : 매개변수로 들어온 값들의 합을 return하는 함수', () => {
  it('두 수의 합을 반환한다', () => {
    const result = add(2, 3);
    expect(result).toBe(5);
  });

  it('음수 입력 시 예외를 던진다', () => {
    expect(() => add(-1, 2)).toThrow('음수는 허용되지 않습니다');
  });
});
```

---

## 10. React 컴포넌트 테스트 원칙 (Testing Library 기준)

### ✅ 테스트 대상

- 사용자의 행동과 결과 중심으로 테스트한다.
- 구현 세부사항(컴포넌트 내부 구조, 훅 호출 여부 등)은 검증하지 않는다.

### ✅ 주요 규칙

1. render 후 실제 사용자 시나리오를 시뮬레이션한다.

```ts
render(<LoginForm />);
await userEvent.type(screen.getByLabelText('아이디'), 'admin');
await userEvent.type(screen.getByLabelText('비밀번호'), '1234');
await userEvent.click(screen.getByRole('button', { name: /로그인/i }));

expect(screen.getByText('로그인 성공')).toBeInTheDocument();
```

2. screen 객체만 사용한다.

- `screen.getByRole`, `screen.getByText`, `screen.findBy...` 등으로 접근한다.

3. 비동기 동작은 `await`과 함께 처리한다.

```ts
const alert = await screen.findByText('로그인 실패');
expect(alert).toBeVisible();
```

4. 접근성(A11y) 역할 기반 선택자 우선 사용.

- `getByRole`, `getByLabelText`, `getByPlaceholderText` → `getByTestId`보다 우선.

5. UI 구조보다 “의도”에 집중한다.

- ❌ `expect(container.querySelector('.text-red')).toBeTruthy();`
- ✅ `expect(screen.getByText("오류 발생")).toBeVisible();`

---

# 11. 테스트 유지보수 원칙

- 하나의 테스트 파일에는 하나의 주요 기능 단위만 포함한다.
- 테스트 파일명은 실제 코드 파일명과 동일하게 맞춘다.
  - 예: useFetch.ts → useFetch.spec.ts
- 중복되는 mock이나 setup 코드는 **mocks** 또는 test-utils.ts로 분리한다.
- 테스트가 실패할 때 원인을 빠르게 파악할 수 있도록 의도적인 이름과 메시지를 사용한다.

---

# 12. 커서 적용 규칙 (Cursor Rule)

이 문서는 다음 파일 패턴에 자동으로 적용된다:

```markdown
_.test.ts
_.test.tsx
_.spec.ts
_.spec.tsx
```

테스트 코드 작성 시 Cursor는 아래 원칙을 따라야 한다:

- AAA 패턴을 따른다.
- 테스트 이름은 행동 중심으로 작성한다.
- Mock은 필요한 최소 수준에서만 사용한다.
- “왜 이 테스트가 필요한지”를 코드 수준에서 드러낸다.
- React 테스트 시, 사용자 행동 기반 시나리오를 우선한다.

---

> 🧭 이 문서는 테스트 품질의 기준이자 TDD의 방향성이다.
> Cursor가 생성하거나 수정하는 모든 테스트 파일은 이 규칙을 반드시 따른다.
