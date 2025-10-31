# 🧪 TEST_RULES.md  
## 테스트 설계 규칙 (TDD 기반)

### 1️⃣ 테스트 철학
- **켄트 백의 TDD 3단계**
  1. **Red** — 실패하는 테스트를 먼저 작성한다. (기능이 없다는 사실을 드러내야 한다.)
  2. **Green** — 테스트를 통과시키기 위한 최소한의 구현을 한다.
  3. **Refactor** — 중복 제거, 구조 개선, 가독성 향상 후 테스트 재실행으로 안정성 확보.

- **핵심 원칙**
  - 테스트는 **설계 도구이자 문서**다. “무엇을 기대하는가?”를 명확히 보여야 한다.
  - 한 테스트는 **하나의 논리적 기대(expectation)** 를 검증해야 한다.
  - 실제 구현보다 **행동(Behavior)** 중심으로 작성한다.  
    예: “이벤트가 저장된다” 대신 → “사용자가 일정을 추가하면 목록에 노출된다.”

---

### 2️⃣ 테스트 구조 규칙
```ts
describe('기능 단위 명세', () => {
  beforeEach(() => { /* 공통 초기화 */ })
  afterEach(() => { /* mock reset */ })

  it('조건 → 기대 결과를 명시한다', async () => {
    // Arrange (준비)
    // Act (실행)
    // Assert (검증)
  })
})
```

- **Describe 블록**: 기능 단위 또는 시나리오 단위로 묶기  
  예: `describe('일정 CRUD')`, `describe('검색 기능')`
- **It 블록**: 동작(Behavior) 중심 문장으로 작성  
  - ✅ “사용자가 일정 추가 버튼을 누르면 일정이 리스트에 표시된다.”
  - ❌ “addEvent 함수가 실행된다.”
- **Given / When / Then** 패턴 허용  
  → “주어진 상황 / 행동 / 기대 결과”를 구분해 가독성 강화

---

### 3️⃣ 네이밍 규칙
| 요소 | 규칙 |
|------|------|
| `describe` | 기능 단위 명시 (예: “일정 CRUD”, “검색 기능”) |
| `it` | 자연어 문장으로 기대 결과 표현 (예: “일정을 삭제하면 리스트에서 사라진다”) |
| 변수명 | 테스트 의도에 맞게 구체적(`mockEvent`, `sampleUser`, `invalidTimeRange`) |
| 테스트 파일 | `*.spec.ts(x)` or `*.test.ts(x)` 명명 유지 |

---

### 4️⃣ Mock & Stub 규칙
- **전역 stub은 `vi.stubGlobal()`**  
  → `fetch` / `Date` / `console` 등
- **MSW 사용 시**
  - 각 테스트마다 `server.use()`로 핸들러를 재정의한다.
  - 테스트 후 반드시 `server.resetHandlers()`로 초기화한다.
- **Mock Handler 네이밍**
  - `setupMockHandlerCreation`, `setupMockHandlerDeletion` 등  
    기능명 + 동작명 패턴 유지
- **타이머 관련 테스트**
  - `vi.useFakeTimers()`로 시간 제어
  - `vi.advanceTimersByTime(ms)`로 시뮬레이션
  - 테스트 종료 후 `vi.useRealTimers()`로 복원

---

### 5️⃣ Assertion 규칙
| 목적 | 예시 |
|------|------|
| DOM 존재 여부 | `expect(screen.getByText('신정')).toBeInTheDocument()` |
| DOM 비존재 | `expect(screen.queryByText('삭제할 이벤트')).not.toBeInTheDocument()` |
| 텍스트 포함 | `expect(element).toHaveTextContent('팀 회의')` |
| 이벤트 트리거 | `await user.click(screen.getByText('일정 추가'))` |
| 비동기 대기 | `await screen.findByText('일정 로딩 완료!')` |

- 가능한 한 `getBy*`, `findBy*`, `queryBy*` 구분을 명확히 사용한다.
- 시각적 피드백이나 알림은 **명확한 텍스트 기반 검증**으로 처리 (`Snackbar`, `Alert`, 등).

---

### 6️⃣ 테스트 범위 구분
| 레벨 | 설명 | 예시 |
|------|------|------|
| **Unit Test** | 단일 함수, 훅의 로직 검증 | `easy.dateUtils.spec.ts`, `easy.timeValidation.spec.ts` |
| **Integration Test** | 컴포넌트 간 상호작용, 상태 변화 검증 | `medium.useEventOperations.spec.ts`, `medium.integration.spec.tsx` |
| **E2E/Behavioral** | 실제 사용자 시나리오 | `일정 CRUD`, `검색 기능`, `일정 충돌` 테스트 블록들 |

---

### 7️⃣ 공통 패턴 예시
```ts
// ✅ 테스트 기본형
it('일정을 추가하면 리스트에 표시된다', async () => {
  setupMockHandlerCreation();
  const { user } = setup(<App />);
  
  await saveSchedule(user, mockEvent);

  const eventList = within(screen.getByTestId('event-list'));
  expect(eventList.getByText('새 회의')).toBeInTheDocument();
});

// ⚠️ 피해야 할 패턴
it('addEvent 함수 실행', () => {
  addEvent(); // 내부 호출 테스트 ❌
});
```

---

### 8️⃣ Refactor 기준
- 중복된 `render()` 또는 `setup()` 로직은 **공통 유틸 함수로 추출**  
  (`setup()`, `saveSchedule()` 등)
- 테스트가 길어질 경우 **의미 단위로 describe 분리**
- **한 테스트 = 하나의 의도** 원칙 유지

---

### 9️⃣ 커버리지 목표
| 항목 | 목표 기준 |
|------|-----------|
| 함수 단위 | 90% 이상 |
| 주요 시나리오 (CRUD, 검색, 알림) | 100% 검증 |
| Mock branch coverage | 모든 조건문 분기 최소 1회 실행 |

---

### 10️⃣ TDD 실천 단계 (에이전트 참고용)
| 단계 | 설명 | 예시 |
|------|------|------|
| **1. Red** | 실패하는 테스트 작성 | “일정 추가 시 리스트에 표시되어야 한다” — 아직 기능 없음 |
| **2. Green** | 최소 구현으로 테스트 통과 | `addEvent()` 로직 추가 |
| **3. Refactor** | 중복 제거 및 공통화 | `setup()` 추출, 네이밍 정리 |

---

### ✅ 결론
이 규칙 파일은 **테스트 설계 에이전트**가 다음과 같은 작업을 자동화할 수 있게 설계되었습니다:
- PRD 기반 요구사항을 **테스트 시나리오로 분해**
- 켄트 백의 **TDD 3단계 사이클**을 따르는 테스트 초안 생성
- 실제 코드베이스(`easy.*`, `medium.*`)의 **테스트 스타일 가이드** 일관성 유지
