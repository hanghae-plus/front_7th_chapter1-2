# TDD 가이드 — Kent Beck의 원칙을 실무에 적용하기

> 이 문서는 Kent Beck의 TDD 철학(레드-그린-리팩터)을 실무에 적용하기 위한 실전 가이드입니다.  
> React + Vitest 환경을 기준으로 예시와 체크리스트, AI 프롬프트 템플릿까지 포함합니다.

---

## 1. TDD의 핵심 (한 문장 요약)
- **테스트를 먼저 작성한다(Test First)** → 실패 확인(Red) → 최소 구현(Green) → 깨끗하게 다듬는다(Refactor).

Kent Beck은 작은 단계로 자주 실패를 만들고, 그 실패를 빠르게 지나가며 시스템을 안전하게 진화시키는 것을 강조합니다.

---

## 2. 기본 원칙 (켄트 벡 스타일)
1. **작게, 자주**: 한 번에 한 가지 행동만 바꾼다. (작은 테스트 → 작은 구현)  
2. **빠르게**: 테스트는 매우 빨라야 한다. (수초 이내)  
3. **명확하게**: 테스트 이름은 문서가 된다 — 행동(describe/it)을 그대로 쓴다.  
4. **하나의 실패**: 한 번에 하나의 테스트만 실패하게 만들자.  
5. **Refactor 안전성**: 테스트는 리팩터링의 안전망이다. 테스트가 있다면 마음껏 리팩터링하라.  
6. **테스트는 문서**: 테스트는 API/행동에 관한 살아있는 문서이다.

---

## 3. 실전 규칙 (구체적)
- **Red**: 실패하는 테스트를 작성한다. (작은 시나리오, 엣지 케이스 포함)  
- **Green**: 테스트를 통과시키는 가장 단순한 구현을 작성한다. (하드코딩 허용하되 임시)  
- **Refactor**: 중복 제거, 의미있는 함수/모듈 분리, 네이밍 개선. 모든 변경 후 테스트 통과 확인.  
- **한 테스트는 한 주장(Assertion)**: 각 테스트는 가능한 한 하나의 주장(assertion)을 가짐. (복잡하면 내부 arrange/act/assert 분할)  
- **테스트의 가독성**: 테스트는 읽는 사람(팀원, 미래의 나)을 위한 문서다. setup/teardown과 helper를 적절히 사용.  
- **느슨한 결합**: 테스트는 내부 구현에 너무 의존하지 않도록 작성(흔히 검증 대상은 "동작"이다).  
- **목(Mock) 남용 금지**: 필요한 경우에만 사용. 통합 수준 테스트는 실제 객체/유틸을 사용.

---

## 4. 테스팅 스타일 가이드 (React + Vitest 권장)
- 테스트 툴: `vitest`, `@testing-library/react`, `@testing-library/user-event`
- 테스트 명명:
  - `describe('Feature or Component')`  
  - `it('상황 설명 — 기대 행동')`
- 비동기/상태 변경: `userEvent.setup()` + `await` 또는 `await findBy...` / `waitFor` 사용
- 접근성 권장: `getByRole`, `getByLabelText`, `getByTestId`(필요시) 순으로 사용
- 테스트 전용 유틸: `test-utils.tsx`에 공통 render 래퍼(Providers, router, i18n 등)를 두자

---

## 5. 예시: 작은 TDD 사이클 (반복 유형 선택 기능)
### Red (테스트)
```ts
// tests/repeatType.test.tsx
it('일정 생성 시 반복 체크박스 클릭하면 반복 유형 Select가 표시된다 (RED)', async () => {
  render(<App />);
  const checkbox = screen.getByLabelText('반복 일정');
  expect(checkbox).not.toBeChecked();

  const user = userEvent.setup();
  await user.click(checkbox);

  await waitFor(() => expect(screen.getByText('반복 유형')).toBeInTheDocument());
});
