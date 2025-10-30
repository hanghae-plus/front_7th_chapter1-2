# Worklog

- 작성자: Refactoring Engineer
- 업무 지시 내용: 반복 일정 코드 리팩토링 (코드 스멜 제거, 가독성 및 유지보수성 개선)
- 참고자료: docs/worklog/worklog-implementation-engineer-v6.md, src/utils/recurringUtils.ts, src/hooks/useEventOperations.ts, src/App.tsx
- 산출물: src/utils/recurringUtils.ts (리팩토링 완료), src/hooks/useEventOperations.ts (리팩토링 완료), src/constants/index.ts (새로 생성), src/App.tsx (상수 적용)

# 업무 과정

## 1. 코드 스멜 진단

### 높은 우선순위 코드 스멜 발견

**recurringUtils.ts (467줄)**

- 중복 코드: generateRecurringDates와 expandRecurringEvents에서 건너뛰기 처리 로직이 3번 반복 (각 50줄씩, 총 150줄)
- 긴 함수: expandRecurringEvents (170줄)
- 영향: 코드 중복으로 인한 유지보수 어려움, 버그 발생 가능성 증가

**useEventOperations.ts (153줄)**

- 긴 함수: saveEvent (93줄) - repeatGroupId 처리 로직이 복잡 (45줄)
- 중복 코드: silent 옵션 체크가 여러 곳에 반복됨
- 영향: 복잡한 로직으로 인한 가독성 저하

**App.tsx (918줄)**

- 매직 문자열/숫자: 'daily', 'weekly', 'monthly', 'yearly', 1, 10, 60, 120, 1440 등
- 중복 코드: 반복 타입 레이블 변환 로직 (일/주/월/년)
- 영향: 유지보수 시 일관성 유지 어려움

## 2. 리팩토링 계획 수립

**Phase 1: recurringUtils.ts - 중복 코드 제거**

1. 건너뛰기 처리 로직을 `findNextValidDate` 함수로 추출
2. 추출한 함수를 세 곳에서 재사용

**Phase 2: useEventOperations.ts - 함수 분리**

1. repeatGroupId 처리 로직을 `updateRepeatGroupEvents` 함수로 추출
2. 에러 처리 로직을 `showSnackbar` 함수로 추출

**Phase 3: 상수 추출**

1. constants/index.ts 파일 생성
2. REPEAT_TYPE_LABELS, NOTIFICATION_OPTIONS, CATEGORIES, WEEK_DAYS 상수 정의
3. App.tsx와 recurringUtils.ts에서 상수 사용

## 3. 리팩토링 실행

### Phase 1-1: findNextValidDate 함수 추출 (recurringUtils.ts)

**변경 전**: 건너뛰기 처리 로직이 3곳에서 중복 (약 150줄)

**변경 후**:

```typescript
function findNextValidDate(
  currentDate: string,
  repeat: RepeatInfo,
  maxDate?: string
): string | null;
```

- 매월/매년 반복 시 건너뛴 날짜의 다음 유효한 날짜를 찾는 로직 통합
- maxDate 옵션으로 검색 범위 제한 가능
- 무한 루프 방지 (100년 제한)

**결과**:

- generateRecurringDates에서 사용 (약 50줄 → 5줄)
- expandRecurringEvents에서 두 곳에 사용 (각 50줄 → 5줄)
- 총 150줄 → 70줄 감소

**테스트**: ✅ 유닛 테스트 36개 통과, 통합 테스트 21개 통과

### Phase 2-1: updateRepeatGroupEvents 함수 추출 (useEventOperations.ts)

**변경 전**: saveEvent 함수 안에 45줄의 repeatGroupId 처리 로직

**변경 후**:

```typescript
async function updateRepeatGroupEvents(eventData: Event, events: Event[]): Promise<void>;
```

- 반복 일정 그룹의 모든 이벤트 업데이트 로직 분리
- 요일 차이 계산 및 날짜 조정 로직 포함

**결과**: saveEvent 함수 내 45줄 → 3줄로 단순화

### Phase 2-2: showSnackbar 함수 추출 (useEventOperations.ts)

**변경 전**: silent 체크와 스낵바 표시 로직이 여러 곳에 반복

**변경 후**:

```typescript
function showSnackbar(
  enqueue: ReturnType<typeof useSnackbar>['enqueueSnackbar'],
  message: string,
  variant: 'success' | 'info' | 'error',
  silent?: boolean
);
```

**결과**:

- saveEvent의 에러 처리 코드 10줄 → 2줄
- deleteEvent의 에러 처리 코드 10줄 → 2줄

**테스트**: ✅ 유닛 테스트 7개 통과, 통합 테스트 21개 통과

### Phase 3: 상수 추출

**새로 생성**: `src/constants/index.ts`

```typescript
export const REPEAT_TYPE_LABELS = {
  daily: '일',
  weekly: '주',
  monthly: '월',
  yearly: '년',
} as const;

export const NOTIFICATION_OPTIONS = [
  { value: 1, label: '1분 전' },
  { value: 10, label: '10분 전' },
  { value: 60, label: '1시간 전' },
  { value: 120, label: '2시간 전' },
  { value: 1440, label: '1일 전' },
] as const;

export const CATEGORIES = ['업무', '개인', '가족', '기타'] as const;
export const WEEK_DAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;
```

**적용**:

- App.tsx: categories, weekDays, notificationOptions → 상수 사용
- recurringUtils.ts: getRepeatText 함수에서 REPEAT_TYPE_LABELS 사용

**결과**: 매직 문자열/숫자 제거, 재사용성 향상

**테스트**: ✅ 전체 테스트 172개 통과

## 4. 최종 검증

**코드 크기 개선**:

- recurringUtils.ts: 467줄 → 약 400줄 (67줄 감소)
- useEventOperations.ts: 153줄 → 약 145줄 (8줄 감소)
- constants/index.ts: 31줄 (새로 생성)

**코드 품질 개선**:

- 중복 코드 약 150줄 제거
- 함수 책임 분리로 가독성 향상
- 상수 추출로 유지보수성 향상
- 테스트 커버리지 유지 (172개 테스트 모두 통과)

## 5. Lint 및 타입 검사

```bash
$ npm run lint
✅ ESLint 통과 (1개 경고 - 반복 일정 기능과 무관)
✅ TypeScript 타입 검사 통과
```

# 참고 파일

- docs/worklog/worklog-implementation-engineer-v6.md (이전 작업)
- src/utils/recurringUtils.ts (리팩토링 대상)
- src/hooks/useEventOperations.ts (리팩토링 대상)
- src/App.tsx (상수 적용)
- src/**tests**/recurring-events.integration.spec.tsx (테스트)
- src/**tests**/unit/recurringUtils.spec.ts (테스트)
- src/**tests**/hooks/medium.useEventOperations.spec.ts (테스트)

# 다음 작업자에게 남기는 코멘트

리팩토링이 성공적으로 완료되었습니다!

## 주요 개선 사항

1. **중복 코드 제거**: 약 150줄의 중복된 건너뛰기 처리 로직을 `findNextValidDate` 함수로 통합
2. **함수 책임 분리**: `updateRepeatGroupEvents`, `showSnackbar` 함수 추출로 가독성 향상
3. **상수 추출**: 매직 문자열/숫자를 상수로 추출하여 유지보수성 향상

## 테스트 결과

- ✅ 전체 테스트: 172개 모두 통과
- ✅ Lint: 통과
- ✅ 타입 검사: 통과
- ✅ 기능 변경 없음: 모든 테스트 GREEN 유지

## 리팩토링 이점

1. **유지보수성**: 중복 코드 제거로 버그 수정 시 한 곳만 수정하면 됨
2. **가독성**: 함수 분리로 각 함수의 책임이 명확해짐
3. **재사용성**: 추출된 함수들은 다른 곳에서도 활용 가능
4. **일관성**: 상수를 사용하여 코드 전체에서 일관된 값 사용

안심하고 다음 작업을 진행하세요!
