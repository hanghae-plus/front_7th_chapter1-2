# TDD 오케스트레이터 실행 계획

> **메타데이터**
>
> - Agent: tdd-orchestrator
> - Status: initialized
> - Timestamp: 2025-10-31T10:00:00Z
> - Total Cycles: 10개
> - Estimated Duration: 12시간 (개발) + 5시간 (테스트) = 17시간
> - Complexity: High

---

## 실행 전략

### 1. TDD 사이클 순서

명세서에 정의된 10개의 TDD Cycle을 순서대로 진행합니다. 각 사이클은 RED → GREEN → REFACTOR 단계를 거칩니다.

### 2. 사이클 분해 원칙

- **복잡도 고려**: 예상 시간이 1.5시간을 초과하는 사이클은 더 작은 단위로 분할 가능
- **의존성 우선**: 의존성이 있는 함수는 순서대로 구현
- **통합 테스트**: Cycle 10에서 모든 엣지 케이스 검증

---

## 사이클 순서

### Cycle 1: 날짜 유틸리티 함수
**예상 소요 시간**: 30분

**구현 대상**:
- `formatDate(date: Date): string`
- `getDayOfWeek(date: Date): number`
- `isLeapYear(year: number): boolean`

**이유**: 모든 반복 로직의 기초, 의존성 없음

**테스트 시나리오**:
- formatDate: YYYY-MM-DD 형식 변환 (2025-01-01, 2025-12-31)
- getDayOfWeek: 요일 계산 (0=일요일, 6=토요일)
- isLeapYear: 윤년 판단 (2024=true, 2025=false, 2000=true, 1900=false)

**파일**:
- 구현: `src/utils/repeatUtils.ts`
- 테스트: `src/__tests__/unit/repeatUtils.spec.ts`

---

### Cycle 2: shouldSkipDate 함수
**예상 소요 시간**: 45분

**구현 대상**:
- `shouldSkipDate(date, repeatType, baseDay, baseMonth): boolean`

**이유**: 31일, 윤년 처리는 복잡한 엣지 케이스

**의존성**: isLeapYear

**테스트 시나리오**:
- 31일 매월 반복: 2월(28일) → 건너뜀, 3월(31일) → 생성
- 2/29 매년 반복: 2025년 → 건너뜀, 2024년 → 생성
- 기타 날짜: 건너뛰지 않음

**파일**:
- 구현: `src/utils/repeatUtils.ts`
- 테스트: `src/__tests__/unit/repeatUtils.spec.ts`

---

### Cycle 3: getNextOccurrence 함수
**예상 소요 시간**: 1시간

**구현 대상**:
- `getNextOccurrence(currentDate, repeatType, interval, baseDate): Date | null`

**이유**: 반복 생성 로직의 핵심

**의존성**: 없음 (Date API만 사용)

**테스트 시나리오**:
- 매일 간격 1, 2, 7
- 매주 간격 1, 2
- 매월 간격 1, 2 (31일 포함)
- 매년 간격 1, 2

**파일**:
- 구현: `src/utils/repeatUtils.ts`
- 테스트: `src/__tests__/unit/repeatUtils.spec.ts`

---

### Cycle 4: generateRecurringInstances 함수
**예상 소요 시간**: 1.5시간

**구현 대상**:
- `generateRecurringInstances(eventForm, endDate): Omit<Event, 'id'>[]`

**이유**: 모든 유틸리티 함수 통합, 생성 로직 완성

**의존성**: getNextOccurrence, shouldSkipDate, formatDate

**테스트 시나리오**:
- 매일 반복 (3일, 10일)
- 매주 반복 (월요일, 금요일)
- 매월 반복 (15일, 31일)
- 매년 반복 (1/15, 2/29)
- 간격 2, 3

**파일**:
- 구현: `src/utils/repeatUtils.ts`
- 테스트: `src/__tests__/unit/repeatUtils.spec.ts`

---

### Cycle 5: 반복 설정 UI
**예상 소요 시간**: 1시간

**구현 대상**:
- Select (반복 유형)
- TextField (반복 간격, 종료일)
- 조건부 렌더링 (none 선택 시 숨김)

**이유**: 사용자 입력 수집

**의존성**: 없음 (UI만)

**테스트 시나리오**:
- 반복 유형 선택 시 폼 표시/숨김
- 간격 최소값 1 강제
- 종료일 최대값 2025-12-31

**파일**:
- 구현: `src/App.tsx` 또는 `src/hooks/useEventForm.ts`
- 테스트: `src/__tests__/medium.integration.spec.tsx`

---

### Cycle 6: 반복 일정 생성 통합
**예상 소요 시간**: 1.5시간

**구현 대상**:
- `handleSaveRecurringEvent` 함수
- API POST /api/events-list 호출
- 상태 업데이트

**이유**: 생성 플로우 완성

**의존성**: generateRecurringInstances, API

**테스트 시나리오**:
- 매일 반복 생성 → 캘린더에 표시
- 매주 반복 생성 → RepeatIcon 표시
- API 실패 → 에러 메시지

**파일**:
- 구현: `src/hooks/useEventOperations.ts`
- 테스트: `src/__tests__/medium.integration.spec.tsx`

---

### Cycle 7: 캘린더 표시 (RepeatIcon)
**예상 소요 시간**: 30분

**구현 대상**:
- `event.repeat.type !== 'none'` → RepeatIcon 렌더링

**이유**: 시각적 피드백

**의존성**: 생성된 이벤트

**테스트 시나리오**:
- 반복 일정에만 아이콘 표시
- 단일 일정에는 아이콘 없음

**파일**:
- 구현: `src/App.tsx`
- 테스트: `src/__tests__/medium.integration.spec.tsx`

---

### Cycle 8: 단일 수정/삭제
**예상 소요 시간**: 1시간

**구현 대상**:
- Dialog 표시
- "예" 선택 → handleEditSingle, handleDeleteSingle
- API 호출

**이유**: 기본 수정/삭제 기능

**의존성**: API

**테스트 시나리오**:
- 단일 수정 → repeat.type = 'none'
- 단일 삭제 → 해당 이벤트만 제거

**파일**:
- 구현: `src/hooks/useEventOperations.ts`, `src/App.tsx`
- 테스트: `src/__tests__/medium.integration.spec.tsx`

---

### Cycle 9: 전체 수정/삭제
**예상 소요 시간**: 2시간 (복잡도로 인해 분할 가능)

**구현 대상**:
- findFirstEventDate 함수
- handleEditAll, handleDeleteAll
- 삭제 + 재생성 플로우

**이유**: 가장 복잡한 로직

**의존성**: generateRecurringInstances, API

**테스트 시나리오**:
- 전체 수정 → 모든 이벤트 제목 변경
- 반복 유형 변경 → 맞지 않는 인스턴스 제거
- 전체 삭제 → 모든 이벤트 제거

**파일**:
- 구현: `src/utils/repeatUtils.ts`, `src/hooks/useEventOperations.ts`
- 테스트: `src/__tests__/medium.integration.spec.tsx`

**분할 가능성**:
- Cycle 9-1: findFirstEventDate + handleDeleteAll (1시간)
- Cycle 9-2: handleEditAll + 재생성 로직 (1시간)

---

### Cycle 10: 엣지 케이스 통합 테스트
**예상 소요 시간**: 1.5시간

**구현 대상**:
- 31일 매월 (건너뛰기)
- 윤년 2/29
- 간격 2 + 31일 상호작용
- 전체 수정 시 제거 로직

**이유**: 실제 시나리오 검증

**의존성**: 모든 이전 사이클

**테스트 시나리오**:
- TC-E01 ~ TC-E20 실행
- 통합 테스트 (medium.integration.spec.tsx)

**파일**:
- 테스트: `src/__tests__/medium.integration.spec.tsx`

---

## 예상 소요 시간 (상세)

| Cycle | 기능 | 예상 시간 | 누적 시간 |
|-------|------|-----------|----------|
| 1 | 날짜 유틸리티 함수 | 30분 | 30분 |
| 2 | shouldSkipDate 함수 | 45분 | 1시간 15분 |
| 3 | getNextOccurrence 함수 | 1시간 | 2시간 15분 |
| 4 | generateRecurringInstances 함수 | 1.5시간 | 3시간 45분 |
| 5 | 반복 설정 UI | 1시간 | 4시간 45분 |
| 6 | 반복 일정 생성 통합 | 1.5시간 | 6시간 15분 |
| 7 | 캘린더 표시 (RepeatIcon) | 30분 | 6시간 45분 |
| 8 | 단일 수정/삭제 | 1시간 | 7시간 45분 |
| 9 | 전체 수정/삭제 | 2시간 | 9시간 45분 |
| 10 | 엣지 케이스 통합 테스트 | 1.5시간 | 11시간 15분 |

**총 예상 시간**: 약 11-12시간

---

## 게이트 조건 요약

### RED Gate
- ✅ red-test-writer-output.md 생성
- ✅ 테스트 파일 생성
- ✅ Baseline 대비 실패 수 +1 이상
- ✅ 신규 실패 항목에 RED에서 추가한 테스트 포함
- ✅ 실패 유형은 Assertion 기반

### GREEN Gate
- ✅ green-implementer-output.md 생성
- ✅ 구현 코드 생성
- ✅ 모든 테스트 통과 (`pnpm test`)
- ✅ 린트 검사 통과 (`pnpm run lint`)

### REFACTOR Gate
- ✅ refactor-engineer-output.md 생성
- ✅ 리팩토링 수행 기록
- ✅ 모든 테스트 여전히 통과
- ✅ 린트 검사 통과

---

## 재시도 전략

각 Phase마다 최대 3회 재시도:

```
시도 1: 실패 → 원인 분석 → 에이전트 재실행
시도 2: 실패 → 더 구체적인 지시 → 에이전트 재실행
시도 3: 실패 → 사용자 개입 요청
```

---

## 커밋 전략

각 Phase 완료 후 즉시 커밋:

- **RED Phase**: `feat: [RED] <scope> <테스트 이름>`
- **GREEN Phase**: `feat: [GREEN] <scope> <구현 내용>`
- **REFACTOR Phase**: `refactor: [REFACTOR] <scope> <리팩토링 내용>`

모든 커밋에 다음 푸터 포함:
```
🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## 중요 원칙

1. **엄격한 TDD**: RED → GREEN → REFACTOR 순서 준수
2. **커밋 검증**: 각 Phase 완료 후 [RED]/[GREEN]/[REFACTOR] 태그 커밋 확인
3. **게이트 조건**: 각 단계의 완료 조건 엄격히 확인
4. **에러 복구**: 실패 시 최대 3회 재시도, 이후 사용자 개입 요청
5. **진행 상황 추적**: Status 파일 실시간 업데이트

---

**초기화 완료**: 이 계획은 전체 TDD 사이클의 로드맵입니다. 각 사이클을 순서대로 진행하며, RED-GREEN-REFACTOR 방식을 엄격히 따릅니다.
