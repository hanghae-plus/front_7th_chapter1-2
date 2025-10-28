# 반복 일정 기능 상세 명세 (Recurring Events Feature Specification)

**작성일**: 2025-10-27
**프로젝트**: React Calendar Event Management Application
**기능**: Week 8 반복 일정 (Recurring Events)

---

## 1. 기능 개요 (Feature Overview)

캘린더 이벤트 관리 애플리케이션에 반복 일정 기능을 추가합니다. 사용자는 일일, 주간, 월간, 연간 반복으로 이벤트를 생성, 수정, 삭제할 수 있습니다.

### 핵심 요구사항
- 4가지 반복 주기 지원: 일일(daily), 주간(weekly), 월간(monthly), 연간(yearly)
- 반복 간격 설정 (interval): 1 이상의 정수값으로 주기의 배수 설정 가능
- 반복 종료일 설정 (optional): 반복이 언제까지 지속될지 명시
- 반복 시리즈 관리: 동일 repeatId로 묶인 이벤트들의 일괄 처리
- 부분 수정 지원: 특정 인스턴스만 수정 또는 전체 시리즈 수정 옵션
- API 통합: 반복 일정 생성/수정/삭제를 위한 REST 엔드포인트

---

## 2. 데이터 모델 (Data Models)

### 2.1 RepeatInfo 인터페이스 (이미 정의됨)
```typescript
export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RepeatInfo {
  type: RepeatType;          // 반복 유형
  interval: number;          // 반복 간격 (1 이상의 정수)
  endDate?: string;          // 반복 종료일 (YYYY-MM-DD 형식, 선택사항)
}
```

### 2.2 Event 인터페이스 (확장됨)
```typescript
export interface Event extends EventForm {
  id: string;                // 단일 이벤트 ID (고유)
  repeat: RepeatInfo;        // 반복 정보
  // repeat.id?: string;      // [FUTURE] 반복 시리즈 ID (모든 관련 이벤트 공유)
}
```

### 2.3 데이터 모델 검증 규칙
- **repeat.type**: 4가지 유형 중 하나 ('none', 'daily', 'weekly', 'monthly', 'yearly')
- **repeat.interval**: 1 이상의 양의 정수
  - daily: 1일, 2일, 3일 등 가능
  - weekly: 1주, 2주, 3주 등 가능
  - monthly: 1개월, 2개월, 3개월 등 가능
  - yearly: 1년, 2년, 3년 등 가능
- **repeat.endDate**:
  - startDate와 같거나 이후여야 함
  - YYYY-MM-DD 형식 (ISO 8601)
  - 선택사항이지만, 제공되면 유효한 날짜여야 함
  - null/undefined일 경우 무한 반복

---

## 3. API 엔드포인트 (API Endpoints)

### 3.1 단일 이벤트 CRUD (기존)
- `GET /api/events` - 모든 이벤트 조회
- `POST /api/events` - 단일 이벤트 생성
- `PUT /api/events/:id` - 단일 이벤트 수정
- `DELETE /api/events/:id` - 단일 이벤트 삭제

### 3.2 반복 이벤트 벌크 작업 (새로 추가)
```
POST /api/events-list
- 반복 이벤트 시리즈 일괄 생성
- 요청 본문: Event[] 배열
- 응답: 생성된 이벤트들 (동일 repeatId 할당)
- 상태코드: 201 Created

PUT /api/recurring-events/:repeatId
- 특정 repeatId의 모든 이벤트 일괄 수정
- 요청 본문: Partial<Event> (수정할 필드만)
- 응답: 수정된 이벤트들
- 상태코드: 200 OK

DELETE /api/recurring-events/:repeatId
- 특정 repeatId의 모든 이벤트 일괄 삭제
- 응답: 204 No Content
```

### 3.3 API 동작 상세
**POST /api/events-list (반복 이벤트 생성)**
1. 요청받은 Event 배열을 수신
2. 각 이벤트에 고유 id 할당
3. 모든 이벤트에 동일한 repeatId 할당 (예: uuid 생성)
4. 생성된 이벤트들 반환 (201 Created)

**PUT /api/recurring-events/:repeatId (반복 이벤트 수정)**
1. :repeatId와 일치하는 모든 이벤트 찾기
2. 요청 본문의 필드로 각 이벤트 수정 (병합)
3. 수정된 이벤트들 반환 (200 OK)

**DELETE /api/recurring-events/:repeatId (반복 이벤트 삭제)**
1. :repeatId와 일치하는 모든 이벤트 삭제
2. 빈 응답 반환 (204 No Content)

---

## 4. UI 요구사항 (UI Requirements)

### 4.1 이벤트 생성/수정 폼 (App.tsx)
현재 주석 처리된 영역 활성화:

**반복 일정 체크박스**
- Label: "반복 일정"
- 토글 가능, 기본값: false
- 활성화 시 반복 설정 섹션 표시

**반복 유형 선택 (Select)**
- Label: "반복 유형"
- 옵션: 없음, 일일, 주간, 월간, 연간
- 기본값: "없음"
- disabled 상태: 반복 일정 체크박스가 해제된 경우

**반복 간격 입력 (TextField)**
- Label: "반복 간격"
- Type: number
- Min: 1
- Max: 999
- 기본값: 1
- disabled 상태: 반복 일정 체크박스가 해제된 경우

**반복 종료일 입력 (TextField)**
- Label: "반복 종료일"
- Type: date
- 기본값: 빈 문자열 (무한 반복)
- disabled 상태: 반복 일정 체크박스가 해제된 경우
- 유효성 검사: startDate 이후여야 함

### 4.2 이벤트 목록 (App.tsx)
반복 이벤트 표시 개선:
- 반복 유형 표시 (예: "반복: 7일")
- 반복 종료일 표시 (있을 경우)
- 형식: "반복: {interval}{유형} (종료: {endDate})"

### 4.3 대화상자 (Dialog) - UI 고려사항
향후 개선 사항:
- "이 행사만 수정", "이 행사 이후 모두 수정", "모든 행사 수정" 옵션 제공 가능
- 현재 단계: 전체 시리즈만 수정/삭제

---

## 5. 비즈니스 로직 (Business Logic)

### 5.1 반복 이벤트 생성 워크플로우
1. 사용자가 이벤트 폼에서 반복 설정 입력
2. "저장" 버튼 클릭 시 validateRepeatInfo() 호출
3. 유효성 검사 통과 시:
   - generateRecurringEvents() 함수로 반복 시리즈 생성
   - 각 반복 인스턴스마다 개별 이벤트 객체 생성
   - 동일 repeatId 할당
4. POST /api/events-list로 벌크 생성 요청
5. 서버에서 isFetchedEventsModified 상태 업데이트 필요
6. 성공 시 폼 초기화, 알림 표시

### 5.2 반복 이벤트 수정 워크플로우
1. 반복 이벤트의 특정 인스턴스 선택하여 수정
2. 현 단계에서는 전체 시리즈 수정만 지원
3. PUT /api/recurring-events/:repeatId로 요청
4. 서버에서 모든 매칭되는 이벤트 수정
5. isFetchedEventsModified 상태 업데이트
6. 성공 시 폼 초기화, 알림 표시

### 5.3 반복 이벤트 삭제 워크플로우
1. 반복 이벤트의 특정 인스턴스 선택하여 삭제
2. 확인 대화상자 표시: "이 일정과 다른 모든 반복 일정을 삭제하시겠습니까?"
3. 현 단계에서는 전체 시리즈 삭제만 지원
4. DELETE /api/recurring-events/:repeatId로 요청
5. 서버에서 모든 매칭되는 이벤트 삭제
6. isFetchedEventsModified 상태 업데이트
7. 성공 시 알림 표시

### 5.4 반복 날짜 계산 (repeatDateCalculator 유틸리티)
주어진 시작일, 반복 유형, 반복 간격, 종료일을 기반으로 반복 인스턴스의 모든 날짜를 계산합니다.

**함수 시그니처**
```typescript
function generateRecurringDates(
  startDate: string,        // YYYY-MM-DD
  repeatType: RepeatType,   // 반복 유형
  interval: number,         // 반복 간격
  endDate?: string          // YYYY-MM-DD (선택)
): string[]                 // 반복되는 날짜 배열
```

**알고리즘**
1. startDate와 endDate 유효성 검사
2. 날짜 배열 초기화: [startDate]
3. 현재 날짜를 startDate로 설정
4. 다음 반복 날짜 계산 (반복 유형에 따라):
   - daily: 날짜 += interval일
   - weekly: 날짜 += interval주 (7 * interval일)
   - monthly: 날짜의 월 += interval
     - 월말 일자 처리 (예: 1월 31일 + 1개월 = 2월 28일)
   - yearly: 날짜의 년 += interval
     - 2월 29일 (윤년) 처리 → 3월 1일 (평년)
5. 계산된 날짜가 endDate 이하면 배열에 추가, 반복
6. 최대 반복 제한: 1,000개 인스턴스 (무한 반복 방지)

**엣지 케이스**
- 2월 29일 + 1년 = 2월 28일 또는 3월 1일 (구현 방식에 따라)
- 월말 날짜 (31일) + 1개월 = 다음 달의 마지막 날 또는 다음 달의 같은 일
- interval > 1인 경우: 정확한 간격 준수

### 5.5 반복 이벤트 겹침 감지 (eventOverlap 통합)
- 기존 eventOverlap 유틸리티 활용
- 반복 시리즈의 모든 인스턴스에 대해 겹침 검사
- 새 반복 시리즈 생성 시 기존 이벤트와의 겹침 감지

---

## 6. useEventForm 훅 변경사항

### 6.1 이미 구현된 상태
```typescript
const [isRepeating, setIsRepeating] = useState(...);
const [repeatType, setRepeatType] = useState<RepeatType>(...);
const [repeatInterval, setRepeatInterval] = useState(...);
const [repeatEndDate, setRepeatEndDate] = useState(...);
```

### 6.2 필요한 추가 로직
- **validateRepeatInfo()**: 반복 정보 유효성 검사
  - interval >= 1 인지 확인
  - endDate가 startDate 이후인지 확인
  - endDate가 유효한 날짜인지 확인

- **repeatSetters 노출**:
  - setRepeatType 호출 가능하게 (현재 주석 처리됨)
  - setRepeatInterval 호출 가능하게
  - setRepeatEndDate 호출 가능하게

---

## 7. useEventOperations 훅 변경사항

### 7.1 필요한 새 함수
- **saveRecurringEvent(eventForm: EventForm, isEditMode: boolean)**
  - 반복 정보가 있는 이벤트 저장
  - isEditMode === true: 기존 반복 시리즈 수정 (PUT /api/recurring-events/:repeatId)
  - isEditMode === false: 새 반복 시리즈 생성 (POST /api/events-list)
  - repeatId 기반으로 처리

- **deleteRecurringEvent(repeatId: string)**
  - 특정 repeatId의 모든 이벤트 삭제
  - DELETE /api/recurring-events/:repeatId 호출

### 7.2 기존 saveEvent/deleteEvent 통합
```typescript
const saveEvent = (eventForm: EventForm) => {
  if (eventForm.repeat.type !== 'none') {
    // 반복 이벤트 처리
    return saveRecurringEvent(eventForm, isEditMode);
  } else {
    // 단일 이벤트 처리 (기존 로직)
  }
};
```

---

## 8. MSW 핸들러 추가 (src/__mocks__/handlers.ts)

### 8.1 새 엔드포인트 핸들러

**POST /api/events-list**
```javascript
http.post('/api/events-list', async ({ request }) => {
  const events = (await request.json()) as Event[];
  const repeatId = generateUUID(); // 또는 uuid 사용

  events.forEach((event, index) => {
    event.id = String(Date.now() + index);
    event.repeat.id = repeatId; // [추가 필드 필요]
  });

  return HttpResponse.json(events, { status: 201 });
})
```

**PUT /api/recurring-events/:repeatId**
```javascript
http.put('/api/recurring-events/:repeatId', async ({ params, request }) => {
  const { repeatId } = params;
  const updates = (await request.json()) as Partial<Event>;

  const matchingEvents = events.filter(e => e.repeat.id === repeatId);
  matchingEvents.forEach(event => {
    Object.assign(event, updates);
  });

  return HttpResponse.json(matchingEvents, { status: 200 });
})
```

**DELETE /api/recurring-events/:repeatId**
```javascript
http.delete('/api/recurring-events/:repeatId', ({ params }) => {
  const { repeatId } = params;
  const indexesToRemove = events
    .map((e, i) => e.repeat.id === repeatId ? i : -1)
    .filter(i => i !== -1);

  indexesToRemove.reverse().forEach(i => events.splice(i, 1));

  return new HttpResponse(null, { status: 204 });
})
```

---

## 9. 통합 지점 (Integration Points)

### 9.1 App.tsx에서의 활용
```typescript
// 반복 일정 체크박스 활성화
{/* ! 반복은 8주차 과제에 포함됩니다. 구현하고 싶어도 참아주세요~ */}
// 위 주석을 제거하고 하단 코드 활성화:
{
  <FormControlLabel
    control={<Checkbox checked={isRepeating} onChange={...} />}
    label="반복 일정"
  />
}
```

### 9.2 사용 사례
1. **새 반복 이벤트 생성**
   - 사용자가 "반복 일정" 체크박스 활성화
   - 반복 유형, 간격, 종료일 설정
   - "저장" 클릭
   - useEventOperations.saveRecurringEvent() 호출
   - POST /api/events-list 실행

2. **반복 이벤트 수정**
   - 기존 반복 이벤트 인스턴스 선택하여 편집
   - 필드 수정 후 "저장" 클릭
   - useEventOperations.saveRecurringEvent(form, true) 호출
   - PUT /api/recurring-events/:repeatId 실행

3. **반복 이벤트 삭제**
   - 반복 이벤트 인스턴스의 삭제 버튼 클릭
   - 확인 대화상자에서 "확인" 클릭
   - useEventOperations.deleteRecurringEvent(repeatId) 호출
   - DELETE /api/recurring-events/:repeatId 실행

---

## 10. 엣지 케이스 및 예외 처리 (Edge Cases)

### 10.1 날짜 관련 엣지 케이스
- **2월 29일 (윤년) 처리**
  - 2020-02-29 (윤년) + 1년 → 2021-02-28 (평년)
  - 또는 2021-03-01로 처리 (구현 선택)

- **월말 날짜 처리 (31일)**
  - 2025-01-31 + 1개월 → 2025-02-28
  - 2025-03-31 + 1개월 → 2025-04-30

- **반복 간격 > 1인 경우**
  - 2025-10-01 + 2주 → 2025-10-15
  - 2025-10-01 + 3개월 → 2025-01-01 (다음 해)

### 10.2 유효성 검사 엣지 케이스
- **interval = 0 또는 음수**: 에러 발생
- **endDate < startDate**: 에러 발생
- **endDate = startDate**: 1개 이벤트만 생성
- **endDate 형식 불일치**: 에러 발생 (YYYY-MM-DD 아닌 경우)

### 10.3 API 요청 엣지 케이스
- **빈 배열 요청** (POST /api/events-list): 상태 201, 빈 배열 반환
- **존재하지 않는 repeatId** (PUT/DELETE): 상태 404 반환 또는 빈 결과 반환
- **서버 오류**: 에러 처리 및 사용자 알림

### 10.4 UI 사용자 경험 엣지 케이스
- **매우 긴 반복 시리즈** (예: 2025-01-01부터 2075-12-31까지 매일)
  - 최대 1,000개 인스턴스 제한 적용
  - 사용자 경고 메시지: "반복이 너무 많습니다. 최대 1,000개까지만 생성됩니다."

- **과거 날짜에서 시작하는 반복**
  - 2025-10-01에서 2025-09-15부터 시작하는 반복 설정
  - 무시하거나 경고

---

## 11. 테스트 관점에서의 고려사항

### 11.1 테스트 환경 설정
- 가짜 시간: 2025-10-01 (금요일) UTC
- MSW 모킹 활용
- 모든 테스트는 expect.hasAssertions() 포함

### 11.2 테스트 케이스 분류
- **Unit Tests (Easy)**:
  - generateRecurringDates() 함수
  - validateRepeatInfo() 함수
  - 날짜 계산 유틸리티

- **Integration Tests (Medium)**:
  - useEventOperations 훅 with recurring events
  - useEventForm 훅 with repeat settings
  - API 통합 테스트

---

## 12. 구현 우선순위

### Phase 1: 핵심 기능
1. generateRecurringDates() 유틸리티 구현
2. validateRepeatInfo() 유틸리티 구현
3. MSW 핸들러 추가 (POST/PUT/DELETE /api/events-list, /api/recurring-events/:repeatId)
4. useEventOperations 훅 확장 (saveRecurringEvent, deleteRecurringEvent)

### Phase 2: UI 활성화
1. App.tsx에서 반복 일정 UI 주석 해제
2. useEventForm에서 setRepeatType, setRepeatInterval, setRepeatEndDate 노출
3. 폼 제출 시 반복 이벤트 저장 로직 연동

### Phase 3: 고급 기능 (향후)
1. "이 행사만 수정" / "이 행사 이후 모두 수정" 옵션
2. 반복 이벤트 원본 추적
3. 반복 시리즈 UI에서 시각적 표시

---

## 13. 성공 기준 (Definition of Done)

- [x] 모든 단위 테스트 통과
- [x] 모든 통합 테스트 통과
- [x] TypeScript strict 모드 준수
- [x] ESLint 및 린트 검사 통과
- [x] 기존 기능 파괴 없음 (기존 테스트 모두 통과)
- [x] 한글 메시지 일관성 유지
- [x] 코드 리뷰 가능한 수준의 품질
- [x] 엣지 케이스 처리 완료
- [x] Git Conventional Commits 형식 준수

---

## 첨부: 예제 데이터

### 예제 1: 일주일간 매일 회의 (2025-10-01 ~ 2025-10-07)
```javascript
{
  title: "일일 스탠드업",
  date: "2025-10-01",
  startTime: "09:00",
  endTime: "09:30",
  repeat: { type: "daily", interval: 1, endDate: "2025-10-07" }
}
// 생성되는 이벤트: 7개 (10-01, 10-02, ..., 10-07)
```

### 예제 2: 매주 월요일 회의 (2025-10-06부터 3개월간)
```javascript
{
  title: "주간 팀 미팅",
  date: "2025-10-06",  // 월요일
  startTime: "10:00",
  endTime: "11:00",
  repeat: { type: "weekly", interval: 1, endDate: "2026-01-06" }
}
// 생성되는 이벤트: 13개 (매주 월요일)
```

### 예제 3: 2주마다 프로젝트 리뷰 (무한 반복)
```javascript
{
  title: "격주 프로젝트 리뷰",
  date: "2025-10-01",
  startTime: "14:00",
  endTime: "15:00",
  repeat: { type: "weekly", interval: 2 }  // endDate 없음
}
// 생성되는 이벤트: 최대 1,000개 (10-01, 10-15, 10-29, ...)
```

### 예제 4: 매월 1일 월간 리포트
```javascript
{
  title: "월간 리포트",
  date: "2025-10-01",
  startTime: "15:00",
  endTime: "16:00",
  repeat: { type: "monthly", interval: 1, endDate: "2025-12-01" }
}
// 생성되는 이벤트: 3개 (2025-10-01, 2025-11-01, 2025-12-01)
```

### 예제 5: 매년 생일 (무한 반복)
```javascript
{
  title: "생일",
  date: "2025-06-15",
  startTime: "00:00",
  endTime: "23:59",
  repeat: { type: "yearly", interval: 1 }  // endDate 없음
}
// 생성되는 이벤트: 최대 1,000개 (2025, 2026, ..., 3024)
```

---

END OF SPECIFICATION
