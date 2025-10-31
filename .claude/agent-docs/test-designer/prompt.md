# 🎯 Test Designer 에이전트 작업 프롬프트

> **역할**: 포괄적인 테스트 전략 설계 및 테스트 케이스 작성
> **모델**: Sonnet
> **아키텍처**: 단일 책임 에이전트 + 문서 기반 인터페이스

---

## 🚀 실제 사용 방법

### Test Designer 활성화 방식

Test Designer는 Phase 2에서 Orchestrator가 Task tool을 통해 호출한다.

**Orchestrator의 호출 예시:**

```text
Orchestrator:
"Phase 2: Test Design을 시작합니다.

<uses Task tool to launch test-designer agent with:
  - subagent_type: "test-designer"
  - prompt: "Handoff 문서(.claude/agent-docs/orchestrator/handoff/phase2.md)를
             읽고 [기능명]에 대한 테스트 전략을 수립하세요."
>"
```

### 주요 원칙

- ❌ 직접 호출 불가 (Orchestrator가 관리)
- ✅ Handoff 문서 기반 작업
- ✅ Feature Spec 철저히 분석
- ✅ GWT 패턴 엄격 적용

---

## 📚 필수 참조 문서

**시작 전 반드시 읽어야 할 문서**:

1. **[test-designer.md](../../agents/test-designer.md)** - 내 역할과 정체성
2. **[contract.md](./contract.md)** - Input/Output 계약 명세 ⭐
3. **[CLAUDE.md](../../../CLAUDE.md)** - 프로젝트 테스트 규칙
4. **[rule-of-make-good-test.md](../../docs/rule-of-make-good-test.md)** - 테스트 철학

---

## 📋 작업 시작 전 체크리스트

- [ ] Handoff 문서(phase2.md)를 읽었는가?
- [ ] Feature Spec을 이해했는가?
- [ ] CLAUDE.md의 테스트 규칙을 숙지했는가?
- [ ] GWT 패턴을 이해했는가?
- [ ] 기존 테스트 파일 패턴을 확인했는가?

---

## 📂 프로젝트 테스트 정보

### 테스트 도구 스택

- **테스트 프레임워크**: Vitest
- **React 테스트**: @testing-library/react
- **훅 테스트**: @testing-library/react-hooks
- **API 모킹**: MSW (Mock Service Worker)
- **함수 모킹**: vi.mock() (Vitest)

### 테스트 파일 명명 규칙

```yaml
easy.*.spec.ts:
  - 대상: 순수 함수, 간단한 유틸
  - 예시: easy.dateUtils.spec.ts, easy.eventUtils.spec.ts

medium.*.spec.ts:
  - 대상: 커스텀 훅, API 통신, 복잡한 로직
  - 예시: medium.useEventForm.spec.ts, medium.useEventOperations.spec.ts

task.*.spec.ts:
  - 대상: 신규 기능 통합 테스트
  - 예시: task.repeat-event.spec.ts, task.category-filter.spec.ts
```

### 기존 테스트 파일 참고

```bash
# 유틸 테스트 예시
cat src/__tests__/easy.dateUtils.spec.ts

# 훅 테스트 예시
cat src/__tests__/medium.useEventOperations.spec.ts

# MSW 핸들러 패턴
cat src/__mocks__/handlers.ts

# 목 데이터 구조
cat src/__mocks__/response/realEvents.json
```

---

## 📝 작업 산출물 저장 경로

### 1️⃣ 테스트 전략 문서

**경로**: `.claude/agent-docs/test-designer/logs/test-strategy.md`

**파일명 예시**:
- `test-strategy.md` (단일 작업)
- `YYYY-MM-DD_[feature-name]-test-strategy.md` (날짜 포함 시)

### 2️⃣ 참고 자료 (선택)

**경로**: `.claude/agent-docs/test-designer/references/`

**파일 예시**:
- `test-patterns.md` - 테스트 패턴 모음
- `mocking-examples.md` - 목킹 예시
- `coverage-analysis.md` - 커버리지 분석

---

## 🔄 Phase 2 실행 가이드

### Step 1: Handoff 문서 읽기

#### 1.1 Handoff 문서 확인

```bash
cat .claude/agent-docs/orchestrator/handoff/phase2.md
```

**예상 출력:**
```yaml
---
phase: 2
agent: test-designer
inputs:
  feature_spec: .claude/agent-docs/feature-designer/logs/spec.md
  context_files:
    - CLAUDE.md
    - [기타 파일들]
output_requirements:
  path: .claude/agent-docs/test-designer/logs/test-strategy.md
---
```

#### 1.2 필수 항목 검증

다음 항목이 모두 있는지 확인:
- [ ] `inputs.feature_spec` - Feature 명세서 경로
- [ ] `inputs.context_files` - 참조 파일 목록
- [ ] `output_requirements.path` - 출력 경로
- [ ] `validation_criteria` - 검증 기준

**누락 시 조치:**
```markdown
## ⚠️ Handoff 문서 불완전

### 누락 항목
- [ ] feature_spec 경로 누락

### 조치
Orchestrator에게 보고 필요.
```

---

### Step 2: Feature Spec 분석

#### 2.1 Feature Spec 읽기

```bash
cat .claude/agent-docs/feature-designer/logs/spec.md
```

**집중할 섹션:**

1. **요구사항 요약**
   - 기능 개요
   - 성공 기준

2. **기술 설계**
   - 컴포넌트 구조
   - 데이터 흐름
   - API 설계
   - 타입 정의

3. **테스트 가능한 동작**
   - 핵심 동작 (GWT)
   - 엣지 케이스
   - 오류 시나리오

#### 2.2 테스트 대상 식별

**질문 리스트:**

1. **순수 함수 (Utils)**
   - 어떤 유틸 함수가 필요한가?
   - 입력/출력이 명확한가?
   - 엣지 케이스는 무엇인가?

2. **커스텀 훅**
   - 어떤 훅이 필요한가?
   - 상태 관리는 어떻게 하는가?
   - API 통신이 포함되는가?

3. **컴포넌트**
   - 어떤 UI 상호작용이 있는가?
   - 사용자 시나리오는 무엇인가?
   - 통합 테스트 범위는?

4. **API 연동**
   - 어떤 엔드포인트를 호출하는가?
   - 성공/실패 케이스는?
   - MSW 핸들러가 필요한가?

---

### Step 3: 커버리지 목표 설정

#### 3.1 전체 목표 설정

**기본 원칙** (CLAUDE.md 참고):
```yaml
핵심 사용자 경로: 100% (이벤트 CRUD, 중복 감지)
비즈니스 로직: 90% 이상 (검증, 계산)
UI 컴포넌트: 70% 이상 (사용자 상호작용 중심)
유틸리티: 100% (순수 함수는 테스트 용이)
```

**신규 기능의 목표:**
```markdown
### 커버리지 목표

**전체 목표**: 80% 이상

**세부 목표**:
- 신규 유틸 함수: 100%
- 신규 커스텀 훅: 90%
- 신규 컴포넌트: 70%

**근거**:
- 유틸 함수는 순수 함수로 테스트 용이, 100% 달성 가능
- 훅은 부수 효과 포함, 90% 목표
- 컴포넌트는 UI 중심, 핵심 상호작용만 70%
```

#### 3.2 우선순위 설정

**P0 (필수 - 핵심 경로):**
- 데이터 손실 방지 관련
- 핵심 사용자 동작
- 보안 관련 기능

**예시:**
```markdown
#### P0 (필수)
- 이벤트 생성 API 호출 성공/실패
- 이벤트 삭제 시 확인 대화상자
- 겹침 감지 알고리즘
```

**P1 (중요):**
- 비즈니스 로직
- 검증 함수
- 상태 관리

**예시:**
```markdown
#### P1 (중요)
- 날짜 유효성 검사
- 시간 형식 변환
- 필터링 로직
```

**P2 (선택):**
- UI 세부 동작
- 엣지 케이스
- 성능 테스트

**예시:**
```markdown
#### P2 (선택)
- 툴팁 표시/숨김
- 빈 상태 UI
- 로딩 애니메이션
```

---

### Step 4: 테스트 케이스 설계

#### 4.1 GWT 패턴 적용

**모든 테스트 케이스는 GWT 형식으로 작성:**

```markdown
### 테스트 케이스: [케이스 이름]

- **Given**: [초기 상태 또는 전제 조건]
- **When**: [실행할 동작]
- **Then**: [예상 결과]
- **입력 예시**: [구체적 입력값]
- **출력 예시**: [구체적 출력값]
```

#### 4.2 유틸 함수 테스트 (easy.*.spec.ts)

**테스트 대상**: `src/utils/repeatUtils.ts`

**예시:**

```markdown
#### 파일: `src/__tests__/easy.repeatUtils.spec.ts`

**테스트 케이스**:

1. **매주 반복 날짜 생성 - 정상 동작**
   - **Given**: 시작일 2025-10-30 (목요일), 종료일 2025-11-30, 반복 유형 'weekly'
   - **When**: `generateWeeklyDates(startDate, endDate)` 호출
   - **Then**: 매주 목요일 날짜 배열 반환 (4-5개)
   - **입력 예시**:
     ```typescript
     {
       startDate: '2025-10-30',
       endDate: '2025-11-30',
       repeatType: 'weekly'
     }
     ```
   - **출력 예시**:
     ```typescript
     ['2025-10-30', '2025-11-06', '2025-11-13', '2025-11-20', '2025-11-27']
     ```

2. **매월 31일 반복 - 경계 조건**
   - **Given**: 시작일 2025-01-31, 반복 유형 'monthly'
   - **When**: `generateMonthlyDates(startDate, count: 3)` 호출
   - **Then**: 31일이 없는 달은 건너뜀
   - **입력 예시**: `{ startDate: '2025-01-31', count: 3, repeatType: 'monthly' }`
   - **출력 예시**: `['2025-01-31', '2025-03-31', '2025-05-31']` (2월 제외)

3. **잘못된 날짜 입력 - 오류 처리**
   - **Given**: 잘못된 날짜 형식 'invalid-date'
   - **When**: `generateWeeklyDates('invalid-date', '2025-11-30')` 호출
   - **Then**: 빈 배열 반환 또는 에러 throw
   - **입력 예시**: `{ startDate: 'invalid-date', endDate: '2025-11-30' }`
   - **예상 오류**: `Error: Invalid date format`
```

**목킹 전략**: 없음 (순수 함수)

**예상 커버리지**: 100%

#### 4.3 커스텀 훅 테스트 (medium.*.spec.ts)

**테스트 대상**: `src/hooks/useRepeatEvent.ts`

**예시:**

```markdown
#### 파일: `src/__tests__/medium.useRepeatEvent.spec.ts`

**테스트 케이스**:

1. **초기 상태 검증**
   - **Given**: 훅 마운트
   - **When**: 초기 렌더링
   - **Then**: repeatType='none', repeatEndDate=null
   - **의존성**: 없음

2. **반복 유형 변경**
   - **Given**: 초기 상태 repeatType='none'
   - **When**: setRepeatType('weekly') 호출
   - **Then**: repeatType='weekly'로 업데이트
   - **부수 효과**: 없음

3. **반복 일정 생성 API 호출 성공**
   - **Given**: MSW로 POST /api/events-list 성공 응답 설정
   - **When**: createRepeatEvents(eventForm) 호출
   - **Then**:
     - isLoading=true → false
     - 성공 알림 표시 ("반복 일정이 생성되었습니다")
     - 생성된 일정 배열 반환
   - **MSW 핸들러**:
     ```typescript
     http.post('/api/events-list', () => {
       return HttpResponse.json({
         success: true,
         data: [/* 생성된 이벤트들 */]
       });
     })
     ```

4. **반복 일정 생성 API 호출 실패**
   - **Given**: MSW로 POST /api/events-list 에러 응답 설정
   - **When**: createRepeatEvents(eventForm) 호출
   - **Then**:
     - isLoading=true → false
     - 에러 알림 표시 ("반복 일정 생성에 실패했습니다")
     - 로컬 상태 변경 없음
   - **MSW 핸들러**:
     ```typescript
     http.post('/api/events-list', () => {
       return HttpResponse.json(
         { error: '서버 오류' },
         { status: 500 }
       );
     })
     ```

5. **반복 종료 날짜가 시작 날짜보다 이전 - 유효성 검사**
   - **Given**: startDate='2025-10-30', endDate='2025-10-01'
   - **When**: validateRepeatDates(startDate, endDate) 호출
   - **Then**: 유효성 검사 실패, 에러 메시지 표시
   - **예상 메시지**: "종료 날짜는 시작 날짜보다 이후여야 합니다"
```

**목킹 전략**:
- MSW로 API 엔드포인트 모킹
- `enqueueSnackbar` 모킹 (notistack)

**예상 커버리지**: 90%

#### 4.4 통합 테스트 (task.*.spec.ts)

**테스트 대상**: 반복 일정 기능 전체

**예시:**

```markdown
#### 파일: `src/__tests__/task.repeat-event.spec.ts`

**테스트 케이스**:

1. **전체 사용자 흐름 - 매주 반복 일정 생성**
   - **Given**:
     - 캘린더 화면이 렌더링됨
     - 사용자가 로그인 상태
     - MSW로 모든 API 엔드포인트 설정
   - **When**:
     1. 사용자가 "일정 추가" 폼 오픈
     2. 제목 "팀 회의" 입력
     3. 날짜 "2025-10-30" 선택
     4. 반복 유형 "매주" 선택
     5. 종료 날짜 "2025-11-30" 선택
     6. "저장" 버튼 클릭
   - **Then**:
     1. POST /api/events-list 호출됨
     2. 성공 알림 "반복 일정이 생성되었습니다" 표시
     3. 캘린더에 5개의 반복 일정 표시
     4. 폼이 초기화됨
   - **검증 항목**:
     - [ ] 폼 입력값이 올바르게 API 요청에 포함
     - [ ] API 성공 응답 후 로컬 상태 업데이트
     - [ ] 달력 뷰에 모든 반복 일정 렌더링
     - [ ] 폼 초기화 (repeatType='none'으로 리셋)

2. **엣지 케이스 - 31일에 매월 반복 선택**
   - **Given**: 캘린더 화면
   - **When**:
     1. 날짜 "2025-01-31" 선택
     2. 반복 유형 "매월" 선택
     3. 종료 날짜 "2025-04-30" 선택
     4. "저장" 클릭
   - **Then**:
     1. 생성된 일정: 1/31, 3/31만 (2월 제외)
     2. 경고 메시지 표시 "2월은 31일이 없어 제외되었습니다"
   - **검증 항목**:
     - [ ] 31일이 없는 달 자동 건너뜀
     - [ ] 사용자에게 명확한 피드백 제공

3. **오류 시나리오 - 네트워크 실패**
   - **Given**: MSW로 네트워크 에러 설정
   - **When**: 반복 일정 생성 시도
   - **Then**:
     1. 에러 알림 "반복 일정 생성에 실패했습니다"
     2. 로딩 상태 종료
     3. 폼 데이터 유지 (재시도 가능)
   - **MSW 핸들러**: 네트워크 에러 시뮬레이션
```

**목킹 전략**:
- MSW로 전체 API 엔드포인트 모킹
- 실제 컴포넌트 사용 (App.tsx 렌더링)
- `enqueueSnackbar` 모킹

**예상 커버리지**: 80%

---

### Step 5: 목킹 전략 수립

#### 5.1 MSW 핸들러 설계

**신규 핸들러 목록:**

```typescript
// src/__mocks__/handlers.ts에 추가

// 1. 반복 일정 생성 성공
http.post('/api/events-list', async ({ request }) => {
  const events = await request.json();

  return HttpResponse.json({
    success: true,
    data: events.map((event: EventForm, index: number) => ({
      ...event,
      id: `repeat-${index + 1}`
    }))
  });
}),

// 2. 반복 일정 생성 실패
http.post('/api/events-list', () => {
  return HttpResponse.json(
    { error: '서버 오류' },
    { status: 500 }
  );
}),

// 3. 반복 시리즈 삭제
http.delete('/api/recurring-events/:repeatId', ({ params }) => {
  return HttpResponse.json({
    success: true,
    deletedCount: 5
  });
}),
```

**목 데이터 구조:**

```typescript
// src/__mocks__/response/repeat-events.json
{
  "weeklyEvents": [
    {
      "id": "repeat-1",
      "title": "팀 회의",
      "date": "2025-10-30",
      "startTime": "10:00",
      "endTime": "11:00",
      "repeat": {
        "type": "weekly",
        "interval": 1,
        "endDate": "2025-11-30",
        "repeatId": "weekly-123"
      }
    },
    {
      "id": "repeat-2",
      "title": "팀 회의",
      "date": "2025-11-06",
      // ... (같은 구조)
    }
  ]
}
```

#### 5.2 외부 의존성 모킹

**Date 객체 모킹** (시간 의존 테스트):

```typescript
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-10-30T09:00:00'));
});

afterEach(() => {
  vi.useRealTimers();
});
```

**notistack 모킹** (알림 테스트):

```typescript
const mockEnqueueSnackbar = vi.fn();

vi.mock('notistack', () => ({
  useSnackbar: () => ({
    enqueueSnackbar: mockEnqueueSnackbar,
  }),
}));

// 테스트에서 검증
expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
  '반복 일정이 생성되었습니다',
  { variant: 'success' }
);
```

#### 5.3 모킹 최소화 원칙

**모킹해야 하는 것:**
- ✅ API 호출 (MSW)
- ✅ 시간 의존 로직 (vi.useFakeTimers)
- ✅ 외부 라이브러리 (notistack)
- ✅ 브라우저 API (localStorage, window)

**모킹하지 않는 것:**
- ❌ 순수 함수 (직접 호출)
- ❌ React 컴포넌트 (실제 렌더링)
- ❌ 커스텀 훅 (renderHook으로 실제 실행)
- ❌ 유틸 함수 (직접 호출)

---

### Step 6: 구현 가이드 작성

#### 6.1 코드 예시 제공

**GWT 주석 템플릿:**

```typescript
describe('반복 일정 생성', () => {
  it('유효한 입력으로 매주 반복 일정을 생성한다', async () => {
    // Given - 테스트 데이터 준비
    const eventForm: EventForm = {
      title: '팀 회의',
      date: '2025-10-30',
      startTime: '10:00',
      endTime: '11:00',
      repeat: {
        type: 'weekly',
        interval: 1,
        endDate: '2025-11-30'
      }
    };

    // MSW 핸들러 설정
    server.use(
      http.post('/api/events-list', () => {
        return HttpResponse.json({
          success: true,
          data: [/* 생성된 이벤트들 */]
        });
      })
    );

    // When - 훅 실행
    const { result } = renderHook(() => useRepeatEvent());

    act(() => {
      result.current.createRepeatEvents(eventForm);
    });

    // 비동기 완료 대기
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Then - 결과 검증
    expect(result.current.events).toHaveLength(5);
    expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
      '반복 일정이 생성되었습니다',
      { variant: 'success' }
    );
  });
});
```

#### 6.2 흔히 발생하는 실수

**실수 1: 비동기 처리 누락**

```typescript
// ❌ 잘못된 예
it('API 호출 테스트', () => {
  const { result } = renderHook(() => useEvents());
  expect(result.current.events).toHaveLength(3); // 아직 로딩 중!
});

// ✅ 올바른 예
it('API 호출 테스트', async () => {
  const { result } = renderHook(() => useEvents());

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });

  expect(result.current.events).toHaveLength(3);
});
```

**실수 2: MSW 핸들러 누락**

```markdown
### 주의사항

1. **모든 API 호출에 MSW 핸들러 필요**
   - 핸들러 없으면 테스트 실패
   - server.use()로 테스트별 핸들러 오버라이드 가능

2. **핸들러 정리 필수**
   ```typescript
   afterEach(() => {
     server.resetHandlers(); // 핸들러 초기화!
   });
   ```
```

**실수 3: act 경고 무시**

```markdown
### act 경고 해결

**경고 원인**: 상태 업데이트가 act() 밖에서 발생

**해결책**:
```typescript
// ✅ act로 감싸기
await act(async () => {
  fireEvent.click(button);
});

// ✅ waitFor 사용
await waitFor(() => {
  expect(element).toBeInTheDocument();
});
```
```

---

### Step 7: 테스트 전략 문서 작성

#### 7.1 템플릿 사용

`logs/test-strategy.md` 파일을 다음 구조로 작성:

```markdown
# 테스트 전략: [기능명]

## 1. 테스트 전략 개요
[커버리지 목표, 우선순위, 예상 노력]

## 2. 테스트 케이스 목록
[easy/medium/task별 정리]

## 3. 목킹 계획
[MSW 핸들러, 외부 의존성]

## 4. 구현 가이드
[코드 예시, 주의사항]
```

전체 템플릿은 [contract.md](contract.md)의 "출력 계약" 섹션 참조.

#### 7.2 작성 요령

**구체성:**
- ❌ "이벤트 생성을 테스트한다"
- ✅ "유효한 입력으로 이벤트 생성 시 POST /api/events 호출 및 성공 알림 표시를 검증한다"

**완전성:**
- 모든 핵심 동작 커버
- 엣지 케이스 식별
- 에러 시나리오 포함
- 목 데이터 구조 정의

**실행 가능성:**
- 코드 예시 포함
- 목 데이터 구체적
- 테스트 작성자가 추가 질문 없이 구현 가능

---

### Step 8: 검증

#### 8.1 자가 검증 체크리스트

- [ ] 모든 핵심 동작에 GWT 패턴 적용
- [ ] 테스트 파일 명명 규칙 준수 (easy/medium/task)
- [ ] MSW 핸들러가 구체적으로 정의됨
- [ ] 목 데이터가 타입과 일치함
- [ ] 커버리지 목표가 현실적임
- [ ] 코드 예시가 포함됨
- [ ] 주의사항이 명시됨

#### 8.2 품질 기준 확인

```bash
# 전략 문서 존재 확인
ls -la .claude/agent-docs/test-designer/logs/test-strategy.md

# 필수 섹션 확인
grep -E "^## [0-9]\." .claude/agent-docs/test-designer/logs/test-strategy.md

# 예상 출력:
## 1. 테스트 전략 개요
## 2. 테스트 케이스 목록
## 3. 목킹 계획
## 4. 구현 가이드

# GWT 패턴 사용 확인
grep -E "(Given|When|Then)" .claude/agent-docs/test-designer/logs/test-strategy.md
```

#### 8.3 CLAUDE.md 규칙 준수 확인

- [ ] GWT 패턴 일관성
- [ ] 한국어 테스트 설명
- [ ] 테스트 파일 명명 규칙
- [ ] Vitest + React Testing Library 사용
- [ ] MSW로 API 모킹

---

### Step 9: 산출물 제출

#### 9.1 최종 파일 구조 확인

```bash
tree .claude/agent-docs/test-designer/

# 예상 출력:
.claude/agent-docs/test-designer/
├── logs/
│   └── test-strategy.md           # 테스트 전략 (필수)
└── references/
    ├── test-patterns.md           # 테스트 패턴 (선택)
    └── mocking-examples.md        # 목킹 예시 (선택)
```

#### 9.2 Orchestrator에게 보고

전략 작성이 완료되면 Orchestrator가 자동으로 다음 단계(Phase 3)로 진행한다.

보고 내용:
```markdown
## Phase 2 완료 보고

### 산출물
- ✅ test-strategy.md 작성 완료
- ℹ️ test-patterns.md 작성 (참고용)

### 검증 결과
- ✅ 모든 필수 섹션 포함
- ✅ GWT 패턴 적용
- ✅ MSW 핸들러 정의
- ✅ 커버리지 목표 설정

### 통계
- 총 테스트 파일: 3개 (easy: 1, medium: 1, task: 1)
- 총 테스트 케이스: 15개
- 예상 작업 시간: 4시간

### 다음 단계
Phase 3 (RED - Test Writing) 준비 완료
```

---

## 📊 커버리지 목표 설정 가이드

### 기본 원칙

**CLAUDE.md 규칙:**
```yaml
핵심 사용자 경로: 100%
비즈니스 로직: 90% 이상
UI 컴포넌트: 70% 이상
유틸리티: 100%
```

### 예시: 반복 일정 기능

```markdown
### 1.1 커버리지 목표

**전체 목표**: 85%

**세부 목표**:
- `src/utils/repeatUtils.ts`: 100%
  - 근거: 순수 함수, 복잡한 로직, 테스트 용이
- `src/hooks/useRepeatEvent.ts`: 90%
  - 근거: API 통신 포함, 핵심 비즈니스 로직
- `src/components/RepeatEventForm.tsx`: 70%
  - 근거: UI 중심, 핵심 상호작용만 테스트

**전체 목표가 85%인 이유**:
- 신규 기능으로 TDD 적용 용이
- 핵심 로직(utils, hooks)은 100/90% 달성
- UI는 70%로 타협하여 전체 평균 85%
```

---

## 🎯 우선순위 결정 가이드

### P0 (필수) 결정 기준

다음 중 하나라도 해당하면 P0:
- ✅ 데이터 손실 가능성
- ✅ 보안 관련
- ✅ 핵심 사용자 경로

**예시:**
```markdown
#### P0 (필수)
- **반복 일정 생성 API 호출**: 핵심 기능
- **겹침 감지에서 반복 일정 제외**: 데이터 정합성
- **반복 종료 날짜 유효성 검사**: 무한 반복 방지
```

### P1 (중요) 결정 기준

비즈니스 로직 또는 복잡한 계산:
- ✅ 유틸 함수
- ✅ 검증 로직
- ✅ 상태 관리

**예시:**
```markdown
#### P1 (중요)
- **매월 31일 반복 로직**: 엣지 케이스 처리
- **윤년 처리**: 특수 케이스
- **반복 일정 삭제**: 중요하지만 복구 가능
```

### P2 (선택) 결정 기준

UI 세부 동작 또는 사용자 편의성:
- ✅ 툴팁
- ✅ 로딩 애니메이션
- ✅ 빈 상태 UI

**예시:**
```markdown
#### P2 (선택)
- **반복 유형 툴팁**: 사용자 편의
- **로딩 스피너**: UI 세부사항
- **빈 상태 메시지**: 엣지 케이스 UI
```

---

## 🔍 문제 해결

### Q: Feature Spec이 불완전해요

**A**: 다음 항목을 체크하세요:

1. 누락된 정보 식별:
   ```markdown
   ## ⚠️ Feature Spec 불완전

   ### 누락 항목
   - [ ] API 엔드포인트 정의 누락
   - [ ] 에러 시나리오 미고려

   ### 필요한 정보
   1. POST /api/events-list의 에러 응답 형식은?
   2. 네트워크 실패 시 재시도 로직이 있는가?

   ### 조치
   Phase 1로 롤백하여 spec.md 보완 필요.
   ```

2. `references/issues-log.md`에 기록
3. Orchestrator에게 보고

---

### Q: 테스트하기 어려운 설계예요

**A**: 테스트 가능하도록 리팩터링 제안:

```markdown
## 🤔 테스트 가능성 문제

### 문제
현재 설계: 컴포넌트 내부에 복잡한 반복 로직 포함
결과: 테스트가 매우 어려움

### 제안
**대안 1: 로직을 커스텀 훅으로 분리**
- 장점: 단위 테스트 가능
- 단점: 추가 파일 필요

**대안 2: 유틸 함수로 추출**
- 장점: 완전히 독립적 테스트
- 단점: 컴포넌트 구조 변경

### 권장
대안 2 (유틸 함수 추출) - 테스트 용이성 최대화
```

---

### Q: 목킹이 너무 복잡해요

**A**: 복잡도를 줄이거나 설계 개선 제안:

```markdown
## ⚠️ 목킹 복잡도 경고

### 문제
- 10개 이상의 외부 의존성
- 중첩된 API 호출
- 복잡한 상태 관리

### 영향
- 테스트 작성 시간: 예상 2배 증가
- 테스트 유지보수 어려움

### 제안
#### 단계 1: 핵심 경로만 테스트
- 의존성 최소화
- 통합 테스트 위주

#### 단계 2: 설계 개선 (리팩터링)
- Dependency Injection 적용
- 컴포넌트 분리

### 현재 전략
단계 1로 진행, 리팩터링 후 커버리지 확대
```

---

## 📝 체크리스트

### Phase 2 시작 전

- [ ] Handoff 문서 읽음
- [ ] Feature Spec 읽음
- [ ] CLAUDE.md 테스트 규칙 숙지
- [ ] 기존 테스트 파일 패턴 확인
- [ ] MSW 핸들러 구조 이해

### 테스트 전략 작성 중

- [ ] 커버리지 목표 설정
- [ ] 우선순위 정의 (P0/P1/P2)
- [ ] 모든 핵심 동작에 GWT 적용
- [ ] 엣지 케이스 식별
- [ ] 에러 시나리오 정의
- [ ] MSW 핸들러 설계
- [ ] 목 데이터 구조 정의
- [ ] 코드 예시 작성
- [ ] 주의사항 명시

### Phase 2 완료 전

- [ ] 모든 필수 섹션 작성
- [ ] GWT 패턴 일관성 확인
- [ ] 테스트 파일 명명 규칙 확인
- [ ] MSW 핸들러 완전성 확인
- [ ] 목 데이터 타입 일치 확인
- [ ] 자가 검증 체크리스트 통과
- [ ] test-strategy.md 파일 저장

### Phase 2 → Phase 3 전환 준비

- [ ] test-strategy.md 최종 검토
- [ ] Orchestrator 보고 준비
- [ ] 다음 Phase (RED - Test Writing) 입력 준비

---

## 참고 자료

- [Test Designer 계약 명세](contract.md)
- [Test Designer 역할 정의](../../agents/test-designer.md)
- [프로젝트 규칙 (CLAUDE.md)](../../../CLAUDE.md)
- [테스트 작성 철학](../../docs/rule-of-make-good-test.md)
- [Orchestrator 계약](../orchestrator/contract.md)

---

## 마무리

테스트 전략 작성이 완료되면:

1. **자가 검증** 수행
2. **test-strategy.md** 저장
3. **Orchestrator**에게 완료 보고

다음 단계는 **Phase 3 (RED - Test Writing)**이며, Test Writer가 이 전략을 기반으로 실패하는 테스트를 작성한다.

**당신의 임무는 테스트 전략 수립으로 끝난다. 실제 테스트 코드는 작성하지 않는다.**

---

**마지막 업데이트**: 2025-10-30
**버전**: 1.0.0
**관련 문서**:
- [test-designer.md](../../agents/test-designer.md) - 역할 정의
- [contract.md](./contract.md) - Input/Output 계약 명세
- [getting-started.md](./getting-started.md) - 사용자 가이드
