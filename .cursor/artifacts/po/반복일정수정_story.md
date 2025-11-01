# User Story: 반복 일정 수정

**Status**: User Story Complete ✅
**Next Action**: 내용을 확인하신 후 승인해주시면 @test-architect에게 테스트 케이스 작성을 요청하겠습니다.

승인하시려면 "승인", "확인", "진행" 등의 메시지를 보내주세요.

---

## Story

**As a** 캘린더 앱을 사용하는 사용자  
**I want** 반복 일정을 수정할 때 이번 일정만 수정할지 전체 반복 시리즈를 수정할지 선택할 수 있기를  
**So that** 의도한 범위만 정확히 수정하여 불필요한 변경을 방지하고 유연하게 일정을 관리할 수 있다.

---

## Description

### 배경

현재 시스템은 반복 일정 수정 시 선택 다이얼로그 없이 바로 수정하고 있다. 사용자는 반복 일정의 경우 특정 날짜만 수정하거나 전체 반복 시리즈를 수정하고 싶은 상황이 있다. 반복 일정 삭제 기능과 동일한 패턴으로 수정 선택권을 제공하여 사용자 의도에 맞는 수정을 수행할 수 있어야 한다.

### 사용자 여정

1. 사용자가 반복 일정의 수정 버튼(Edit event 아이콘)을 클릭한다.
2. 수정 폼이 열리고 기존 일정 데이터가 로드된다.
3. 사용자가 폼의 필드(제목, 날짜, 시간, 설명, 위치, 카테고리 등)를 수정한다.
4. 사용자가 저장 버튼을 클릭한다.
5. 시스템이 `event.repeat.type !== 'none'`을 확인하여 반복 일정임을 인식한다.
6. "반복 일정 수정" 다이얼로그가 나타나고 "해당 일정만 수정하시겠어요?" 안내 메시지가 표시된다.
7. 사용자가 "예" 또는 "아니오" 중 하나를 선택한다.
   - **"예" 선택**: 단일 인스턴스 수정 (`PUT /api/events/:id`) - 반복 일정에서 단일 일정으로 변경
   - **"아니오" 선택**: 전체 반복 시리즈 수정 (`PUT /api/recurring-events/:repeatId`) - 반복 일정 유지
8. 수정 완료 후 일정 목록이 새로고침되고 적절한 성공 메시지가 표시된다.

### 주요 시나리오

#### 시나리오 1: 단일 인스턴스 수정

- **상황**: 매주 회의가 있지만 이번 주만 회의실이나 시간을 변경하고 싶은 상황.
- **동작**: 2025-10-15 날짜의 회의 일정에서 내용을 수정한 후 저장 버튼 클릭 → "예" 선택
- **결과**:
  - 2025-10-15만 수정됨
  - 수정된 일정은 일반 일정이 됨 (반복 일정 아이콘 제거)
  - 2025-10-08, 2025-10-22 등 다른 주의 회의는 그대로 유지됨
  - 다른 일정들은 여전히 반복 일정 아이콘 표시

#### 시나리오 2: 전체 반복 시리즈 수정

- **상황**: 매주 운동 계획의 제목이나 카테고리를 전체적으로 변경하고 싶은 상황.
- **동작**: 어떤 날짜의 운동 일정에서 제목과 카테고리를 수정한 후 저장 버튼 클릭 → "아니오" 선택
- **결과**:
  - 전체 운동일정(2025-10-15, 2025-10-22, 2025-10-29 등)이 모두 수정됨
  - 모든 일정에 반복 일정 아이콘이 유지됨
  - 반복 패턴 유지 (주간 반복 계속)

#### 시나리오 3: 일반 일정 수정 (기존 동작 유지)

- **상황**: 일반 일정을 수정하는 상황.
- **동작**: 일반 일정 수정 버튼 클릭 → 폼 수정 → 저장 버튼 클릭
- **결과**: 다이얼로그 표시 없이 기존 수정 로직이 실행됨.

---

## Acceptance Criteria

### AC-1: 반복 일정 수정 판별 확인

**Given** 사용자가 반복 일정의 수정 버튼을 클릭하고 폼에서 데이터를 수정한 후 저장 버튼을 클릭했을 때  
**When** 시스템이 해당 일정의 `event.repeat.type`이 `'none'`이 아니고 `event.repeat.id`가 존재하는 경우  
**Then** 반복 일정임을 인식해야함  
**And** 수정 선택 다이얼로그를 표시해야함

---

### AC-2: 반복 일정 수정 다이얼로그 표시

**Given** 반복 일정임을 인식한 후 저장 버튼 클릭 시  
**When** 수정 선택 다이얼로그가 나타나면  
**Then** 다이얼로그 제목이 "반복 일정 수정"이어야함  
**And** 다이얼로그 내용이 "해당 일정만 수정하시겠어요?"이어야함  
**And** "예" 버튼이 표시되어야함  
**And** "아니오" 버튼이 표시되어야함  
**And** 배경 클릭 또는 취소로 다이얼로그를 닫을 수 있어야함

---

### AC-3: 단일 인스턴스 수정 ("예" 선택)

**Given** 수정 선택 다이얼로그가 표시된 상태에서  
**When** 사용자가 "예" 버튼을 클릭했을때  
**Then** `PUT /api/events/:id` API가 호출되어야함  
**And** 요청 body에 `repeat.type: 'none'`이 포함되어야함  
**And** 요청 body에 `repeat.id`가 제거되어야함  
**And** 선택된 일정만 수정되어야함  
**And** 동일한 `repeat.id`를 가진 다른 인스턴스는 변경되지 않아야함  
**And** 수정된 일정의 반복 일정 아이콘이 사라져야함  
**And** 일정 목록이 새로고침되어야함  
**And** "일정이 수정되었습니다." 성공 메시지가 표시되어야함  
**And** 다이얼로그가 닫혀야함  
**And** 폼이 닫혀야함

---

### AC-4: 전체 반복 시리즈 수정 ("아니오" 선택)

**Given** 수정 선택 다이얼로그가 표시된 상태에서  
**When** 사용자가 "아니오" 버튼을 클릭했을때  
**Then** `PUT /api/recurring-events/:repeatId` API가 호출되어야함  
**And** 요청 body에 수정된 필드가 포함되어야함 (title, description, location, category, notificationTime 등)  
**And** 요청 body에 반복 정보가 포함되어야함 (repeat.type, repeat.interval, repeat.endDate)  
**And** 동일한 `repeat.id`를 가진 모든 인스턴스가 수정되어야함  
**And** 모든 일정에 반복 일정 아이콘이 유지되어야함  
**And** 일정 목록이 새로고침되어야함  
**And** "일정이 수정되었습니다." 성공 메시지가 표시되어야함  
**And** 다이얼로그가 닫혀야함  
**And** 폼이 닫혀야함

---

### AC-5: 일반 일정 수정 (기존 동작 유지)

**Given** 일반 일정 (`event.repeat.type === 'none'`)의 수정 버튼을 클릭하고 폼에서 데이터를 수정한 후 저장 버튼을 클릭했을 때  
**When** 저장 버튼을 클릭하면  
**Then** 다이얼로그가 표시되지 않아야함  
**And** `PUT /api/events/:id` API가 즉시 호출되어야함  
**And** 기존 수정 로직이 정상적으로 실행되어야함

---

### AC-6: 폼 검증 실패 시 다이얼로그 미표시

**Given** 반복 일정 수정 폼에서 필수 필드가 비어있거나 잘못된 값이 입력된 상태에서  
**When** 저장 버튼을 클릭하면  
**Then** 다이얼로그가 표시되지 않아야함  
**And** 해당 필드의 에러 메시지가 토스트로 표시되어야함  
**And** 폼은 열린 상태로 유지되어야함

---

### AC-7: 전체 수정 시 반복 설정 검증

**Given** 반복 일정 수정 폼에서 "아니오"를 선택하여 전체 수정을 시도할 때  
**When** 반복 설정 검증이 실패한 경우 (`repeat.type === 'none'` 또는 `repeat.endDate`가 잘못된 경우)  
**Then** 에러 메시지가 토스트로 표시되어야함  
**And** 다이얼로그는 닫혀야함  
**And** 폼은 열린 상태로 유지되어야함

---

### AC-8: 네트워크 오류 처리

**Given** 수정 선택 다이얼로그에서 "예" 또는 "아니오"를 선택하여 API 호출 시  
**When** 네트워크 오류가 발생하면  
**Then** 에러 토스트 메시지가 표시되어야함 ("일정 수정 실패" 또는 "반복 일정 수정 실패")  
**And** 다이얼로그는 닫혀야함  
**And** 폼은 열린 상태로 유지되어야함 (재시도 가능)

---

### AC-9: 404 오류 처리

**Given** 수정하려는 일정이 이미 삭제된 상태에서  
**When** "예" 또는 "아니오" 선택 후 API 호출 시 404 오류가 발생하면  
**Then** 에러 토스트 메시지가 표시되어야함 ("수정할 일정을 찾을 수 없습니다." 또는 "반복 일정을 찾을 수 없습니다.")  
**And** 이벤트 목록이 새로고침되어야함  
**And** 폼이 닫혀야함

---

### AC-10: 반복 일정 아이콘 표시/제거

**Given** 반복 일정 수정이 완료된 후  
**When** 일정 목록이 새로고침되면  
**Then** 단일 수정("예" 선택)된 일정은 반복 일정 아이콘이 표시되지 않아야함 (`repeat.type === 'none'`)  
**And** 전체 수정("아니오" 선택)된 일정들은 반복 일정 아이콘이 유지되어야함 (`repeat.type !== 'none'`)

---

## Tasks

### 🧪 Phase 1: Test Setup

1. **MSW 핸들러 정의**

   - `PUT /api/events/:id` 성공/실패 시나리오 핸들러 작성
   - `PUT /api/recurring-events/:repeatId` 성공/실패 시나리오 핸들러 작성
   - 404 오류, 네트워크 오류 핸들러 작성

2. **Mock 데이터 생성**

   - 반복 일정 Event 객체 생성 (repeat.type, repeat.id 포함)
   - 일반 일정 Event 객체 생성
   - 수정 요청/응답 데이터 형식 정의

3. **Test 유틸리티**
   - 다이얼로그 렌더링 헬퍼 함수
   - 반복 일정 수정 플로우 헬퍼 함수

---

### 🔴 Phase 2: Red - Test First

4. **Unit Test: 반복 일정 판별 로직**

   - `event.repeat.type !== 'none'` 조건 테스트
   - `event.repeat.id` 존재 여부 테스트

5. **Integration Test: 다이얼로그 표시**

   - 반복 일정 수정 시 다이얼로그 표시 테스트
   - 일반 일정 수정 시 다이얼로그 미표시 테스트
   - 다이얼로그 UI 구성 요소 테스트 (제목, 내용, 버튼)

6. **Integration Test: 단일 수정 플로우**

   - "예" 선택 시 `PUT /api/events/:id` 호출 테스트
   - `repeat.type: 'none'` 설정 테스트
   - 반복 일정 아이콘 제거 테스트
   - 성공 메시지 표시 테스트

7. **Integration Test: 전체 수정 플로우**

   - "아니오" 선택 시 `PUT /api/recurring-events/:repeatId` 호출 테스트
   - 반복 정보 유지 테스트
   - 반복 일정 아이콘 유지 테스트
   - 성공 메시지 표시 테스트

8. **Integration Test: 에러 처리**
   - 폼 검증 실패 테스트
   - 네트워크 오류 테스트
   - 404 오류 테스트

---

### 🟢 Phase 3: Green - Implementation

9. **상태 관리 구현**

   - `isEditDialogOpen` state 추가
   - `editTargetEvent` state 추가
   - `editScope` state 추가

10. **다이얼로그 컴포넌트 구현**

    - MUI Dialog 컴포넌트 사용
    - 제목: "반복 일정 수정"
    - 내용: "해당 일정만 수정하시겠어요?"
    - "예", "아니오" 버튼 구현

11. **반복 일정 판별 로직 구현**

    - `addOrUpdateEvent` 함수에서 반복 일정 체크
    - 반복 일정인 경우 다이얼로그 표시

12. **단일 수정 로직 구현**

    - "예" 선택 시 `PUT /api/events/:id` 호출
    - `repeat.type: 'none'` 설정
    - `repeat.id` 제거

13. **전체 수정 로직 구현**

    - "아니오" 선택 시 `PUT /api/recurring-events/:repeatId` 호출
    - 반복 정보 유지

14. **에러 처리 구현**
    - 네트워크 오류 토스트 메시지
    - 404 오류 토스트 메시지
    - 폼 검증 실패 처리

---

### 🔵 Phase 4: Refactor

15. **코드 리팩토링**
    - 중복 코드 제거
    - 함수 분리 및 재사용성 향상
    - 타입 정의 개선

---

### 📝 Phase 5: Documentation

16. **문서화**
    - 코드 주석 추가
    - 주요 함수 JSDoc 작성

---

## Technical Notes

### 기술 스택

- **Frontend**: React + TypeScript
- **UI 라이브러리**: MUI (Material-UI)
- **상태 관리**: React Hooks (useState)
- **API 통신**: Fetch API
- **테스트**: Vitest, Testing Library, MSW

### 데이터 모델

```typescript
interface Event {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  location: string;
  category: string;
  repeat: {
    type: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate: string;
    id?: string; // 반복 시리즈 식별자
  };
  notificationTime: number;
}
```

### API 엔드포인트

#### 단일 수정

```
PUT /api/events/:id
```

**Request Body:**

```json
{
  "id": "event-id",
  "title": "수정된 제목",
  "date": "2025-10-15",
  "startTime": "14:00",
  "endTime": "15:00",
  "description": "수정된 설명",
  "location": "수정된 장소",
  "category": "수정된 카테고리",
  "repeat": {
    "type": "none",
    "interval": 1,
    "endDate": ""
  },
  "notificationTime": 10
}
```

#### 전체 수정

```
PUT /api/recurring-events/:repeatId
```

**Request Body:**

```json
{
  "title": "수정된 제목",
  "description": "수정된 설명",
  "location": "수정된 장소",
  "category": "수정된 카테고리",
  "notificationTime": 10,
  "repeat": {
    "type": "weekly",
    "interval": 1,
    "endDate": "2025-12-31"
  }
}
```

### 상태 관리

```typescript
// App.tsx
const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
const [editTargetEvent, setEditTargetEvent] = useState<Event | null>(null);
const [editScope, setEditScope] = useState<'single' | 'series' | null>(null);
```

### 주요 Hook

- `useEventForm`: 폼 상태 관리
- `useEventOperations`: 이벤트 저장 로직

---

## Definition of Done

### 기능 완료 기준

- [ ] 모든 Acceptance Criteria가 구현되었는가?
- [ ] 단위 테스트가 모두 통과하는가?
- [ ] 통합 테스트가 모두 통과하는가?
- [ ] 에러 처리가 모든 케이스를 커버하는가?

### 코드 품질 기준

- [ ] ESLint 오류가 없는가?
- [ ] TypeScript 타입 오류가 없는가?
- [ ] 코드 주석이 적절히 작성되었는가?

### 테스트 기준

- [ ] 테스트 커버리지가 80% 이상인가?
- [ ] 모든 Acceptance Criteria에 대한 테스트가 작성되었는가?

### 사용자 경험 기준

- [ ] 다이얼로그 UI가 명세서와 일치하는가?
- [ ] 성공/에러 메시지가 명확한가?
- [ ] 반복 일정 아이콘이 올바르게 표시/제거되는가?

---

## Story Points

**추정**: 8 Story Points

**근거**:

- 다이얼로그 UI 구현: 2 SP
- 반복 일정 판별 로직: 1 SP
- 단일 수정 로직: 2 SP
- 전체 수정 로직: 2 SP
- 에러 처리 및 테스트: 1 SP

---

## 우선순위

**High Priority**

- 반복 일정 삭제 기능과의 일관성 유지
- 사용자 실수 방지 (전체 수정 vs 단일 수정)

---

## 의존성

- 기존 반복 일정 삭제 기능 참고 (동일한 패턴)
- `PUT /api/recurring-events/:repeatId` API 엔드포인트 (서버에 이미 구현됨)

---

**Version**: 1.0.0
**Last Updated**: 2025-01-31
**Author**: PO Agent
