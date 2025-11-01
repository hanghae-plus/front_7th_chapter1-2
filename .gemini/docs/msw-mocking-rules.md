# MSW (Mock Service Worker) API Mocking Rules
These rules define the mandatory strategy for mocking API (HTTP) requests during development and testing within this project.

## 1. The Core Philosophy: Network-Level Mocking
*(1. 핵심 철학: `fetch`/`axios` 모듈 자체를 모킹하지 않고, 실제 네트워크 요청을 가로채 테스트한다.)*

- **Rule:** All external API requests (e.g., `fetch`, `axios`) **must** be mocked using MSW.
- **Why:** MSW intercepts actual network requests, meaning the application (including data-fetching hooks) runs *exactly* as it would in production, ensuring tests are closer to real-world scenarios.
- **Forbidden:** Do **not** use `vi.fn()`, `vi.spyOn`, or `vi.mock` to bypass or mock the data-fetching module itself (e.g., `vi.mock('axios')`). This tests implementation details, making tests brittle.

## 2. TDD Workflow with MSW
*(2. TDD 워크플로우: 테스트(`[RED]`) 작성 시, MSW 핸들러를 먼저 정의하여 API 응답을 시뮬레이션한다.)*

- **[RED]**: When writing a failing test (`it` block) for a feature that requires API data:
    1.  First, clearly define the expected API call (method, path, request body if applicable).
    2.  Second, define the **mock response** for that specific call using an MSW handler (e.g., `http.get(...)` or `http.post(...)`). This handler should simulate the expected server behavior for the test scenario.
- **[GREEN]**: The implementation code (e.g., calling `fetch('/api/user')`) will execute a *real* network request during the test. MSW will intercept this request and respond with your predefined mock data.
- **[Assert]**: The test assertion (`expect`) **must** focus on the *user-observable outcome* caused by the API response (e.g., `await screen.findByText('Mock User Name')`), not merely that `fetch` was called.

## 3. Handler Management: Central vs. Test-Specific
*(3. 핸들러 관리: 공통 핸들러는 `src/__mocks__/handlers.ts`에, 테스트별 예외는 `server.use()`로 정의한다.)*

- **Rule (Central Handlers):** All common, reusable, "happy path" handlers (e.g., standard `200 OK` responses) **must** be defined in the central **`src/__mocks__/handlers.ts`** file.
- **Rule (Test-Specific Overrides):** To test specific edge cases or error scenarios (e.g., simulating a 500 server error, a 404 not found, or specific data variations):
    - Use **`server.use()`** *inside* the relevant test block (`it(...)`) to temporarily override or add handlers *for that specific test only*.
    - These overrides take precedence over the central handlers for the duration of the test.

- **Example (Inside an `it` block):**
    ```typescript
    // In src/__tests__/MyComponent.spec.tsx
    import { server } from '../setupTests'; // Import the server instance
    import { http, HttpResponse } from 'msw';

    it('should display an error message on server failure', async () => {
      // Temporarily override the GET /api/events handler for this test
      server.use(
        http.get('/api/events', () => {
          return new HttpResponse(null, { status: 500, statusText: 'Internal Server Error' });
        })
      );

      render(<MyComponent />);

      // Assert that the component now displays the error UI
      expect(await screen.findByRole('alert')).toHaveTextContent(/error/i);
    });
    ```

## 4. Best Practices
*(4. 모범 사례: `HttpResponse`로 정확한 상태 코드를 반환하고, 200/4xx/5xx 등 다양한 시나리오를 테스트한다.)*

- **Rule:** Always use **`HttpResponse`** (from `msw`) to construct mock responses. Explicitly set the `status`, `statusText`, and JSON `body` to accurately simulate real API responses.
- **Rule:** Ensure comprehensive testing by covering critical API scenarios:
    1.  **Happy Path:** Successful response (`status: 200`) with expected data.
    2.  **Client Error:** Scenarios like Not Found (`status: 404`), Unauthorized (`status: 401`), Bad Request (`status: 400`).
    3.  **Server Error:** Internal Server Error (`status: 500`).
- **Rule (Setup):** The MSW server instance (`setupServer` from `@mswjs/node`) **must** be configured in **`src/setupTests.ts`** to start before all tests (`beforeAll(() => server.listen())`), reset handlers after each test (`afterEach(() => server.resetHandlers())`), and stop after all tests (`afterAll(() => server.close())`). This ensures test isolation.