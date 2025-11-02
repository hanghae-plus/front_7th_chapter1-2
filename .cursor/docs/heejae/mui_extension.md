# heejae MUI Extension

> **목적:**  
> heejae가 Material UI(MUI) 기반 컴포넌트의 테스트 코드를 작성할 때  
> 더 정확하고 사용자 친화적인 로직을 구현할 수 있도록 돕는 확장 규칙이다.  
>  
> 이 문서는 TDD 사이클 중 **GREEN 단계**에서 적용된다.

---

## 1. 기본 원칙

- MUI 테스트는 **구조가 아닌 사용자 경험(UI interaction)** 을 검증해야 한다.  
- DOM 구조(`.MuiButtonBase-root`)나 CSS 클래스 접근은 금지한다.  
- 오직 **role, aria-label, text, data-testid** 를 기준으로 선택한다.  
- heejae는 항상 `@testing-library/react` 와 `userEvent` 중심으로 작성한다.

**좋은 예**
```tsx
expect(screen.getByRole('button', { name: '저장' })).toBeEnabled();

나쁜 예

// 내부 클래스 구조를 테스트하면 MUI 버전 업 시 깨질 수 있음
expect(container.querySelector('.MuiButtonBase-root')).toBeTruthy();

## 2. 기본 원칙컴포넌트별 테스트 패턴
2-1. Button

버튼의 활성/비활성, 클릭 반응, 텍스트 렌더링 검증에 집중

toBeEnabled(), toBeDisabled(), toHaveTextContent() 사용

const button = screen.getByRole('button', { name: '저장' });
expect(button).toBeEnabled();
await userEvent.click(button);
expect(handleSave).toHaveBeenCalled();

2-2. TextField / Input

placeholder, label, value, error 메시지를 기준으로 검증

getByLabelText, getByPlaceholderText 우선 사용

const input = screen.getByLabelText('이메일');
await userEvent.type(input, 'test@example.com');
expect(input).toHaveValue('test@example.com');

2-3. Select

userEvent.click으로 열고, 옵션 선택 후 UI 반영 검증

role="option" 또는 getByText로 옵션 선택

await userEvent.click(screen.getByRole('button', { name: '반복 유형' }));
await userEvent.click(screen.getByRole('option', { name: '매일' }));
expect(screen.getByRole('button', { name: '매일' })).toBeInTheDocument();

2-4. Dialog / Modal

열린 상태(toBeInTheDocument)와 닫힘 상태(not.toBeInTheDocument)를 검증

aria-labelledby, aria-describedby 가 있다면 이를 적극 활용

await userEvent.click(screen.getByRole('button', { name: '삭제' }));
expect(screen.getByRole('dialog', { name: '삭제 확인' })).toBeInTheDocument();

await userEvent.click(screen.getByRole('button', { name: '취소' }));
await waitFor(() => {
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

2-5. Snackbar / Alert

메시지 텍스트 기반으로 노출 여부 확인

setTimeout 등 비동기 동작은 await waitFor 로 감싸기

await userEvent.click(screen.getByRole('button', { name: '저장' }));
await waitFor(() => {
  expect(screen.getByText('저장되었습니다')).toBeInTheDocument();
});

3. 접근성(A11y) 원칙

getByRole과 getByLabelText를 항상 우선 사용

aria-label, aria-labelledby, aria-describedby를 테스트 기준으로 포함

data-testid는 최후의 수단으로만 사용

// 좋은 예
expect(screen.getByRole('textbox', { name: '이름' })).toHaveValue('정민');

// 최소한으로 허용
expect(screen.getByTestId('name-input')).toHaveValue('정민');

4. async 처리 원칙

MUI 컴포넌트는 내부 transition, animation, timeout이 많다.

따라서 모든 UI 변경 검증은 await waitFor 로 감싸는 것을 기본으로 한다.

await userEvent.click(screen.getByRole('button', { name: '삭제' }));
await waitFor(() => {
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

5. snapshot은 지양

MUI의 DOM 구조는 버전마다 달라지므로 snapshot 테스트는 불안정하다.

대신 사용자 시나리오 기반 검증으로 대체한다.