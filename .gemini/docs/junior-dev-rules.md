# Custom TDD Rules for Dev-Junior (Brian's Style)
These are specific coding patterns derived from the project's existing integration tests. Agent 'Brian' **must** learn and follow these rules.

## 1. Mocking External Libraries
*(1. 외부 라이브러리 모킹: `vi.mock`을 사용해 파일 최상단에서 모킹하고, `vi.fn()`을 외부에 선언해 추적한다.)*

- **Rule:** Mocks for external libraries (e.g., `notistack`) **must** be defined at the top level of the test file using `vi.mock`.
- **Rule:** When tracking calls to a mocked function (like `enqueueSnackbar`), define a `vi.fn()` *outside* the mock scope and provide it within the mock's implementation.
- **Example:**
    ```javascript
    const enqueueSnackbarFn = vi.fn();
    vi.mock('notistack', async () => {
      const actual = await vi.importActual('notistack');
      return {
        ...actual,
        useSnackbar: () => ({
          enqueueSnackbar: enqueueSnackbarFn,
        }),
      };
    });
    ```

## 2. Test Helper Functions (Core Pattern)
*(2. 헬퍼 함수 (핵심 패턴): 'init...Setting' (쿼리)과 'addNewEvent' (액션) 헬퍼 함수로 테스트를 구조화한다.)*

- **Rule:** Complex tests (like CRUD or Search) **must** be structured using helper functions.
- **Rule (Query Helper):** Create an `init...Setting()` helper function. Its only job is to query for and return a collection of common DOM elements (forms, buttons).
    - *Pattern:* `function initCRUDTestSetting(): CRUDTestElements { ... return { title: screen.queryByLabelText('제목'), ... } }`
- **Rule (Action Helper):** Create an `addNewEvent(...)` or `searchTestExec(...)` helper function. Its job is to encapsulate a sequence of user *actions* (typing, clicking).
    - *Pattern:* `async function addNewEvent(eventObj: CRUDTestElements, newEvent: Partial<Event>) { ... await user.type(eventObj.title, ...); await user.click(eventObj.addButton); }`

## 3. User Interaction (Specific Mix)
*(3. 사용자 인터랙션: `userEvent.setup()`을 기본으로 하되, 'time'/'date' 필드는 `fireEvent.change`를 사용한다.)*

- **Rule:** Always use `userEvent.setup()` at the start of an action helper or test.
- **Rule (Specific):** Use `user.type` for standard text inputs (`<input type="text">`) and `user.clear` for clearing.
- **Rule (Specific):T** Use **`fireEvent.change`** for special inputs like `<input type="time">` or `<input type="date">`.
    - *Pattern:* `fireEvent.change(eventObj.startTime, { target: { value: newEvent.startTime } });`

## 4. MSW Handler Management
*(4. MSW 핸들러 관리: 'server.use()'를 'it' 블록 내부에서 호출하고, 'handlersUtils' 헬퍼를 사용한다.)*

- **Rule:** MSW handlers **must** be set *inside each test* (`it` block) using `server.use(...)`.
- **Rule:** Handlers **must** be provided by custom helper functions imported from `__mocks__/handlersUtils` (e.g., `setupMockHandlerCreation`, `setupMockHandlerDeletion`).
- **Example:**
    ```javascript
    it('should create an event', async () => {
      server.use(...setupMockHandlerCreation([]));
      render(<App />);
      // ...
    });
    ```

## 5. Asynchronous Assertions
*(5. 비동기 검증: `await waitFor`를 사용하고, 'within'으로 쿼리 범위를 좁힌다.)*

- **Rule:** Asynchronous UI updates (e.g., after an event is added) **must** be asserted using `await waitFor(...)`.
- **Rule:** When asserting content within a specific container (like `event-list`), use `within(element)` to scope the query.
    - *Pattern:* `const eventList = screen.getByTestId('event-list'); await waitFor(() => expect(within(eventList).getByText(...)).toBeInTheDocument());`

## 6. Data Integrity
*(6. 데이터 무결성: 'structuredClone'을 사용해 테스트 간 데이터 오염을 방지한다.)*

- **Rule:** When passing a shared mock data array (like `EVT`) to an MSW handler, use `structuredClone(EVT)` to prevent data mutations from one test affecting another.

## 7. Test Description Language
*(7. 테스트 설명 언어: 테스트 코드의 디스크립션은 한글로 작성한다.)*

- **Rule:** All test descriptions within `it()` or `test()` blocks **must** be written in Korean.
- **Why:** Ensures clarity and consistency with project documentation and communication.