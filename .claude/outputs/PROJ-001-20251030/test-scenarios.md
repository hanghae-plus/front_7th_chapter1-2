# 테스트 시나리오: PROJ-001 - 캘린더 반복 일정 기능

**프로젝트 ID**: PROJ-001-20251030
**버전**: 1.1.0
**작성일**: 2025-10-30
**최종 수정일**: 2025-10-31
**작성자**: Test Designer Agent
**티켓**: PROJ-002

---

## 1. 테스트 개요

### 1.1 Story 요약

**제목**: 캘린더 반복 일정 기능 구현

**Acceptance Criteria**:
- [ ] 사용자가 반복 유형(매일, 매주, 매월, 매년)을 선택하여 반복 일정을 생성할 수 있음
- [ ] 캘린더 뷰에서 반복 일정이 아이콘으로 구분되어 표시됨
- [ ] 반복 종료 조건(특정 날짜까지)을 지정할 수 있음
- [ ] 반복 일정을 단일 또는 전체로 수정할 수 있음
- [ ] 반복 일정을 단일 또는 전체로 삭제할 수 있음

**참조**:
- **PRD**: `.claude/outputs/PROJ-001-20251030/prd.md`

### 1.2 테스트 목표

**주요 테스트 목표**:
- 반복 일정 생성 로직이 올바르게 동작하는지 검증
- 31일 매월 반복, 윤년 29일 매년 반복 등 엣지 케이스 처리 검증
- 반복 일정 UI가 올바르게 표시되는지 검증
- 단일/전체 수정 및 삭제 로직이 정확히 동작하는지 검증

**테스트 범위**:
- **단위 테스트**: 반복 일정 생성 함수, 유틸리티 함수, 컴포넌트
- **통합 테스트**: 반복 일정 생성부터 수정/삭제까지 전체 플로우

**테스트 커버리지 목표**: 70% 이상

---

## 2. 단위 테스트 시나리오

### 2.1 유틸리티 함수 테스트

#### 2.1.1 generateRecurringEvents 함수

**테스트 대상**: `src/utils/recurringEventUtils.ts`의 `generateRecurringEvents` 함수

**Scenario 1: 매일 반복 일정 생성**

- **Given**: 시작 날짜 2025-01-01, 종료 날짜 2025-01-07, 반복 유형 "daily"
- **When**: `generateRecurringEvents` 함수를 호출함
- **Then**:
  - [ ] 7개의 일정이 생성됨
  - [ ] 각 일정의 날짜가 연속적임 (2025-01-01부터 2025-01-07까지)
  - [ ] 모든 일정이 동일한 `recurrenceId`를 가짐
  - [ ] 각 일정의 `repeat.type`이 "daily"임

**우선순위**: High

**테스트 데이터**:
```typescript
{
  startDate: new Date('2025-01-01'),
  endDate: new Date('2025-01-07'),
  repeatType: 'daily',
  eventData: {
    title: '매일 회의',
    startTime: '09:00',
    endTime: '10:00',
    description: 'Daily standup',
    location: 'Office',
    category: 'meeting',
  }
}
```

---

**Scenario 2: 매주 반복 일정 생성**

- **Given**: 시작 날짜 2025-01-01 (수요일), 종료 날짜 2025-01-29, 반복 유형 "weekly"
- **When**: `generateRecurringEvents` 함수를 호출함
- **Then**:
  - [ ] 5개의 일정이 생성됨 (1/1, 1/8, 1/15, 1/22, 1/29)
  - [ ] 각 일정 간 간격이 정확히 7일임
  - [ ] 모든 일정이 수요일임
  - [ ] 모든 일정이 동일한 `recurrenceId`를 가짐

**우선순위**: High

---

**Scenario 3: 매월 반복 일정 생성**

- **Given**: 시작 날짜 2025-01-15, 종료 날짜 2025-06-30, 반복 유형 "monthly"
- **When**: `generateRecurringEvents` 함수를 호출함
- **Then**:
  - [ ] 6개의 일정이 생성됨 (1/15, 2/15, 3/15, 4/15, 5/15, 6/15)
  - [ ] 각 일정이 매월 15일임
  - [ ] 모든 일정이 동일한 `recurrenceId`를 가짐

**우선순위**: High

---

**Scenario 4: 31일 매월 반복 (엣지 케이스)**

- **Given**: 시작 날짜 2025-01-31, 종료 날짜 2025-12-31, 반복 유형 "monthly"
- **When**: `generateRecurringEvents` 함수를 호출함
- **Then**:
  - [ ] 31일이 있는 달에만 일정이 생성됨 (1월, 3월, 5월, 7월, 8월, 10월, 12월)
  - [ ] 2월, 4월, 6월, 9월, 11월에는 일정이 생성되지 않음
  - [ ] 총 7개의 일정이 생성됨

**우선순위**: High (엣지 케이스)

**테스트 데이터**:
```typescript
{
  startDate: new Date('2025-01-31'),
  endDate: new Date('2025-12-31'),
  repeatType: 'monthly',
  eventData: { title: '월말 정산' }
}
```

---

**Scenario 5: 윤년 2월 29일 매년 반복 (엣지 케이스)**

- **Given**: 시작 날짜 2024-02-29 (윤년), 종료 날짜 2030-12-31, 반복 유형 "yearly"
- **When**: `generateRecurringEvents` 함수를 호출함
- **Then**:
  - [ ] 2024년, 2028년에만 일정이 생성됨 (윤년)
  - [ ] 2025년, 2026년, 2027년, 2029년, 2030년에는 일정이 생성되지 않음
  - [ ] 총 2개의 일정이 생성됨

**우선순위**: High (엣지 케이스)

**테스트 데이터**:
```typescript
{
  startDate: new Date('2024-02-29'),
  endDate: new Date('2030-12-31'),
  repeatType: 'yearly',
  eventData: { title: '윤년 이벤트' }
}
```

---

**Scenario 6: 매년 반복 일정 생성**

- **Given**: 시작 날짜 2025-03-15, 종료 날짜 2028-12-31, 반복 유형 "yearly"
- **When**: `generateRecurringEvents` 함수를 호출함
- **Then**:
  - [ ] 4개의 일정이 생성됨 (2025-03-15, 2026-03-15, 2027-03-15, 2028-03-15)
  - [ ] 각 일정이 3월 15일임
  - [ ] 모든 일정이 동일한 `recurrenceId`를 가짐

**우선순위**: High

---

**Scenario 7: 종료 날짜 없이 반복 일정 생성 (에러 케이스)**

- **Given**: 시작 날짜 2025-01-01, 종료 날짜 없음, 반복 유형 "daily"
- **When**: `generateRecurringEvents` 함수를 호출함
- **Then**:
  - [ ] 에러가 발생하거나 빈 배열을 반환함

**우선순위**: Medium

---

**Scenario 8: 종료 날짜가 시작 날짜보다 이전 (에러 케이스)**

- **Given**: 시작 날짜 2025-01-10, 종료 날짜 2025-01-05, 반복 유형 "daily"
- **When**: `generateRecurringEvents` 함수를 호출함
- **Then**:
  - [ ] 에러가 발생하거나 빈 배열을 반환함

**우선순위**: Medium

---

#### 2.1.2 isRecurringEvent 함수

**테스트 대상**: `src/utils/recurringEventUtils.ts`의 `isRecurringEvent` 함수

**Scenario 1: 반복 일정 확인**

- **Given**: `repeat.type`이 "daily"인 이벤트
- **When**: `isRecurringEvent` 함수를 호출함
- **Then**:
  - [ ] `true`를 반환함

**우선순위**: High

---

**Scenario 2: 일반 일정 확인**

- **Given**: `repeat.type`이 "none"인 이벤트
- **When**: `isRecurringEvent` 함수를 호출함
- **Then**:
  - [ ] `false`를 반환함

**우선순위**: High

---

### 2.2 컴포넌트 테스트

#### 2.2.1 RecurrenceSelector 컴포넌트

**테스트 대상**: `src/components/RecurrenceSelector.tsx`

**Scenario 1: 기본 렌더링**

- **Given**: RecurrenceSelector가 기본 Props로 마운트됨
- **When**: 컴포넌트가 렌더링됨
- **Then**:
  - [ ] "반복" 레이블이 표시됨
  - [ ] 드롭다운이 표시됨
  - [ ] 기본값이 "없음"임
  - [ ] 종료 날짜 필드가 숨겨져 있음

**우선순위**: High

**테스트 데이터**:
```typescript
{
  value: { type: 'none', interval: 1 },
  onChange: vi.fn(),
}
```

---

**Scenario 2: 반복 유형 선택**

- **Given**: RecurrenceSelector가 렌더링됨
- **When**: 사용자가 드롭다운에서 "매일"을 선택함
- **Then**:
  - [ ] `onChange` 콜백이 `{ type: 'daily', interval: 1 }`로 호출됨
  - [ ] 종료 날짜 필드가 Slide down 애니메이션으로 표시됨 (0.3초)
  - [ ] 종료 날짜 필드가 DOM에 존재함

**우선순위**: High

**Mocking 전략**:
- `onChange` 콜백을 `vi.fn()`으로 Mocking
- 호출 검증: `expect(onChange).toHaveBeenCalledWith({ type: 'daily', interval: 1 })`

---

**Scenario 3: 반복 유형 "없음" 선택 시 종료 날짜 필드 숨김**

- **Given**: 반복 유형이 "매일"로 설정되어 종료 날짜 필드가 표시됨
- **When**: 사용자가 드롭다운에서 "없음"을 선택함
- **Then**:
  - [ ] 종료 날짜 필드가 숨겨짐
  - [ ] `onChange` 콜백이 `{ type: 'none', interval: 1 }`로 호출됨

**우선순위**: High

---

**Scenario 4: 모든 반복 유형 옵션 표시**

- **Given**: RecurrenceSelector가 렌더링됨
- **When**: 드롭다운을 열음
- **Then**:
  - [ ] "없음", "매일", "매주", "매월", "매년" 옵션이 표시됨
  - [ ] 5개의 옵션이 존재함

**우선순위**: High

---

#### 2.2.2 EndDateInput 컴포넌트

**테스트 대상**: `src/components/EndDateInput.tsx`

**Scenario 1: 기본 렌더링**

- **Given**: EndDateInput이 기본 Props로 마운트됨
- **When**: 컴포넌트가 렌더링됨
- **Then**:
  - [ ] "종료 날짜" 레이블이 표시됨
  - [ ] Date Picker가 표시됨
  - [ ] 최소 날짜가 시작 날짜 + 1일로 설정됨
  - [ ] 최대 날짜가 2025-12-31로 설정됨

**우선순위**: High

**테스트 데이터**:
```typescript
{
  value: '',
  startDate: '2025-01-01',
  onChange: vi.fn(),
}
```

---

**Scenario 2: 종료 날짜 선택**

- **Given**: EndDateInput이 렌더링됨
- **When**: 사용자가 2025-01-31을 선택함
- **Then**:
  - [ ] `onChange` 콜백이 "2025-01-31"로 호출됨
  - [ ] Date Picker에 선택된 날짜가 표시됨

**우선순위**: High

---

**Scenario 3: 종료 날짜 검증 - 시작 날짜보다 이전**

- **Given**: 시작 날짜가 2025-01-10임
- **When**: 사용자가 종료 날짜로 2025-01-05를 선택함
- **Then**:
  - [ ] 검증 에러 메시지 "종료 날짜는 시작 날짜 이후여야 합니다."가 표시됨
  - [ ] Date Picker에 에러 스타일이 적용됨

**우선순위**: High

---

**Scenario 4: 종료 날짜 검증 - 최대 날짜 초과**

- **Given**: EndDateInput이 렌더링됨
- **When**: 사용자가 종료 날짜로 2026-01-01을 선택함
- **Then**:
  - [ ] 검증 에러 메시지 "종료 날짜는 2025-12-31까지 선택 가능합니다."가 표시됨

**우선순위**: High

---

#### 2.2.3 RecurrenceIcon 컴포넌트

**테스트 대상**: `src/components/RecurrenceIcon.tsx`

**Scenario 1: 반복 일정에 아이콘 표시**

- **Given**: `isRecurring={true}` Props로 RecurrenceIcon이 마운트됨
- **When**: 컴포넌트가 렌더링됨
- **Then**:
  - [ ] 반복 아이콘(🔁 또는 이와 유사한 아이콘)이 표시됨
  - [ ] `aria-label="반복 일정"`이 설정됨
  - [ ] 아이콘 크기가 16px임

**우선순위**: High

**테스트 데이터**:
```typescript
{
  isRecurring: true
}
```

---

**Scenario 2: 일반 일정에 아이콘 미표시**

- **Given**: `isRecurring={false}` Props로 RecurrenceIcon이 마운트됨
- **When**: 컴포넌트가 렌더링됨
- **Then**:
  - [ ] 아이콘이 표시되지 않음
  - [ ] DOM에 아이콘 요소가 없음

**우선순위**: High

---

#### 2.2.4 RecurrenceEditModal 컴포넌트

**테스트 대상**: `src/components/RecurrenceEditModal.tsx`

**Scenario 1: 모달 기본 렌더링**

- **Given**: RecurrenceEditModal이 `isOpen={true}`로 마운트됨
- **When**: 컴포넌트가 렌더링됨
- **Then**:
  - [ ] 모달이 표시됨
  - [ ] 제목 "반복 일정 수정"이 표시됨
  - [ ] 메시지 "해당 일정만 수정하시겠어요?"가 표시됨
  - [ ] "예", "아니오" 버튼이 표시됨

**우선순위**: High

**테스트 데이터**:
```typescript
{
  isOpen: true,
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
}
```

---

**Scenario 2: "예" 버튼 클릭 - 단일 수정**

- **Given**: 모달이 열려 있음
- **When**: 사용자가 "예" 버튼을 클릭함
- **Then**:
  - [ ] `onConfirm('single')` 콜백이 호출됨
  - [ ] 모달이 닫힘

**우선순위**: High

---

**Scenario 3: "아니오" 버튼 클릭 - 전체 수정**

- **Given**: 모달이 열려 있음
- **When**: 사용자가 "아니오" 버튼을 클릭함
- **Then**:
  - [ ] `onConfirm('all')` 콜백이 호출됨
  - [ ] 모달이 닫힘

**우선순위**: High

---

**Scenario 4: Esc 키로 모달 닫기**

- **Given**: 모달이 열려 있음
- **When**: 사용자가 Esc 키를 누름
- **Then**:
  - [ ] `onCancel` 콜백이 호출됨
  - [ ] 모달이 닫힘

**우선순위**: High

---

**Scenario 5: 키보드 네비게이션 - Tab 키**

- **Given**: 모달이 열려 있음
- **When**: 사용자가 Tab 키를 누름
- **Then**:
  - [ ] 포커스가 "예" 버튼 → "아니오" 버튼 순서로 이동함
  - [ ] 포커스가 모달 내부에만 유지됨 (포커스 트랩)

**우선순위**: Medium

---

#### 2.2.5 RecurrenceDeleteModal 컴포넌트

**테스트 대상**: `src/components/RecurrenceDeleteModal.tsx`

**Scenario 1: 모달 기본 렌더링**

- **Given**: RecurrenceDeleteModal이 `isOpen={true}`로 마운트됨
- **When**: 컴포넌트가 렌더링됨
- **Then**:
  - [ ] 모달이 표시됨
  - [ ] 제목 "반복 일정 삭제"가 표시됨
  - [ ] 메시지 "해당 일정만 삭제하시겠어요?"가 표시됨
  - [ ] "예", "아니오" 버튼이 표시됨

**우선순위**: High

---

**Scenario 2: "예" 버튼 클릭 - 단일 삭제**

- **Given**: 모달이 열려 있음
- **When**: 사용자가 "예" 버튼을 클릭함
- **Then**:
  - [ ] `onConfirm('single')` 콜백이 호출됨
  - [ ] 모달이 닫힘

**우선순위**: High

---

**Scenario 3: "아니오" 버튼 클릭 - 전체 삭제**

- **Given**: 모달이 열려 있음
- **When**: 사용자가 "아니오" 버튼을 클릭함
- **Then**:
  - [ ] `onConfirm('all')` 콜백이 호출됨
  - [ ] 모달이 닫힘

**우선순위**: High

---

## 3. 통합 테스트 시나리오

### 3.1 반복 일정 생성 플로우

**Scenario: 사용자가 매주 반복 일정을 생성한다**

- **Given**: 일정 생성 폼이 열림
- **When**:
  1. 사용자가 제목 "주간 회의"를 입력함
  2. 사용자가 시작 날짜 "2025-01-06"을 선택함
  3. 사용자가 반복 유형 "매주"를 선택함
  4. 사용자가 종료 날짜 "2025-01-27"을 선택함
  5. 사용자가 "저장" 버튼을 클릭함
- **Then**:
  - [ ] 4개의 반복 일정이 생성됨 (1/6, 1/13, 1/20, 1/27)
  - [ ] 캘린더 뷰에 4개의 일정이 표시됨
  - [ ] 각 일정에 반복 아이콘이 표시됨
  - [ ] 모든 일정이 동일한 `recurrenceId`를 가짐

**우선순위**: High

---

### 3.2 반복 일정 수정 플로우

**Scenario: 사용자가 반복 일정 중 하나를 단일 수정한다**

- **Given**: 매주 반복 일정 4개가 존재함 (1/6, 1/13, 1/20, 1/27)
- **When**:
  1. 사용자가 1/13 일정을 클릭함
  2. 사용자가 제목을 "긴급 회의"로 변경함
  3. 사용자가 "저장" 버튼을 클릭함
  4. 모달이 표시되고 "예"를 클릭함 (단일 수정)
- **Then**:
  - [ ] 1/13 일정의 제목이 "긴급 회의"로 변경됨
  - [ ] 1/13 일정의 반복 아이콘이 제거됨
  - [ ] 1/13 일정의 `repeat.type`이 "none"으로 변경됨
  - [ ] 다른 일정(1/6, 1/20, 1/27)은 변경되지 않음
  - [ ] 다른 일정의 반복 아이콘이 유지됨

**우선순위**: High

---

**Scenario: 사용자가 반복 일정 전체를 수정한다**

- **Given**: 매주 반복 일정 4개가 존재함 (1/6, 1/13, 1/20, 1/27)
- **When**:
  1. 사용자가 1/13 일정을 클릭함
  2. 사용자가 제목을 "전체 회의"로 변경함
  3. 사용자가 "저장" 버튼을 클릭함
  4. 모달이 표시되고 "아니오"를 클릭함 (전체 수정)
- **Then**:
  - [ ] 모든 일정(1/6, 1/13, 1/20, 1/27)의 제목이 "전체 회의"로 변경됨
  - [ ] 모든 일정의 반복 아이콘이 유지됨
  - [ ] 모든 일정의 `repeat.type`이 "weekly"로 유지됨

**우선순위**: High

---

### 3.3 반복 일정 삭제 플로우

**Scenario: 사용자가 반복 일정 중 하나를 단일 삭제한다**

- **Given**: 매주 반복 일정 4개가 존재함 (1/6, 1/13, 1/20, 1/27)
- **When**:
  1. 사용자가 1/13 일정의 삭제 버튼을 클릭함
  2. 모달이 표시되고 "예"를 클릭함 (단일 삭제)
- **Then**:
  - [ ] 1/13 일정만 삭제됨
  - [ ] 다른 일정(1/6, 1/20, 1/27)은 유지됨
  - [ ] 캘린더에 3개의 일정이 표시됨

**우선순위**: High

---

**Scenario: 사용자가 반복 일정 전체를 삭제한다**

- **Given**: 매주 반복 일정 4개가 존재함 (1/6, 1/13, 1/20, 1/27)
- **When**:
  1. 사용자가 1/13 일정의 삭제 버튼을 클릭함
  2. 모달이 표시되고 "아니오"를 클릭함 (전체 삭제)
- **Then**:
  - [ ] 모든 일정(1/6, 1/13, 1/20, 1/27)이 삭제됨
  - [ ] 캘린더에 일정이 표시되지 않음

**우선순위**: High

---

### 3.4 반복 일정 겹침 검사 플로우

**Scenario: 반복 일정 생성 시 기존 일정과 겹쳐도 경고가 나타나지 않는다**

- **Given**: 기존 일정이 "2025-10-15 10:00-12:00"에 존재함
- **When**:
  1. 사용자가 반복 일정 생성 폼을 열음
  2. 사용자가 제목 "반복 회의"를 입력함
  3. 사용자가 날짜 "2025-10-15"를 선택함
  4. 사용자가 시간 "11:00-13:00"을 선택함 (기존 일정과 겹침)
  5. 사용자가 반복 유형 "매주"를 선택함
  6. 사용자가 "저장" 버튼을 클릭함
- **Then**:
  - [ ] 일정 겹침 경고 다이얼로그가 표시되지 않음
  - [ ] 반복 일정이 정상적으로 생성됨
  - [ ] 캘린더에 반복 일정이 표시됨

**우선순위**: High

**비즈니스 로직**: 반복 일정은 유연한 스케줄 관리를 위해 의도적으로 겹침 검사를 수행하지 않음

---

**Scenario: 일반 일정 생성 시 기존 일정과 겹치면 경고가 나타난다 (대조 테스트)**

- **Given**: 기존 일정이 "2025-10-15 10:00-12:00"에 존재함
- **When**:
  1. 사용자가 일반 일정 생성 폼을 열음
  2. 사용자가 제목 "새 회의"를 입력함
  3. 사용자가 날짜 "2025-10-15"를 선택함
  4. 사용자가 시간 "11:00-13:00"을 선택함 (기존 일정과 겹침)
  5. 사용자가 반복 일정을 선택하지 않음 (일반 일정)
  6. 사용자가 "저장" 버튼을 클릭함
- **Then**:
  - [ ] 일정 겹침 경고 다이얼로그가 표시됨
  - [ ] 다이얼로그에 "다음 일정과 겹칩니다"라는 메시지가 표시됨
  - [ ] 겹치는 일정 정보(기존 회의)가 표시됨
  - [ ] "계속 진행" 버튼을 클릭하면 일정이 생성됨
  - [ ] "취소" 버튼을 클릭하면 일정 생성이 취소됨

**우선순위**: High

**비즈니스 로직**: 일반 일정은 기존대로 겹침 경고를 표시하여 사용자에게 알림

---

## 4. 테스트 데이터 명세

### 4.1 Mock 데이터

#### 4.1.1 반복 일정 Mock

```typescript
export const mockDailyRecurringEvent: Event = {
  id: '1',
  title: '매일 운동',
  date: '2025-01-01',
  startTime: '07:00',
  endTime: '08:00',
  description: 'Morning exercise',
  location: 'Gym',
  category: 'personal',
  repeat: {
    type: 'daily',
    interval: 1,
    endDate: '2025-01-07',
  },
  notificationTime: 10,
};

export const mockWeeklyRecurringEvent: Event = {
  id: '2',
  title: '주간 회의',
  date: '2025-01-06',
  startTime: '14:00',
  endTime: '15:00',
  description: 'Weekly meeting',
  location: 'Conference Room',
  category: 'meeting',
  repeat: {
    type: 'weekly',
    interval: 1,
    endDate: '2025-01-27',
  },
  notificationTime: 30,
};

export const mockMonthlyRecurringEvent: Event = {
  id: '3',
  title: '월간 리뷰',
  date: '2025-01-15',
  startTime: '10:00',
  endTime: '11:00',
  description: 'Monthly review',
  location: 'Office',
  category: 'work',
  repeat: {
    type: 'monthly',
    interval: 1,
    endDate: '2025-06-15',
  },
  notificationTime: 60,
};

export const mockYearlyRecurringEvent: Event = {
  id: '4',
  title: '생일',
  date: '2025-03-15',
  startTime: '00:00',
  endTime: '23:59',
  description: 'Birthday celebration',
  location: 'Home',
  category: 'personal',
  repeat: {
    type: 'yearly',
    interval: 1,
    endDate: '2030-03-15',
  },
  notificationTime: 1440, // 1 day before
};
```

---

## 5. Mocking 전략

### 5.1 함수 Mocking

**Mocking 대상**:
- `onChange` 콜백: `vi.fn()`
- `onConfirm` 콜백: `vi.fn()`
- `onCancel` 콜백: `vi.fn()`

**예시**:
```typescript
const mockOnChange = vi.fn();
// 호출 검증
expect(mockOnChange).toHaveBeenCalledWith({ type: 'daily', interval: 1 });
expect(mockOnChange).toHaveBeenCalledTimes(1);
```

### 5.2 날짜/시간 Mocking

**Mocking 방법**:
- `vi.useFakeTimers()` 사용
- 특정 날짜로 고정: `vi.setSystemTime(new Date('2025-01-01'))`

**예시**:
```typescript
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-01-01'));
});

afterEach(() => {
  vi.useRealTimers();
});
```

### 5.3 date-fns Mocking

**Mocking 대상**:
- `addDays`, `addWeeks`, `addMonths`, `addYears`
- `isLeapYear`
- `getDaysInMonth`

**예시**:
```typescript
vi.mock('date-fns', () => ({
  addDays: (date: Date, amount: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + amount);
    return result;
  },
  isLeapYear: (date: Date) => {
    const year = date.getFullYear();
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  },
}));
```

---

## 6. 테스트 우선순위

### High Priority
- 반복 일정 생성 로직 (매일, 매주, 매월, 매년)
- 31일 매월 반복 엣지 케이스
- 윤년 2월 29일 매년 반복 엣지 케이스
- 단일/전체 수정 로직
- 단일/전체 삭제 로직
- 반복 아이콘 표시

### Medium Priority
- 종료 날짜 검증
- 모달 키보드 네비게이션
- Slide down 애니메이션

### Low Priority
- 스타일 테스트 (스냅샷 테스트)

---

## 7. 접근성 테스트 시나리오

### 7.1 키보드 네비게이션

**Scenario: Tab 키로 포커스 이동**

- **Given**: 일정 생성 폼이 렌더링됨
- **When**: Tab 키를 누름
- **Then**:
  - [ ] 포커스가 제목 → 날짜 → 반복 유형 → 종료 날짜 → 저장 버튼 순서로 이동함
  - [ ] 포커스 표시가 명확히 보임

**테스트 방법**: `userEvent.tab()` 사용

---

### 7.2 스크린 리더 지원

**Scenario: ARIA 레이블 확인**

- **Given**: 반복 아이콘이 렌더링됨
- **When**: 스크린 리더가 아이콘을 읽음
- **Then**:
  - [ ] `aria-label="반복 일정"`이 읽힘
  - [ ] 레이블 텍스트가 명확함

**테스트 방법**: `getByRole()`, `getByLabelText()` 사용

---

## 8. 참조 및 연결

### 8.1 PRD 참조

- **섹션 3**: 주요 기능 (Features)
- **섹션 5**: 기술 스택 및 요구사항
- **섹션 8**: 데이터 모델

### 8.2 기술 스택

- **테스트 프레임워크**: Vitest
- **테스트 라이브러리**: React Testing Library
- **모킹 라이브러리**: Vitest (`vi.fn()`, `vi.mock()`)
- **날짜 라이브러리**: date-fns

---

## 9. 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|-----------|
| 1.0.0 | 2025-10-30 | Test Designer | 초안 작성 |
| 1.1.0 | 2025-10-31 | Doc Keeper | 반복 일정 겹침 검사 시나리오 추가 (3.4절) |

---

**다음 단계**: Test Writer가 이 시나리오를 기반으로 실패하는 테스트 코드 작성 (Red 단계)
