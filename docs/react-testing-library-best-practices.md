# React Testing Library 모범 사례 및 안티 패턴

## 목차

1. [핵심 원칙](#핵심-원칙)
2. [모범 사례](#모범-사례)
3. [안티 패턴](#안티-패턴)
4. [쿼리 우선순위](#쿼리-우선순위)
5. [비동기 테스트](#비동기-테스트)
6. [이벤트 처리](#이벤트-처리)
7. [실전 예제](#실전-예제)

---

## 핵심 원칙

React Testing Library는 다음과 같은 핵심 원칙을 기반으로 합니다:

### 1. 사용자 중심 테스트

> "테스트가 소프트웨어 사용 방식과 유사할수록 더 많은 신뢰를 제공할 수 있습니다."

- 구현 세부 사항이 아닌 사용자 동작을 테스트
- 실제 DOM 노드를 사용한 테스트
- 사용자가 경험하는 방식대로 테스트

### 2. 접근성 우선

- 접근 가능한 요소를 우선적으로 쿼리
- 스크린 리더 사용자도 접근 가능한 방식으로 테스트

---

## 모범 사례

### ✅ 1. 적절한 쿼리 사용

**우선순위 순서:**

1. **모두가 접근 가능한 쿼리**

   ```javascript
   // 최우선: getByRole
   const button = screen.getByRole("button", { name: /submit/i });

   // getByLabelText - 폼 요소에 적합
   const input = screen.getByLabelText("Username");

   // getByPlaceholderText - label이 없을 때
   const search = screen.getByPlaceholderText("Search...");

   // getByText - 비대화형 요소
   const heading = screen.getByText("Welcome");

   // getByDisplayValue - 폼의 현재 값
   const filled = screen.getByDisplayValue("John Doe");
   ```

2. **시맨틱 쿼리**

   ```javascript
   // getByAltText - 이미지, area 요소
   const avatar = screen.getByAltText("User avatar");

   // getByTitle - title 속성 또는 svg title
   const icon = screen.getByTitle("Close");
   ```

3. **최후의 수단**
   ```javascript
   // getByTestId - 다른 방법이 불가능할 때만
   const complex = screen.getByTestId("complex-component");
   ```

### ✅ 2. 비동기 작업 처리

```javascript
import { render, screen, waitFor } from "@testing-library/react";

// ✅ 좋은 예: findBy 사용
test("데이터 로딩 후 표시", async () => {
  render(<UserProfile userId="123" />);

  // findBy는 자동으로 대기
  const userName = await screen.findByText("John Doe");
  expect(userName).toBeInTheDocument();
});

// ✅ 좋은 예: waitFor 사용
test("상태 변경 대기", async () => {
  render(<Counter />);
  const button = screen.getByRole("button", { name: /increment/i });

  fireEvent.click(button);

  await waitFor(() => {
    expect(screen.getByText("Count: 1")).toBeInTheDocument();
  });
});

// ✅ 좋은 예: waitForElementToBeRemoved
test("로딩 스피너 제거 대기", async () => {
  render(<DataFetcher />);

  const spinner = screen.getByText("Loading...");
  await waitForElementToBeRemoved(spinner);

  expect(screen.getByText("Data loaded")).toBeInTheDocument();
});
```

### ✅ 3. 사용자 이벤트 시뮬레이션

```javascript
import userEvent from "@testing-library/user-event";

// ✅ 권장: userEvent 사용 (더 현실적)
test("폼 제출", async () => {
  const user = userEvent.setup();
  render(<LoginForm />);

  await user.type(screen.getByLabelText("Email"), "user@example.com");
  await user.type(screen.getByLabelText("Password"), "password123");
  await user.click(screen.getByRole("button", { name: /login/i }));

  expect(await screen.findByText("Welcome back!")).toBeInTheDocument();
});

// ✅ 키보드 네비게이션 테스트
test("키보드로 메뉴 탐색", async () => {
  const user = userEvent.setup();
  render(<NavigationMenu />);

  const firstLink = screen.getByRole("link", { name: /home/i });
  firstLink.focus();

  await user.keyboard("{ArrowDown}");
  expect(screen.getByRole("link", { name: /about/i })).toHaveFocus();
});
```

### ✅ 4. 적절한 Matcher 사용

```javascript
// ✅ 좋은 예: 명확하고 구체적인 assertion
expect(button).toBeDisabled();
expect(checkbox).toBeChecked();
expect(input).toHaveValue("test");
expect(element).toHaveClass("active");
expect(link).toHaveAttribute("href", "/home");

// ✅ 접근성 관련 matcher
expect(element).toBeVisible();
expect(element).toHaveAccessibleName("Submit form");
expect(element).toHaveAccessibleDescription("Click to submit");
```

### ✅ 5. 컴포넌트 격리 및 모킹

```javascript
// ✅ 좋은 예: 외부 의존성 모킹
import { render, screen } from "@testing-library/react";
import { rest } from "msw";
import { setupServer } from "msw/node";

const server = setupServer(
  rest.get("/api/user", (req, res, ctx) => {
    return res(ctx.json({ name: "John Doe", email: "john@example.com" }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("사용자 프로필 표시", async () => {
  render(<UserProfile />);

  expect(await screen.findByText("John Doe")).toBeInTheDocument();
  expect(screen.getByText("john@example.com")).toBeInTheDocument();
});
```

### ✅ 6. 커스텀 렌더 함수

```javascript
// ✅ 좋은 예: 공통 설정을 재사용 가능한 함수로
import { render } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { QueryClient, QueryClientProvider } from "react-query";

const customRender = (ui, options = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>{ui}</ThemeProvider>
    </QueryClientProvider>,
    options
  );
};

// 테스트에서 사용
test("테마가 적용된 버튼", () => {
  customRender(<ThemedButton />);
  expect(screen.getByRole("button")).toHaveStyle({ color: "blue" });
});
```

---

## 안티 패턴

### ❌ 1. 구현 세부사항 테스트

```javascript
// ❌ 나쁜 예: state나 props를 직접 테스트
test("counter state 변경", () => {
  const { container } = render(<Counter />);
  const instance = container.querySelector(".counter").__reactInternalInstance;
  expect(instance.state.count).toBe(0); // 구현 세부사항!
});

// ✅ 좋은 예: 사용자가 보는 것을 테스트
test("카운터 증가 표시", async () => {
  const user = userEvent.setup();
  render(<Counter />);

  expect(screen.getByText("Count: 0")).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: /increment/i }));
  expect(screen.getByText("Count: 1")).toBeInTheDocument();
});
```

### ❌ 2. 부적절한 쿼리 사용

```javascript
// ❌ 나쁜 예: querySelector 사용
test('제목 확인', () => {
  const { container } = render(<Header />);
  const title = container.querySelector('.title');
  expect(title.textContent).toBe('Welcome');
});

// ✅ 좋은 예: 시맨틱 쿼리 사용
test('제목 확인', () => {
  render(<Header />);
  expect(screen.getByRole('heading', { name: /welcome/i })).toBeInTheDocument();
});

// ❌ 나쁜 예: 과도한 testId 사용
<div data-testid="user-name">John</div>

// ✅ 좋은 예: 시맨틱 마크업
<p>Name: <strong>John</strong></p>
// screen.getByText(/john/i) 로 찾기
```

### ❌ 3. 비동기 처리 오류

```javascript
// ❌ 나쁜 예: 비동기를 동기로 처리
test("데이터 로딩", () => {
  render(<UserList />);
  expect(screen.getByText("John Doe")).toBeInTheDocument(); // 실패!
});

// ❌ 나쁜 예: 임의의 setTimeout
test("데이터 로딩", async () => {
  render(<UserList />);
  await new Promise((resolve) => setTimeout(resolve, 1000)); // 취약함
  expect(screen.getByText("John Doe")).toBeInTheDocument();
});

// ✅ 좋은 예: findBy 또는 waitFor 사용
test("데이터 로딩", async () => {
  render(<UserList />);
  expect(await screen.findByText("John Doe")).toBeInTheDocument();
});
```

### ❌ 4. wrapper 없이 cleanup 미수행

```javascript
// ❌ 나쁜 예: 수동 cleanup (최신 버전에서는 자동)
afterEach(() => {
  cleanup(); // @testing-library/react는 자동으로 처리
});

// ✅ 좋은 예: 자동 cleanup 신뢰
// 아무것도 하지 않아도 됨!
```

### ❌ 5. 불필요한 act() 사용

```javascript
// ❌ 나쁜 예: 이미 act로 래핑된 API에 act 추가
import { act } from "react-dom/test-utils";

test("버튼 클릭", async () => {
  render(<Button />);
  await act(async () => {
    fireEvent.click(screen.getByRole("button")); // 이미 act 내부
  });
});

// ✅ 좋은 예: RTL API는 이미 act 처리됨
test("버튼 클릭", async () => {
  const user = userEvent.setup();
  render(<Button />);
  await user.click(screen.getByRole("button"));
});
```

### ❌ 6. snapshot 테스트 과용

```javascript
// ❌ 나쁜 예: 큰 컴포넌트 전체 스냅샷
test("전체 페이지 렌더링", () => {
  const { container } = render(<FullPage />);
  expect(container).toMatchSnapshot(); // 유지보수 어려움
});

// ✅ 좋은 예: 특정 동작과 출력 테스트
test("에러 메시지 표시", () => {
  render(<Form errors={["Invalid email"]} />);
  expect(screen.getByRole("alert")).toHaveTextContent("Invalid email");
});
```

---

## 쿼리 우선순위

### 우선순위 가이드

```javascript
// 1순위: 모든 사용자가 접근 가능
screen.getByRole("button", { name: /submit/i });
screen.getByLabelText("Username");
screen.getByPlaceholderText("Enter email");
screen.getByText("Welcome");
screen.getByDisplayValue("John");

// 2순위: 시맨틱 쿼리
screen.getByAltText("Profile picture");
screen.getByTitle("Close");

// 3순위: 최후의 수단
screen.getByTestId("custom-element");
```

### 쿼리 변형

```javascript
// 단일 요소
getBy...     // 즉시 반환, 없으면 에러
queryBy...   // 즉시 반환, 없으면 null
findBy...    // Promise 반환, 대기 후 반환

// 복수 요소
getAllBy...
queryAllBy...
findAllBy...

// 사용 예시
const button = screen.getByRole('button'); // 있어야 함
const optional = screen.queryByRole('button'); // 없을 수도 있음
const async = await screen.findByRole('button'); // 비동기로 나타남
```

---

## 비동기 테스트

### findBy 쿼리

```javascript
// ✅ 요소가 비동기로 나타날 때
test("비동기 데이터 렌더링", async () => {
  render(<AsyncComponent />);

  // 최대 1초까지 대기 (기본값)
  const element = await screen.findByText("Loaded data");
  expect(element).toBeInTheDocument();
});
```

### waitFor 유틸리티

```javascript
// ✅ 복잡한 조건 대기
test("여러 조건 확인", async () => {
  render(<ComplexComponent />);

  await waitFor(
    () => {
      expect(screen.getByText("Success")).toBeInTheDocument();
      expect(screen.queryByText("Loading")).not.toBeInTheDocument();
    },
    { timeout: 3000 } // 커스텀 타임아웃
  );
});
```

### waitForElementToBeRemoved

```javascript
// ✅ 요소 제거 대기
test("로딩 완료", async () => {
  render(<DataLoader />);

  await waitForElementToBeRemoved(() => screen.getByText("Loading..."));
  expect(screen.getByText("Data loaded")).toBeInTheDocument();
});
```

---

## 이벤트 처리

### userEvent vs fireEvent

```javascript
import userEvent from "@testing-library/user-event";
import { fireEvent } from "@testing-library/react";

// ✅ 권장: userEvent (더 현실적인 상호작용)
test("사용자 입력", async () => {
  const user = userEvent.setup();
  render(<Input />);

  // 실제 사용자처럼 타이핑 시뮬레이션
  await user.type(screen.getByRole("textbox"), "Hello World");

  // click, hover, tab 등도 지원
  await user.click(screen.getByRole("button"));
  await user.hover(screen.getByRole("link"));
  await user.tab();
});

// ⚠️ fireEvent는 저수준 이벤트 트리거 (필요시에만)
test("저수준 이벤트", () => {
  render(<Component />);
  fireEvent.mouseDown(screen.getByRole("button"));
});
```

### 일반적인 사용자 상호작용

```javascript
test("폼 상호작용", async () => {
  const user = userEvent.setup();
  const handleSubmit = jest.fn();

  render(<ContactForm onSubmit={handleSubmit} />);

  // 텍스트 입력
  await user.type(screen.getByLabelText("Name"), "John Doe");

  // 체크박스 토글
  await user.click(screen.getByLabelText("Subscribe to newsletter"));

  // 셀렉트 박스 선택
  await user.selectOptions(screen.getByLabelText("Country"), "South Korea");

  // 파일 업로드
  const file = new File(["content"], "test.png", { type: "image/png" });
  const input = screen.getByLabelText("Upload avatar");
  await user.upload(input, file);

  // 폼 제출
  await user.click(screen.getByRole("button", { name: /submit/i }));

  expect(handleSubmit).toHaveBeenCalledTimes(1);
});
```

---

## 실전 예제

### 예제 1: 폼 검증

```javascript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "./LoginForm";

describe("LoginForm", () => {
  test("유효한 입력으로 제출 가능", async () => {
    const user = userEvent.setup();
    const handleSubmit = jest.fn();

    render(<LoginForm onSubmit={handleSubmit} />);

    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");

    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(handleSubmit).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "password123",
    });
  });

  test("빈 이메일에 대한 에러 표시", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const emailInput = screen.getByLabelText("Email");
    await user.type(emailInput, "");
    await user.tab(); // blur 트리거

    expect(await screen.findByText("Email is required")).toBeInTheDocument();
  });

  test("잘못된 이메일 형식 에러", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText("Email"), "invalid-email");
    await user.tab();

    expect(
      await screen.findByText("Please enter a valid email")
    ).toBeInTheDocument();
  });
});
```

### 예제 2: API 통합 테스트

```javascript
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rest } from "msw";
import { setupServer } from "msw/node";
import UserSearch from "./UserSearch";

const server = setupServer(
  rest.get("/api/users", (req, res, ctx) => {
    const query = req.url.searchParams.get("q");

    if (query === "john") {
      return res(
        ctx.json([
          { id: 1, name: "John Doe", email: "john@example.com" },
          { id: 2, name: "John Smith", email: "jsmith@example.com" },
        ])
      );
    }

    return res(ctx.json([]));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("UserSearch", () => {
  test("사용자 검색 및 결과 표시", async () => {
    const user = userEvent.setup();
    render(<UserSearch />);

    const searchInput = screen.getByPlaceholderText("Search users...");
    await user.type(searchInput, "john");

    // 로딩 상태 확인
    expect(screen.getByText("Searching...")).toBeInTheDocument();

    // 로딩 완료 대기
    await waitForElementToBeRemoved(() => screen.queryByText("Searching..."));

    // 결과 확인
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("John Smith")).toBeInTheDocument();
  });

  test("API 에러 처리", async () => {
    server.use(
      rest.get("/api/users", (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const user = userEvent.setup();
    render(<UserSearch />);

    await user.type(screen.getByPlaceholderText("Search users..."), "test");

    expect(await screen.findByText("Failed to load users")).toBeInTheDocument();
  });
});
```

### 예제 3: 모달 상호작용

```javascript
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Modal from "./Modal";

describe("Modal", () => {
  test("버튼 클릭으로 모달 열기", async () => {
    const user = userEvent.setup();
    render(<Modal />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /open modal/i }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  test("ESC 키로 모달 닫기", async () => {
    const user = userEvent.setup();
    render(<Modal defaultOpen />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("모달 내부 요소 상호작용", async () => {
    const user = userEvent.setup();
    const handleConfirm = jest.fn();

    render(<Modal defaultOpen onConfirm={handleConfirm} />);

    const modal = screen.getByRole("dialog");
    const confirmButton = within(modal).getByRole("button", {
      name: /confirm/i,
    });

    await user.click(confirmButton);

    expect(handleConfirm).toHaveBeenCalled();
  });

  test("포커스 트랩 확인", async () => {
    const user = userEvent.setup();
    render(<Modal defaultOpen />);

    const modal = screen.getByRole("dialog");
    const firstButton = within(modal).getByRole("button", { name: /cancel/i });
    const lastButton = within(modal).getByRole("button", { name: /confirm/i });

    firstButton.focus();
    expect(firstButton).toHaveFocus();

    // Tab으로 마지막 요소까지 이동
    await user.tab();
    expect(lastButton).toHaveFocus();

    // Tab으로 다시 첫 요소로 순환
    await user.tab();
    expect(firstButton).toHaveFocus();
  });
});
```

---

## 추가 팁

### 디버깅

```javascript
import { render, screen } from "@testing-library/react";

test("디버깅", () => {
  render(<Component />);

  // 현재 DOM 구조 출력
  screen.debug();

  // 특정 요소만 출력
  screen.debug(screen.getByRole("button"));

  // logRoles로 사용 가능한 role 확인
  const { container } = render(<Component />);
  logRoles(container);
});
```

### 접근성 테스트

```javascript
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

test("접근성 위반 없음", async () => {
  const { container } = render(<Component />);
  const results = await axe(container);

  expect(results).toHaveNoViolations();
});
```

### 커스텀 Matcher

```javascript
// 자주 사용하는 assertion을 커스텀 matcher로
expect.extend({
  toBeValidEmail(received) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);

    return {
      pass,
      message: () =>
        pass
          ? `expected ${received} not to be a valid email`
          : `expected ${received} to be a valid email`,
    };
  },
});

// 사용
expect("user@example.com").toBeValidEmail();
```

---

## 참고 자료

- [React Testing Library 공식 문서](https://testing-library.com/react)
- [Common mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Testing Library 쿼리 우선순위](https://testing-library.com/docs/queries/about/#priority)
- [userEvent vs fireEvent](https://testing-library.com/docs/user-event/intro)

---

## 체크리스트

테스트 작성 시 다음을 확인하고 총 점수를 합산하세요:

- [ ] 구현 세부사항이 아닌 사용자 동작을 테스트하는가?
- [ ] 적절한 쿼리 우선순위를 따르는가?
- [ ] testId를 남용하지 않는가?
- [ ] 비동기 작업을 올바르게 처리하는가?
- [ ] userEvent를 사용하는가 (fireEvent 대신)?
- [ ] 적절한 matcher를 사용하는가?
- [ ] 테스트가 독립적이고 격리되어 있는가?
- [ ] 접근성을 고려하는가?
- [ ] 스냅샷 테스트를 과용하지 않는가?
- [ ] 불필요한 act() 경고가 없는가?
