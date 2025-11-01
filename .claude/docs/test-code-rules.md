# 테스트 코드 규칙 (React + TypeScript + Vitest + RTL + MSW)

### 핵심 원칙

- **단일 책임**: 각 테스트는 하나의 동작 또는 기능만을 명확히 검증한다.
- **의도 우선**: 구현 세부사항이 아니라 사용자 관점(입력→행동→결과)을 검증한다.
- **독립성/결정성**: 테스트 간 의존성을 없애고, 언제 어디서 실행해도 같은 결과가 나오게 한다.
- **가독성**: 준비-실행-검증(AAA) 또는 Given-When-Then(GWT) 구조를 일관되게 사용한다.
- **빠름과 신뢰성**: 최대한 빠르게 실행되되, flakiness(간헐 실패)를 허용하지 않는다.
- **최소 모킹, 현실적 경계**: 네트워크는 MSW, 시간은 가짜 타이머 등 경계만 모킹하고, 내부 구현 모킹은 지양한다.
- **회귀 방지**: 중요한 케이스는 회귀 테스트를 추가하고, 스냅샷은 최소·의미 있는 부분만 사용한다.

### 테스트 구조와 스타일

- **AAA/GWT 템플릿**을 지킨다.
  - Arrange/Given: 테스트 픽스처와 환경 준비
  - Act/When: 한 가지 행동만 수행
  - Assert/Then: 단일 핵심 결과를 중심으로 검증하고, 부가 검증은 서브-assert로 제한
- **명명 규칙**: 한국어나 영어로 의도를 드러낸다. `should_동사_조건` 또는 `when_상황_then_결과` 형식 권장.
- **파일 위치**: 테스트 대상 모듈과 가까이 두되, 프로젝트 표준(`src/__tests__/**`)을 우선한다.
- **단언 지침**: `expect`는 결과-중심. DOM 테스트는 역할/이름/레이블 기반 쿼리를 우선(`getByRole`, `getByLabelText`).

### 단위/통합 테스트 범위

- **단위(Unit)**: 순수 함수와 훅의 로직 검증. 빠르고 세밀. 외부 의존성은 대역 사용.
- **통합(Integration)**: 컴포넌트+훅+상호작용 흐름. 실제 DOM 이벤트, 상태 변화, 네트워크는 MSW로.
- **계층별 중복 금지**: 동일 시나리오를 여러 계층에서 반복하지 않는다. 각 계층은 고유한 리스크를 커버.

### React Testing Library(RTL)

- **사용자-중심 쿼리**: 역할→이름→라벨→텍스트→테스트ID 순으로 선택.
- **상호작용**: `user-event`를 사용하고, 비동기 UI는 `await findBy...`, `await waitFor`로 안정화.
- **접근성 포함 검증**: 시맨틱 역할/이름을 통해 접근성 회귀를 자연스레 감지.

### 네트워크와 비동기: MSW/타이머

- **MSW**: API는 무조건 MSW로 모킹한다. 핸들러는 실제 API 계약을 반영하고, 성공/에러/엣지 케이스를 모두 준비.
- **가짜 타이머**: 시간 의존 로직은 `vi.useFakeTimers()`로 제어하고, 테스트 종료 시 원복.
- **로딩/에러 상태**를 반드시 검증: 스피너/디세이블/재시도/알림 토스트 등.

### 데이터 빌더/픽스처

- **Builder 패턴**으로 의미 있는 기본값을 제공하고, 필요한 속성만 오버라이드.
- 무의미한 랜덤 값은 지양(결정성 깨짐). 랜덤이 필요하면 씨드 고정.

### 스냅샷 사용 원칙

- 대형 DOM 전체 스냅샷은 금지. 접근성 이름/텍스트/상태 등 의미가 있는 최소 부분만 스냅샷.
- 실패 원인 파악이 쉬운 단언을 우선하고, 스냅샷은 보조 수단.

### 커버리지와 품질 게이트

- **기본 가이드**: 라인/브랜치 80%+ 목표. 핵심 도메인 모듈은 90%+.
- 커버리지 수치보다 중요한 시나리오(에러 흐름, 경계값, 동시성)를 우선 커버.

### 플레이키(Flaky) 방지

- 네트워크/타이머/시간대/로캘을 통제. 의존 순서를 없애고 공유 상태를 초기화.
- `waitFor` 폴링 간격/타임아웃을 합리적으로 설정하고, `findBy` 과사용을 피한다.

### 구현 세부사항 미노출 원칙

- 내부 훅 state, 프라이빗 함수 직접 접근 금지. 공개 API/DOM을 통해 검증.
- 모듈 경계(HTTP, 시간, 스토리지)만 모킹하고, 컴포넌트 구현 내부는 모킹하지 않는다.

### 예시: 훅 단위 테스트(AAA/GWT)

```ts
// Given
import { renderHook, act } from '@testing-library/react';
import { useSearch } from '@/hooks/useSearch';

test('when query changes then filters results by title', () => {
  const { result } = renderHook(() => useSearch(sampleEvents));

  // When
  act(() => result.current.setQuery('work'));

  // Then
  expect(result.current.filtered).toMatchObject([
    expect.objectContaining({ title: expect.stringMatching(/work/i) }),
  ]);
});
```

### 예시: 컴포넌트 + MSW 통합 테스트

```tsx
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { server } from '@/src/setupTests'; // MSW server
import { rest } from 'msw';
import App from '@/App';
import { render } from '@/__tests__/utils';

test('shows holidays after fetch and error toast on failure', async () => {
  render(<App />);

  // 성공 흐름
  await userEvent.click(screen.getByRole('button', { name: /load holidays/i }));
  expect(await screen.findByText(/new year/i)).toBeInTheDocument();

  // 에러 흐름
  server.use(rest.get('/api/holidays', (_req, res, ctx) => res(ctx.status(500))));
  await userEvent.click(screen.getByRole('button', { name: /reload/i }));
  expect(await screen.findByRole('alert')).toHaveTextContent(/failed/i);
});
```

### 체크리스트 (PR 전 자기 점검)

- [ ] 테스트가 단일 행동을 검증하는가?
- [ ] 사용자의 시나리오로 서술되는가(텍스트/역할/라벨 기반 쿼리)?
- [ ] 로딩/성공/에러/엣지 케이스를 모두 다루는가?
- [ ] MSW, 가짜 타이머 등 경계 모킹이 적절한가?
- [ ] 테스트가 빠르고 결정적인가(로컬/CI 동일 결과)?
- [ ] 스냅샷은 최소·의미 있는가?
- [ ] 불필요한 구현 세부사항에 의존하지 않는가?

### 팀 규칙

- 새 기능은 최소 1개 이상의 통합 테스트와 핵심 로직 단위 테스트를 포함한다.
- 버그 수정은 재현 테스트를 먼저 추가하고, 수정 후 테스트를 통과시킨다.
- flaky 발생 시 가장 먼저 재현 테스트와 원인 분석 PR을 올린다.
