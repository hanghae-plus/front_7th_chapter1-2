# 반복 일정 기능 상세 명세

> **메타데이터**
>
> - Agent: spec-analyzer
> - Status: success
> - Timestamp: 2025-10-31T10:00:00Z
> - Input Source: .claude/spec/SPEC_1.md
> - Total Features: 5개
> - Total Test Scenarios: 35개
> - Total Utility Functions: 8개
> - Estimated Cycles: 10개
> - Complexity: High
> - Output Version: 1.0

---

## 1. 기능 개요

### 1.1 목적
캘린더 애플리케이션에서 일정을 반복적으로 생성하고 관리하는 기능을 구현합니다. 사용자는 일정 생성 시 반복 유형(매일/매주/매월/매년)을 선택할 수 있으며, 생성된 반복 일정의 개별 인스턴스 또는 전체 그룹을 수정/삭제할 수 있습니다.

### 1.2 범위
- **포함**: 반복 설정 UI, 반복 인스턴스 생성 로직, 캘린더 표시, 단일/전체 수정, 단일/전체 삭제
- **제외**: 반복 일정 겹침 검사, 요일 선택 UI (매주 반복 시 생성일의 요일로 고정)

### 1.3 핵심 제약사항
1. **저장 시 즉시 생성 방식**: 사용자가 저장 버튼 클릭 시 프론트엔드에서 모든 반복 인스턴스를 개별 Event로 생성하여 서버에 전송
2. **최대 종료일**: 2025-12-31 (자동으로 DatePicker에 채워짐)
3. **반복 간격**: 사용자가 number input으로 설정 (최소 1)
4. **반복 그룹 식별**: 서버가 할당하는 `repeat.id`로 동일 그룹 식별

---

## 2. 데이터 모델

### 2.1 RepeatInfo 타입

```typescript
export interface RepeatInfo {
  type: RepeatType; // 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval: number; // 반복 간격 (최소 1)
  endDate?: string; // 종료 날짜 (YYYY-MM-DD, 최대 2025-12-31)
  id?: string; // 서버가 할당하는 반복 그룹 ID (반복 일정만 존재)
}
```

### 2.2 Event 타입

```typescript
export interface Event {
  id: string; // 개별 이벤트 ID (서버 할당)
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  description: string;
  location: string;
  category: string;
  repeat: RepeatInfo;
  notificationTime: number; // 분 단위
}
```

### 2.3 반복 일정의 데이터 특징

- **개별 인스턴스**: 각 반복 일정은 고유한 `id`를 가진 독립적인 Event
- **그룹 식별**: 같은 반복 그룹은 동일한 `repeat.id` 공유
- **단일 일정 전환**: `repeat.type = 'none'`이고 `repeat.id = undefined`로 변경

**예시 (1월 1일 매주 반복, 3회 생성)**:
```json
[
  {
    "id": "uuid-1",
    "title": "팀 미팅",
    "date": "2025-01-01",
    "repeat": {
      "type": "weekly",
      "interval": 1,
      "endDate": "2025-12-31",
      "id": "repeat-group-abc"
    }
  },
  {
    "id": "uuid-2",
    "title": "팀 미팅",
    "date": "2025-01-08",
    "repeat": {
      "type": "weekly",
      "interval": 1,
      "endDate": "2025-12-31",
      "id": "repeat-group-abc"
    }
  },
  {
    "id": "uuid-3",
    "title": "팀 미팅",
    "date": "2025-01-15",
    "repeat": {
      "type": "weekly",
      "interval": 1,
      "endDate": "2025-12-31",
      "id": "repeat-group-abc"
    }
  }
]
```

---

## 3. API 명세

### 3.1 반복 일정 생성

**엔드포인트**: `POST /api/events-list`

**요청**:
```typescript
{
  events: Event[] // 모든 반복 인스턴스 (id 없음)
}
```

**응답**:
```typescript
Event[] // 서버가 각 이벤트에 id + repeat.id 할당
```

**서버 동작**:
1. 새로운 `repeatId = randomUUID()` 생성
2. 각 이벤트에 고유한 `id` 할당
3. `repeat.type !== 'none'`인 이벤트에 동일한 `repeat.id` 할당
4. 모든 이벤트를 데이터베이스에 추가

### 3.2 단일 이벤트 수정

**엔드포인트**: `PUT /api/events/:id`

**요청**:
```typescript
Partial<Event> // 수정할 필드만 전송
```

**용도**: 반복 일정 중 하나만 수정 (단일 일정으로 전환)

### 3.3 전체 반복 일정 수정

**엔드포인트**: `PUT /api/recurring-events/:repeatId`

**요청**:
```typescript
{
  title?: string;
  description?: string;
  location?: string;
  category?: string;
  startTime?: string;
  endTime?: string;
  notificationTime?: number;
  repeat?: Partial<RepeatInfo>;
}
```

**주의**: 날짜는 수정 불가 (첫 이벤트 날짜 기준으로 재생성)

### 3.4 단일 이벤트 삭제

**엔드포인트**: `DELETE /api/events/:id`

### 3.5 전체 반복 일정 삭제

**엔드포인트**: `DELETE /api/recurring-events/:repeatId`

---

## 4. 기능 분해

### 기능 1: 반복 설정 UI

#### 4.1.1 입력
- 사용자가 이벤트 생성/수정 폼에서 반복 관련 필드 입력

#### 4.1.2 UI 구조

```jsx
<FormControl fullWidth>
  <FormLabel>반복 유형</FormLabel>
  <Select value={repeatType} onChange={handleRepeatTypeChange}>
    <MenuItem value="none">반복 안함</MenuItem>
    <MenuItem value="daily">매일</MenuItem>
    <MenuItem value="weekly">매주</MenuItem>
    <MenuItem value="monthly">매월</MenuItem>
    <MenuItem value="yearly">매년</MenuItem>
  </Select>
</FormControl>

{repeatType !== 'none' && (
  <>
    <FormControl fullWidth>
      <FormLabel>반복 간격</FormLabel>
      <TextField
        type="number"
        value={repeatInterval}
        onChange={handleIntervalChange}
        slotProps={{ htmlInput: { min: 1 } }}
      />
      <FormHelperText>
        {repeatType === 'daily' && `${repeatInterval}일마다`}
        {repeatType === 'weekly' && `${repeatInterval}주마다`}
        {repeatType === 'monthly' && `${repeatInterval}개월마다`}
        {repeatType === 'yearly' && `${repeatInterval}년마다`}
      </FormHelperText>
    </FormControl>

    <FormControl fullWidth>
      <FormLabel>반복 종료일</FormLabel>
      <TextField
        type="date"
        value={repeatEndDate}
        onChange={handleEndDateChange}
        slotProps={{ htmlInput: { max: "2025-12-31" } }}
      />
      <FormHelperText>최대 2025-12-31까지 설정 가능</FormHelperText>
    </FormControl>
  </>
)}
```

#### 4.1.3 상태 관리

```typescript
const [repeatType, setRepeatType] = useState<RepeatType>('none');
const [repeatInterval, setRepeatInterval] = useState<number>(1);
const [repeatEndDate, setRepeatEndDate] = useState<string>('2025-12-31');
```

#### 4.1.4 검증 규칙

1. **반복 간격**: 최소 1 이상
2. **종료일**:
   - 시작 날짜보다 이후여야 함
   - 최대 2025-12-31
   - YYYY-MM-DD 형식
3. **반복 유형**: 'none' 선택 시 간격/종료일 필드 숨김

#### 4.1.5 엣지 케이스

| 상황 | 처리 |
|------|------|
| 반복 간격에 0 또는 음수 입력 | 최소값 1로 강제 조정 |
| 종료일이 2025-12-31 이후 | DatePicker에서 선택 불가 (max 속성) |
| 종료일이 시작 날짜보다 이전 | 에러 메시지 표시, 저장 버튼 비활성화 |
| 'none'에서 반복 유형으로 변경 | 기본값 자동 설정 (간격 1, 종료일 2025-12-31) |

---

### 기능 2: 반복 인스턴스 생성 로직

#### 4.2.1 입력
- `eventForm: EventForm` (사용자 입력)
- `endDate: string` (종료 날짜, 최대 2025-12-31)

#### 4.2.2 처리 로직

**핵심 함수**: `generateRecurringInstances`

```typescript
function generateRecurringInstances(
  eventForm: EventForm,
  endDate: string
): Omit<Event, 'id'>[] {
  const instances: Omit<Event, 'id'>[] = [];
  const baseDate = new Date(eventForm.date);
  const maxDate = new Date(endDate);

  let currentDate = new Date(baseDate);

  // 첫 이벤트는 무조건 추가
  instances.push({ ...eventForm, date: formatDate(currentDate) });

  // 다음 발생일 계산 반복
  while (true) {
    const nextDate = getNextOccurrence(
      currentDate,
      eventForm.repeat.type,
      eventForm.repeat.interval,
      baseDate
    );

    if (!nextDate || nextDate > maxDate) break;

    // 날짜 건너뛰기 체크 (31일, 윤년)
    if (shouldSkipDate(nextDate, eventForm.repeat.type, baseDate.getDate())) {
      currentDate = nextDate;
      continue;
    }

    instances.push({ ...eventForm, date: formatDate(nextDate) });
    currentDate = nextDate;
  }

  return instances;
}
```

#### 4.2.3 출력
- `Omit<Event, 'id'>[]`: 개별 이벤트 배열 (id 제외, 서버가 할당)

#### 4.2.4 반복 간격 적용 규칙

| 반복 유형 | 계산 방식 | 예시 |
|----------|----------|------|
| **매일** | `baseDate + (interval × n)일` | 1/1 + 간격 2 → 1/1, 1/3, 1/5, 1/7... |
| **매주** | `baseDate + (interval × n)주` (같은 요일) | 1/1(수) + 간격 2 → 1/1, 1/15, 1/29... |
| **매월** | `baseDate + (interval × n)월` (같은 일자) | 1/15 + 간격 2 → 1/15, 3/15, 5/15... |
| **매년** | `baseDate + (interval × n)년` (같은 월일) | 1/15 + 간격 2 → 2025/1/15, 2027/1/15... |

#### 4.2.5 엣지 케이스

##### 엣지 케이스 1: 31일 매월 반복

**조건**: `baseDate.getDate() === 31` && `repeatType === 'monthly'`

**처리**:
- 31일이 없는 달(2월, 4월, 6월, 9월, 11월) **건너뛰기**
- 매월 마지막 날이 아닌, 정확히 31일에만 생성

**예시**:
```typescript
// 입력: 2025-01-31 + 매월 간격 1 + 종료 2025-12-31
// 출력: [1/31, 3/31, 5/31, 7/31, 8/31, 10/31, 12/31]
// 건너뜀: 2월(28일), 4월(30일), 6월(30일), 9월(30일), 11월(30일)

// 입력: 2025-01-31 + 매월 간격 2 + 종료 2025-12-31
// 출력: [1/31, 3/31, 5/31, 7/31]
// 건너뜀: 9월(간격 규칙 위배), 11월(간격 규칙 위배)
```

**구현**:
```typescript
function shouldSkipDate(
  date: Date,
  repeatType: RepeatType,
  baseDay: number
): boolean {
  if (repeatType === 'monthly' && baseDay === 31) {
    return date.getDate() !== 31;
  }
  return false;
}
```

##### 엣지 케이스 2: 윤년 2월 29일

**조건**: `baseDate.getMonth() === 1` && `baseDate.getDate() === 29` && `repeatType === 'yearly'`

**처리**:
- 2025년은 윤년 아님 → **2/29 선택 불가** (캘린더에 표시 안됨)
- 윤년에만 2/29 생성, 평년에는 건너뜀

**예시**:
```typescript
// 입력: 2024-02-29 + 매년 간격 1 + 종료 2040-12-31
// 출력: [2024-02-29, 2028-02-29, 2032-02-29, 2036-02-29, 2040-02-29]
// 건너뜀: 2025, 2026, 2027, 2029, 2030, 2031, 2033, 2034, 2035, 2037, 2038, 2039
```

**구현**:
```typescript
function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

function shouldSkipDate(
  date: Date,
  repeatType: RepeatType,
  baseDay: number,
  baseMonth: number
): boolean {
  if (repeatType === 'yearly' && baseMonth === 1 && baseDay === 29) {
    return !isLeapYear(date.getFullYear()) || date.getDate() !== 29;
  }
  if (repeatType === 'monthly' && baseDay === 31) {
    return date.getDate() !== 31;
  }
  return false;
}
```

##### 엣지 케이스 3: 매주 반복 (요일 고정)

**조건**: `repeatType === 'weekly'`

**처리**:
- 생성일의 요일로 자동 고정 (요일 선택 UI 없음)
- 예: 월요일 생성 → 매주 월요일

**예시**:
```typescript
// 입력: 2025-01-06(월) + 매주 간격 1
// 출력: [1/6(월), 1/13(월), 1/20(월), 1/27(월), 2/3(월)...]

// 입력: 2025-01-07(화) + 매주 간격 2
// 출력: [1/7(화), 1/21(화), 2/4(화), 2/18(화)...]
```

##### 엣지 케이스 4: 생성 실패 방지

**원칙**: 선택한 날짜에는 **무조건 첫 이벤트 생성**

**예시**:
```typescript
// 입력: 2025-12-15 + 매월 31일 + 종료 2025-12-31
// 출력: [12/15(첫 이벤트), 12/31(반복 규칙 적용)]
// 이유: 15일에 생성했으므로 15일은 무조건 생성

// 입력: 2025-02-01 + 매월 31일 + 종료 2025-12-31
// 출력: [2/1(첫 이벤트), 3/31, 5/31, 7/31, 8/31, 10/31, 12/31]
// 이유: 2월은 31일이 없지만 생성일은 2/1이므로 2/1은 생성
```

##### 엣지 케이스 5: 반복 간격과 건너뛰기 상호작용

**조건**: `interval > 1` && 날짜 건너뛰기 발생

**예시**:
```typescript
// 입력: 2025-01-31 + 매월 간격 2 + 종료 2025-12-31
// 계산 과정:
// 1. 1/31 (시작)
// 2. 3/31 (1월 + 2개월)
// 3. 5/31 (3월 + 2개월)
// 4. 7/31 (5월 + 2개월)
// 5. 9/30 계산 → 31일 없음 → 건너뜀
// 6. 11/30 계산 → 31일 없음 → 건너뜀
// 출력: [1/31, 3/31, 5/31, 7/31]

// 중요: 간격 계산은 "실제 생성된 날짜"가 아닌 "이론상 날짜" 기준
```

---

### 기능 3: 캘린더 표시

#### 4.3.1 입력
- `events: Event[]` (모든 이벤트 목록)
- `currentDate: Date` (현재 뷰의 기준 날짜)

#### 4.3.2 처리

1. **필터링**: 현재 뷰(월간/주간)에 해당하는 날짜 범위의 이벤트만 표시
2. **반복 아이콘 표시**: `event.repeat.type !== 'none'`인 이벤트에 RepeatIcon 추가
3. **그룹화**: 같은 날짜의 이벤트를 그룹화하여 표시

```jsx
{filteredEvents.map(event => (
  <EventCard key={event.id} onClick={() => handleEventClick(event)}>
    <EventTitle>
      {event.repeat.type !== 'none' && <RepeatIcon />}
      {event.title}
    </EventTitle>
    <EventTime>{event.startTime} - {event.endTime}</EventTime>
  </EventCard>
))}
```

#### 4.3.3 출력
- 캘린더 뷰에 이벤트 카드 렌더링
- 반복 일정에는 RepeatIcon 표시

#### 4.3.4 엣지 케이스

| 상황 | 처리 |
|------|------|
| 같은 날짜에 반복 일정 여러 개 | 각각 독립적으로 RepeatIcon 표시 |
| 단일 일정으로 전환된 이벤트 | RepeatIcon 표시 안 함 |
| 주간/월간 뷰 전환 | 두 뷰 모두 동일한 로직으로 RepeatIcon 표시 |

---

### 기능 4: 단일/전체 수정

#### 4.4.1 입력
- 사용자가 반복 일정 클릭 → 수정 버튼 클릭

#### 4.4.2 처리: Dialog 표시

```jsx
<Dialog open={isEditDialogOpen} onClose={handleDialogClose}>
  <DialogTitle>반복 일정 수정</DialogTitle>
  <DialogContent>
    <DialogContentText>
      해당 일정만 수정하시겠어요?
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleEditSingle}>예</Button>
    <Button onClick={handleEditAll}>아니오</Button>
  </DialogActions>
</Dialog>
```

#### 4.4.3 출력

##### 출력 1: 단일 수정 ("예" 선택)

**동작**:
1. `repeat.type = 'none'` 설정
2. `repeat.id = undefined` 설정
3. **모든 필드 변경 가능 (날짜 포함)**
4. RepeatIcon 사라짐
5. `PUT /api/events/:id` 호출

**API 요청**:
```typescript
PUT /api/events/uuid-2
{
  "title": "개별 미팅", // 수정 가능
  "date": "2025-01-10", // 날짜 변경 가능 (원래 1/8 → 1/10)
  "startTime": "15:00", // 시간 변경 가능
  "repeat": {
    "type": "none",
    "interval": 1,
    "id": undefined // 반복 그룹에서 제외
  }
}
```

**결과**:
- 원래 날짜(1/8)에서 이벤트 사라짐
- 새 날짜(1/10)에 단일 일정으로 표시
- 다른 반복 일정(1/1, 1/15...)은 그대로 유지

##### 출력 2: 전체 수정 ("아니오" 선택)

**동작**:
1. **변경 가능 필드**:
   - 제목/설명/위치/카테고리
   - 시작/종료 시간
   - 반복 유형
   - 반복 간격
   - 반복 종료일
2. **날짜 변경 불가**: 원래 반복 그룹의 **첫 이벤트 날짜** 기준으로 재생성
3. **변경된 설정에 맞지 않는 인스턴스 자동 제거**
4. RepeatIcon 유지

**구현 플로우**:
```typescript
async function handleEditAll(event: Event, newData: Partial<EventForm>) {
  // 1. 같은 repeat.id를 가진 모든 이벤트 찾기
  const groupEvents = events.filter(e => e.repeat.id === event.repeat.id);

  // 2. 첫 이벤트 날짜 찾기 (가장 빠른 날짜)
  const sortedEvents = groupEvents.sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const firstEventDate = sortedEvents[0].date;

  // 3. 기존 그룹 전체 삭제
  await fetch(`/api/recurring-events/${event.repeat.id}`, {
    method: 'DELETE'
  });

  // 4. 첫 이벤트 날짜 기준으로 새 설정 적용하여 인스턴스 재생성
  const updatedForm: EventForm = {
    ...event,
    ...newData,
    date: firstEventDate, // 첫 이벤트 날짜 기준
  };

  const newInstances = generateRecurringInstances(
    updatedForm,
    newData.repeat?.endDate || event.repeat.endDate
  );

  // 5. 새 그룹 생성
  await fetch('/api/events-list', {
    method: 'POST',
    body: JSON.stringify({ events: newInstances })
  });
}
```

**예시 1: 반복 유형 변경**
```typescript
// 기존: 1/1, 1/2, 1/3, 1/4, 1/5 (매일)
// 사용자: 1/3 클릭 → "아니오" → 매주(월요일)로 변경

// 1. 첫 이벤트 날짜: 1/1 (수요일)
// 2. 기존 그룹 전체 삭제
// 3. 1/1 기준 + 매주(수요일) 재생성
// 결과: 1/1(수), 1/8(수), 1/15(수), 1/22(수)...
```

**예시 2: 종료일 단축**
```typescript
// 기존: 1/31, 3/31, 5/31, 7/31, 8/31, 10/31, 12/31 (매월 31일)
// 사용자: 5/31 클릭 → "아니오" → 종료일 2025-06-30으로 변경

// 1. 첫 이벤트 날짜: 1/31
// 2. 기존 그룹 전체 삭제
// 3. 1/31 기준 + 종료일 6/30 재생성
// 결과: 1/31, 3/31, 5/31 (7/31 이후 제거)
```

**예시 3: 반복 간격 변경**
```typescript
// 기존: 1/1, 1/8, 1/15, 1/22, 1/29 (매주 간격 1)
// 사용자: 1/15 클릭 → "아니오" → 간격 2로 변경

// 1. 첫 이벤트 날짜: 1/1
// 2. 기존 그룹 전체 삭제
// 3. 1/1 기준 + 2주마다 재생성
// 결과: 1/1, 1/15, 1/29, 2/12, 2/26...
// 제거: 1/8, 1/22 (2주 간격에 맞지 않음)
```

#### 4.4.4 엣지 케이스

##### 엣지 케이스 1: 단일 수정 후 날짜 변경

**시나리오**: 1/8 반복 일정을 단일 수정 → 날짜를 1/10으로 변경

**처리**:
1. 1/8에서 이벤트 사라짐
2. 1/10에 단일 일정으로 표시
3. `repeat.type = 'none'`, `repeat.id = undefined`

##### 엣지 케이스 2: 전체 수정 시 첫 이벤트가 아닌 중간 이벤트 클릭

**시나리오**: 1/1, 1/8, 1/15 그룹에서 1/15 클릭 → "아니오"

**처리**:
1. 첫 이벤트 날짜(1/1) 찾기
2. 1/1 기준으로 재생성
3. 1/15는 기준 날짜가 아님 (사용자가 어느 이벤트를 클릭하든 첫 이벤트 기준)

##### 엣지 케이스 3: 전체 수정 시 새 설정으로 첫 이벤트가 건너뛰어지는 경우

**시나리오**: 1/1, 1/8 (매주) → 1/8 클릭 → "아니오" → 매월 31일로 변경

**처리**:
1. 첫 이벤트 날짜: 1/1
2. 1/1 + 매월 31일 규칙 적용
3. 1/1(첫 이벤트 무조건 생성), 1/31, 3/31, 5/31...
4. 원래 1/8은 사라짐 (새 규칙에 맞지 않음)

##### 엣지 케이스 4: 전체 수정 중 API 실패

**시나리오**: 삭제는 성공했지만 재생성 실패

**처리**:
1. 트랜잭션 개념 부재 → 롤백 불가
2. **해결 방안**: 삭제 전 새 인스턴스 생성 검증
3. 에러 발생 시 사용자에게 에러 메시지 표시
4. 페이지 새로고침 유도

```typescript
async function handleEditAll(event: Event, newData: Partial<EventForm>) {
  try {
    // 1. 새 인스턴스 생성 (검증 단계)
    const newInstances = generateRecurringInstances(...);
    if (newInstances.length === 0) {
      throw new Error('생성할 반복 일정이 없습니다');
    }

    // 2. 삭제 + 생성 (순차 실행)
    await fetch(`/api/recurring-events/${event.repeat.id}`, {
      method: 'DELETE'
    });

    await fetch('/api/events-list', {
      method: 'POST',
      body: JSON.stringify({ events: newInstances })
    });

  } catch (error) {
    alert('반복 일정 수정 중 오류 발생. 페이지를 새로고침하세요.');
    // 로그 기록 또는 에러 리포팅
  }
}
```

---

### 기능 5: 단일/전체 삭제

#### 4.5.1 입력
- 사용자가 반복 일정 클릭 → 삭제 버튼 클릭

#### 4.5.2 처리: Dialog 표시

```jsx
<Dialog open={isDeleteDialogOpen} onClose={handleDialogClose}>
  <DialogTitle>반복 일정 삭제</DialogTitle>
  <DialogContent>
    <DialogContentText>
      해당 일정만 삭제하시겠어요?
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleDeleteSingle} color="error">예</Button>
    <Button onClick={handleDeleteAll} color="error">아니오</Button>
  </DialogActions>
</Dialog>
```

#### 4.5.3 출력

##### 출력 1: 단일 삭제 ("예" 선택)

**동작**:
1. 해당 이벤트만 삭제
2. 다른 반복 일정은 그대로 유지
3. `DELETE /api/events/:id` 호출

**예시**:
```typescript
// 기존: 1/1, 1/8, 1/15 (매주)
// 사용자: 1/8 클릭 → 삭제 → "예"
// 결과: 1/1, 1/15 (1/8만 삭제)
```

##### 출력 2: 전체 삭제 ("아니오" 선택)

**동작**:
1. 같은 `repeat.id`를 가진 모든 이벤트 삭제
2. `DELETE /api/recurring-events/:repeatId` 호출

**예시**:
```typescript
// 기존: 1/1, 1/8, 1/15 (매주, repeat.id = 'abc')
// 사용자: 1/8 클릭 → 삭제 → "아니오"
// 결과: 모든 이벤트 삭제 (1/1, 1/8, 1/15 모두 제거)
```

#### 4.5.4 엣지 케이스

| 상황 | 처리 |
|------|------|
| 단일 삭제 후 그룹에 1개만 남음 | 그대로 유지 (RepeatIcon 유지) |
| 전체 삭제 시 다른 그룹 영향 | 영향 없음 (repeat.id 기준 삭제) |
| 삭제 중 API 실패 | 에러 메시지 표시, 페이지 새로고침 유도 |

---

## 5. 테스트 시나리오

### 5.1 Happy Path (10개)

#### TC-H01: 매일 반복 생성
**Given**: 사용자가 2025-01-01에 일정 생성
**When**: 반복 유형 "매일", 간격 1, 종료일 2025-01-10 선택 후 저장
**Then**: 1/1 ~ 1/10까지 10개 이벤트 생성, 모든 이벤트에 RepeatIcon 표시

#### TC-H02: 매주 반복 생성 (월요일)
**Given**: 사용자가 2025-01-06(월)에 일정 생성
**When**: 반복 유형 "매주", 간격 1, 종료일 2025-01-31 선택 후 저장
**Then**: 1/6, 1/13, 1/20, 1/27에 이벤트 생성 (모두 월요일)

#### TC-H03: 매월 반복 생성 (15일)
**Given**: 사용자가 2025-01-15에 일정 생성
**When**: 반복 유형 "매월", 간격 1, 종료일 2025-05-31 선택 후 저장
**Then**: 1/15, 2/15, 3/15, 4/15, 5/15에 이벤트 생성

#### TC-H04: 매년 반복 생성
**Given**: 사용자가 2025-01-15에 일정 생성
**When**: 반복 유형 "매년", 간격 1, 종료일 2028-12-31 선택 후 저장
**Then**: 2025/1/15, 2026/1/15, 2027/1/15, 2028/1/15에 이벤트 생성

#### TC-H05: 단일 수정 (날짜 변경)
**Given**: 1/1, 1/8, 1/15 반복 일정 존재
**When**: 1/8 클릭 → 수정 → "예" → 날짜를 1/10으로 변경 후 저장
**Then**: 1/1, 1/10, 1/15로 표시, 1/10은 단일 일정 (RepeatIcon 없음)

#### TC-H06: 전체 수정 (제목 변경)
**Given**: 1/1, 1/8, 1/15 반복 일정 존재 (제목 "팀 미팅")
**When**: 1/8 클릭 → 수정 → "아니오" → 제목을 "전체 회의"로 변경 후 저장
**Then**: 1/1, 1/8, 1/15 모두 제목이 "전체 회의"로 변경, RepeatIcon 유지

#### TC-H07: 단일 삭제
**Given**: 1/1, 1/8, 1/15 반복 일정 존재
**When**: 1/8 클릭 → 삭제 → "예"
**Then**: 1/1, 1/15만 남음

#### TC-H08: 전체 삭제
**Given**: 1/1, 1/8, 1/15 반복 일정 존재
**When**: 1/8 클릭 → 삭제 → "아니오"
**Then**: 모든 이벤트 삭제 (1/1, 1/8, 1/15 모두 제거)

#### TC-H09: 반복 간격 2로 매주 생성
**Given**: 사용자가 2025-01-06(월)에 일정 생성
**When**: 반복 유형 "매주", 간격 2, 종료일 2025-03-31 선택 후 저장
**Then**: 1/6(월), 1/20(월), 2/3(월), 2/17(월), 3/3(월), 3/17(월), 3/31(월)에 이벤트 생성

#### TC-H10: 반복 유형 'none' 선택
**Given**: 사용자가 일정 생성 폼에서 반복 유형 선택
**When**: "반복 안함" 선택
**Then**: 간격/종료일 필드 숨김, 저장 시 단일 일정 생성

---

### 5.2 Edge Cases (20개)

#### TC-E01: 31일 매월 반복 (건너뛰기)
**Given**: 사용자가 2025-01-31에 일정 생성
**When**: 반복 유형 "매월", 간격 1, 종료일 2025-12-31 선택 후 저장
**Then**: 1/31, 3/31, 5/31, 7/31, 8/31, 10/31, 12/31에만 생성 (2/4/6/9/11월 건너뜀)

#### TC-E02: 31일 매월 반복 (간격 2)
**Given**: 사용자가 2025-01-31에 일정 생성
**When**: 반복 유형 "매월", 간격 2, 종료일 2025-12-31 선택 후 저장
**Then**: 1/31, 3/31, 5/31, 7/31에만 생성 (9/11월은 간격 규칙과 31일 규칙 모두 위배)

#### TC-E03: 윤년 2월 29일 매년 반복
**Given**: 윤년(2024)에 2024-02-29에 일정 생성
**When**: 반복 유형 "매년", 간격 1, 종료일 2040-12-31 선택 후 저장
**Then**: 2024/2/29, 2028/2/29, 2032/2/29, 2036/2/29, 2040/2/29에만 생성

#### TC-E04: 2025년에 2월 29일 선택 불가
**Given**: 2025년은 윤년 아님
**When**: 사용자가 2월 달력에서 날짜 선택 시도
**Then**: 2/29가 달력에 표시되지 않음 (선택 불가)

#### TC-E05: 매월 31일 선택 → 12월 15일에 생성
**Given**: 사용자가 2025-12-15에 일정 생성
**When**: 반복 유형 "매월", 간격 1, 종료일 2025-12-31, 기준일 31일 선택 후 저장
**Then**: 12/15(첫 이벤트), 12/31(반복 규칙)에 생성

#### TC-E06: 전체 수정 - 반복 유형 변경 (매일 → 매주)
**Given**: 1/1, 1/2, 1/3 (매일) 반복 일정 존재
**When**: 1/2 클릭 → 수정 → "아니오" → 매주(수요일)로 변경
**Then**: 1/1(수), 1/8(수), 1/15(수)... 로 재생성, 1/2, 1/3 삭제

#### TC-E07: 전체 수정 - 종료일 단축
**Given**: 1/1 ~ 12/31 (매일) 반복 일정 존재
**When**: 6/15 클릭 → 수정 → "아니오" → 종료일 2025-06-30으로 변경
**Then**: 1/1 ~ 6/30만 남음, 7/1 이후 모두 삭제

#### TC-E08: 전체 수정 - 간격 변경 (1 → 2)
**Given**: 1/1, 1/8, 1/15, 1/22 (매주 간격 1) 반복 일정 존재
**When**: 1/15 클릭 → 수정 → "아니오" → 간격 2로 변경
**Then**: 1/1, 1/15, 1/29... 로 재생성, 1/8, 1/22 삭제

#### TC-E09: 전체 수정 - 첫 이벤트가 아닌 중간 이벤트 클릭
**Given**: 1/1, 1/8, 1/15 (매주) 반복 일정 존재
**When**: 1/15 클릭 → 수정 → "아니오" → 제목 변경
**Then**: 첫 이벤트 날짜(1/1) 기준으로 재생성, 모든 이벤트 제목 변경

#### TC-E10: 전체 수정 - 새 설정으로 첫 이벤트가 건너뛰어지는 경우
**Given**: 1/1, 1/8 (매주) 반복 일정 존재
**When**: 1/8 클릭 → 수정 → "아니오" → 매월 31일로 변경
**Then**: 1/1(첫 이벤트), 1/31, 3/31... 로 재생성, 1/8 삭제

#### TC-E11: 단일 수정 후 다시 전체 수정 시도
**Given**: 1/1, 1/8 (매주) 반복 일정 + 1/8을 단일 수정하여 단일 일정으로 전환
**When**: 1/8(단일 일정) 클릭 → 수정 시도
**Then**: Dialog 표시 안 함, 직접 수정 폼 표시

#### TC-E12: 반복 간격에 0 입력 시도
**Given**: 사용자가 반복 설정 폼에서 간격 입력
**When**: 0 입력
**Then**: 자동으로 1로 조정 (HTML min 속성)

#### TC-E13: 종료일이 시작 날짜보다 이전
**Given**: 사용자가 2025-01-15에 일정 생성
**When**: 종료일 2025-01-10 선택
**Then**: 에러 메시지 표시 ("종료일은 시작 날짜 이후여야 합니다"), 저장 버튼 비활성화

#### TC-E14: 종료일이 2025-12-31 이후 입력 시도
**Given**: 사용자가 종료일 입력
**When**: 2026-01-01 입력 시도
**Then**: DatePicker에서 선택 불가 (max="2025-12-31")

#### TC-E15: 같은 날짜에 여러 반복 일정
**Given**: 1/1에 "회의 A" (매주) + "회의 B" (매일) 반복 일정 존재
**When**: 캘린더에서 1/1 확인
**Then**: 두 이벤트 모두 RepeatIcon 표시, 독립적으로 관리

#### TC-E16: 단일 삭제 후 그룹에 1개만 남음
**Given**: 1/1, 1/8 (매주) 반복 일정 존재
**When**: 1/1 삭제 → "예"
**Then**: 1/8만 남음, 여전히 RepeatIcon 표시 (repeat.id 유지)

#### TC-E17: 반복 일정 생성 시 첫 이벤트만 생성되는 경우
**Given**: 사용자가 2025-12-31에 일정 생성
**When**: 반복 유형 "매일", 간격 1, 종료일 2025-12-31 선택 후 저장
**Then**: 12/31 1개만 생성

#### TC-E18: 매주 반복 (금요일) → 종료일까지 정확히 계산
**Given**: 사용자가 2025-01-03(금)에 일정 생성
**When**: 반복 유형 "매주", 간격 1, 종료일 2025-01-31 선택 후 저장
**Then**: 1/3, 1/10, 1/17, 1/24, 1/31에 이벤트 생성 (모두 금요일)

#### TC-E19: 전체 수정 중 API 삭제 성공, 생성 실패
**Given**: 1/1, 1/8 (매주) 반복 일정 존재
**When**: 1/8 클릭 → 수정 → "아니오" → 제목 변경 → API 생성 실패
**Then**: 에러 메시지 표시 ("반복 일정 수정 중 오류 발생"), 페이지 새로고침 유도

#### TC-E20: 반복 일정 생성 중 서버 에러
**Given**: 사용자가 반복 일정 생성 시도
**When**: 서버 응답 500 에러
**Then**: 에러 메시지 표시, 폼 데이터 유지 (재시도 가능)

---

### 5.3 Error Cases (5개)

#### TC-ERR01: API 타임아웃
**Given**: 네트워크 연결 불안정
**When**: 반복 일정 생성/수정/삭제 요청
**Then**: 타임아웃 에러 메시지 표시, 재시도 버튼 제공

#### TC-ERR02: 잘못된 repeat.id로 전체 수정 시도
**Given**: 서버에 존재하지 않는 repeat.id
**When**: 전체 수정 시도
**Then**: 404 에러, "반복 일정을 찾을 수 없습니다" 메시지 표시

#### TC-ERR03: 동시 수정 충돌
**Given**: 두 사용자가 동일한 반복 일정 그룹을 동시에 수정
**When**: 두 번째 사용자 저장 시도
**Then**: 충돌 에러, "다른 사용자가 수정했습니다. 새로고침 후 다시 시도하세요" 메시지 표시

#### TC-ERR04: 서버 데이터 불일치
**Given**: 프론트엔드 캐시와 서버 데이터 불일치
**When**: 삭제된 이벤트 수정 시도
**Then**: 404 에러, 자동으로 이벤트 목록 새로고침

#### TC-ERR05: 잘못된 날짜 형식
**Given**: 사용자가 날짜 필드를 직접 수동 입력
**When**: "2025/01/01" 형식 입력 (올바른 형식: "2025-01-01")
**Then**: 폼 검증 에러, "올바른 날짜 형식(YYYY-MM-DD)을 입력하세요" 메시지 표시

---

## 6. 유틸리티 함수

### 6.1 generateRecurringInstances

#### 목적
사용자 입력을 기반으로 반복 일정의 모든 인스턴스를 생성합니다.

#### 시그니처
```typescript
function generateRecurringInstances(
  eventForm: EventForm,
  endDate: string
): Omit<Event, 'id'>[]
```

#### 입력
- `eventForm: EventForm` - 사용자 입력 (date, repeat.type, repeat.interval 포함)
- `endDate: string` - 반복 종료 날짜 (YYYY-MM-DD, 최대 2025-12-31)

#### 출력
- `Omit<Event, 'id'>[]` - 개별 이벤트 배열 (id 제외)

#### 로직
1. `baseDate` 파싱 (eventForm.date)
2. 첫 이벤트 무조건 추가 (instances.push)
3. while 루프:
   - `getNextOccurrence`로 다음 날짜 계산
   - 종료일 초과 시 break
   - `shouldSkipDate`로 건너뛰기 체크
   - 유효하면 instances에 추가
4. instances 반환

#### 엣지 케이스
- **첫 이벤트만**: `endDate === eventForm.date` → 1개 반환
- **건너뛰기**: 31일, 윤년 처리
- **최대 생성 수**: 메모리 보호를 위해 최대 1000개 제한 (2025-12-31 제약으로 실질적으로 초과 불가)

#### 테스트 예시
```typescript
describe('generateRecurringInstances', () => {
  it('매일 반복 생성 (3일)', () => {
    const form: EventForm = {
      date: '2025-01-01',
      repeat: { type: 'daily', interval: 1, endDate: '2025-01-03' },
      // ... 기타 필드
    };
    const result = generateRecurringInstances(form, '2025-01-03');
    expect(result).toHaveLength(3);
    expect(result[0].date).toBe('2025-01-01');
    expect(result[1].date).toBe('2025-01-02');
    expect(result[2].date).toBe('2025-01-03');
  });

  it('31일 매월 반복 (건너뛰기)', () => {
    const form: EventForm = {
      date: '2025-01-31',
      repeat: { type: 'monthly', interval: 1, endDate: '2025-05-31' },
      // ... 기타 필드
    };
    const result = generateRecurringInstances(form, '2025-05-31');
    expect(result).toHaveLength(3); // 1/31, 3/31, 5/31
    expect(result.map(e => e.date)).toEqual(['2025-01-31', '2025-03-31', '2025-05-31']);
  });
});
```

---

### 6.2 getNextOccurrence

#### 목적
현재 날짜를 기반으로 다음 반복 발생일을 계산합니다.

#### 시그니처
```typescript
function getNextOccurrence(
  currentDate: Date,
  repeatType: RepeatType,
  interval: number,
  baseDate: Date
): Date | null
```

#### 입력
- `currentDate: Date` - 현재 날짜
- `repeatType: RepeatType` - 반복 유형
- `interval: number` - 반복 간격
- `baseDate: Date` - 기준 날짜 (첫 이벤트 날짜)

#### 출력
- `Date | null` - 다음 발생일 (없으면 null)

#### 로직
```typescript
switch (repeatType) {
  case 'daily':
    return new Date(currentDate.getTime() + interval * 24 * 60 * 60 * 1000);

  case 'weekly':
    return new Date(currentDate.getTime() + interval * 7 * 24 * 60 * 60 * 1000);

  case 'monthly':
    const nextMonth = new Date(currentDate);
    nextMonth.setMonth(nextMonth.getMonth() + interval);
    nextMonth.setDate(baseDate.getDate()); // 기준일로 설정
    return nextMonth;

  case 'yearly':
    const nextYear = new Date(currentDate);
    nextYear.setFullYear(nextYear.getFullYear() + interval);
    nextYear.setMonth(baseDate.getMonth());
    nextYear.setDate(baseDate.getDate());
    return nextYear;

  default:
    return null;
}
```

#### 엣지 케이스
- **매월 31일**: `setDate(31)` → 자동으로 다음 달 초로 넘어감 (이후 `shouldSkipDate`에서 필터링)
- **윤년 2/29**: `setDate(29)` → 평년은 3/1로 넘어감 (이후 필터링)

#### 테스트 예시
```typescript
describe('getNextOccurrence', () => {
  it('매일 간격 1', () => {
    const current = new Date('2025-01-01');
    const base = new Date('2025-01-01');
    const next = getNextOccurrence(current, 'daily', 1, base);
    expect(formatDate(next!)).toBe('2025-01-02');
  });

  it('매월 간격 1 (31일)', () => {
    const current = new Date('2025-01-31');
    const base = new Date('2025-01-31');
    const next = getNextOccurrence(current, 'monthly', 1, base);
    // 2/31은 3/3으로 자동 조정되지만, shouldSkipDate에서 필터링됨
    expect(next!.getDate()).not.toBe(31);
  });
});
```

---

### 6.3 shouldSkipDate

#### 목적
특정 날짜가 반복 규칙에 따라 건너뛰어야 하는지 판단합니다.

#### 시그니처
```typescript
function shouldSkipDate(
  date: Date,
  repeatType: RepeatType,
  baseDay: number,
  baseMonth?: number
): boolean
```

#### 입력
- `date: Date` - 체크할 날짜
- `repeatType: RepeatType` - 반복 유형
- `baseDay: number` - 기준일 (1-31)
- `baseMonth?: number` - 기준월 (0-11, 매년 반복 시 사용)

#### 출력
- `boolean` - true면 건너뜀, false면 생성

#### 로직
```typescript
if (repeatType === 'monthly' && baseDay === 31) {
  return date.getDate() !== 31;
}

if (repeatType === 'yearly' && baseMonth === 1 && baseDay === 29) {
  return !isLeapYear(date.getFullYear()) || date.getDate() !== 29;
}

return false;
```

#### 엣지 케이스
- **31일 매월**: 정확히 31일이 아니면 건너뜀
- **2/29 매년**: 윤년 아니거나 29일이 아니면 건너뜀

#### 테스트 예시
```typescript
describe('shouldSkipDate', () => {
  it('2월 31일은 건너뜀 (매월 31일 반복)', () => {
    const date = new Date('2025-02-28');
    expect(shouldSkipDate(date, 'monthly', 31)).toBe(true);
  });

  it('3월 31일은 생성 (매월 31일 반복)', () => {
    const date = new Date('2025-03-31');
    expect(shouldSkipDate(date, 'monthly', 31)).toBe(false);
  });

  it('평년 2/29는 건너뜀 (매년 2/29 반복)', () => {
    const date = new Date('2025-02-28');
    expect(shouldSkipDate(date, 'yearly', 29, 1)).toBe(true);
  });
});
```

---

### 6.4 isLeapYear

#### 목적
주어진 연도가 윤년인지 판단합니다.

#### 시그니처
```typescript
function isLeapYear(year: number): boolean
```

#### 입력
- `year: number` - 연도 (예: 2024)

#### 출력
- `boolean` - true면 윤년, false면 평년

#### 로직
```typescript
return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
```

#### 규칙
1. 4로 나누어떨어지면 윤년
2. 단, 100으로 나누어떨어지면 평년
3. 단, 400으로 나누어떨어지면 윤년

#### 테스트 예시
```typescript
describe('isLeapYear', () => {
  it('2024는 윤년', () => {
    expect(isLeapYear(2024)).toBe(true);
  });

  it('2025는 평년', () => {
    expect(isLeapYear(2025)).toBe(false);
  });

  it('2000은 윤년 (400으로 나누어떨어짐)', () => {
    expect(isLeapYear(2000)).toBe(true);
  });

  it('1900은 평년 (100으로 나누어떨어지지만 400으로는 안됨)', () => {
    expect(isLeapYear(1900)).toBe(false);
  });
});
```

---

### 6.5 getDayOfWeek

#### 목적
날짜의 요일을 반환합니다 (0=일요일, 6=토요일).

#### 시그니처
```typescript
function getDayOfWeek(date: Date): number
```

#### 입력
- `date: Date` - 날짜

#### 출력
- `number` - 0-6 (0=일요일, 6=토요일)

#### 로직
```typescript
return date.getDay();
```

#### 테스트 예시
```typescript
describe('getDayOfWeek', () => {
  it('2025-01-06은 월요일 (1)', () => {
    const date = new Date('2025-01-06');
    expect(getDayOfWeek(date)).toBe(1);
  });

  it('2025-01-05는 일요일 (0)', () => {
    const date = new Date('2025-01-05');
    expect(getDayOfWeek(date)).toBe(0);
  });
});
```

---

### 6.6 formatDate

#### 목적
Date 객체를 YYYY-MM-DD 형식 문자열로 변환합니다.

#### 시그니처
```typescript
function formatDate(date: Date): string
```

#### 입력
- `date: Date` - 날짜 객체

#### 출력
- `string` - YYYY-MM-DD 형식 문자열

#### 로직
```typescript
const year = date.getFullYear();
const month = String(date.getMonth() + 1).padStart(2, '0');
const day = String(date.getDate()).padStart(2, '0');
return `${year}-${month}-${day}`;
```

#### 테스트 예시
```typescript
describe('formatDate', () => {
  it('2025-01-01 형식 변환', () => {
    const date = new Date('2025-01-01');
    expect(formatDate(date)).toBe('2025-01-01');
  });

  it('2025-12-31 형식 변환', () => {
    const date = new Date('2025-12-31');
    expect(formatDate(date)).toBe('2025-12-31');
  });
});
```

---

### 6.7 findFirstEventDate

#### 목적
반복 그룹에서 가장 빠른 날짜를 찾습니다.

#### 시그니처
```typescript
function findFirstEventDate(events: Event[]): string
```

#### 입력
- `events: Event[]` - 같은 repeat.id를 가진 이벤트 배열

#### 출력
- `string` - 가장 빠른 날짜 (YYYY-MM-DD)

#### 로직
```typescript
const sorted = events.sort((a, b) =>
  new Date(a.date).getTime() - new Date(b.date).getTime()
);
return sorted[0].date;
```

#### 엣지 케이스
- **빈 배열**: 빈 배열이면 에러 throw
- **단일 이벤트**: 1개면 그 날짜 반환

#### 테스트 예시
```typescript
describe('findFirstEventDate', () => {
  it('여러 이벤트 중 가장 빠른 날짜', () => {
    const events: Event[] = [
      { date: '2025-01-15', /* ... */ },
      { date: '2025-01-08', /* ... */ },
      { date: '2025-01-01', /* ... */ },
    ];
    expect(findFirstEventDate(events)).toBe('2025-01-01');
  });

  it('빈 배열이면 에러', () => {
    expect(() => findFirstEventDate([])).toThrow('이벤트가 없습니다');
  });
});
```

---

### 6.8 filterRemovedInstances

#### 목적
전체 수정 시 새로운 반복 설정에 맞지 않는 인스턴스 ID를 찾습니다.

#### 시그니처
```typescript
function filterRemovedInstances(
  existingEvents: Event[],
  newRepeatInfo: RepeatInfo,
  baseDate: string
): string[]
```

#### 입력
- `existingEvents: Event[]` - 기존 반복 그룹 이벤트
- `newRepeatInfo: RepeatInfo` - 새로운 반복 설정
- `baseDate: string` - 기준 날짜 (첫 이벤트 날짜)

#### 출력
- `string[]` - 삭제할 이벤트 ID 배열

#### 로직
```typescript
const newInstances = generateRecurringInstances({
  date: baseDate,
  repeat: newRepeatInfo,
  // ... 기타 필드
}, newRepeatInfo.endDate || '2025-12-31');

const newDates = new Set(newInstances.map(e => e.date));

return existingEvents
  .filter(event => !newDates.has(event.date))
  .map(event => event.id);
```

#### 테스트 예시
```typescript
describe('filterRemovedInstances', () => {
  it('매일 → 매주 변경 시 제거 대상 찾기', () => {
    const existing: Event[] = [
      { id: '1', date: '2025-01-01', /* ... */ },
      { id: '2', date: '2025-01-02', /* ... */ },
      { id: '3', date: '2025-01-03', /* ... */ },
    ];
    const newRepeat: RepeatInfo = {
      type: 'weekly',
      interval: 1,
      endDate: '2025-01-31',
    };
    const removed = filterRemovedInstances(existing, newRepeat, '2025-01-01');
    expect(removed).toEqual(['2', '3']); // 1/2, 1/3 제거 (1/1은 수요일 기준 유지)
  });
});
```

---

## 7. API 통합 전략

### 7.1 반복 일정 생성 플로우

```typescript
async function handleSaveRecurringEvent(eventForm: EventForm) {
  try {
    // 1. 유효성 검증
    if (eventForm.repeat.endDate! < eventForm.date) {
      throw new Error('종료일은 시작 날짜 이후여야 합니다');
    }

    // 2. 반복 인스턴스 생성
    const instances = generateRecurringInstances(
      eventForm,
      eventForm.repeat.endDate || '2025-12-31'
    );

    // 3. 서버에 일괄 전송
    const response = await fetch('/api/events-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: instances }),
    });

    if (!response.ok) throw new Error('서버 오류');

    // 4. 응답 처리 (서버가 id + repeat.id 할당)
    const createdEvents: Event[] = await response.json();

    // 5. 상태 업데이트
    setEvents(prev => [...prev, ...createdEvents]);

    // 6. 성공 메시지
    alert(`${createdEvents.length}개의 반복 일정이 생성되었습니다`);

  } catch (error) {
    alert(`반복 일정 생성 실패: ${error.message}`);
  }
}
```

---

### 7.2 단일 수정 플로우

```typescript
async function handleEditSingle(event: Event, updatedData: Partial<EventForm>) {
  try {
    // 1. repeat.type = 'none' 설정 (단일 일정으로 전환)
    const payload = {
      ...updatedData,
      repeat: {
        type: 'none',
        interval: 1,
        id: undefined,
      },
    };

    // 2. 서버에 단일 수정 요청
    const response = await fetch(`/api/events/${event.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error('서버 오류');

    // 3. 응답 처리
    const updatedEvent: Event = await response.json();

    // 4. 상태 업데이트
    setEvents(prev =>
      prev.map(e => (e.id === event.id ? updatedEvent : e))
    );

    alert('일정이 수정되었습니다 (단일 일정으로 전환)');

  } catch (error) {
    alert(`수정 실패: ${error.message}`);
  }
}
```

---

### 7.3 전체 수정 플로우

```typescript
async function handleEditAll(event: Event, updatedData: Partial<EventForm>) {
  try {
    // 1. 같은 repeat.id를 가진 모든 이벤트 찾기
    const groupEvents = events.filter(e => e.repeat.id === event.repeat.id);

    // 2. 첫 이벤트 날짜 찾기
    const firstDate = findFirstEventDate(groupEvents);

    // 3. 새 인스턴스 생성 (검증 단계)
    const updatedForm: EventForm = {
      ...event,
      ...updatedData,
      date: firstDate,
    };

    const newInstances = generateRecurringInstances(
      updatedForm,
      updatedData.repeat?.endDate || event.repeat.endDate || '2025-12-31'
    );

    if (newInstances.length === 0) {
      throw new Error('생성할 반복 일정이 없습니다');
    }

    // 4. 기존 그룹 전체 삭제
    const deleteResponse = await fetch(`/api/recurring-events/${event.repeat.id}`, {
      method: 'DELETE',
    });

    if (!deleteResponse.ok) throw new Error('삭제 실패');

    // 5. 새 그룹 생성
    const createResponse = await fetch('/api/events-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: newInstances }),
    });

    if (!createResponse.ok) {
      throw new Error('생성 실패 (기존 일정이 삭제되었습니다. 페이지를 새로고침하세요)');
    }

    // 6. 응답 처리
    const createdEvents: Event[] = await createResponse.json();

    // 7. 상태 업데이트 (기존 그룹 제거 + 새 그룹 추가)
    setEvents(prev => [
      ...prev.filter(e => e.repeat.id !== event.repeat.id),
      ...createdEvents,
    ]);

    alert(`${createdEvents.length}개의 반복 일정이 수정되었습니다`);

  } catch (error) {
    alert(`전체 수정 실패: ${error.message}`);
  }
}
```

---

### 7.4 단일/전체 삭제 플로우

```typescript
async function handleDeleteSingle(event: Event) {
  try {
    const response = await fetch(`/api/events/${event.id}`, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error('삭제 실패');

    setEvents(prev => prev.filter(e => e.id !== event.id));
    alert('일정이 삭제되었습니다');

  } catch (error) {
    alert(`삭제 실패: ${error.message}`);
  }
}

async function handleDeleteAll(event: Event) {
  try {
    const response = await fetch(`/api/recurring-events/${event.repeat.id}`, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error('삭제 실패');

    setEvents(prev => prev.filter(e => e.repeat.id !== event.repeat.id));
    alert('모든 반복 일정이 삭제되었습니다');

  } catch (error) {
    alert(`삭제 실패: ${error.message}`);
  }
}
```

---

## 8. TDD Cycles

### Cycle 1: 날짜 유틸리티 함수 (30분)

**목표**: 날짜 계산 및 포맷팅 함수 구현

**기능**:
- `formatDate(date: Date): string`
- `getDayOfWeek(date: Date): number`
- `isLeapYear(year: number): boolean`

**이유**: 모든 반복 로직의 기초, 의존성 없음

**의존성**: 없음

**테스트**:
- formatDate: 다양한 날짜 포맷팅
- getDayOfWeek: 요일 계산 (0-6)
- isLeapYear: 윤년 판단 (2024, 2025, 2000, 1900)

---

### Cycle 2: shouldSkipDate 함수 (45분)

**목표**: 날짜 건너뛰기 로직 구현

**기능**:
- `shouldSkipDate(date, repeatType, baseDay, baseMonth): boolean`

**이유**: 31일, 윤년 처리는 복잡한 엣지 케이스

**의존성**: isLeapYear

**테스트**:
- 31일 매월: 2월, 4월, 6월, 9월, 11월 건너뛰기
- 2/29 매년: 평년 건너뛰기, 윤년 생성
- 기타 날짜: 건너뛰지 않음

---

### Cycle 3: getNextOccurrence 함수 (1시간)

**목표**: 다음 반복 날짜 계산

**기능**:
- `getNextOccurrence(currentDate, repeatType, interval, baseDate): Date | null`

**이유**: 반복 생성 로직의 핵심

**의존성**: 없음 (Date API만 사용)

**테스트**:
- 매일 간격 1, 2, 7
- 매주 간격 1, 2
- 매월 간격 1, 2 (31일 포함)
- 매년 간격 1, 2

---

### Cycle 4: generateRecurringInstances 함수 (1.5시간)

**목표**: 반복 인스턴스 생성 통합

**기능**:
- `generateRecurringInstances(eventForm, endDate): Omit<Event, 'id'>[]`

**이유**: 모든 유틸리티 함수 통합, 생성 로직 완성

**의존성**: getNextOccurrence, shouldSkipDate, formatDate

**테스트**:
- 매일 반복 (3일, 10일)
- 매주 반복 (월요일, 금요일)
- 매월 반복 (15일, 31일)
- 매년 반복 (1/15, 2/29)
- 간격 2, 3

---

### Cycle 5: 반복 설정 UI (1시간)

**목표**: 반복 설정 폼 렌더링 및 상태 관리

**기능**:
- Select (반복 유형)
- TextField (반복 간격, 종료일)
- 조건부 렌더링 (none 선택 시 숨김)

**이유**: 사용자 입력 수집

**의존성**: 없음 (UI만)

**테스트**:
- 반복 유형 선택 시 폼 표시/숨김
- 간격 최소값 1 강제
- 종료일 최대값 2025-12-31

---

### Cycle 6: 반복 일정 생성 통합 (1.5시간)

**목표**: 폼 제출 → API 호출 → 상태 업데이트

**기능**:
- `handleSaveRecurringEvent` 함수
- API POST /api/events-list 호출
- 상태 업데이트

**이유**: 생성 플로우 완성

**의존성**: generateRecurringInstances, API

**테스트**:
- 매일 반복 생성 → 캘린더에 표시
- 매주 반복 생성 → RepeatIcon 표시
- API 실패 → 에러 메시지

---

### Cycle 7: 캘린더 표시 (RepeatIcon) (30분)

**목표**: 반복 일정에 RepeatIcon 표시

**기능**:
- `event.repeat.type !== 'none'` → RepeatIcon 렌더링

**이유**: 시각적 피드백

**의존성**: 생성된 이벤트

**테스트**:
- 반복 일정에만 아이콘 표시
- 단일 일정에는 아이콘 없음

---

### Cycle 8: 단일 수정/삭제 (1시간)

**목표**: Dialog → 단일 수정/삭제 처리

**기능**:
- Dialog 표시
- "예" 선택 → handleEditSingle, handleDeleteSingle
- API 호출

**이유**: 기본 수정/삭제 기능

**의존성**: API

**테스트**:
- 단일 수정 → repeat.type = 'none'
- 단일 삭제 → 해당 이벤트만 제거

---

### Cycle 9: 전체 수정/삭제 (2시간)

**목표**: "아니오" 선택 → 전체 수정/삭제 처리

**기능**:
- findFirstEventDate 함수
- handleEditAll, handleDeleteAll
- 삭제 + 재생성 플로우

**이유**: 가장 복잡한 로직

**의존성**: generateRecurringInstances, API

**테스트**:
- 전체 수정 → 모든 이벤트 제목 변경
- 반복 유형 변경 → 맞지 않는 인스턴스 제거
- 전체 삭제 → 모든 이벤트 제거

---

### Cycle 10: 엣지 케이스 통합 테스트 (1.5시간)

**목표**: 31일, 윤년, 간격, 전체 수정 엣지 케이스 검증

**기능**:
- 31일 매월 (건너뛰기)
- 윤년 2/29
- 간격 2 + 31일 상호작용
- 전체 수정 시 제거 로직

**이유**: 실제 시나리오 검증

**의존성**: 모든 이전 사이클

**테스트**:
- TC-E01 ~ TC-E20 실행
- 통합 테스트 (medium.integration.spec.tsx)

---

## 9. 구현 체크리스트

### 9.1 유틸리티 함수 (src/utils/repeatUtils.ts)

- [ ] formatDate(date: Date): string
- [ ] getDayOfWeek(date: Date): number
- [ ] isLeapYear(year: number): boolean
- [ ] shouldSkipDate(date, repeatType, baseDay, baseMonth): boolean
- [ ] getNextOccurrence(currentDate, repeatType, interval, baseDate): Date | null
- [ ] generateRecurringInstances(eventForm, endDate): Omit<Event, 'id'>[]
- [ ] findFirstEventDate(events: Event[]): string
- [ ] filterRemovedInstances(existingEvents, newRepeatInfo, baseDate): string[]

### 9.2 타입 정의 (src/types.ts)

- [ ] RepeatInfo에 id?: string 필드 추가 (이미 존재 확인 필요)
- [ ] RepeatType 정의 확인

### 9.3 UI 컴포넌트 (src/App.tsx 또는 src/components/)

- [ ] 반복 유형 Select
- [ ] 반복 간격 TextField (type="number", min=1)
- [ ] 반복 종료일 TextField (type="date", max="2025-12-31")
- [ ] 조건부 렌더링 (repeatType !== 'none')
- [ ] RepeatIcon 표시 (event.repeat.type !== 'none')
- [ ] 수정 Dialog ("해당 일정만 수정하시겠어요?")
- [ ] 삭제 Dialog ("해당 일정만 삭제하시겠어요?")

### 9.4 이벤트 핸들러 (src/hooks/useEventOperations.ts)

- [ ] handleSaveRecurringEvent(eventForm: EventForm)
- [ ] handleEditSingle(event: Event, updatedData: Partial<EventForm>)
- [ ] handleEditAll(event: Event, updatedData: Partial<EventForm>)
- [ ] handleDeleteSingle(event: Event)
- [ ] handleDeleteAll(event: Event)

### 9.5 API 통합 (src/apis/ 또는 useEventOperations)

- [ ] POST /api/events-list (반복 생성)
- [ ] PUT /api/events/:id (단일 수정)
- [ ] PUT /api/recurring-events/:repeatId (전체 수정) → 삭제 + 재생성으로 대체
- [ ] DELETE /api/events/:id (단일 삭제)
- [ ] DELETE /api/recurring-events/:repeatId (전체 삭제)

### 9.6 상태 관리

- [ ] repeatType 상태 추가
- [ ] repeatInterval 상태 추가
- [ ] repeatEndDate 상태 추가
- [ ] isEditDialogOpen 상태 추가
- [ ] isDeleteDialogOpen 상태 추가
- [ ] selectedEvent 상태 추가 (Dialog에서 사용)

### 9.7 테스트 (src/__tests__/)

- [ ] repeatUtils.spec.ts (유틸리티 함수 단위 테스트)
  - [ ] formatDate
  - [ ] getDayOfWeek
  - [ ] isLeapYear
  - [ ] shouldSkipDate
  - [ ] getNextOccurrence
  - [ ] generateRecurringInstances
  - [ ] findFirstEventDate
- [ ] recurring.integration.spec.tsx (통합 테스트)
  - [ ] TC-H01 ~ TC-H10 (Happy Path)
  - [ ] TC-E01 ~ TC-E20 (Edge Cases)
  - [ ] TC-ERR01 ~ TC-ERR05 (Error Cases)

### 9.8 문서

- [ ] README 업데이트 (반복 일정 기능 추가)
- [ ] CHANGELOG 작성 (반복 일정 기능 릴리즈 노트)

---

## 10. 요약

### 10.1 핵심 원칙

1. **저장 시 즉시 생성**: 프론트엔드에서 모든 인스턴스를 개별 Event로 생성
2. **repeat.id로 그룹 관리**: 서버가 할당하는 repeat.id로 동일 그룹 식별
3. **첫 이벤트 날짜 기준**: 전체 수정 시 가장 빠른 날짜 기준으로 재생성
4. **건너뛰기 규칙**: 31일, 윤년 처리는 정확히 해당 날짜에만 생성

### 10.2 구현 우선순위

1. **Phase 1**: 유틸리티 함수 (Cycle 1-4)
2. **Phase 2**: 반복 생성 UI + API (Cycle 5-6)
3. **Phase 3**: 캘린더 표시 (Cycle 7)
4. **Phase 4**: 수정/삭제 (Cycle 8-9)
5. **Phase 5**: 엣지 케이스 검증 (Cycle 10)

### 10.3 예상 소요 시간

- **총 개발 시간**: 약 12시간
- **테스트 작성 시간**: 약 5시간
- **통합 및 디버깅**: 약 3시간
- **총합**: 약 20시간 (2-3일)

---

## 11. 참고 자료

### 11.1 관련 파일

- `.claude/spec/SPEC_1.md`: 원본 요구사항
- `src/types.ts`: 타입 정의
- `server.js`: API 엔드포인트 (76-174줄)
- `src/hooks/useEventForm.ts`: 폼 상태 관리
- `src/hooks/useEventOperations.ts`: 이벤트 CRUD 로직

### 11.2 외부 참고

- [Material-UI Select](https://mui.com/material-ui/react-select/)
- [Material-UI TextField](https://mui.com/material-ui/react-text-field/)
- [Material-UI Dialog](https://mui.com/material-ui/react-dialog/)
- [JavaScript Date API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)

---

**작성 완료**: 이 명세서는 TDD 구현을 위한 완전한 가이드입니다. 각 사이클을 순서대로 진행하며, 테스트를 먼저 작성하고 구현하는 RED-GREEN-REFACTOR 방식을 따르세요.
