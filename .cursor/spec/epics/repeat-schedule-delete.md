# 반복 일정 삭제

## 요약 (Summary)
- 반복 일정 인스턴스 선택 후 확인 모달에서 '예'를 누르면 해당 인스턴스만 삭제(예외 처리)한다.
- 같은 모달에서 '아니오'를 누르면 해당 반복 시리즈 전체가 삭제된다.
- 삭제 성공/실패에 따른 사용자 피드백(토스트)와 데이터 일관성을 보장한다.

## 배경 (Background)
- 반복 일정을 개별 인스턴스 단위로 제거하거나, 전체 시리즈를 한 번에 삭제하는 요구가 있다.
- 현재 확장(expand) 기반 렌더링 구조에서는 단일 인스턴스 삭제 시 시리즈에 예외(exceptions)를 기록해야 한다.
- 서버는 단일 이벤트 삭제, 반복 시리즈 갱신(예외 반영), 반복 시리즈 전체 삭제의 API를 제공한다.

## 목표 (Goals)
- 반복 일정 카드의 삭제 액션에서 확인 모달을 띄우고 '예/아니오'에 따라 동작을 분기한다.
- '예' 선택 시: 해당 날짜 인스턴스만 삭제되도록 시리즈 `repeat.exceptions`에 날짜를 추가한다.
- '아니오' 선택 시: 해당 반복 시리즈 전체를 삭제한다.
- 삭제 성공 시 "일정이 삭제되었습니다." 토스트, 실패 시 "일정 삭제 실패" 토스트를 노출한다.
- 확장(expand) 로직에서 `repeat.exceptions`가 반영되어 예외 날짜 인스턴스가 노출되지 않도록 한다.

## 목표가 아닌 것 (Non-Goals)
- 비반복(단일) 일정의 일반 삭제 확인 모달/동작 설계(본 스펙 범위 밖). 단, 삭제 API와 토스트 메시지는 공통을 사용한다.
- 반복 일정 편집(단일/전체 수정) 스펙 전반. 해당 스펙은 `.cursor/spec/epics/repeat-schedule-edit.md`를 따른다.

## 계획 (Plan)

### 예상 동작 (Expected Behaviors)

1) 확인 모달 노출 조건 및 문구
- 동작 명세:
  - 반복 일정 카드에서 삭제를 누르면 확인 모달을 노출한다.
  - 모달 문구: "해당 일정만 삭제하시겠어요?"
  - 버튼: '예'(해당 일정만 삭제), '아니오'(전체 삭제)
  - 비반복 일정은 이 모달을 사용하지 않고 일반 삭제 확인 모달(범위 밖)을 사용한다.
- 검증 포인트:
```
Given: repeat.type != 'none'인 반복 일정 카드에서 삭제 클릭
When: 확인 모달 노출
Then: 제목이 "해당 일정만 삭제하시겠어요?"이고 버튼 '예'와 '아니오'가 표시됨
```

2) '예' 선택 - 해당 일정만 삭제(예외 처리)
- 동작 명세:
  - 선택한 인스턴스의 날짜(YYYY-MM-DD)를 시리즈의 `repeat.exceptions`에 추가한다(중복 없이).
  - 서버에 PUT `/api/recurring-events/:repeatId`로 `repeat.exceptions` 변경을 반영한다.
  - 성공 시 이벤트 목록/캘린더에서 해당 날짜 인스턴스가 사라진다.
  - 성공 토스트: "일정이 삭제되었습니다." 실패 토스트: "일정 삭제 실패"
- 검증 포인트:
```
Given: repeat.id = "r-123"인 매주 반복 일정, 선택 날짜 = '2025-11-05'
When: 삭제 클릭 → 모달에서 '예' 선택 → 서버에 PUT /api/recurring-events/r-123 (body.repeat.exceptions에 '2025-11-05' 추가)
Then: 목록/달력 갱신 시 2025-11-05 인스턴스가 표시되지 않음
And: 토스트 "일정이 삭제되었습니다." 표시
```

3) '아니오' 선택 - 시리즈 전체 삭제
- 동작 명세:
  - 서버에 DELETE `/api/recurring-events/:repeatId`를 호출한다.
  - 성공 시 해당 시리즈의 모든 인스턴스가 목록/달력에서 사라진다.
  - 성공 토스트: "일정이 삭제되었습니다." 실패 토스트: "일정 삭제 실패"
- 검증 포인트:
```
Given: repeat.id = "r-456"인 매일 반복 일정
When: 삭제 클릭 → 모달에서 '아니오' 선택 → 서버에 DELETE /api/recurring-events/r-456 호출
Then: 목록/달력에서 해당 시리즈의 모든 인스턴스가 더 이상 표시되지 않음
And: 토스트 "일정이 삭제되었습니다." 표시
```

4) 비반복 일정 삭제(참고)
- 동작 명세:
  - 비반복 일정은 DELETE `/api/events/:id`를 호출해 삭제한다.
  - 본 스펙의 모달 문구/분기 대상이 아니다.
- 검증 포인트:
```
Given: repeat.type = 'none'인 단일 일정 id='e-1'
When: 삭제 확인 후 DELETE /api/events/e-1 호출
Then: 목록에서 일정이 사라지고, 토스트 "일정이 삭제되었습니다." 표시
```

5) 예외 반영 확장 규칙
- 동작 명세:
  - 확장(expand) 시 `repeat.exceptions`에 포함된 날짜는 생성/표시에서 제외한다.
- 검증 포인트:
```
Given: repeat.exceptions = ['2025-11-05']인 매주 반복 시리즈
When: 2025-11-03 ~ 2025-11-09 주간 범위를 확장(expand)
Then: 2025-11-05 인스턴스는 생성되지 않음
```

### 기술 요구사항

#### 1. 데이터 타입
```typescript
export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RepeatInfo {
  id?: string;               // 시리즈 식별자 (반복 시리즈 공통)
  type: RepeatType;
  interval: number;          // 1 이상 정수
  endDate?: string;          // YYYY-MM-DD
  exceptions?: string[];     // YYYY-MM-DD 목록 (단일 삭제된 인스턴스 날짜)
}

export interface EventForm {
  title: string;
  date: string;            // YYYY-MM-DD
  startTime: string;       // HH:mm
  endTime: string;         // HH:mm
  description: string;
  location: string;
  category: string;
  repeat: RepeatInfo;      // 단일 일정은 { type: 'none', interval: 1 }
  notificationTime: number; // 분 단위
}

export interface Event extends EventForm {
  id: string;              // 시리즈 기반 id 가능, 확장 시 'id@YYYY-MM-DD' 형태 사용 가능
}
```

#### 2. 유효성 검증 규칙(정확 문자열)
- 삭제 성공(공통): "일정이 삭제되었습니다."
- 삭제 실패(공통): "일정 삭제 실패"
- 시리즈 미존재(404): "시리즈를 찾을 수 없습니다."
- 잘못된 인스턴스 날짜: "유효하지 않은 인스턴스 날짜입니다."
- 반복 간격: 정수, 1 이상(편집/생성 스펙과 동일)

#### 3. 알고리즘
- 단일 인스턴스 삭제('예') 의사코드
```
function deleteSingleOccurrence(seriesEvent, targetDate):
  if (!isValidISODate(targetDate)) throw Error('유효하지 않은 인스턴스 날짜입니다.')
  const repeatId = seriesEvent.repeat.id
  if (!repeatId) throw Error('시리즈를 찾을 수 없습니다.')

  const existing = seriesEvent.repeat.exceptions || []
  const nextExceptions = uniq([...existing, targetDate])

  // 서버 반영
  PUT /api/recurring-events/:repeatId
  body: { repeat: { exceptions: nextExceptions } }

  // 성공 후: 목록 재조회/캐시 갱신 → 토스트 "일정이 삭제되었습니다."
```

- 시리즈 전체 삭제('아니오') 의사코드
```
function deleteEntireSeries(seriesEvent):
  const repeatId = seriesEvent.repeat.id
  if (!repeatId) throw Error('시리즈를 찾을 수 없습니다.')

  DELETE /api/recurring-events/:repeatId

  // 성공 후: 목록 재조회/캐시 갱신 → 토스트 "일정이 삭제되었습니다."
```

### 제약사항 및 에지 케이스
- 예외 날짜는 중복 없이 관리한다(uniq 처리).
- 예외 추가/시리즈 삭제가 성공적으로 반영되기 전까지 UI는 로딩/비활성 상태를 표시한다.
- 네트워크 오류, 404 등 실패 시 기존 목록은 변경하지 않고 "일정 삭제 실패"를 표시한다.
- 비반복 일정에서 본 스펙의 모달을 띄우지 않는다(별도 플로우).

### 구현 우선순위
1. 높은: '예' 단일 삭제(예외 반영) API 연동 및 UI 반영
2. 높은: '아니오' 시리즈 전체 삭제 API 연동 및 UI 반영
3. 중간: 확장(expand) 로직에 `exceptions` 반영(이미 구현되어 있지 않다면 추가)
4. 낮음: 실패/경계 케이스(404, 잘못된 날짜)에 대한 UX 보강

## 작성 체크리스트
- [x] 모든 동작에 "동작 명세"와 "검증 포인트" 존재
- [x] 검증 포인트가 Given-When-Then 형식으로 작성됨
- [x] 구체적인 데이터와 값 사용 (추상적 표현 없음)
- [x] 오류 메시지가 정확한 문자열로 명시됨
- [x] 데이터 타입과 검증 규칙 제공됨
- [x] 에지 케이스가 구체적으로 나열됨
- [x] 구현 우선순위 제안됨
- [x] 기존 코드베이스와의 연결점 파악됨 (API: PUT/DELETE /recurring-events, DELETE /events/:id)
