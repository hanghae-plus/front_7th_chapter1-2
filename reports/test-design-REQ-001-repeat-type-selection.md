# REQ-001: 반복 유형 선택 - 테스트 설계

> **작성일**: 2025-01-29  
> **명세 문서**: docs/specification.md (REQ-001)  
> **설계자**: Test Planner Agent  
> **우선순위**: Critical  
> **버전**: 1.0

---

## 📊 Executive Summary

### 핵심 통계

- **총 TODO 항목**: 16개
- **예상 작업 시간**: 2시간 50분
- **명세 커버리지**: 100%
- **Critical 항목**: 10개 (1시간 30분)
- **High 항목**: 5개 (55분)
- **Medium 항목**: 1개 (25분)

### 주요 결정사항

1. **간단한 것부터**: 비반복(none) → 매일(daily) → 매주(weekly) → 매월(monthly) → 매년(yearly) 순서
2. **명세 중심**: REQ-001에 명시된 4가지 반복 유형 선택만 테스트
3. **UI와 로직 분리**: 폼 UI 동작 검증 + 데이터 저장 검증
4. **점진적 검증**: 생성 → 수정 → 상태 관리 순서

### 범위 제한

- ✅ **In Scope**: 반복 유형 선택 및 저장
- ❌ **Out of Scope**: 반복 일정 실제 생성 로직 (REQ-002~003), 아이콘 표시 (REQ-005), 종료일 검증 (REQ-006)

---

## 명세 분석 결과

### REQ-001 핵심 요구사항

#### 1. 기본 동작

- 일정 생성 시 반복 유형을 선택할 수 있다
- 일정 수정 시 반복 유형을 선택할 수 있다

#### 2. 지원 반복 유형

- **`반복 안 함`** (None) - `'none'` - 단일 일정 (1회성)
- `매일` (Daily) - `'daily'` - 매일 반복
- `매주` (Weekly) - `'weekly'` - 매주 반복
- `매월` (Monthly) - `'monthly'` - 매월 반복
- `매년` (Yearly) - `'yearly'` - 매년 반복

#### 3. 관련 UI

- 일정 생성/수정 폼

#### 4. 데이터 구조

```typescript
// types.ts에서 확인
export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RepeatInfo {
  type: RepeatType;
  interval: number;
  endDate?: string;
}

export interface EventForm {
  // ... 기타 필드
  repeat: RepeatInfo;
}
```

#### 5. 현재 구현 확인

- `useEventForm` 훅: `isRepeating`, `repeatType` 상태 관리
- `App.tsx`: 반복 체크박스 + 반복 유형 Select UI
- 반복 체크박스 활성화 시 반복 유형 선택 UI 표시

---

## ⚠️ 불명확한 항목 (구현 전 확인 필요)

| 항목 | 명세 참조 | 질문 | 제안 | 상태 |
|------|----------|------|------|------|
| 매주 반복 요일 선택 | - | 매주 반복 시 특정 요일을 선택할 수 있나요? | 시작일의 요일로 고정 | ⏳ 대기 중 |
| 반복 간격 설정 | - | "2일마다", "3주마다" 같은 간격을 설정할 수 있나요? | interval=1 고정 (REQ-001 범위 아님) | ⏳ 대기 중 |
| 반복 체크박스 기본값 | - | 체크박스 활성화 시 기본 반복 유형은? | 사용자가 명시적으로 선택해야 함 | ⏳ 대기 중 |

> 💡 **Action**: 위 항목에 대한 답변을 제공하면 TODO List가 조정됩니다.

---

## TODO List

### Kent Beck 방식: 간단한 것부터 복잡한 순서

```
Happy Path (기본 동작)
  ↓
Validation (간단한 검증)
  ↓
State Management (상태 관리)
  ↓
Modification (수정 동작)
  ↓
Data Persistence (저장/조회)
```

---

### Phase 1: Happy Path - 기본 반복 유형 선택 (Critical)

**Goal**: 가장 간단한 반복 유형 선택부터 시작

#### Group 1.1: Non-Recurring Event (가장 간단 - 시작점)

```markdown
- [ ] TODO-001: 반복 체크박스가 비활성화된 상태로 일정 생성 시 repeat.type이 'none'으로 저장된다
  - Priority: Critical
  - Time: 10min
  - Why start here: 가장 간단한 케이스, 기본 동작 검증
  - Test file: src/__tests__/hooks/useEventForm.spec.ts
  - Test type: Unit Test
```

#### Group 1.2: Enable Repeat Checkbox

```markdown
- [ ] TODO-002: 반복 체크박스를 활성화하면 반복 유형 선택 UI가 표시된다
  - Priority: High
  - Time: 10min
  - Dependency: TODO-001
  - Test file: src/__tests__/hooks/useEventForm.spec.ts
  - Test type: Unit Test
```

#### Group 1.3: Select Each Repeat Type (Core Feature)

```markdown
- [ ] TODO-003: 반복 체크박스 활성화 후 "매일" 반복 유형을 선택하고 일정 생성 시 repeat.type이 'daily'로 저장된다
  - Priority: Critical
  - Time: 10min
  - Dependency: TODO-002
  - Test file: src/__tests__/hooks/useEventForm.spec.ts
  - Test type: Unit Test

- [ ] TODO-004: 반복 체크박스 활성화 후 "매주" 반복 유형을 선택하고 일정 생성 시 repeat.type이 'weekly'로 저장된다
  - Priority: Critical
  - Time: 10min
  - Dependency: TODO-002
  - Pattern: TODO-003과 동일 패턴
  - Test file: src/__tests__/hooks/useEventForm.spec.ts
  - Test type: Unit Test

- [ ] TODO-005: 반복 체크박스 활성화 후 "매월" 반복 유형을 선택하고 일정 생성 시 repeat.type이 'monthly'로 저장된다
  - Priority: Critical
  - Time: 10min
  - Dependency: TODO-002
  - Pattern: TODO-003과 동일 패턴
  - Test file: src/__tests__/hooks/useEventForm.spec.ts
  - Test type: Unit Test

- [ ] TODO-006: 반복 체크박스 활성화 후 "매년" 반복 유형을 선택하고 일정 생성 시 repeat.type이 'yearly'로 저장된다
  - Priority: Critical
  - Time: 10min
  - Dependency: TODO-002
  - Pattern: TODO-003과 동일 패턴
  - Test file: src/__tests__/hooks/useEventForm.spec.ts
  - Test type: Unit Test
```

**Refactor Point**: TODO-003~006 완료 후 중복 제거 가능

---

### Phase 2: Event Modification - Repeat Type Change (High)

**Goal**: 기존 일정의 반복 유형 변경 검증

#### Group 2.1: Non-Recurring ↔ Recurring

```markdown
- [ ] TODO-007: 비반복 일정을 수정하여 "매일" 반복으로 변경할 수 있다
  - Priority: High
  - Time: 15min
  - Dependency: TODO-003
  - Test file: src/__tests__/hooks/useEventForm.spec.ts
  - Test type: Unit Test

- [ ] TODO-008: "매일" 반복 일정을 수정하여 비반복으로 변경할 수 있다
  - Priority: High
  - Time: 15min
  - Dependency: TODO-003
  - Test file: src/__tests__/hooks/useEventForm.spec.ts
  - Test type: Unit Test
```

#### Group 2.2: Repeat Type Switch

```markdown
- [ ] TODO-009: "매일" 반복 일정을 수정하여 "매주" 반복으로 변경할 수 있다
  - Priority: High
  - Time: 15min
  - Dependency: TODO-003, TODO-004
  - Test file: src/__tests__/hooks/useEventForm.spec.ts
  - Test type: Unit Test

- [ ] TODO-010: "매주" 반복 일정을 수정하여 "매월" 반복으로 변경할 수 있다
  - Priority: Medium
  - Time: 15min
  - Pattern: TODO-009와 동일
  - Test file: src/__tests__/hooks/useEventForm.spec.ts
  - Test type: Unit Test
```

---

### Phase 3: UI State Management (High)

**Goal**: 폼 상태 관리 검증

#### Group 3.1: Form Reset

```markdown
- [ ] TODO-011: 일정 생성 후 폼 초기화 시 반복 체크박스가 해제된다
  - Priority: High
  - Time: 10min
  - Test file: src/__tests__/hooks/useEventForm.spec.ts
  - Test type: Unit Test

- [ ] TODO-012: 일정 생성 후 폼 초기화 시 반복 유형이 'none'으로 리셋된다
  - Priority: High
  - Time: 10min
  - Test file: src/__tests__/hooks/useEventForm.spec.ts
  - Test type: Unit Test
```

#### Group 3.2: Edit Mode State

```markdown
- [ ] TODO-013: 반복 일정 수정 모드 진입 시 반복 체크박스가 활성화된다
  - Priority: Critical
  - Time: 10min
  - Test file: src/__tests__/hooks/useEventForm.spec.ts
  - Test type: Unit Test

- [ ] TODO-014: 반복 일정 수정 모드 진입 시 기존 반복 유형이 선택된 상태로 표시된다
  - Priority: Critical
  - Time: 10min
  - Test file: src/__tests__/hooks/useEventForm.spec.ts
  - Test type: Unit Test
```

---

### Phase 4: Data Persistence Verification (Critical)

**Goal**: 저장/조회 시 데이터 무결성 검증

#### Group 4.1: Save and Retrieve

```markdown
- [ ] TODO-015: "매일" 반복으로 저장된 일정 조회 시 repeat.type이 'daily'다
  - Priority: Critical
  - Time: 10min
  - Test file: src/__tests__/hooks/useEventOperations.spec.ts
  - Test type: Unit Test

- [ ] TODO-016: "매주" 반복으로 저장된 일정 조회 시 repeat.type이 'weekly'다
  - Priority: Critical
  - Time: 10min
  - Test file: src/__tests__/hooks/useEventOperations.spec.ts
  - Test type: Unit Test

- [ ] TODO-017: "매월" 반복으로 저장된 일정 조회 시 repeat.type이 'monthly'다
  - Priority: Critical
  - Time: 10min
  - Test file: src/__tests__/hooks/useEventOperations.spec.ts
  - Test type: Unit Test

- [ ] TODO-018: "매년" 반복으로 저장된 일정 조회 시 repeat.type이 'yearly'다
  - Priority: Critical
  - Time: 10min
  - Test file: src/__tests__/hooks/useEventOperations.spec.ts
  - Test type: Unit Test

- [ ] TODO-019: 비반복으로 저장된 일정 조회 시 repeat.type이 'none'이다
  - Priority: Critical
  - Time: 10min
  - Test file: src/__tests__/hooks/useEventOperations.spec.ts
  - Test type: Unit Test
```

---

### Summary

**Total TODO Items**: 19개
**Total Estimated Time**: 2시간 50분
**Critical Priority**: 10 items (1시간 30분)
**High Priority**: 5 items (55분)
**Medium Priority**: 1 item (15분)

**Execution Order**:
1. Phase 1 (TODO-001~006): 기본 반복 유형 선택 - 1시간
2. Phase 2 (TODO-007~010): 반복 유형 변경 - 1시간
3. Phase 3 (TODO-011~014): UI 상태 관리 - 40분
4. Phase 4 (TODO-015~019): 데이터 검증 - 50분

---

## Coverage Map

### Specification Requirements Coverage

| Spec Item | TODO Items | Status |
|-----------|------------|--------|
| **기본 동작: 일정 생성 시 반복 유형 선택** | TODO-001~006 | ✅ Covered |
| **기본 동작: 일정 수정 시 반복 유형 선택** | TODO-007~010 | ✅ Covered |
| **지원 유형: 반복 안 함 (none)** | TODO-001, 008, 012, 019 | ✅ Covered |
| **지원 유형: 매일 (daily)** | TODO-003, 007, 008, 015 | ✅ Covered |
| **지원 유형: 매주 (weekly)** | TODO-004, 009, 010, 016 | ✅ Covered |
| **지원 유형: 매월 (monthly)** | TODO-005, 010, 017 | ✅ Covered |
| **지원 유형: 매년 (yearly)** | TODO-006, 018 | ✅ Covered |
| **관련 UI: 일정 생성/수정 폼** | TODO-002, 011~014 | ✅ Covered |

### Data Structure Coverage

| Data Field | TODO Items | Status |
|------------|------------|--------|
| `Event.repeat.type: 'none'` | TODO-001, 008, 012, 019 | ✅ Covered |
| `Event.repeat.type: 'daily'` | TODO-003, 007, 015 | ✅ Covered |
| `Event.repeat.type: 'weekly'` | TODO-004, 009, 016 | ✅ Covered |
| `Event.repeat.type: 'monthly'` | TODO-005, 010, 017 | ✅ Covered |
| `Event.repeat.type: 'yearly'` | TODO-006, 018 | ✅ Covered |

### User Actions Coverage

| User Action | TODO Items | Status |
|-------------|------------|--------|
| 반복 체크박스 활성화 | TODO-002, 013 | ✅ Covered |
| 반복 체크박스 비활성화 | TODO-001, 011 | ✅ Covered |
| 반복 유형 선택 (각 타입) | TODO-003~006 | ✅ Covered |
| 비반복 → 반복 변경 | TODO-007 | ✅ Covered |
| 반복 → 비반복 변경 | TODO-008 | ✅ Covered |
| 반복 유형 간 변경 | TODO-009, 010 | ✅ Covered |
| 일정 저장 | TODO-001, 003~006 | ✅ Covered |
| 일정 조회 | TODO-015~019 | ✅ Covered |
| 일정 수정 | TODO-007~010 | ✅ Covered |

### Test Type Coverage

| Test Type | TODO Items | Status |
|-----------|------------|--------|
| **Unit Test - useEventForm** | TODO-001~014 | ✅ Covered |
| **Unit Test - useEventOperations** | TODO-015~019 | ✅ Covered |

### Coverage Score

- **Specification Requirements**: 100% (8/8 items covered)
- **Data Fields**: 100% (5/5 fields covered)
- **User Actions**: 100% (9/9 actions covered)
- **Overall Coverage**: 100%

---

## Edge Cases

### ✅ Covered in REQ-001

#### EC-001: Repeat Checkbox State Consistency

**Scenario**: 반복 체크박스와 repeat.type의 일관성

**Test Coverage**:
- TODO-001: 체크박스 비활성화 → type='none'
- TODO-011: 폼 초기화 시 체크박스 해제
- TODO-012: 폼 초기화 시 type='none' 리셋

**Why Important**: 데이터 무결성 보장

---

#### EC-002: Edit Mode State Preservation

**Scenario**: 반복 일정 수정 모드 진입 시 기존 상태 표시

**Test Coverage**:
- TODO-013: 수정 모드 진입 시 체크박스 활성화
- TODO-014: 수정 모드 진입 시 기존 반복 유형 선택

**Why Important**: 사용자가 혼동하지 않도록

---

### ❌ Out of Scope (다른 REQ에서 다룰 것)

#### EC-003: 31일 월간 반복

**Why Out of Scope**: REQ-002 전용 Edge Case

**Related Spec**: EDGE-001

---

#### EC-004: 윤년 2월 29일 연간 반복

**Why Out of Scope**: REQ-003 전용 Edge Case

**Related Spec**: EDGE-002

---

## Integration Points

### How REQ-001 Interacts with Other Requirements

#### REQ-002: 매월 반복 - 31일 처리

**Dependency**: REQ-001 → REQ-002

**Relationship**:
- REQ-001: 사용자가 "매월" 반복을 선택할 수 있다
- REQ-002: 31일에 "매월" 선택 시 특수 처리

**Test Boundary**:
- REQ-001은 'monthly' 선택만 테스트
- REQ-002는 31일 날짜 처리 로직 테스트

---

#### REQ-003: 매년 반복 - 윤년 29일 처리

**Dependency**: REQ-001 → REQ-003

**Relationship**:
- REQ-001: 사용자가 "매년" 반복을 선택할 수 있다
- REQ-003: 2월 29일에 "매년" 선택 시 특수 처리

**Test Boundary**:
- REQ-001은 'yearly' 선택만 테스트
- REQ-003은 2월 29일 로직 테스트

---

#### REQ-005: 반복 일정 시각적 표시

**Dependency**: REQ-001 → REQ-005 (순차)

**Relationship**:
- REQ-001: `repeat.type !== 'none'` 설정
- REQ-005: 반복 아이콘(🔁) 표시

**Test Boundary**:
- REQ-001: 데이터 저장만 테스트
- REQ-005: 아이콘 표시 테스트

---

## Test Data Requirements

### Event Form Data Templates

#### Template 1: Non-Recurring Event

```typescript
const nonRecurringEvent: EventForm = {
  title: '회의',
  date: '2025-01-15',
  startTime: '09:00',
  endTime: '10:00',
  description: '팀 미팅',
  location: '회의실 A',
  category: '업무',
  repeat: {
    type: 'none',
    interval: 0,
  },
  notificationTime: 10,
};
```

#### Template 2: Daily Recurring Event

```typescript
const dailyRecurringEvent: EventForm = {
  title: '매일 운동',
  date: '2025-01-01',
  startTime: '07:00',
  endTime: '08:00',
  description: '아침 운동',
  location: '헬스장',
  category: '개인',
  repeat: {
    type: 'daily',
    interval: 1,
  },
  notificationTime: 10,
};
```

#### Template 3: Weekly Recurring Event

```typescript
const weeklyRecurringEvent: EventForm = {
  title: '주간 회의',
  date: '2025-01-06', // 월요일
  startTime: '14:00',
  endTime: '15:00',
  description: '팀 주간 회의',
  location: '회의실 B',
  category: '업무',
  repeat: {
    type: 'weekly',
    interval: 1,
  },
  notificationTime: 10,
};
```

#### Template 4: Monthly Recurring Event

```typescript
const monthlyRecurringEvent: EventForm = {
  title: '월간 리뷰',
  date: '2025-01-15',
  startTime: '10:00',
  endTime: '11:00',
  description: '월간 성과 리뷰',
  location: '대회의실',
  category: '업무',
  repeat: {
    type: 'monthly',
    interval: 1,
  },
  notificationTime: 10,
};
```

#### Template 5: Yearly Recurring Event

```typescript
const yearlyRecurringEvent: EventForm = {
  title: '생일',
  date: '2025-03-15',
  startTime: '00:00',
  endTime: '23:59',
  description: '내 생일',
  location: '',
  category: '개인',
  repeat: {
    type: 'yearly',
    interval: 1,
  },
  notificationTime: 1440,
};
```

---

## Acceptance Criteria

### Definition of Done for REQ-001

REQ-001이 완료되었다고 판단하는 기준:

#### 1. All TODO Items Completed

- [ ] 19개의 TODO 항목 모두 구현 완료
- [ ] 모든 테스트 통과 (Green)
- [ ] Code coverage ≥ 90%

#### 2. Specification Requirements Met

- [ ] 4가지 반복 유형(daily, weekly, monthly, yearly) 선택 가능
- [ ] 일정 생성 시 반복 유형 선택 동작
- [ ] 일정 수정 시 반복 유형 선택 동작
- [ ] 선택한 반복 유형이 정확히 저장됨

#### 3. Data Integrity

- [ ] 저장된 `repeat.type` 값이 선택한 유형과 일치
- [ ] 반복 체크박스 해제 시 `type='none'`
- [ ] 데이터 조회 시 저장된 유형이 정확히 로드됨

#### 4. UI/UX Requirements

- [ ] 반복 체크박스 동작 정상
- [ ] 반복 유형 선택 UI 표시/숨김 정상
- [ ] 폼 초기화 시 상태 리셋 정상
- [ ] 수정 모드 진입 시 기존 값 표시 정상

#### 5. Integration Points

- [ ] REQ-002, REQ-003과의 경계 명확히 정의됨
- [ ] REQ-005와 데이터 공유 정상

#### 6. Test Quality

- [ ] 모든 테스트가 사용자 관점으로 작성됨
- [ ] 구현 세부사항이 아닌 동작을 검증함
- [ ] 테스트가 명세를 정확히 반영함

#### 7. Documentation

- [ ] 이 Test Design 문서 작성 완료
- [ ] Coverage Map 100% 달성

---

## Next Steps

### For User (사용자가 해야 할 것)

1. **Review this document**
   - 이 문서를 검토하고 피드백 제공
   - 특히 "불명확한 항목" 섹션의 3가지 질문에 답변

2. **Approve or Modify**
   - ✅ 승인: "OK" 또는 "구현 시작" 응답
   - 🔄 수정: "TODO-XXX 수정 필요: [이유]" 형식으로 피드백
   - 🔁 재설계: "재설계" 응답

---

### For Test Implementer (구현자가 해야 할 것)

승인 후 다음 순서로 진행:

1. **Phase 1: Basic Setup**
   - TODO-001~006 구현 (1시간)
   - Mock API handlers 설정
   - 첫 번째 Green 확인

2. **Phase 2: Modification**
   - TODO-007~010 구현 (1시간)
   - 반복 유형 변경 로직 검증

3. **Phase 3: UI State**
   - TODO-011~014 구현 (40분)
   - 폼 상태 관리 검증

4. **Phase 4: Data Persistence**
   - TODO-015~019 구현 (50분)
   - API 통합 검증

5. **Final Check**
   - All tests Green
   - Coverage ≥ 90%
   - Acceptance Criteria 충족 확인

---

## Document Metadata

**File**: `reports/test-design-REQ-001-repeat-type-selection.md`
**Created**: 2025-01-29
**Designer**: Test Planner Agent
**Specification**: `docs/specification.md` (REQ-001)
**Related Docs**:
- Kent Beck TDD Philosophy: `docs/kent-beck-tdd-pillosophy.md`
- Specification: `docs/specification.md`
- Test Code Rules: `docs/test-code-rules.md`

**Test Files to Create**:
- `src/__tests__/hooks/useEventForm.spec.ts` (TODO-001~014)
- `src/__tests__/hooks/useEventOperations.spec.ts` (TODO-015~019)

**Total TODO Items**: 19
**Estimated Implementation Time**: 2시간 50분
**Coverage**: 100%

---

**End of Test Design Document**

