# Product Requirements: TDD-CYCLE-2 - 반복 일정 UI 기능

**Feature ID**: TDD-CYCLE-2
**Created**: 2025-11-01
**Based on**: 01_analysis.md
**Priority**: P0 (High)

---

## 1. Product Goals (OKRs + KPIs)

### Objective 1: 반복 일정 명확성 향상
**Key Results**:
- KR1: 반복 일정 식별률 95% 달성 (아이콘 통한 시각적 구분)
- KR2: 사용자 혼란 보고 건수 0건 유지
- KR3: 반복 일정 관련 UI 피드백 만족도 4.5/5.0 이상

**KPIs**:
- 아이콘 표시 정확도: 100% (모든 반복 일정에 아이콘 표시)
- 아이콘 렌더링 성능: < 50ms (일정당)

### Objective 2: 수정/삭제 오류 방지
**Key Results**:
- KR1: 의도하지 않은 전체 수정/삭제 발생률 0%
- KR2: 모달 확인 단계 추가로 사용자 확신도 100%
- KR3: 데이터 손실 관련 지원 티켓 0건

**KPIs**:
- 모달 표시율: 100% (반복 일정 수정/삭제 시)
- 모달 응답 시간: < 200ms
- 사용자 선택 정확도: 98% (의도와 일치하는 선택)

### Objective 3: TDD 기반 안정성 확보
**Key Results**:
- KR1: 통합 테스트 커버리지 100% (반복 일정 UI 흐름)
- KR2: 테스트 실패율 0% (RED → GREEN → REFACTOR)
- KR3: 회귀 버그 발생률 0%

**KPIs**:
- 테스트 수: 15-25개 (표준 복잡도 기준)
- 테스트 실행 시간: < 5초
- 테스트 신뢰도: 100% (flaky test 0%)

---

## 2. User Stories (Given-When-Then)

### Story 1: 반복 일정 아이콘 표시
**As a** 캘린더 사용자
**I want to** 반복 일정을 아이콘으로 구분하여 볼 수 있다
**So that** 단일 일정과 반복 일정을 쉽게 구분할 수 있다

**Given-When-Then**:
```gherkin
Given: 매주 월요일 "팀 회의" 일정이 있다
  And: event.repeat = { type: 'weekly', interval: 1 }
When: 11월 캘린더 뷰를 연다
Then: "팀 회의" 일정 옆에 Repeat 아이콘이 표시된다
  And: 아이콘은 모든 반복 발생 일정에 표시된다
```

**Acceptance Criteria**:
- [ ] `event.repeat` 속성이 있는 일정에만 아이콘 표시
- [ ] 아이콘은 일정 제목 바로 옆에 위치
- [ ] 아이콘 크기: 16x16px, 색상: 테마 primary color
- [ ] 단일 일정에는 아이콘 미표시

---

### Story 2: 반복 일정 단일 수정 (모달 확인)
**As a** 일정 관리자
**I want to** 반복 일정 중 하나만 수정할 수 있다
**So that** 특정 날짜의 예외 상황을 처리할 수 있다

**Given-When-Then**:
```gherkin
Given: 매주 목요일 "영어 스터디" 일정이 있다
  And: 11월 7일 일정을 수정하려 한다
When: 일정 수정 버튼을 클릭한다
Then: 모달이 표시된다
  And: 모달 메시지: "해당 일정만 수정하시겠어요?"
  And: 버튼: "예", "아니오"
When: "예" 버튼을 클릭한다
Then: 11월 7일 일정만 수정된다
  And: event.repeat 속성이 제거된다
  And: Repeat 아이콘이 사라진다
  And: 다른 날짜의 "영어 스터디"는 그대로 유지된다
```

**Acceptance Criteria**:
- [ ] 반복 일정 수정 시 모달 자동 표시
- [ ] 모달 메시지: "해당 일정만 수정하시겠어요?"
- [ ] "예" 선택 시: 단일 일정으로 변환, repeat 속성 제거, 아이콘 제거
- [ ] 수정 후 다른 반복 일정 영향 없음

---

### Story 3: 반복 일정 전체 수정 (모달 확인)
**As a** 일정 관리자
**I want to** 반복 일정 전체를 한 번에 수정할 수 있다
**So that** 모든 발생 일정의 정보를 동기화할 수 있다

**Given-When-Then**:
```gherkin
Given: 매일 "운동" 일정이 있다 (시간: 18:00)
  And: 시간을 19:00으로 변경하려 한다
When: 일정 수정 버튼을 클릭한다
Then: 모달이 표시된다
  And: 모달 메시지: "해당 일정만 수정하시겠어요?"
When: "아니오" 버튼을 클릭한다
Then: 모든 "운동" 일정의 시간이 19:00으로 변경된다
  And: event.repeat 속성이 유지된다
  And: Repeat 아이콘이 모든 일정에 유지된다
```

**Acceptance Criteria**:
- [ ] 반복 일정 수정 시 모달 자동 표시
- [ ] "아니오" 선택 시: `useRecurringEvent.updateRecurringEvent()` 호출
- [ ] 모든 반복 발생 일정 동시 업데이트
- [ ] repeat 속성 및 아이콘 유지

---

### Story 4: 반복 일정 단일 삭제 (모달 확인)
**As a** 일정 관리자
**I want to** 반복 일정 중 특정 날짜만 삭제할 수 있다
**So that** 공휴일 등 예외 상황을 처리할 수 있다

**Given-When-Then**:
```gherkin
Given: 매주 금요일 "독서 모임" 일정이 있다
  And: 11월 15일은 공휴일이라 삭제하려 한다
When: 11월 15일 일정의 삭제 버튼을 클릭한다
Then: 모달이 표시된다
  And: 모달 메시지: "해당 일정만 삭제하시겠어요?"
When: "예" 버튼을 클릭한다
Then: 11월 15일 "독서 모임"만 삭제된다
  And: 11월 8일, 22일, 29일 일정은 유지된다
```

**Acceptance Criteria**:
- [ ] 반복 일정 삭제 시 모달 자동 표시
- [ ] 모달 메시지: "해당 일정만 삭제하시겠어요?"
- [ ] "예" 선택 시: 해당 일정만 제거
- [ ] 다른 반복 발생 일정은 유지

---

### Story 5: 반복 일정 전체 삭제 (모달 확인)
**As a** 일정 관리자
**I want to** 반복 일정 전체를 한 번에 삭제할 수 있다
**So that** 더 이상 필요 없는 반복 활동을 정리할 수 있다

**Given-When-Then**:
```gherkin
Given: 매월 1일 "월례 회의" 일정이 있다
  And: 프로젝트 종료로 더 이상 필요 없다
When: 11월 1일 일정의 삭제 버튼을 클릭한다
Then: 모달이 표시된다
  And: 모달 메시지: "해당 일정만 삭제하시겠어요?"
When: "아니오" 버튼을 클릭한다
Then: 모든 "월례 회의" 일정이 삭제된다 (11월, 12월, ...)
  And: `useRecurringEvent.deleteRecurringEvent()` 호출됨
```

**Acceptance Criteria**:
- [ ] 반복 일정 삭제 시 모달 자동 표시
- [ ] "아니오" 선택 시: `useRecurringEvent.deleteRecurringEvent()` 호출
- [ ] 모든 반복 발생 일정 제거
- [ ] 삭제 확인 후 캘린더 뷰 자동 새로고침

---

## 3. Acceptance Criteria (BDD Format)

### Feature: 반복 일정 UI 통합

#### Scenario 1: 반복 일정 아이콘 표시
```gherkin
Given 매주 반복되는 "회의" 일정이 존재한다
When 캘린더 뷰를 렌더링한다
Then "회의" 일정 옆에 Repeat 아이콘이 표시된다
And 아이콘은 모든 반복 발생 일정에 표시된다
```

#### Scenario 2: 단일 일정은 아이콘 미표시
```gherkin
Given 단일 "점심 약속" 일정이 존재한다
And event.repeat 속성이 없다
When 캘린더 뷰를 렌더링한다
Then "점심 약속" 일정에 아이콘이 표시되지 않는다
```

#### Scenario 3: 반복 일정 수정 모달 표시
```gherkin
Given 매일 반복되는 "운동" 일정이 있다
When 일정 수정 버튼을 클릭한다
Then 모달이 표시된다
And 모달 메시지는 "해당 일정만 수정하시겠어요?"이다
And "예", "아니오" 버튼이 있다
```

#### Scenario 4: 단일 수정 (예 선택)
```gherkin
Given 반복 일정 수정 모달이 표시된 상태
When "예" 버튼을 클릭한다
Then 해당 일정만 수정된다
And event.repeat 속성이 제거된다
And Repeat 아이콘이 제거된다
```

#### Scenario 5: 전체 수정 (아니오 선택)
```gherkin
Given 반복 일정 수정 모달이 표시된 상태
When "아니오" 버튼을 클릭한다
Then useRecurringEvent.updateRecurringEvent()가 호출된다
And 모든 반복 일정이 업데이트된다
And event.repeat 속성이 유지된다
And Repeat 아이콘이 유지된다
```

#### Scenario 6: 반복 일정 삭제 모달 표시
```gherkin
Given 매주 반복되는 "스터디" 일정이 있다
When 일정 삭제 버튼을 클릭한다
Then 모달이 표시된다
And 모달 메시지는 "해당 일정만 삭제하시겠어요?"이다
And "예", "아니오" 버튼이 있다
```

#### Scenario 7: 단일 삭제 (예 선택)
```gherkin
Given 반복 일정 삭제 모달이 표시된 상태
When "예" 버튼을 클릭한다
Then 해당 일정만 삭제된다
And 다른 반복 발생 일정은 유지된다
```

#### Scenario 8: 전체 삭제 (아니오 선택)
```gherkin
Given 반복 일정 삭제 모달이 표시된 상태
When "아니오" 버튼을 클릭한다
Then useRecurringEvent.deleteRecurringEvent()가 호출된다
And 모든 반복 일정이 삭제된다
```

---

## 4. Handoff Summary

**To Architect**:
- 5개 사용자 스토리 정의 완료: 아이콘 표시, 단일/전체 수정, 단일/전체 삭제
- 8개 BDD 시나리오로 모든 케이스 커버
- 모달 인터페이스 설계 필요: "해당 일정만 수정/삭제하시겠어요?" 메시지, "예"/"아니오" 버튼

**Key Requirements**:
- UI 컴포넌트: Repeat 아이콘, 확인 모달 (2개 타입: 수정용, 삭제용)
- 이벤트 핸들러: 수정/삭제 클릭 시 모달 표시, 버튼 선택 시 적절한 훅 메서드 호출
- 상태 관리: 모달 열림/닫힘 상태, 선택된 일정 정보
