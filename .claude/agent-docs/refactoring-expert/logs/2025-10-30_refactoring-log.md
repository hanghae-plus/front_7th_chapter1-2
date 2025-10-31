# Refactoring Log (REFACTOR Phase)

**작성일**: 2025-10-30  
**Phase**: 5/6 - REFACTOR (Code Quality)  
**기능**: 반복 일정 수정 (단일/전체 수정 선택)  
**이전 상태**: Phase 4 GREEN 완료 (8/8 테스트 통과)

**분석 대상 파일**:

- `/src/App.tsx` (879줄)
- `/src/hooks/useEventOperations.ts` (182줄)
- `/src/__tests__/integration/task.recurring-edit.spec.tsx` (384줄)

---

## 요약 (Executive Summary)

### 전체 품질 평가

Phase 4에서 구현된 코드는 **기능적으로 완벽하게 동작**하며 모든 테스트를 통과하고 있습니다. 전반적인 코드 품질은 **양호(Good)** 수준이나, 다음 영역에서 개선 여지가 있습니다:

- **App.tsx 크기**: 879줄 (권장: 500줄 이하)
- **중복 코드**: 일정 렌더링 로직이 Week/Month 뷰에 중복됨
- **Material-UI 경고**: RepeatType Select에서 'none' 값 처리 문제
- **매직 문자열/넘버**: 메시지 및 설정 값이 하드코딩됨
- **함수 복잡도**: `addOrUpdateEvent` 함수가 79줄로 너무 김

### 최우선 3가지 개선 사항

1. **중복 코드 제거**: Week/Month 뷰의 일정 카드 렌더링 로직을 재사용 가능한 컴포넌트로 추출
2. **Material-UI Select 경고 해결**: RepeatType Select에서 'none' 값 처리 개선
3. **함수 분해**: `addOrUpdateEvent` 함수를 유효성 검사, 저장 로직으로 분리

### 주요 지표

| 항목            | 현재 상태         | 개선 목표  |
| --------------- | ----------------- | ---------- |
| 테스트 통과율   | 100% (8/8)        | 100% 유지  |
| App.tsx 줄 수   | 879줄             | 600줄 이하 |
| 중복 코드       | Week/Month 뷰 2회 | 0회        |
| MUI 경고        | 약 30개 발생      | 0개        |
| 매직 문자열     | 15+               | 0          |
| 함수 최대 길이  | 79줄              | 30줄 이하  |
| TypeScript 에러 | 0                 | 0 유지     |
| ESLint 에러     | 0                 | 0 유지     |

---

## 2. 개선 사항 상세

### 2.1 DRY 원칙 적용

#### 개선 1: 다이얼로그 구조 분석

**문제점**: App.tsx에 3개의 다이얼로그(일정 겹침, 반복 수정, 반복 삭제)가 유사한 패턴으로 구현되어 있으나, 각각의 동작이 충분히 달라 무리한 추상화는 오히려 복잡도를 증가시킬 수 있음

**영향**: 현재 구조는 각 다이얼로그의 고유한 로직을 명확하게 표현하고 있어, 과도한 추상화는 불필요

**우선순위**: 낮음 (현재 구조 유지 권장)

**현재 코드**: (변경 불필요)

```typescript
// 각 다이얼로그가 명확한 목적과 다른 액션을 가지고 있음
<Dialog open={isOverlapDialogOpen} ...>         // 겹침 경고 + 진행 확인
<Dialog open={isRecurringEditDialogOpen} ...>   // 단일/전체 선택
<Dialog open={isRecurringDeleteDialogOpen} ...> // 전체 삭제 확인
```

**설명**: 각 다이얼로그는 고유한 상태, 메시지, 액션을 가지고 있어 현재 구조가 적절합니다.

**테스트 고려사항**: 변경 없음

---

#### 개선 2: 반복 타입 라벨 로직 중복

**문제점**: App.tsx 라인 720-726에서 반복 타입을 한글로 표시하는 조건문이 인라인으로 작성됨

**영향**: 동일한 로직이 다른 곳에서 필요할 경우 중복 발생 가능

**우선순위**: 중간

**현재 코드**:

```typescript
{
  event.repeat.type !== 'none' && (
    <Typography>
      반복: {event.repeat.interval}
      {event.repeat.type === 'daily' && '일'}
      {event.repeat.type === 'weekly' && '주'}
      {event.repeat.type === 'monthly' && '월'}
      {event.repeat.type === 'yearly' && '년'}
      마다
      {event.repeat.endDate && ` (종료: ${event.repeat.endDate})`}
    </Typography>
  );
}
```

**리팩토링된 코드**:

```typescript
// src/utils/repeatUtils.ts에 이미 존재하는 함수 활용
import { formatRepeatInfo } from './utils/repeatUtils';

// App.tsx에서 사용
{
  event.repeat.type !== 'none' && <Typography>반복: {formatRepeatInfo(event.repeat)}</Typography>;
}
```

**설명**: `formatRepeatInfo` 함수가 이미 존재하나 활용되지 않고 있습니다. 이 함수를 사용하면 코드 중복을 제거하고 일관성을 확보할 수 있습니다.

**테스트 고려사항**:

- 기존 테스트가 텍스트 내용을 검증하지 않으므로 영향 없음
- formatRepeatInfo의 기존 테스트가 있는지 확인 필요

---

### 2.2 React 성능 최적화

#### 개선 1: App 컴포넌트 크기 및 리렌더링

**문제점**: App.tsx가 879줄로 크고 많은 상태를 관리하고 있으나, 각 하위 섹션(폼, 캘린더, 이벤트 리스트)은 이미 적절히 분리되어 있음

**영향**: 현재 구조에서 불필요한 리렌더링은 발생하지 않으며, 컴포넌트 분리는 CLAUDE.md의 지침에 따라 명시적 요청 시에만 진행

**우선순위**: 낮음 (현재 유지)

**설명**:

- 폼 상태는 useEventForm 훅으로 분리됨
- API 로직은 useEventOperations 훅으로 분리됨
- 캘린더 뷰는 renderWeekView/renderMonthView로 함수 분리됨
- 현재 구조는 프로젝트 아키텍처 원칙을 잘 따르고 있음

**테스트 고려사항**: 변경 없음

---

#### 개선 2: 이벤트 카드 렌더링

**문제점**: filteredEvents.map에서 반복 렌더링되는 이벤트 카드가 순수 컴포넌트로 분리되지 않음

**영향**: 부모 리렌더 시 모든 이벤트 카드가 재렌더링될 가능성이 있으나, 실제 성능 문제는 측정되지 않음

**우선순위**: 낮음 (성급한 최적화 방지)

**현재 코드**: (변경 보류)

```typescript
{
  filteredEvents.map((event) => (
    <Box key={event.id} sx={{ border: 1, borderRadius: 2, p: 3, width: '100%' }}>
      {/* 이벤트 카드 UI */}
    </Box>
  ));
}
```

**설명**:

- 이벤트 목록이 대량이 아니므로 현재 성능은 충분
- React.memo 적용은 실제 성능 문제가 측정된 후 진행 권장
- 컴포넌트 분리는 사용자 요청 시 진행

**테스트 고려사항**: 변경 없음

---

### 2.3 타입 안전성 강화

#### 개선 1: RepeatType Select의 MUI 경고

**문제점**: RepeatType Select에서 'none' 값이 option에 없어 MUI 경고 발생

**영향**: 기능적 문제는 없으나 콘솔에 경고가 출력되어 개발 경험 저하

**우선순위**: 높음

**현재 코드**:

```typescript
<Select
  id="repeat-type"
  size="small"
  value={repeatType}
  onChange={(e) => setRepeatType(e.target.value as RepeatType)}
  aria-label="반복 유형"
  data-testid="repeat-type-select"
>
  <MenuItem value="daily" aria-label="매일-option">
    매일
  </MenuItem>
  <MenuItem value="weekly" aria-label="매주-option">
    매주
  </MenuItem>
  <MenuItem value="monthly" aria-label="매월-option">
    매월
  </MenuItem>
  <MenuItem value="yearly" aria-label="매년-option">
    매년
  </MenuItem>
</Select>
```

**리팩토링된 코드**:

```typescript
<Select
  id="repeat-type"
  size="small"
  value={repeatType === 'none' ? 'daily' : repeatType}
  onChange={(e) => setRepeatType(e.target.value as RepeatType)}
  aria-label="반복 유형"
  data-testid="repeat-type-select"
>
  <MenuItem value="daily" aria-label="매일-option">
    매일
  </MenuItem>
  <MenuItem value="weekly" aria-label="매주-option">
    매주
  </MenuItem>
  <MenuItem value="monthly" aria-label="매월-option">
    매월
  </MenuItem>
  <MenuItem value="yearly" aria-label="매년-option">
    매년
  </MenuItem>
</Select>
```

**설명**:

- 반복 설정이 활성화된 경우에만 이 Select가 표시되므로, repeatType이 'none'일 경우 'daily'로 기본값 설정
- 또는 MenuItem에 'none' 옵션 추가 고려 가능

**테스트 고려사항**:

- 기존 테스트는 통과 유지
- MUI 경고 해결 확인

---

#### 개선 2: 테스트 파일의 any 타입 사용

**문제점**: 테스트 파일(task.repeat-event-integration.spec.ts, task.useEventOperations.spec.ts)에서 any 타입이 11개 사용됨

**영향**: 테스트 코드의 타입 안전성 저하

**우선순위**: 중간

**현재 코드**:

```typescript
// task.useEventOperations.spec.ts:55
let actualRequest: any = null;

// task.repeat-event-integration.spec.ts:51
let requestBody: any = null;
```

**리팩토링된 코드**:

```typescript
// 적절한 타입 정의
interface CreateEventRequest {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  location: string;
  category: string;
  repeat: RepeatInfo;
  notificationTime: number;
}

let actualRequest: CreateEventRequest | null = null;
let requestBody: Partial<CreateEventRequest> | null = null;
```

**설명**:

- HTTP 요청/응답 타입을 명확히 정의
- unknown 타입 사용 후 타입 가드 적용도 고려 가능

**테스트 고려사항**:

- ESLint 에러 해결
- 테스트 동작은 변경 없음

---

### 2.4 코드 가독성 향상

#### 개선 1: 매직 문자열 상수화

**문제점**: 에러 메시지, 성공 메시지가 하드코딩됨

**영향**: 메시지 변경 시 여러 곳 수정 필요, 일관성 관리 어려움

**우선순위**: 중간

**현재 코드**:

```typescript
enqueueSnackbar('필수 정보를 모두 입력해주세요.', { variant: 'error' });
enqueueSnackbar('반복 간격은 1 이상이어야 합니다.', { variant: 'error' });
enqueueSnackbar('반복 종료일은 시작일 이후여야 합니다.', { variant: 'error' });
enqueueSnackbar('반복 종료일은 2025-12-31까지만 가능합니다.', { variant: 'error' });
```

**리팩토링된 코드**:

```typescript
// src/constants/messages.ts (새 파일)
export const VALIDATION_MESSAGES = {
  REQUIRED_FIELDS_MISSING: '필수 정보를 모두 입력해주세요.',
  INVALID_TIME_RANGE: '시간 설정을 확인해주세요.',
  REPEAT_INTERVAL_MIN: '반복 간격은 1 이상이어야 합니다.',
  REPEAT_END_DATE_BEFORE_START: '반복 종료일은 시작일 이후여야 합니다.',
  REPEAT_END_DATE_MAX: '반복 종료일은 2025-12-31까지만 가능합니다.',
} as const;

export const SUCCESS_MESSAGES = {
  EVENT_CREATED: '일정이 추가되었습니다.',
  EVENT_UPDATED: '일정이 수정되었습니다.',
  EVENT_DELETED: '일정이 삭제되었습니다.',
  RECURRING_SERIES_UPDATED: '반복 일정 시리즈가 수정되었습니다.',
  RECURRING_SERIES_DELETED: '반복 일정 시리즈가 삭제되었습니다.',
} as const;

// 사용
import { VALIDATION_MESSAGES } from './constants/messages';
enqueueSnackbar(VALIDATION_MESSAGES.REQUIRED_FIELDS_MISSING, { variant: 'error' });
```

**설명**:

- 메시지를 한 곳에서 관리하여 일관성 확보
- i18n 전환 시에도 용이
- as const로 타입 안전성 확보

**테스트 고려사항**:

- 테스트는 메시지 내용을 검증하므로 import 경로 업데이트 필요
- 메시지 내용은 동일하게 유지

---

#### 개선 2: 매직 넘버 상수화

**문제점**: 반복 종료일 최대값 '2025-12-31'이 하드코딩됨

**영향**: 연도 변경 시 여러 곳 수정 필요

**우선순위**: 높음

**현재 코드**:

```typescript
if (repeatEndDate && new Date(repeatEndDate) > new Date('2025-12-31')) {
  enqueueSnackbar('반복 종료일은 2025-12-31까지만 가능합니다.', { variant: 'error' });
  return;
}
```

**리팩토링된 코드**:

```typescript
// src/constants/eventConfig.ts (새 파일)
export const EVENT_CONFIG = {
  REPEAT_END_DATE_MAX: '2025-12-31',
  DEFAULT_NOTIFICATION_TIME: 10,
  DEFAULT_REPEAT_INTERVAL: 1,
} as const;

// 사용
import { EVENT_CONFIG } from './constants/eventConfig';
if (repeatEndDate && new Date(repeatEndDate) > new Date(EVENT_CONFIG.REPEAT_END_DATE_MAX)) {
  enqueueSnackbar(`반복 종료일은 ${EVENT_CONFIG.REPEAT_END_DATE_MAX}까지만 가능합니다.`, {
    variant: 'error',
  });
  return;
}
```

**설명**:

- 설정 값을 한 곳에서 관리
- 메시지에서도 동적으로 참조하여 일관성 유지

**테스트 고려사항**:

- 테스트는 날짜 값을 검증하지 않으므로 영향 없음

---

#### 개선 3: 복잡한 조건문 분리

**문제점**: addOrUpdateEvent 함수의 유효성 검사 로직이 긴 조건문으로 나열됨

**영향**: 가독성 저하, 재사용 어려움

**우선순위**: 중간

**현재 코드**:

```typescript
const addOrUpdateEvent = async () => {
  if (!title || !date || !startTime || !endTime) {
    enqueueSnackbar('필수 정보를 모두 입력해주세요.', { variant: 'error' });
    return;
  }

  if (startTimeError || endTimeError) {
    enqueueSnackbar('시간 설정을 확인해주세요.', { variant: 'error' });
    return;
  }

  if (isRepeating) {
    if (repeatInterval < 1) {
      enqueueSnackbar('반복 간격은 1 이상이어야 합니다.', { variant: 'error' });
      return;
    }

    if (repeatEndDate && new Date(repeatEndDate) < new Date(date)) {
      enqueueSnackbar('반복 종료일은 시작일 이후여야 합니다.', { variant: 'error' });
      return;
    }

    if (repeatEndDate && new Date(repeatEndDate) > new Date('2025-12-31')) {
      enqueueSnackbar('반복 종료일은 2025-12-31까지만 가능합니다.', { variant: 'error' });
      return;
    }
  }
  // ...
};
```

**리팩토링된 코드**:

```typescript
// src/utils/eventValidation.ts (새 파일)
import { VALIDATION_MESSAGES } from '../constants/messages';
import { EVENT_CONFIG } from '../constants/eventConfig';

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateEventForm(
  title: string,
  date: string,
  startTime: string,
  endTime: string,
  startTimeError: string | null,
  endTimeError: string | null
): ValidationResult {
  if (!title || !date || !startTime || !endTime) {
    return { isValid: false, error: VALIDATION_MESSAGES.REQUIRED_FIELDS_MISSING };
  }

  if (startTimeError || endTimeError) {
    return { isValid: false, error: VALIDATION_MESSAGES.INVALID_TIME_RANGE };
  }

  return { isValid: true };
}

export function validateRepeatConfig(
  repeatInterval: number,
  repeatEndDate: string | undefined,
  date: string
): ValidationResult {
  if (repeatInterval < 1) {
    return { isValid: false, error: VALIDATION_MESSAGES.REPEAT_INTERVAL_MIN };
  }

  if (repeatEndDate && new Date(repeatEndDate) < new Date(date)) {
    return { isValid: false, error: VALIDATION_MESSAGES.REPEAT_END_DATE_BEFORE_START };
  }

  if (repeatEndDate && new Date(repeatEndDate) > new Date(EVENT_CONFIG.REPEAT_END_DATE_MAX)) {
    return { isValid: false, error: VALIDATION_MESSAGES.REPEAT_END_DATE_MAX };
  }

  return { isValid: true };
}

// App.tsx에서 사용
import { validateEventForm, validateRepeatConfig } from './utils/eventValidation';

const addOrUpdateEvent = async () => {
  const formValidation = validateEventForm(
    title,
    date,
    startTime,
    endTime,
    startTimeError,
    endTimeError
  );
  if (!formValidation.isValid) {
    enqueueSnackbar(formValidation.error!, { variant: 'error' });
    return;
  }

  if (isRepeating) {
    const repeatValidation = validateRepeatConfig(repeatInterval, repeatEndDate, date);
    if (!repeatValidation.isValid) {
      enqueueSnackbar(repeatValidation.error!, { variant: 'error' });
      return;
    }
  }

  // ...
};
```

**설명**:

- 유효성 검사 로직을 순수 함수로 분리
- 단위 테스트 작성 용이
- 다른 곳에서 재사용 가능

**테스트 고려사항**:

- 기존 통합 테스트는 통과 유지
- 새로운 유틸 함수에 대한 단위 테스트 추가 권장

---

#### 개선 4: 긴 함수 분해

**문제점**: handleEditSingleOccurrence 함수가 인라인 fetch 로직과 에러 처리를 모두 포함

**영향**: 유지보수 어려움, useEventOperations와 책임 중복

**우선순위**: 높음

**현재 코드**:

```typescript
const handleEditSingleOccurrence = async () => {
  if (!selectedRecurringEvent) {
    enqueueSnackbar('선택된 일정이 없습니다.', { variant: 'error' });
    return;
  }

  try {
    const updatedEvent: Event = {
      ...selectedRecurringEvent,
      repeat: {
        type: 'none',
        interval: 1,
        id: undefined,
        endDate: undefined,
      },
    };

    const response = await fetch(`/api/events/${updatedEvent.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedEvent),
    });

    if (!response.ok) {
      throw new Error('Failed to update single event');
    }

    await fetchEvents();
    setIsRecurringEditDialogOpen(false);
    setSelectedRecurringEvent(null);

    enqueueSnackbar('일정이 수정되었습니다.', { variant: 'success' });
  } catch (error) {
    console.error('Error updating single occurrence:', error);
    enqueueSnackbar('일정 수정 실패', { variant: 'error' });
  }
};
```

**리팩토링된 코드**:

```typescript
// useEventOperations.ts에 추가
export const convertToSingleEvent = async (event: Event): Promise<void> => {
  try {
    const updatedEvent: Event = {
      ...event,
      repeat: {
        type: 'none',
        interval: 1,
        id: undefined,
        endDate: undefined,
      },
    };

    const response = await fetch(`/api/events/${updatedEvent.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedEvent),
    });

    if (!response.ok) {
      throw new Error('Failed to convert to single event');
    }

    await fetchEvents();
    enqueueSnackbar('일정이 수정되었습니다.', { variant: 'success' });
  } catch (error) {
    console.error('Error converting to single event:', error);
    enqueueSnackbar('일정 수정 실패', { variant: 'error' });
    throw error;
  }
};

// App.tsx에서 사용
const { convertToSingleEvent } = useEventOperations(...);

const handleEditSingleOccurrence = async () => {
  if (!selectedRecurringEvent) {
    enqueueSnackbar('선택된 일정이 없습니다.', { variant: 'error' });
    return;
  }

  try {
    await convertToSingleEvent(selectedRecurringEvent);
    setIsRecurringEditDialogOpen(false);
    setSelectedRecurringEvent(null);
  } catch (error) {
    // 에러는 이미 useEventOperations에서 처리됨
  }
};
```

**설명**:

- API 로직을 useEventOperations로 이동하여 책임 분리
- App.tsx는 UI 상태 관리에만 집중
- 에러 처리 일관성 확보

**테스트 고려사항**:

- 기존 통합 테스트는 통과 유지
- useEventOperations 단위 테스트 추가 권장

---

### 2.5 디자인 패턴 적용

#### 개선 1: 관심사 분리 (SoC)

**문제점**: App.tsx가 UI 렌더링, 상태 관리, 다이얼로그 로직을 모두 담당

**영향**: 현재는 적절하게 분리되어 있으나, 향후 확장 시 복잡도 증가 가능

**우선순위**: 낮음 (현재 유지)

**설명**:

- useEventForm: 폼 상태 관리 ✅
- useEventOperations: API 통신 ✅
- useCalendarView: 달력 뷰 상태 ✅
- useNotifications: 알림 관리 ✅
- useSearch: 검색 필터링 ✅
- 현재 아키텍처는 관심사가 잘 분리되어 있음

**테스트 고려사항**: 변경 없음

---

#### 개선 2: 전략 패턴 (선택적)

**문제점**: repeatUtils.ts에 반복 타입별 로직이 조건문으로 분산

**영향**: 현재 코드는 명확하고 이해하기 쉬우므로 변경 불필요

**우선순위**: 낮음 (과도한 추상화 방지)

**설명**:

- 현재 구조가 충분히 명확하고 유지보수 가능
- 전략 패턴 적용은 복잡도만 증가시킬 가능성

**테스트 고려사항**: 변경 없음

---

## 3. 구현 로드맵

### 단계 1: 타입 안전성 강화 (가장 안전)

**예상 작업량**: 1-2시간

1. RepeatType Select MUI 경고 해결

   - App.tsx 라인 574 수정
   - 테스트 실행 확인

2. 테스트 파일 any 타입 제거
   - HTTP 요청/응답 타입 정의
   - task.useEventOperations.spec.ts 수정
   - task.repeat-event-integration.spec.ts 수정
   - ESLint 통과 확인

**의존성**: 없음
**위험도**: 낮음

---

### 단계 2: 매직 문자열/넘버 상수화

**예상 작업량**: 2-3시간

1. constants 디렉토리 생성

   - `src/constants/messages.ts` 작성
   - `src/constants/eventConfig.ts` 작성

2. App.tsx 리팩터링

   - 메시지 상수 import 및 교체
   - 설정 값 상수 import 및 교체
   - 테스트 실행 확인

3. useEventOperations.ts 리팩터링
   - 메시지 상수 교체
   - 테스트 실행 확인

**의존성**: 없음
**위험도**: 낮음

---

### 단계 3: 유효성 검사 로직 분리

**예상 작업량**: 2-3시간

1. eventValidation.ts 유틸 작성

   - validateEventForm 함수
   - validateRepeatConfig 함수
   - 단위 테스트 작성

2. App.tsx에 적용
   - addOrUpdateEvent 함수 리팩터링
   - 통합 테스트 실행 확인

**의존성**: 단계 2 (상수 사용)
**위험도**: 중간

---

### 단계 4: API 로직 통합

**예상 작업량**: 1-2시간

1. useEventOperations에 convertToSingleEvent 추가

   - 함수 구현
   - 에러 처리 통합

2. App.tsx 리팩터링
   - handleEditSingleOccurrence 간소화
   - 테스트 실행 확인

**의존성**: 없음
**위험도**: 중간

---

### 단계 5: formatRepeatInfo 활용

**예상 작업량**: 30분

1. App.tsx 라인 718-727 리팩터링
   - formatRepeatInfo 함수 import
   - 조건문 교체
   - 테스트 실행 확인

**의존성**: 없음
**위험도**: 낮음

---

### 변경 간 의존성

```
단계 1 (타입 안전성) → 단계 2 (상수화) → 단계 3 (유효성 검사)
                                         ↓
단계 4 (API 로직)   →   단계 5 (formatRepeatInfo)
```

---

## 4. 문서 개선 사항

### 복잡한 로직 주석 추가

1. **useEventOperations.ts**:

   - updateRecurringSeries 함수에 "반복 시리즈 전체를 수정하는 함수" 주석 추가
   - deleteRecurringSeries 함수에 404 처리 로직 설명 추가

2. **App.tsx**:
   - isEditingRecurringSeries 상태 변수에 "전체 시리즈 수정 모드 플래그" 주석 추가
   - handleEditSingleOccurrence와 handleEditAllOccurrences의 차이점 주석 추가

### 타입 문서화

1. **types.ts**:
   - UpdateRecurringSeriesRequest 인터페이스에 JSDoc 주석 추가
   - 각 필드가 optional인 이유 설명

### 아키텍처 결정 사항 문서화

1. **ARCHITECTURE.md** (새 파일 제안):

   ```markdown
   # 아키텍처 결정 기록 (ADR)

   ## ADR-001: 반복 일정 수정 방식

   ### 컨텍스트

   사용자가 반복 일정을 수정할 때, 단일 일정만 수정할지 전체 시리즈를 수정할지 선택해야 함.

   ### 결정

   - 다이얼로그를 통해 사용자에게 선택 제공
   - "예" 선택 시: 해당 일정을 단일 일정(repeat.type='none')으로 변환
   - "아니오" 선택 시: 전체 시리즈를 수정할 수 있도록 폼 로드

   ### 결과

   - 사용자 친화적인 UX
   - 데이터 무결성 보장
   - API 설계: PUT /api/recurring-events/:repeatId
   ```

---

## 5. 테스트 결과

### 리팩터링 전 결과

```bash
✓ 8 passed (8)
- 반복 일정 수정 시 다이얼로그를 표시해야 함
- 단일 일정 수정 시 다이얼로그가 표시되지 않아야 함
- 예 버튼 클릭 시 단일 일정으로 수정되어야 함
- 아니오 버튼 클릭 시 폼에 데이터가 로드되어야 함
- 전체 시리즈 수정 후 모든 일정이 업데이트되어야 함
- 취소 버튼 클릭 시 다이얼로그만 닫혀야 함
- 단일 수정 API 실패 시 에러 메시지를 표시해야 함
- 반복 시리즈가 존재하지 않으면 404 에러를 처리해야 함
```

**TypeScript**: ✅ 에러 없음
**ESLint**: ⚠️ 11개 에러 (테스트 파일 any 타입)

### 현재 상태 (2025-10-30)

```bash
✓ 8 passed (8) - 모든 테스트 통과
```

**TypeScript**: ✅ 컴파일 성공 (에러 없음)
**ESLint**: ⚠️ 11개 에러 발견

- `task.useEventOperations.spec.ts`: 2개 (any 타입)
- `task.repeat-event-integration.spec.ts`: 9개 (any 타입 5개, unused vars 4개)
- `useNotifications.ts`: 1개 경고 (react-hooks/exhaustive-deps)

**MUI 경고**: ⚠️ 약 30개 발생 (RepeatType Select 'none' 값)

### 리팩터링 후 목표

**TypeScript**: ✅ 에러 없음 유지
**ESLint**: ✅ 에러 0개 (any 타입 제거, unused vars 제거)
**MUI 경고**: ✅ 0개 (Select 값 처리 개선)

---

## 6. 성능 영향 분석

### 렌더 성능

**현재**:

- 불필요한 리렌더링 없음 (커스텀 훅으로 분리됨)
- 이벤트 목록이 대량이 아니므로 성능 문제 없음

**리팩터링 후**:

- 영향 없음 (성능 최적화 적용 보류)

### 번들 크기

**현재**: 측정 안 됨

**리팩터링 후**:

- constants 파일 추가로 ~1KB 증가 예상 (무시할 수준)
- eventValidation.ts 추가로 ~2KB 증가 예상

### 컴파일 시간

**현재**: 정상

**리팩터링 후**:

- 타입 정의 증가로 미세한 증가 가능 (1초 이내)

---

## 7. 남은 기술 부채

### 해결하지 못한 사항

1. **App.tsx 크기 (879줄)**:

   - 컴포넌트 분리는 명시적 요청 시에만 진행
   - 현재 구조는 적절하게 유지됨

2. **useNotifications 훅의 useEffect 의존성 경고**:

   - react-hooks/exhaustive-deps 경고 존재
   - 별도 이슈로 처리 권장

3. **테스트 커버리지**:
   - eventValidation.ts 유틸에 대한 단위 테스트 부재
   - 단계 3 구현 시 추가 필요

### 후속 작업 제안

1. **컴포넌트 분리 (선택적)**:

   - EventCard 컴포넌트 추출
   - EventFormSection 컴포넌트 추출
   - CalendarViewSection 컴포넌트 추출
   - **조건**: 사용자 명시적 요청 시

2. **성능 최적화 (측정 후)**:

   - React.memo 적용
   - useMemo/useCallback 추가
   - **조건**: 실제 성능 문제 측정 후

3. **i18n 지원**:

   - 메시지 상수를 다국어 지원 구조로 변경
   - **조건**: 다국어 요구사항 발생 시

4. **E2E 테스트 추가**:
   - Playwright로 실제 사용자 시나리오 테스트
   - **조건**: CI/CD 파이프라인 구축 시

---

## 8. 결론

### 현재 코드 품질 평가

Phase 4에서 구현된 반복 일정 수정 기능은 **기능적으로 완벽하게 동작**하며, 모든 요구사항을 충족합니다. 다만 다음 영역에서 개선이 필요합니다:

**강점**:

- ✅ 모든 테스트 통과 (8/8, 100%)
- ✅ TypeScript 컴파일 성공
- ✅ 명확한 비즈니스 로직 흐름
- ✅ 커스텀 훅으로 관심사 분리

**개선 필요**:

- ⚠️ ESLint 에러 11개 (테스트 파일 any 타입)
- ⚠️ MUI Select 경고 약 30개
- ⚠️ 중복 코드 (Week/Month 뷰 렌더링)
- ⚠️ 긴 함수 (`addOrUpdateEvent` 79줄)
- ⚠️ 매직 문자열/넘버 다수 존재

### 리팩터링 권장사항 요약

#### 즉시 적용 권장 (Phase 1)

1. **Material-UI Select 경고 해결**: `repeatType` 값 처리 개선
2. **ESLint 에러 해결**: 테스트 파일 any 타입 제거
3. **매직 넘버 상수화**: REPEAT_END_DATE_MAX 추출

**예상 작업량**: 1~2시간
**위험도**: 낮음
**영향**: Console 깨끗해짐, 코드 품질 향상

#### 점진적 적용 권장 (Phase 2~3)

1. **EventCard 컴포넌트 추출**: 중복 제거
2. **유효성 검사 로직 분리**: 순수 함수화
3. **메시지 상수화**: i18n 대비
4. **API 로직 통합**: `convertToSingleEvent` 함수 추출

**예상 작업량**: 4~6시간
**위험도**: 중간
**영향**: 유지보수성, 테스트 가능성 대폭 향상

#### 선택적 적용 (Phase 4)

1. **성능 최적화**: React.memo, useMemo 적용
2. **컴포넌트 분리**: App.tsx 크기 감소

**예상 작업량**: 2~3시간
**위험도**: 낮음
**영향**: 일정 수 증가 시 성능 개선

### 품질 지표 비교

| 항목           | 현재 (Before) | 개선 목표 (After) |
| -------------- | ------------- | ----------------- |
| 테스트 통과    | 8/8 (100%)    | 8/8 유지          |
| TypeScript     | ✅ 0 에러     | ✅ 0 유지         |
| ESLint         | ⚠️ 11 에러    | ✅ 0              |
| MUI 경고       | ⚠️ 약 30개    | ✅ 0              |
| 중복 코드      | 2곳           | 0곳               |
| 최대 함수 길이 | 79줄          | 30줄 이하         |
| 매직 문자열    | 15+           | 0                 |
| App.tsx 크기   | 879줄         | 600줄 이하        |

### 최종 권고

**이 리팩터링 보고서는 분석 자료입니다. 실제 코드 수정은 진행하지 않았습니다.**

리팩터링 적용 여부는 다음 기준으로 판단하시기 바랍니다:

1. **프로젝트 일정**: 여유가 있다면 Phase 1~2 적용 권장
2. **팀 합의**: 리팩터링 우선순위에 대한 팀 토론 필요
3. **비즈니스 요구사항**: 새로운 기능 개발이 우선이면 Phase 1만 적용

**권장 접근 방식**:

- Phase 1 (긴급 수정)을 먼저 적용해 Console 경고 제거
- Phase 2~3는 별도 브랜치에서 점진적으로 진행
- 각 단계마다 테스트 통과 확인 필수
- Phase 4는 실제 성능 문제 측정 후 적용

---

**작성자**: Refactoring Expert Agent
**작성일**: 2025-10-30
**보고서 버전**: 1.0
**다음 단계**: 팀 검토 및 리팩터링 적용 여부 결정

---

## 부록: 리팩터링 체크리스트

개선사항을 적용할 때 다음 체크리스트를 사용하세요:

### 적용 전 체크리스트

- [ ] 현재 브랜치가 최신 상태인가?
- [ ] 모든 테스트가 통과하는가?
- [ ] 변경사항을 되돌릴 수 있는가? (Git stash/branch)

### 적용 중 체크리스트

- [ ] 한 번에 하나의 개선사항만 적용하는가?
- [ ] 각 변경 후 테스트를 실행했는가?
- [ ] TypeScript 컴파일이 성공하는가?
- [ ] ESLint가 통과하는가?

### 적용 후 체크리스트

- [ ] 모든 테스트가 통과하는가? (8/8)
- [ ] 기능 동작에 변화가 없는가?
- [ ] Console 경고가 해결되었는가?
- [ ] 코드 리뷰를 요청했는가?

---

**문의사항**: Refactoring Expert Agent에게 질문하세요.
