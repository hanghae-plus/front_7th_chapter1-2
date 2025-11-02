# Problem Analysis: TDD-CYCLE-2 - 반복 일정 UI 기능

**Feature ID**: TDD-CYCLE-2
**Created**: 2025-11-01
**Complexity**: Standard
**Route**: Standard (Analyst → PM → Architect → QA)

---

## 1. Problem Statement (E5 Framework)

### Essence
사용자가 반복 일정을 UI에서 명확히 구분하고, 수정/삭제 시 단일 또는 전체 변경을 선택할 수 있어야 함.

### Evidence
- **TDD-CYCLE-1 완료**: `useRecurringEvent` 훅을 통한 백엔드 로직 구현 완성
- **미구현 요구사항** (inst.md 기준):
  - 반복 일정 표시: 캘린더 뷰에서 아이콘으로 구분 표시 (요구사항 #2)
  - 반복 일정 수정: '해당 일정만 수정하시겠어요?' 모달 프롬프트 (요구사항 #4)
  - 반복 일정 삭제: '해당 일정만 삭제하시겠어요?' 모달 프롬프트 (요구사항 #5)

### Effect
**문제 발생 시 영향**:
- 사용자가 반복 일정과 단일 일정을 구분하지 못함
- 수정/삭제 시 의도하지 않은 전체 변경으로 인한 데이터 손실 위험
- UX 혼란으로 인한 사용자 신뢰도 저하

**해결 시 이점**:
- 명확한 UI 피드백으로 반복 일정 식별 가능
- 사용자 의도에 맞는 수정/삭제 작업 수행
- 일정 관리 안정성 향상

### Effort
**예상 작업량**:
- **설계**: 2시간 (모달 인터페이스 설계, 아이콘 통합)
- **구현**: 3-4시간 (UI 컴포넌트 수정, 이벤트 핸들러 연결)
- **테스트**: 2시간 (통합 테스트 15-25개 작성)
- **총**: 7-8시간

**기술 복잡도**: Medium
- 기존 `useRecurringEvent` 훅 활용 (로직 재사용)
- React 상태 관리 및 조건부 렌더링
- 모달 UI 통합 (기존 패턴 활용)

### Examples
**시나리오 1: 반복 일정 아이콘 표시**
```
Given: 매주 월요일 팀 회의 일정이 있을 때
When: 캘린더 뷰에서 해당 일정을 볼 때
Then: 일정 옆에 Repeat 아이콘이 표시된다
```

**시나리오 2: 단일 수정**
```
Given: 반복 일정을 수정하려 할 때
When: '해당 일정만 수정하시겠어요?' 모달에서 '예'를 선택
Then: 해당 일정만 단일 일정으로 변경되고, 아이콘이 제거된다
```

**시나리오 3: 전체 수정**
```
Given: 반복 일정을 수정하려 할 때
When: '해당 일정만 수정하시겠어요?' 모달에서 '아니오'를 선택
Then: 모든 반복 일정이 변경되고, 아이콘이 유지된다
```

---

## 2. Codebase Context (Existing Patterns Observed)

### Test Structure
**Location**: `src/__tests__/`
- `medium.integration.spec.tsx`: 기존 통합 테스트
- `hooks/`: 훅 단위 테스트
- `unit/`: 유틸리티 단위 테스트
- `utils.ts`: 테스트 헬퍼 함수

**Patterns**:
- Vitest 사용
- Integration tests는 `medium.integration.spec.tsx` 패턴
- 새 통합 테스트는 `integration/` 디렉토리 생성 권장

### Hooks Architecture
**Location**: `src/hooks/`
- `useRecurringEvent.ts`: 반복 일정 로직 (TDD-CYCLE-1에서 구현 완료)
- `useEventForm.ts`: 일정 폼 관리
- `useEventOperations.ts`: 일정 CRUD 작업
- `useCalendarView.ts`: 캘린더 뷰 상태
- `useNotifications.ts`: 알림 관리
- `useSearch.ts`: 검색 기능

**Integration Point**:
- `src/App.tsx`: 메인 컴포넌트 (단일 파일 모드)
- 모든 훅을 조합하여 UI 구성

---

## 3. Success Criteria (SMART Goals)

### Specific (구체적)
1. 반복 일정 아이콘 표시
   - `event.repeat` 속성이 있는 일정에 Repeat 아이콘 렌더링
   - 아이콘 위치: 일정 제목 옆 또는 별도 표시 영역

2. 수정 모달 프롬프트
   - 반복 일정 수정 시 모달 팝업: "해당 일정만 수정하시겠어요?"
   - 버튼: "예" (단일 수정), "아니오" (전체 수정)
   - 단일 수정: `event.repeat` 제거, 아이콘 제거
   - 전체 수정: `updateRecurringEvent()` 호출, 아이콘 유지

3. 삭제 모달 프롬프트
   - 반복 일정 삭제 시 모달 팝업: "해당 일정만 삭제하시겠어요?"
   - 버튼: "예" (단일 삭제), "아니오" (전체 삭제)
   - 단일 삭제: 해당 일정만 제거
   - 전체 삭제: `deleteRecurringEvent()` 호출

### Measurable (측정 가능)
- 통합 테스트 15-25개 작성 (표준 복잡도 기준)
- 테스트 커버리지: 반복 일정 UI 흐름 100%
- 모달 인터랙션 테스트: 4가지 시나리오 (수정/삭제 × 예/아니오)

### Achievable (달성 가능)
- `useRecurringEvent` 훅 이미 구현됨 (백엔드 로직 완성)
- 기존 모달 패턴 재사용 가능
- React 조건부 렌더링으로 아이콘 표시 간단함

### Relevant (관련성)
- inst.md 요구사항 #2, #4, #5 충족
- TDD-CYCLE-1의 자연스러운 다음 단계 (로직 → UI)
- 사용자 경험 개선 및 오류 방지

### Time-bound (기한)
- **Phase 완료**: 1일 (분석 → 요구사항 → 설계 → 테스트 작성)
- **구현 (다음 사이클)**: 0.5일

---

## 4. Impact Assessment

### Technical Impact
**변경 범위**:
- `src/App.tsx`: UI 로직 추가 (아이콘 렌더링, 모달 핸들러)
- `src/__tests__/integration/App.recurring-ui.spec.tsx`: 새 통합 테스트 파일 생성

**의존성**:
- `useRecurringEvent` 훅 (이미 존재, 변경 불필요)
- 모달 컴포넌트 (기존 또는 신규 생성)
- 아이콘 라이브러리 (예: lucide-react의 Repeat 아이콘)

**위험도**: Low-Medium
- 기존 로직 변경 없음 (UI 레이어만 추가)
- 새 테스트 파일 생성 (기존 테스트 영향 없음)

### User Impact
**긍정적 영향**:
- 반복 일정 명확한 구분 → 사용자 혼란 감소
- 수정/삭제 확인 모달 → 실수 방지
- 직관적인 UI 피드백 → 신뢰도 향상

**부정적 영향 (최소화)**:
- 모달 팝업 추가 → 클릭 1회 증가 (필수적 트레이드오프)

### Business Impact
- **사용자 만족도**: +15% (예상)
- **데이터 손실 방지**: 실수로 인한 전체 삭제 방지
- **기능 완성도**: inst.md 요구사항 80% 달성 (반복 유형 선택 제외)

---

## 5. Top 3 Risks

### Risk 1: 모달 UX 일관성
**Description**: 기존 모달 패턴과 다른 디자인으로 인한 혼란
**Probability**: Medium
**Impact**: Medium
**Mitigation**:
- 기존 모달 컴포넌트 재사용
- 일관된 버튼 레이블 및 스타일 적용
- QA 단계에서 UX 검증

### Risk 2: 아이콘 표시 위치 모호성
**Description**: 아이콘 위치가 명확하지 않아 사용자가 놓칠 수 있음
**Probability**: Low
**Impact**: Medium
**Mitigation**:
- 일정 제목 옆에 명확히 표시
- 색상/크기로 시각적 강조
- 통합 테스트로 아이콘 렌더링 검증

### Risk 3: 단일 수정 시 상태 동기화 이슈
**Description**: 단일 수정 시 `event.repeat` 제거가 제대로 반영되지 않을 수 있음
**Probability**: Low
**Impact**: High
**Mitigation**:
- `useRecurringEvent` 훅의 `updateSingleOccurrence()` 활용
- 통합 테스트로 상태 변화 검증
- TDD 접근으로 버그 사전 방지

---

## 6. Handoff Summary

**To PM**:
- 반복 일정 UI 기능 3가지 정의 완료: (1) 아이콘 표시, (2) 수정 모달, (3) 삭제 모달
- 백엔드 로직 완성 (useRecurringEvent 훅 활용), UI 연결만 필요
- 4가지 핵심 사용자 스토리 작성 필요: 아이콘 표시, 단일 수정, 전체 수정, 단일/전체 삭제

**Key Takeaways**:
- 기존 코드베이스 재사용으로 구현 위험 최소화
- 테스트 우선 접근으로 안정성 확보
- inst.md 요구사항 #2, #4, #5 충족
