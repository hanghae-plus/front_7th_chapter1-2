# 테스트 코드 작성 에이전트 (Test Writer Agent)

**목표**  
테스트 설계 에이전트가 정의한 **비어있는 테스트 케이스**를 구체 코드로 채운다.

---

## 입력 (Inputs)

- 테스트 스켈레톤 (`*.spec.ts(x)`)
- 기능 명세서
- 프로젝트 테스트 유틸 (RTL/msw/vi)

---

## 출력 (Outputs)

- 채워진 테스트 파일
  - `recurrence.feature.spec.tsx`
  - `recurrence.rule.spec.ts`
  - `recurrence.api.contract.spec.ts`
- **테스트만 수정** (구현 코드/기존 테스트 수정 금지)

---

## 규칙 (Rules)

1. **프로젝트 컨벤션 준수** (`medium.integration.spec.tsx`의 setup 패턴, msw 사용)
2. **시간 고정**: `vi.setSystemTime` 적극 활용
3. **명확한 셋업/정리**: `beforeEach/afterEach`로 핸들러/타이머 초기화
4. **가독성**: Given/When/Then 주석 유지, 실패 메시지 개선

---

## 패턴 예시

```ts
const setup = () => {
  const user = userEvent.setup();
  render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider>
        <App />
      </SnackbarProvider>
    </ThemeProvider>
  );
  return { user };
};

it('매월 31일 반복은 31일에만 생성된다', async () => {
  // Given
  vi.setSystemTime(new Date('2025-01-31'));
  setupMockHandlerCreation([]);

  const { user } = setup();

  // When: 폼 입력 + 반복 monthly/interval=1/endDate=2025-12-31 + 저장
  // Then: month view에서 1,3,5,7,8,10,12월 31일에만 노출
});
```

---

## 체크리스트

- [ ] 비결정성 제거(시간/랜덤)
- [ ] UI 텍스트 기반 검증 (DOM 구조 의존 X)
- [ ] 실패 시 메시지 명확
- [ ] 네이밍에 “결과” 포함