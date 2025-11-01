# Guiding Principles for React Testing Library (by Kent C. Dodds)
These are the core rules for writing effective, resilient, and maintainable tests using React Testing Library.

## 1. The Core Philosophy
*(1. 핵심 철학: 구현이 아닌, 사용자 경험과 동작을 테스트한다.)*

- **Rule:** Tests should resemble how users interact with your software.
- **Why:** This gives you confidence that your application works for your users, not just that your implementation details are correct. Tests that focus on implementation details are brittle and break on refactoring.

## 2. Querying: The "Which Query Should I Use?" Priority
*(2. 쿼리 우선순위: 'getByRole' (접근성 역할)을 최우선으로 사용하고, 'getByTestId'는 최후의 수단으로 사용한다.)*

Always query the DOM in the following order of priority. Query as closely to the end-user experience as possible.

1.  **`getByRole(...)`**: (Highest Priority) Query by accessible roles. This is the primary, most user-centric query. Users (especially with assistive technologies) navigate by roles.
    - *Example:* `screen.getByRole('button', { name: /submit/i })`
2.  **`getByLabelText(...)`**: Good for form fields.
3.  **`getByPlaceholderText(...)`**:
4.  **`getByText(...)`**: Good for non-interactive elements (div, span).
5.  **`getByDisplayValue(...)`**: Good for form fields with a default value.
6.  **`getByAltText(...)`**: For images (`<img>`).
7.  **`getByTitle(...)`**: For elements with a `title` attribute.
8.  **`getByTestId(...)`**: (Lowest Priority) Only use this as a last resort when you cannot query by accessible or text-based means.

## 3. Query Variants (get, query, find)
*(3. 쿼리 종류: 'getBy'(존재 확인), 'queryBy'(부재 확인), 'findBy'(비동기 존재 확인)를 용도에 맞게 사용한다.)*

Use the correct query variant for the correct job.

- **`getBy...`**: Use to find an element that **must** exist *right now*. Throws an error if not found. This is your default.
    - *Example:* `expect(screen.getByRole('button')).toBeInTheDocument()`
- **`queryBy...`**: Use only to assert that an element **does not** exist. Returns `null` if not found (does not throw).
    - *Example:* `expect(screen.queryByRole('alert')).not.toBeInTheDocument()`
- **`findBy...`**: Use to find an element that will appear **asynchronously**. Returns a Promise that resolves when the element is found.
    - *Example:* `const alert = await screen.findByRole('alert')`
    - **Rule:** Always use `findBy...` instead of using `waitFor(() => getBy...())`.

## 4. Asynchronous Code & `waitFor`
*(4. 비동기/waitFor: `waitFor` 내부에는 '검증(expect)'만 넣고, '이벤트 실행(userEvent)'은 반드시 밖에서 수행한다.)*

- **Rule:** All user actions (clicks, types) must happen *outside* of `waitFor`.
- **Rule:** `waitFor` callbacks should *only* contain assertions. Never put side-effects (like `fireEvent` or `userEvent`) inside `waitFor`.
    - *Wrong:* `await waitFor(() => { userEvent.click(button) })`
    - *Right:* `userEvent.click(button); await waitFor(() => { expect(screen.getByText(...))... })`
- **Rule:** When using `waitFor`, wait for a *specific assertion* to pass. Do not use an empty callback.
    - *Wrong:* `await waitFor(() => {})`
    - *Right:* `await waitFor(() => expect(mockAPI).toHaveBeenCalled())`

## 5. User Interaction
*(5. 사용자 인터랙션: 'fireEvent' 대신, 실제 사용자 행동과 유사한 'user-event'를 항상 우선적으로 사용한다.)*

- **Rule:** **Always prefer `@testing-library/user-event` over `fireEvent`.**
- **Why:** `user-event` (e.g., `userEvent.type(input, 'hello')`) simulates the full user interaction (keyboard events, hover, focus) more realistically than `fireEvent` (e.g., `fireEvent.change(...)`), which only dispatches a single event.

## 6. Assertions
*(6. 검증: 더 명확한 에러 메시지를 위해 'jest-dom'을 사용하고, 'screen' 객체를 통해 쿼리한다.)*

- **Rule:** Use `@testing-library/jest-dom` for more readable and specific assertions.
    - *Wrong:* `expect(button.disabled).toBe(true)`
    - *Right:* `expect(button).toBeDisabled()`
- **Rule:** Always use `screen` for querying (e.g., `screen.getByRole`). Do not destructure queries from the `render` result (e.g., `const { getByRole } = render(...)`). This simplifies query usage.

## 7. Accessibility & Implementation Details
*(7. 접근성/구현: 'querySelector'나 CSS 선택자로 테스트하지 않고, 시맨틱 HTML과 접근성 규칙을 준수한다.)*

- **Rule:** **Do not test implementation details.** Test the user-observable output.
- **Rule:** Do not query using `container.querySelector` or CSS selectors. This is testing implementation details.
- **Rule:** Rely on semantic HTML for accessibility (e.g., use `<button>`, not `<div role="button">`). Do not add redundant or incorrect ARIA attributes.