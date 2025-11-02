# 테스트 코드 작성 지침

## 목적

프론트엔드 개발 환경 기준, 고품질 테스트 코드 작성을 위한 핵심 규칙입니다.

---

## 1. 테스트 명명 규칙

**패턴**: `[기능]_[조건]_[예상결과]`

```javascript
// ✅ 좋은 예
test('button_click_with_disabled_state_should_not_trigger_action', () => {});
test('renders_error_message_when_validation_fails', () => {});
test('should_display_loading_spinner_while_fetching_data', () => {});
```

**원칙**: 테스트 이름만 보고 무엇을 검증하는지 명확히 이해 가능해야 함

---

## 2. AAA 패턴 (Arrange-Act-Assert)

모든 테스트는 3단계로 구분:

```javascript
test('displays user name after successful login', () => {
    // Arrange: 준비
    const user = { name: 'John', email: 'john@example.com' };
    render(<UserProfile user={user} />);
    
    // Act: 실행
    const nameElement = screen.getByText('John');
    
    // Assert: 검증
    expect(nameElement).toBeInTheDocument();
});
```

---

## 3. 테스트 독립성

```javascript
// ❌ 나쁜 예: 전역 상태 의존
let sharedCart = [];
test('adds item', () => {
    sharedCart.push({ id: 1 });
    expect(sharedCart).toHaveLength(1); // 실행 순서 의존
});

// ✅ 좋은 예: 독립적 상태
test('adds item to cart', () => {
    const cart = [];
    cart.push({ id: 1 });
    expect(cart).toHaveLength(1);
});
```

**Setup/Teardown 활용**:

```javascript
beforeEach(() => {
    // 각 테스트 전 실행
});

afterEach(() => {
    // 각 테스트 후 정리
});
```

---

## 4. 하나의 테스트는 하나의 개념만 검증

```javascript
// ❌ 나쁜 예
test('form validation', () => {
    render(<LoginForm />);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByText(/required/i)).toBeInTheDocument();
});

// ✅ 좋은 예
test('submit button is disabled initially', () => {
    render(<LoginForm />);
    expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled();
});
```

---

## 5. 적절한 Matcher 사용

```javascript
// ❌ 약한 검증
expect(button).toBeTruthy();

// ✅ 정확한 검증
expect(button).toBeInTheDocument();
expect(button).toHaveAttribute('disabled');
expect(screen.getAllByRole('listitem')).toHaveLength(3);
expect(screen.getByLabelText(/email/i)).toHaveValue('test@example.com');
```

---

## 6. 테스트 데이터 관리

```javascript
// Factory 함수 패턴
export function createMockUser(overrides = {}) {
    return {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        ...overrides
    };
}

// 사용
test('handles inactive user', () => {
    const user = createMockUser({ isActive: false });
    render(<UserCard user={user} />);
    expect(screen.getByText(/inactive/i)).toBeInTheDocument();
});
```

---

## 7. Mock과 Stub 사용

```javascript
// API 모킹
test('displays user data after fetch', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ name: 'John' })
    });
    global.fetch = mockFetch;
    
    render(<UserProfile userId={1} />);
    
    expect(await screen.findByText('John')).toBeInTheDocument();
    expect(mockFetch).toHaveBeenCalledWith('/api/users/1');
});

// 함수 호출 검증
test('calls onSubmit when form is submitted', () => {
    const handleSubmit = vi.fn();
    render(<Form onSubmit={handleSubmit} />);
    
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    expect(handleSubmit).toHaveBeenCalledTimes(1);
});
```

**원칙**: Mock 과용 방지 - 외부 의존성만 Mock 처리

---

## 8. 경계값 및 엣지 케이스

반드시 테스트해야 할 경우:
- 빈 값: null, undefined, '', [], {}
- 경계값: 0, -1, 최대/최소 길이
- 특수 문자: 공백, HTML 특수문자, 이모지
- 극한 케이스: 매우 긴 텍스트, 많은 항목

```javascript
test.each([
    { value: '', error: 'Email is required' },
    { value: 'invalid', error: 'Invalid format' },
    { value: 'test@example.com', error: null },
])('validates email: $value', ({ value, error }) => {
    const result = validateEmail(value);
    expect(result).toBe(error);
});
```

---

## 9. 비동기 코드 테스트

```javascript
test('displays loading then data', async () => {
    render(<UserList />);
    
    // 로딩 상태 확인
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    
    // 데이터 로드 대기
    expect(await screen.findByText('John')).toBeInTheDocument();
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
});
```

---

## 10. 커스텀 렌더 헬퍼

```javascript
// testUtils.js
export function renderWithProviders(ui, options = {}) {
    function Wrapper({ children }) {
        return (
            <ThemeProvider>
                <UserContext.Provider value={options.user}>
                    {children}
                </UserContext.Provider>
            </ThemeProvider>
        );
    }
    return render(ui, { wrapper: Wrapper, ...options });
}
```

---

## 핵심 체크리스트

새로운 테스트 작성 시 확인:

- [ ] 테스트 이름이 검증 내용을 명확히 설명하는가?
- [ ] AAA 패턴을 따르는가?
- [ ] 독립적으로 실행 가능한가?
- [ ] 하나의 개념만 검증하는가?
- [ ] 경계값과 엣지 케이스를 포함하는가?
- [ ] 적절한 Matcher를 사용하는가?
- [ ] 불필요한 Mock을 피했는가?
- [ ] 비동기 처리가 올바른가?

---

## 테스트 유형별 가이드

**단위 테스트**:

- 단일 컴포넌트/함수/훅 검증
- ms 단위 실행
- Mock 최소화

**통합 테스트**:

- 여러 컴포넌트 상호작용 검증
- API 연동 포함
- 초 단위 실행

**E2E 테스트**:

- 사용자 플로우 전체 검증
- 실제 환경과 유사하게
- 분 단위 실행

---
