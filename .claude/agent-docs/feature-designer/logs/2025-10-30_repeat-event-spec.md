# 기술 명세서: 반복 일정 기능

**작성일**: 2025-10-30
**작성자**: feature-designer agent
**버전**: 1.0.0
**Phase**: Phase 1 - Feature Design

---

## 1. 요구사항 요약

### 1.1 기능 요구사항 (사용자 관점)

**핵심 기능**:
- 사용자는 일정 생성 시 반복 유형을 선택할 수 있다 (없음/매일/매주/매월/매년)
- 반복 간격(interval)과 종료일(endDate)을 설정할 수 있다
- 반복 일정 시리즈를 전체 수정하거나 전체 삭제할 수 있다
- 달력과 일정 목록에서 반복 일정을 시각적으로 구분할 수 있다

**특수 규칙**:
1. **31일 매월 반복**: 31일이 있는 달에만 일정이 생성됨 (2월, 4월, 6월, 9월, 11월은 건너뜀)
2. **윤년 2월 29일 매년 반복**: 윤년의 2월 29일에만 일정이 생성됨 (평년은 건너뜀)

**제약 사항**:
- 반복 일정은 일정 겹침 감지에서 제외됨
- 개별 반복 일정 수정은 지원하지 않음 (시리즈 전체만 수정 가능)

### 1.2 기술 요구사항 (개발자 관점)

**타입 시스템**:
- `RepeatInfo` 인터페이스는 이미 `src/types.ts`에 정의되어 있음 (활성화만 필요)
- 배치 API 요청/응답 타입 추가 필요

**아키텍처**:
- 순수 함수(Utils)와 훅(Hooks) 분리 원칙 준수
- 반복 날짜 생성 로직은 순수 함수로 구현 (`src/utils/repeatUtils.ts`)
- API 통신은 `useEventOperations` 훅 확장
- 기존 `App.tsx` 최소 변경 원칙 (주석 해제 및 개선)

**API 통합**:
- 반복 일정 생성: `POST /api/events-list` (배치 생성)
- 반복 시리즈 수정: `PUT /api/recurring-events/:repeatId`
- 반복 시리즈 삭제: `DELETE /api/recurring-events/:repeatId`
- 일반 일정과 반복 일정의 저장 로직 분기 처리

### 1.3 비기능 요구사항

**성능**:
- 반복 일정 생성 시 최대 2년치(약 730개) 일정 생성을 1초 이내 처리
- 배치 API 응답 시간은 일반 API와 유사한 수준 유지

**접근성**:
- 모든 폼 필드에 적절한 `aria-label` 속성 추가
- 테스트를 위한 `data-testid` 속성 추가
- 반복 일정 시각적 구분을 위한 아이콘 제공

**테스트 가능성**:
- 모든 유틸 함수는 순수 함수로 작성 (부수 효과 없음)
- 훅은 MSW를 활용한 API 모킹으로 테스트
- 통합 테스트 시나리오 포함 (생성→표시→수정→삭제)

---

## 2. 기술 설계

### 2.1 타입 시스템 설계

#### 2.1.1 기존 타입 확인

`src/types.ts`에 이미 정의된 타입들:

```typescript
export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RepeatInfo {
  type: RepeatType;
  interval: number;
  endDate?: string;
}

export interface EventForm {
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

export interface Event extends EventForm {
  id: string;
}
```

**현재 상태**: RepeatInfo는 이미 정의되어 있고, EventForm의 repeat 필드도 활성화되어 있음.

#### 2.1.2 신규 타입 정의 (배치 API용)

`src/types.ts`에 추가할 타입:

```typescript
/**
 * 배치 API 요청 타입: 여러 일정을 한 번에 생성
 */
export interface BatchCreateEventsRequest {
  events: EventForm[];
}

/**
 * 배치 API 응답 타입: 생성된 일정 목록
 */
export interface BatchCreateEventsResponse {
  events: Event[];
}

/**
 * 반복 시리즈 수정 요청 타입
 */
export interface UpdateRecurringSeriesRequest {
  title?: string;
  description?: string;
  location?: string;
  category?: string;
  notificationTime?: number;
  repeat?: Partial<RepeatInfo>;
  // 주의: date, startTime, endTime은 수정 불가 (시리즈 특성상)
}

/**
 * 반복 일정의 repeatId 확장
 * 서버에서 자동 생성되며, 반복 시리즈 식별에 사용
 */
export interface RepeatInfoWithId extends RepeatInfo {
  id?: string; // repeatId (서버에서 자동 생성)
}
```

**타입 안전성**: 모든 타입은 TypeScript strict mode 호환.

#### 2.1.3 타입 가드 함수

반복 일정 여부를 체크하는 타입 가드 추가 (`src/utils/eventUtils.ts` 또는 `src/utils/repeatUtils.ts`):

```typescript
/**
 * 주어진 이벤트가 반복 일정인지 확인합니다.
 */
export function isRecurringEvent(event: Event | EventForm): boolean {
  return event.repeat.type !== 'none';
}

/**
 * 주어진 날짜가 유효한 날짜 문자열인지 확인합니다.
 */
export function isValidDateString(dateStr: string): boolean {
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}
```

### 2.2 아키텍처 결정

#### 2.2.1 순수 함수(Utils) vs 훅(Hooks) 분리

**순수 함수(Utils)** - `src/utils/repeatUtils.ts`:
- 반복 날짜 배열 생성 (`generateRepeatDates`)
- 다음 반복 날짜 계산 (`getNextRepeatDate`)
- 특수 규칙 검증 (`isValid31stMonthly`, `isValidLeapYearFeb29`)
- 외부 상태에 의존하지 않음, 동일 입력→동일 출력

**커스텀 훅(Hooks)** - `src/hooks/useEventOperations.ts`:
- API 통신 (배치 생성/수정/삭제)
- 상태 관리 (events 배열 업데이트)
- 에러 처리 및 사용자 피드백 (notistack)
- 부수 효과(Side effects) 관리

#### 2.2.2 상태 관리 전략

**기존 훅 확장**:
- `useEventForm`: 이미 반복 관련 상태를 관리하고 있음 (변경 불필요)
- `useEventOperations`: 배치 API 메서드 추가 필요

**신규 훅 불필요**: 기존 훅 확장으로 충분함.

#### 2.2.3 에러 처리 전략

**Early return 패턴**:
```typescript
// 예시: saveEvent 함수
if (!isValidDateString(date)) {
  enqueueSnackbar('유효하지 않은 날짜입니다.', { variant: 'error' });
  return;
}

if (repeatEndDate && new Date(repeatEndDate) < new Date(date)) {
  enqueueSnackbar('반복 종료일은 시작일 이후여야 합니다.', { variant: 'error' });
  return;
}
```

**Try-catch 패턴**:
```typescript
try {
  await fetch('/api/events-list', { ... });
} catch (error) {
  console.error('Error creating recurring events:', error);
  enqueueSnackbar('반복 일정 생성 실패', { variant: 'error' });
}
```

**에러 메시지 한글화**:
- 모든 사용자 대면 에러 메시지는 한글로 작성
- 개발자용 로그는 영어 허용

---

## 3. 유틸 함수 설계

### 3.1 파일 위치

**신규 파일**: `src/utils/repeatUtils.ts`

### 3.2 필수 함수 명세

#### 3.2.1 generateRepeatDates

**목적**: 반복 일정의 모든 날짜를 배열로 생성 (핵심 함수)

**함수 시그니처**:
```typescript
export function generateRepeatDates(
  baseDate: string, // 시작 날짜 (YYYY-MM-DD)
  repeatInfo: RepeatInfo
): string[]
```

**입력 파라미터**:
- `baseDate`: 시작 날짜 (형식: `'2025-01-15'`)
- `repeatInfo`: 반복 정보 객체
  - `type`: 반복 유형 ('daily' | 'weekly' | 'monthly' | 'yearly')
  - `interval`: 반복 간격 (양수)
  - `endDate`: 반복 종료일 (선택적)

**반환 타입**:
- `string[]`: 날짜 문자열 배열 (형식: `'YYYY-MM-DD'`)

**동작 방식**:
1. `repeatInfo.type`이 'none'이면 빈 배열 반환
2. `endDate`가 없으면 시작일로부터 최대 2년치 생성 (기본값)
3. `endDate`가 있으면 해당 날짜까지만 생성
4. `interval`에 따라 간격 조정
5. 특수 규칙 적용:
   - `type === 'monthly' && baseDate.day === 31`: 31일이 있는 달만 포함
   - `type === 'yearly' && baseDate === '02-29'`: 윤년만 포함

**예외 상황**:
- `baseDate`가 유효하지 않은 날짜: 빈 배열 반환
- `interval <= 0`: 빈 배열 반환
- `endDate < baseDate`: 빈 배열 반환

**Edge Cases**:
1. 윤년 2월 29일 매년 반복
2. 31일 매월 반복
3. 반복 종료일이 시작일과 동일한 경우
4. interval이 매우 큰 경우 (예: 100일마다)

**예시**:
```typescript
// 매주 반복, 3주간
generateRepeatDates('2025-01-15', { type: 'weekly', interval: 1, endDate: '2025-02-05' })
// ['2025-01-15', '2025-01-22', '2025-01-29', '2025-02-05']

// 매월 31일 반복
generateRepeatDates('2025-01-31', { type: 'monthly', interval: 1, endDate: '2025-05-31' })
// ['2025-01-31', '2025-03-31', '2025-05-31'] (2월, 4월 제외)

// 매년 2월 29일 반복
generateRepeatDates('2024-02-29', { type: 'yearly', interval: 1, endDate: '2028-02-29' })
// ['2024-02-29', '2028-02-29'] (2025, 2026, 2027은 평년이므로 제외)
```

#### 3.2.2 getNextRepeatDate

**목적**: 현재 날짜로부터 다음 반복 날짜 계산

**함수 시그니처**:
```typescript
export function getNextRepeatDate(
  currentDate: string, // 현재 날짜 (YYYY-MM-DD)
  repeatType: RepeatType,
  interval: number
): string | null
```

**입력 파라미터**:
- `currentDate`: 현재 날짜 (형식: `'2025-01-15'`)
- `repeatType`: 반복 유형
- `interval`: 반복 간격

**반환 타입**:
- `string | null`: 다음 날짜 또는 null (계산 불가 시)

**동작 방식**:
- `daily`: `interval`일 추가
- `weekly`: `interval`주 추가 (7일 단위)
- `monthly`: `interval`개월 추가 (Date 객체 사용)
- `yearly`: `interval`년 추가

**예외 상황**:
- `repeatType === 'none'`: null 반환
- 유효하지 않은 날짜: null 반환

**예시**:
```typescript
getNextRepeatDate('2025-01-15', 'daily', 1)   // '2025-01-16'
getNextRepeatDate('2025-01-15', 'weekly', 2)  // '2025-01-29'
getNextRepeatDate('2025-01-31', 'monthly', 1) // '2025-02-28' (2월은 28일까지)
getNextRepeatDate('2024-02-29', 'yearly', 1)  // '2025-02-28' (윤년 규칙 미적용)
```

#### 3.2.3 isValid31stMonthly

**목적**: 31일 매월 반복 규칙 검증

**함수 시그니처**:
```typescript
export function isValid31stMonthly(date: string): boolean
```

**입력 파라미터**:
- `date`: 검증할 날짜 (형식: `'YYYY-MM-DD'`)

**반환 타입**:
- `boolean`: 해당 월이 31일이 있는 달이면 true

**동작 방식**:
1. 날짜 파싱하여 월 추출
2. 해당 월이 31일이 있는 달인지 확인
   - 1월, 3월, 5월, 7월, 8월, 10월, 12월: true
   - 2월, 4월, 6월, 9월, 11월: false

**예시**:
```typescript
isValid31stMonthly('2025-01-31') // true (1월은 31일 있음)
isValid31stMonthly('2025-02-28') // false (2월은 31일 없음)
isValid31stMonthly('2025-04-30') // false (4월은 31일 없음)
```

#### 3.2.4 isValidLeapYearFeb29

**목적**: 윤년 2월 29일 규칙 검증

**함수 시그니처**:
```typescript
export function isValidLeapYearFeb29(date: string): boolean
```

**입력 파라미터**:
- `date`: 검증할 날짜 (형식: `'YYYY-MM-DD'`)

**반환 타입**:
- `boolean`: 해당 연도가 윤년이고 날짜가 2월 29일이면 true

**동작 방식**:
1. 날짜 파싱하여 연도, 월, 일 추출
2. 윤년 조건 확인:
   - 4로 나누어떨어지고
   - 100으로 나누어떨어지지 않거나
   - 400으로 나누어떨어지는 경우
3. 월이 2월(02)이고 일이 29일인지 확인

**예시**:
```typescript
isValidLeapYearFeb29('2024-02-29') // true (2024는 윤년)
isValidLeapYearFeb29('2025-02-29') // false (2025는 평년, 2월 29일 없음)
isValidLeapYearFeb29('2000-02-29') // true (2000은 윤년)
isValidLeapYearFeb29('1900-02-29') // false (1900은 평년)
```

### 3.3 보조 함수 (선택적)

#### 3.3.1 isLeapYear

**목적**: 윤년 판별 (내부 헬퍼 함수)

```typescript
function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}
```

#### 3.3.2 getDaysInMonth

**목적**: 특정 월의 일수 계산 (이미 `dateUtils.ts`에 존재)

```typescript
// 기존 함수 활용
import { getDaysInMonth } from './dateUtils';
```

### 3.4 유틸 함수 의존성

**외부 의존성**:
- `src/types.ts`: RepeatInfo, RepeatType 타입 import
- `src/utils/dateUtils.ts`: getDaysInMonth, fillZero 함수 재사용 가능

**내부 의존성**:
- 모든 함수는 순수 함수로 작성
- 외부 상태, API 호출, 로컬 스토리지 접근 금지
- Date 객체만 사용 (외부 라이브러리 불필요)

---

## 4. 훅 인터페이스 설계

### 4.1 useEventOperations 확장

**파일 위치**: `src/hooks/useEventOperations.ts` (기존 파일 수정)

### 4.2 확장 메서드 명세

#### 4.2.1 saveEvent 메서드 수정

**기존 메서드**: `saveEvent(eventData: Event | EventForm): Promise<void>`

**수정 내용**: 반복 일정 여부에 따라 API 엔드포인트 분기

**수정된 로직**:
```typescript
const saveEvent = async (eventData: Event | EventForm) => {
  try {
    const isRecurring = eventData.repeat.type !== 'none';

    // 반복 일정인 경우 배치 API 사용
    if (!editing && isRecurring) {
      await saveRecurringEvents(eventData as EventForm);
      return;
    }

    // 기존 로직 (단일 일정 저장)
    let response;
    if (editing) {
      response = await fetch(`/api/events/${(eventData as Event).id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });
    } else {
      response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });
    }

    if (!response.ok) {
      throw new Error('Failed to save event');
    }

    await fetchEvents();
    onSave?.();
    enqueueSnackbar(editing ? '일정이 수정되었습니다.' : '일정이 추가되었습니다.', {
      variant: 'success',
    });
  } catch (error) {
    console.error('Error saving event:', error);
    enqueueSnackbar('일정 저장 실패', { variant: 'error' });
  }
};
```

#### 4.2.2 saveRecurringEvents (신규 메서드)

**목적**: 반복 일정 배치 생성

**함수 시그니처**:
```typescript
const saveRecurringEvents = async (eventForm: EventForm): Promise<void>
```

**API 매핑**:
- **엔드포인트**: `POST /api/events-list`
- **메서드**: POST
- **헤더**: `Content-Type: application/json`

**요청 페이로드**:
```typescript
{
  events: EventForm[] // 반복 날짜별로 생성된 EventForm 배열
}
```

**구현 로직**:
```typescript
const saveRecurringEvents = async (eventForm: EventForm): Promise<void> => {
  try {
    // 1. 반복 날짜 배열 생성
    const repeatDates = generateRepeatDates(eventForm.date, eventForm.repeat);

    if (repeatDates.length === 0) {
      enqueueSnackbar('반복 일정을 생성할 수 없습니다.', { variant: 'error' });
      return;
    }

    // 2. 각 날짜마다 EventForm 객체 생성
    const eventsToCreate: EventForm[] = repeatDates.map((date) => ({
      ...eventForm,
      date, // 날짜만 변경
    }));

    // 3. 배치 API 호출
    const response = await fetch('/api/events-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: eventsToCreate }),
    });

    if (!response.ok) {
      throw new Error('Failed to create recurring events');
    }

    // 4. 성공 처리
    await fetchEvents();
    onSave?.();
    enqueueSnackbar(`반복 일정이 생성되었습니다. (${repeatDates.length}개)`, {
      variant: 'success',
    });
  } catch (error) {
    console.error('Error creating recurring events:', error);
    enqueueSnackbar('반복 일정 생성 실패', { variant: 'error' });
  }
};
```

**응답 처리**:
- 성공(201): 생성된 일정 개수와 함께 성공 메시지 표시
- 실패(4xx/5xx): 에러 메시지 표시 및 롤백 (서버 책임)

**notistack 메시지**:
- 성공: `"반복 일정이 생성되었습니다. (10개)"`
- 실패: `"반복 일정 생성 실패"`
- 날짜 없음: `"반복 일정을 생성할 수 없습니다."`

#### 4.2.3 updateRecurringSeries (신규 메서드)

**목적**: 반복 시리즈 전체 수정

**함수 시그니처**:
```typescript
const updateRecurringSeries = async (
  repeatId: string,
  updateData: UpdateRecurringSeriesRequest
): Promise<void>
```

**API 매핑**:
- **엔드포인트**: `PUT /api/recurring-events/:repeatId`
- **메서드**: PUT
- **헤더**: `Content-Type: application/json`

**요청 페이로드**:
```typescript
{
  title?: string;
  description?: string;
  location?: string;
  category?: string;
  notificationTime?: number;
  repeat?: Partial<RepeatInfo>;
}
```

**구현 로직**:
```typescript
const updateRecurringSeries = async (
  repeatId: string,
  updateData: UpdateRecurringSeriesRequest
): Promise<void> => {
  try {
    const response = await fetch(`/api/recurring-events/${repeatId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error('Failed to update recurring series');
    }

    await fetchEvents();
    enqueueSnackbar('반복 일정 시리즈가 수정되었습니다.', { variant: 'success' });
  } catch (error) {
    console.error('Error updating recurring series:', error);
    enqueueSnackbar('반복 일정 수정 실패', { variant: 'error' });
  }
};
```

**주의사항**:
- 날짜(`date`), 시작/종료 시간(`startTime`, `endTime`)은 수정 불가
- 반복 시리즈의 특성상 시간 정보는 모든 일정에 동일하게 적용되므로 수정 가능
- `repeatId`가 없는 경우 404 에러 반환

**notistack 메시지**:
- 성공: `"반복 일정 시리즈가 수정되었습니다."`
- 실패: `"반복 일정 수정 실패"`
- 시리즈 없음: `"반복 일정 시리즈를 찾을 수 없습니다."`

#### 4.2.4 deleteRecurringSeries (신규 메서드)

**목적**: 반복 시리즈 전체 삭제

**함수 시그니처**:
```typescript
const deleteRecurringSeries = async (repeatId: string): Promise<void>
```

**API 매핑**:
- **엔드포인트**: `DELETE /api/recurring-events/:repeatId`
- **메서드**: DELETE

**구현 로직**:
```typescript
const deleteRecurringSeries = async (repeatId: string): Promise<void> => {
  try {
    const response = await fetch(`/api/recurring-events/${repeatId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete recurring series');
    }

    await fetchEvents();
    enqueueSnackbar('반복 일정 시리즈가 삭제되었습니다.', { variant: 'info' });
  } catch (error) {
    console.error('Error deleting recurring series:', error);
    enqueueSnackbar('반복 일정 삭제 실패', { variant: 'error' });
  }
};
```

**notistack 메시지**:
- 성공: `"반복 일정 시리즈가 삭제되었습니다."`
- 실패: `"반복 일정 삭제 실패"`
- 시리즈 없음: `"반복 일정 시리즈를 찾을 수 없습니다."`

### 4.3 훅 반환 인터페이스 확장

**기존 반환값**:
```typescript
return { events, fetchEvents, saveEvent, deleteEvent };
```

**확장된 반환값**:
```typescript
return {
  events,
  fetchEvents,
  saveEvent,
  deleteEvent,
  updateRecurringSeries, // 신규
  deleteRecurringSeries, // 신규
};
```

**주의**: `saveRecurringEvents`는 내부 함수이므로 외부에 노출하지 않음.

---

## 5. UI 설계

### 5.1 반복 설정 폼 (App.tsx 수정)

#### 5.1.1 반복 체크박스 (이미 존재)

**위치**: 카테고리 선택 아래, 알림 설정 위

**현재 코드** (L412-422):
```typescript
<FormControl>
  <FormControlLabel
    control={
      <Checkbox
        checked={isRepeating}
        onChange={(e) => setIsRepeating(e.target.checked)}
      />
    }
    label="반복 일정"
  />
</FormControl>
```

**수정 사항**:
- 변경 없음 (이미 올바르게 구현됨)
- `data-testid` 추가 필요: `data-testid="repeat-checkbox"`

#### 5.1.2 반복 설정 섹션 (주석 해제)

**위치**: L440-478 (현재 주석 처리됨)

**주석 해제할 코드**:
```typescript
{isRepeating && (
  <Stack spacing={2}>
    <FormControl fullWidth>
      <FormLabel htmlFor="repeat-type">반복 유형</FormLabel>
      <Select
        id="repeat-type"
        size="small"
        value={repeatType}
        onChange={(e) => setRepeatType(e.target.value as RepeatType)}
        aria-label="반복 유형"
        data-testid="repeat-type-select"
      >
        <MenuItem value="daily" aria-label="매일-option">매일</MenuItem>
        <MenuItem value="weekly" aria-label="매주-option">매주</MenuItem>
        <MenuItem value="monthly" aria-label="매월-option">매월</MenuItem>
        <MenuItem value="yearly" aria-label="매년-option">매년</MenuItem>
      </Select>
    </FormControl>

    <Stack direction="row" spacing={2}>
      <FormControl fullWidth>
        <FormLabel htmlFor="repeat-interval">반복 간격</FormLabel>
        <TextField
          id="repeat-interval"
          size="small"
          type="number"
          value={repeatInterval}
          onChange={(e) => setRepeatInterval(Number(e.target.value))}
          slotProps={{ htmlInput: { min: 1 } }}
          aria-label="반복 간격"
          data-testid="repeat-interval-input"
        />
      </FormControl>
      <FormControl fullWidth>
        <FormLabel htmlFor="repeat-end-date">반복 종료일</FormLabel>
        <TextField
          id="repeat-end-date"
          size="small"
          type="date"
          value={repeatEndDate}
          onChange={(e) => setRepeatEndDate(e.target.value)}
          aria-label="반복 종료일"
          data-testid="repeat-end-date-input"
        />
      </FormControl>
    </Stack>
  </Stack>
)}
```

**수정 사항**:
- 주석 해제
- `data-testid` 속성 추가 (테스트용)
- `aria-label` 속성 추가 (접근성)
- `htmlFor` 속성 추가 (FormLabel과 Input 연결)
- `setRepeatType`, `setRepeatInterval`, `setRepeatEndDate` 주석 해제 (L80, 82, 84)

#### 5.1.3 조건부 렌더링

**조건**: `isRepeating === true`일 때만 반복 설정 섹션 표시

**유효성 검사** (추가 필요):
```typescript
// App.tsx의 addOrUpdateEvent 함수에 추가
if (isRepeating) {
  if (repeatInterval < 1) {
    enqueueSnackbar('반복 간격은 1 이상이어야 합니다.', { variant: 'error' });
    return;
  }

  if (repeatEndDate && new Date(repeatEndDate) < new Date(date)) {
    enqueueSnackbar('반복 종료일은 시작일 이후여야 합니다.', { variant: 'error' });
    return;
  }
}
```

### 5.2 반복 일정 표시

#### 5.2.1 달력 뷰: 반복 아이콘 추가

**위치**: `renderWeekView()` 및 `renderMonthView()` 함수 내 일정 표시 부분

**아이콘**: Material-UI의 `Repeat` 아이콘 사용

**코드 예시** (renderWeekView):
```typescript
import { Repeat } from '@mui/icons-material';

// 기존 일정 렌더링 부분 수정
<Box
  key={event.id}
  sx={{
    p: 1,
    my: 1,
    backgroundColor: 'primary.light',
    cursor: 'pointer',
  }}
  onClick={() => editEvent(event)}
>
  <Stack direction="row" spacing={1} alignItems="center">
    {event.repeat.type !== 'none' && <Repeat fontSize="small" />}
    <Typography variant="body2">{event.title}</Typography>
  </Stack>
</Box>
```

#### 5.2.2 일정 목록: 반복 정보 표시

**위치**: 오른쪽 일정 목록 (L519 이후)

**표시 형식**:
- 반복 유형: `매일`, `매주`, `매월`, `매년`
- 반복 간격: `2일마다`, `3주마다` (interval > 1인 경우)
- 반복 종료일: `2025-12-31까지` (endDate가 있는 경우)

**코드 예시**:
```typescript
// 일정 목록 아이템에 추가
<TableCell>
  <Stack>
    <Typography variant="body2">{event.title}</Typography>
    {event.repeat.type !== 'none' && (
      <Typography variant="caption" color="text.secondary">
        <Repeat fontSize="inherit" /> {formatRepeatInfo(event.repeat)}
      </Typography>
    )}
  </Stack>
</TableCell>
```

**formatRepeatInfo 유틸 함수** (추가 필요, `src/utils/repeatUtils.ts`):
```typescript
/**
 * 반복 정보를 사용자 친화적인 문자열로 변환
 */
export function formatRepeatInfo(repeatInfo: RepeatInfo): string {
  const { type, interval, endDate } = repeatInfo;

  if (type === 'none') return '';

  const typeLabel = {
    daily: '매일',
    weekly: '매주',
    monthly: '매월',
    yearly: '매년',
  }[type];

  const intervalText = interval > 1 ? ` (${interval}${getIntervalUnit(type)}마다)` : '';
  const endDateText = endDate ? ` ~ ${endDate}` : '';

  return `${typeLabel}${intervalText}${endDateText}`;
}

function getIntervalUnit(type: RepeatType): string {
  const unitMap = {
    daily: '일',
    weekly: '주',
    monthly: '개월',
    yearly: '년',
  };
  return unitMap[type] || '';
}
```

#### 5.2.3 반복 시리즈 편집/삭제 확인 다이얼로그

**목적**: 반복 일정 수정/삭제 시 사용자 확인

**다이얼로그 타입**:
1. **수정 확인**: "이 반복 시리즈의 모든 일정을 수정하시겠습니까?"
2. **삭제 확인**: "이 반복 시리즈의 모든 일정을 삭제하시겠습니까?"

**상태 추가** (App.tsx):
```typescript
const [isRecurringEditDialogOpen, setIsRecurringEditDialogOpen] = useState(false);
const [isRecurringDeleteDialogOpen, setIsRecurringDeleteDialogOpen] = useState(false);
```

**다이얼로그 컴포넌트** (App.tsx 추가):
```typescript
<Dialog open={isRecurringEditDialogOpen} onClose={() => setIsRecurringEditDialogOpen(false)}>
  <DialogTitle>반복 일정 수정</DialogTitle>
  <DialogContent>
    <DialogContentText>
      이 반복 시리즈의 모든 일정을 수정하시겠습니까?
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setIsRecurringEditDialogOpen(false)}>취소</Button>
    <Button onClick={handleRecurringSeriesUpdate} color="primary">
      전체 수정
    </Button>
  </DialogActions>
</Dialog>

<Dialog open={isRecurringDeleteDialogOpen} onClose={() => setIsRecurringDeleteDialogOpen(false)}>
  <DialogTitle>반복 일정 삭제</DialogTitle>
  <DialogContent>
    <DialogContentText>
      이 반복 시리즈의 모든 일정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setIsRecurringDeleteDialogOpen(false)}>취소</Button>
    <Button onClick={handleRecurringSeriesDelete} color="error">
      전체 삭제
    </Button>
  </DialogActions>
</Dialog>
```

### 5.3 접근성 (Accessibility)

**필수 속성**:
- `aria-label`: 모든 인터랙티브 요소에 추가
- `data-testid`: 테스트 가능성을 위한 ID
- `htmlFor`: FormLabel과 Input 연결

**키보드 네비게이션**:
- Tab 키로 모든 폼 필드 이동 가능
- Enter 키로 버튼 클릭 가능
- Escape 키로 다이얼로그 닫기

**스크린 리더 지원**:
- 모든 폼 필드에 명확한 라벨
- 에러 메시지는 `aria-live="polite"` 영역에 표시 (notistack 기본 제공)

---

## 6. API 통합 전략

### 6.1 배치 API 사용 시점

**분기 로직** (`saveEvent` 함수 내부):

```typescript
const isRecurring = eventData.repeat.type !== 'none';
const isNewEvent = !editing;

if (isNewEvent && isRecurring) {
  // 배치 API 사용
  await saveRecurringEvents(eventData as EventForm);
} else {
  // 단일 API 사용
  // 기존 로직...
}
```

**의사 결정 트리**:
```
일정 저장 요청
│
├─ 수정 모드? (editing === true)
│  ├─ Yes → 단일 API (PUT /api/events/:id)
│  └─ No → 신규 생성
│      ├─ 반복 일정? (repeat.type !== 'none')
│      │  ├─ Yes → 배치 API (POST /api/events-list)
│      │  └─ No → 단일 API (POST /api/events)
│      └─ ...
│
└─ ...
```

### 6.2 repeatId 관리

**서버 측 생성**:
- `POST /api/events-list` 호출 시 서버에서 자동으로 `repeatId` 생성 (UUID)
- 동일 배치의 모든 일정에 동일한 `repeatId` 부여

**클라이언트 측 사용**:
- 클라이언트는 `repeatId`를 직접 생성하거나 관리하지 않음
- 반복 시리즈 수정/삭제 시 `repeatId`를 파라미터로 전달
- 일정 목록에서 `event.repeat.id`로 접근

**server.js 코드 확인** (L76-99):
```javascript
app.post('/api/events-list', async (req, res) => {
  const events = await getEvents();
  const repeatId = randomUUID(); // 서버에서 자동 생성
  const newEvents = req.body.events.map((event) => {
    const isRepeatEvent = event.repeat.type !== 'none';
    return {
      id: randomUUID(),
      ...event,
      repeat: {
        ...event.repeat,
        id: isRepeatEvent ? repeatId : undefined, // 반복 일정에만 repeatId 추가
      },
    };
  });
  // ...
});
```

### 6.3 에러 처리

#### 6.3.1 클라이언트 측 에러 처리

**배치 생성 실패**:
```typescript
try {
  const response = await fetch('/api/events-list', { ... });
  if (!response.ok) {
    throw new Error('Failed to create recurring events');
  }
} catch (error) {
  console.error('Error creating recurring events:', error);
  enqueueSnackbar('반복 일정 생성 실패', { variant: 'error' });
}
```

**네트워크 에러**:
```typescript
catch (error) {
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    enqueueSnackbar('네트워크 연결을 확인해주세요.', { variant: 'error' });
  } else {
    enqueueSnackbar('반복 일정 생성 실패', { variant: 'error' });
  }
}
```

#### 6.3.2 서버 측 에러 처리 (이미 구현됨)

**트랜잭션 방식**:
- 배치 생성 시 모든 일정이 성공하거나 모두 실패
- 부분적 성공은 허용하지 않음 (서버 책임)

**404 에러**:
- `PUT /api/recurring-events/:repeatId`: repeatId에 해당하는 시리즈가 없는 경우
- `DELETE /api/recurring-events/:repeatId`: repeatId에 해당하는 시리즈가 없는 경우

**클라이언트 처리**:
```typescript
if (response.status === 404) {
  enqueueSnackbar('반복 일정 시리즈를 찾을 수 없습니다.', { variant: 'error' });
  return;
}
```

### 6.4 API 요청/응답 예시

#### 6.4.1 배치 생성 (POST /api/events-list)

**요청**:
```json
{
  "events": [
    {
      "title": "주간 회의",
      "date": "2025-01-15",
      "startTime": "10:00",
      "endTime": "11:00",
      "description": "팀 주간 회의",
      "location": "회의실 A",
      "category": "업무",
      "repeat": {
        "type": "weekly",
        "interval": 1,
        "endDate": "2025-02-15"
      },
      "notificationTime": 10
    },
    {
      "title": "주간 회의",
      "date": "2025-01-22",
      "startTime": "10:00",
      "endTime": "11:00",
      "description": "팀 주간 회의",
      "location": "회의실 A",
      "category": "업무",
      "repeat": {
        "type": "weekly",
        "interval": 1,
        "endDate": "2025-02-15"
      },
      "notificationTime": 10
    }
    // ... 추가 날짜들
  ]
}
```

**응답** (201 Created):
```json
{
  "events": [
    {
      "id": "abc123",
      "title": "주간 회의",
      "date": "2025-01-15",
      "startTime": "10:00",
      "endTime": "11:00",
      "description": "팀 주간 회의",
      "location": "회의실 A",
      "category": "업무",
      "repeat": {
        "type": "weekly",
        "interval": 1,
        "endDate": "2025-02-15",
        "id": "repeat-xyz789" // 서버에서 생성
      },
      "notificationTime": 10
    },
    {
      "id": "def456",
      "title": "주간 회의",
      "date": "2025-01-22",
      "startTime": "10:00",
      "endTime": "11:00",
      "description": "팀 주간 회의",
      "location": "회의실 A",
      "category": "업무",
      "repeat": {
        "type": "weekly",
        "interval": 1,
        "endDate": "2025-02-15",
        "id": "repeat-xyz789" // 동일한 repeatId
      },
      "notificationTime": 10
    }
    // ...
  ]
}
```

#### 6.4.2 시리즈 수정 (PUT /api/recurring-events/:repeatId)

**요청**:
```json
{
  "title": "주간 팀 미팅",
  "description": "업데이트된 설명",
  "location": "회의실 B",
  "notificationTime": 30
}
```

**응답** (200 OK):
```json
[
  {
    "id": "abc123",
    "title": "주간 팀 미팅", // 수정됨
    "date": "2025-01-15", // 유지
    "startTime": "10:00", // 유지
    "endTime": "11:00", // 유지
    "description": "업데이트된 설명", // 수정됨
    "location": "회의실 B", // 수정됨
    "category": "업무",
    "repeat": {
      "type": "weekly",
      "interval": 1,
      "endDate": "2025-02-15",
      "id": "repeat-xyz789"
    },
    "notificationTime": 30 // 수정됨
  }
  // ... 시리즈의 나머지 일정들
]
```

#### 6.4.3 시리즈 삭제 (DELETE /api/recurring-events/:repeatId)

**요청**: (본문 없음)

**응답** (204 No Content): (본문 없음)

---

## 7. 일정 겹침 감지 수정

### 7.1 변경 파일

**파일**: `src/utils/eventOverlap.ts`

### 7.2 수정 내용

#### 7.2.1 findOverlappingEvents 함수 수정

**기존 코드**:
```typescript
export function findOverlappingEvents(newEvent: Event | EventForm, events: Event[]) {
  return events.filter(
    (event) => event.id !== (newEvent as Event).id && isOverlapping(event, newEvent)
  );
}
```

**수정된 코드**:
```typescript
export function findOverlappingEvents(newEvent: Event | EventForm, events: Event[]) {
  return events.filter((event) => {
    // 동일한 이벤트 제외
    if (event.id === (newEvent as Event).id) {
      return false;
    }

    // 반복 일정은 겹침 체크에서 제외
    if (event.repeat.type !== 'none' || newEvent.repeat.type !== 'none') {
      return false;
    }

    // 일반 일정끼리만 겹침 체크
    return isOverlapping(event, newEvent);
  });
}
```

**변경 사유**:
- 반복 일정(`repeat.type !== 'none'`)은 일정 겹침 감지에서 제외
- 일반 일정(`repeat.type === 'none')끼리만 겹침 체크

### 7.3 테스트 영향 분석

**기존 테스트 파일**: `src/__tests__/unit/easy.eventOverlap.spec.ts`

**영향**:
- 기존 테스트는 모두 일반 일정(repeat.type === 'none')을 사용하므로 영향 없음
- 반복 일정 관련 테스트 케이스 추가 필요

**추가할 테스트 케이스**:
```typescript
describe('findOverlappingEvents - 반복 일정 제외', () => {
  it('반복 일정은 겹침 체크에서 제외되어야 한다', () => {
    // Given: 반복 일정
    const recurringEvent: EventForm = {
      title: '반복 회의',
      date: '2025-01-15',
      startTime: '10:00',
      endTime: '11:00',
      repeat: { type: 'weekly', interval: 1 },
      // ...
    };

    const normalEvent: Event = {
      id: '1',
      title: '일반 회의',
      date: '2025-01-15',
      startTime: '10:30',
      endTime: '11:30',
      repeat: { type: 'none', interval: 1 },
      // ...
    };

    // When: 겹침 체크
    const overlapping = findOverlappingEvents(recurringEvent, [normalEvent]);

    // Then: 겹침 없음 (반복 일정 제외됨)
    expect(overlapping).toHaveLength(0);
  });
});
```

---

## 8. 파일 구조

### 8.1 신규 파일

```
src/
├── utils/
│   └── repeatUtils.ts                    # 반복 날짜 생성 유틸리티 (순수 함수)
│
└── __tests__/
    ├── unit/
    │   └── task.repeatUtils.spec.ts      # repeatUtils 단위 테스트
    │
    ├── hooks/
    │   └── task.useEventOperations.spec.ts # useEventOperations 훅 테스트
    │
    └── integration/
        └── task.repeat-event-integration.spec.ts # 통합 테스트
```

### 8.2 수정 파일

```
src/
├── types.ts                              # 배치 API 타입 추가
├── hooks/
│   └── useEventOperations.ts             # 배치 API 메서드 추가
├── utils/
│   └── eventOverlap.ts                   # 반복 일정 겹침 제외 로직
└── App.tsx                               # 반복 UI 활성화 (주석 해제)

src/__tests__/
└── unit/
    └── easy.eventOverlap.spec.ts         # 반복 일정 테스트 케이스 추가
```

### 8.3 파일별 변경 상세

#### 8.3.1 src/types.ts

**추가 내용**:
- `BatchCreateEventsRequest` 인터페이스
- `BatchCreateEventsResponse` 인터페이스
- `UpdateRecurringSeriesRequest` 인터페이스
- `RepeatInfoWithId` 인터페이스 (선택적)

**라인 수 증가**: 약 +30줄

#### 8.3.2 src/utils/repeatUtils.ts (신규)

**함수 목록**:
- `generateRepeatDates(baseDate, repeatInfo): string[]`
- `getNextRepeatDate(currentDate, repeatType, interval): string | null`
- `isValid31stMonthly(date): boolean`
- `isValidLeapYearFeb29(date): boolean`
- `formatRepeatInfo(repeatInfo): string` (UI용 헬퍼)
- `isLeapYear(year): boolean` (내부 헬퍼)

**예상 라인 수**: 약 150-200줄

#### 8.3.3 src/hooks/useEventOperations.ts

**추가 내용**:
- `saveRecurringEvents` 함수 (내부)
- `updateRecurringSeries` 함수
- `deleteRecurringSeries` 함수
- `saveEvent` 함수 수정 (분기 로직 추가)
- 반환값에 신규 메서드 추가

**라인 수 증가**: 약 +80줄

#### 8.3.4 src/utils/eventOverlap.ts

**수정 내용**:
- `findOverlappingEvents` 함수 수정 (반복 일정 필터링)

**라인 수 증가**: 약 +5줄

#### 8.3.5 src/App.tsx

**수정 내용**:
- L38: `RepeatType` import 주석 해제
- L80, 82, 84: `setRepeatType`, `setRepeatInterval`, `setRepeatEndDate` 주석 해제
- L440-478: 반복 UI 주석 해제 및 개선 (aria-label, data-testid 추가)
- 유효성 검사 로직 추가 (반복 간격, 종료일)
- 반복 아이콘 추가 (달력 뷰, 일정 목록)
- 반복 시리즈 편집/삭제 다이얼로그 추가
- Import에 `Repeat` 아이콘 추가

**라인 수 증가**: 약 +50줄

#### 8.3.6 src/__tests__/unit/task.repeatUtils.spec.ts (신규)

**테스트 구조**:
- `generateRepeatDates` 테스트 (10+ 케이스)
  - 매일/매주/매월/매년 반복
  - 31일 매월 특수 규칙
  - 윤년 2월 29일 특수 규칙
  - Edge cases
- `getNextRepeatDate` 테스트 (5+ 케이스)
- `isValid31stMonthly` 테스트 (5+ 케이스)
- `isValidLeapYearFeb29` 테스트 (5+ 케이스)

**예상 라인 수**: 약 300-400줄

#### 8.3.7 src/__tests__/hooks/task.useEventOperations.spec.ts (신규)

**테스트 구조**:
- `saveRecurringEvents` 테스트 (MSW 모킹)
- `updateRecurringSeries` 테스트
- `deleteRecurringSeries` 테스트
- 에러 처리 테스트

**예상 라인 수**: 약 200-300줄

#### 8.3.8 src/__tests__/integration/task.repeat-event-integration.spec.ts (신규)

**테스트 구조**:
- E2E 시나리오: 생성 → 표시 → 수정 → 삭제
- 특수 규칙 시나리오
- 겹침 제외 검증

**예상 라인 수**: 약 200-300줄

#### 8.3.9 src/__tests__/unit/easy.eventOverlap.spec.ts

**추가 내용**:
- 반복 일정 겹침 제외 테스트 케이스 (2-3개)

**라인 수 증가**: 약 +30줄

### 8.4 전체 변경 요약

| 파일 | 상태 | 예상 라인 수 | 주요 내용 |
|------|------|-------------|----------|
| `src/types.ts` | 수정 | +30 | 배치 API 타입 추가 |
| `src/utils/repeatUtils.ts` | 신규 | 150-200 | 반복 날짜 생성 로직 |
| `src/hooks/useEventOperations.ts` | 수정 | +80 | 배치 API 메서드 |
| `src/utils/eventOverlap.ts` | 수정 | +5 | 겹침 제외 로직 |
| `src/App.tsx` | 수정 | +50 | UI 활성화 |
| `task.repeatUtils.spec.ts` | 신규 | 300-400 | 유틸 테스트 |
| `task.useEventOperations.spec.ts` | 신규 | 200-300 | 훅 테스트 |
| `task.repeat-event-integration.spec.ts` | 신규 | 200-300 | 통합 테스트 |
| `easy.eventOverlap.spec.ts` | 수정 | +30 | 테스트 추가 |
| **총계** | | **약 1,200-1,600줄** | |

---

## 9. 구현 순서 및 의존성

### 9.1 Phase별 실행 순서

#### Phase 1: Feature Design (현재)
✅ 기술 명세서 작성 완료

#### Phase 2: Test Design
- 테스트 전략 수립
- 테스트 케이스 목록 작성
- MSW 핸들러 설계

#### Phase 3: RED (Test Writing)
1. `src/__tests__/unit/task.repeatUtils.spec.ts` 작성
2. `src/__tests__/hooks/task.useEventOperations.spec.ts` 작성
3. `src/__tests__/integration/task.repeat-event-integration.spec.ts` 작성
4. `src/__tests__/unit/easy.eventOverlap.spec.ts` 테스트 추가
5. 모든 테스트 실행 → **RED (실패 예상)**

#### Phase 4: GREEN (Implementation)
1. `src/types.ts` - 배치 API 타입 추가
2. `src/utils/repeatUtils.ts` - 반복 날짜 생성 로직 구현
3. `src/utils/eventOverlap.ts` - 겹침 제외 로직 수정
4. `src/hooks/useEventOperations.ts` - 배치 API 메서드 구현
5. `src/App.tsx` - UI 통합 (주석 해제 및 개선)
6. 각 단계마다 해당 테스트 통과 확인
7. 최종: 모든 테스트 통과 → **GREEN**

#### Phase 5: REFACTOR
- 코드 중복 제거
- 함수 분리 및 명명 개선
- 성능 최적화 (필요 시)
- 테스트 유지 확인

#### Phase 6: VALIDATE
- 전체 테스트 스위트 실행
- 커버리지 검증 (목표: 80% 이상)
- TypeScript/ESLint 검증
- 수동 테스트 시나리오 실행

### 9.2 의존성 그래프

```
types.ts (타입 정의)
    ↓
    ├→ repeatUtils.ts (순수 함수)
    │       ↓
    │       └→ useEventOperations.ts (API 통신)
    │               ↓
    │               └→ App.tsx (UI 통합)
    │
    └→ eventOverlap.ts (겹침 제외 로직)
            ↓
            └→ App.tsx (검증 로직)
```

**의존성 규칙**:
- `types.ts`는 다른 모듈에 의존하지 않음
- `repeatUtils.ts`는 `types.ts`와 `dateUtils.ts`만 의존
- `useEventOperations.ts`는 `repeatUtils.ts` 사용
- `App.tsx`는 모든 모듈 사용

---

## 10. 검증 체크리스트

### 10.1 Phase 1 검증 (Feature Design)

- ✅ RepeatInfo 타입 정의 확인됨
- ✅ 배치 API 인터페이스 설계 완료
- ✅ 유틸 함수 시그니처 정의 (4개)
- ✅ 훅 인터페이스 설계 (3개 메서드)
- ✅ UI 컴포넌트 구조 명확
- ✅ 특수 규칙(31일, 윤년) 명세 명확
- ✅ 일정 겹침 제외 로직 설계
- ✅ 모든 타입이 TypeScript strict mode 호환
- ✅ 필수 섹션 모두 포함
- ✅ CLAUDE.md 컨벤션 준수

### 10.2 구현 완료 후 검증 (Phase 4-6)

**기능 요구사항**:
- [ ] 사용자가 반복 유형 선택 가능
- [ ] 반복 간격 및 종료일 설정 가능
- [ ] 31일 매월 반복: 31일이 있는 달에만 생성
- [ ] 윤년 2월 29일 매년 반복: 2월 29일에만 생성
- [ ] 반복 일정은 일정 겹침 감지 제외
- [ ] 반복 시리즈 전체 수정/삭제 가능
- [ ] 반복 일정 시각적 구분 (아이콘)

**기술 요구사항**:
- [ ] 배치 API 사용
- [ ] 타입 안전성 보장
- [ ] 순수 함수로 유틸 작성
- [ ] 기존 코드 패턴 준수
- [ ] 테스트 커버리지 80% 이상

**품질 요구사항**:
- [ ] 모든 테스트 통과
- [ ] TypeScript 컴파일 에러 없음
- [ ] ESLint 에러/경고 없음
- [ ] 기존 기능 영향 없음 (회귀 테스트)
- [ ] 코드 리뷰 준비 완료

---

## 11. 참조 문서

### 11.1 프로젝트 규칙
- [CLAUDE.md](../../../CLAUDE.md) - 프로젝트 전체 규칙
- [folder-tree.md](../../docs/folder-tree.md) - 폴더 구조

### 11.2 관련 코드 파일
- `src/types.ts` - 타입 정의
- `src/hooks/useEventOperations.ts` - API 통신 패턴
- `src/hooks/useEventForm.ts` - 폼 상태 관리
- `src/utils/dateUtils.ts` - 날짜 유틸 참고
- `src/utils/eventOverlap.ts` - 겹침 감지
- `src/App.tsx` - 메인 애플리케이션
- `server.js` - 백엔드 API

### 11.3 Work Plan
- [Work Plan](../orchestrator/logs/2025-10-30_repeat-event-plan.md) - 전체 작업 세분화 및 우선순위

---

## 12. 다음 단계

### 12.1 즉시 실행 (Orchestrator)
1. 이 명세서 검증
2. Phase 1 커밋 및 태그 생성
3. Phase 2 Handoff 문서 생성 (test-designer용)

### 12.2 Phase 2 준비사항
- 이 명세서를 test-designer에게 전달
- 테스트 전략 수립 요청
- GWT 패턴 및 MSW 핸들러 설계

---

**명세서 작성 완료 시간**: 2025-10-30
**예상 구현 시간**: 약 6-8시간 (Phase 3-5)
**우선순위**: P0 (Critical)
**담당 에이전트**: feature-designer → test-designer → test-writer → code-writer → refactoring-expert
