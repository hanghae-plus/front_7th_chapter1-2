# Phase 1 Handoff: Feature Design for Recurring Event Delete

**From**: Orchestrator
**To**: feature-designer
**Date**: 2025-10-31
**Feature**: 반복 일정 삭제 기능 (단일 삭제 vs 시리즈 전체 삭제)

---

## 1. Mission Statement

**목표**: 사용자가 반복 일정을 삭제할 때 "해당 일정만" 또는 "전체 시리즈" 중 선택할 수 있는 직관적이고 안전한 UX를 설계하라.

**제약조건**:
- 기존 UI 패턴과 일관성 유지 (반복 일정 수정 다이얼로그 참조)
- Material-UI 컴포넌트 사용
- 한글 UI 텍스트
- 되돌릴 수 없는 작업임을 명확히 전달

---

## 2. Input Artifacts (입력 자료)

### 2.1 필수 읽기 문서
1. **Planning 문서**: `handoff/phase0-planning.md`
   - 전체 컨텍스트 및 요구사항
   - 현재 코드베이스 분석
   - 성공 기준

2. **프로젝트 규칙**: `CLAUDE.md`
   - 코드 컨벤션
   - 아키텍처 원칙
   - UI/UX 가이드라인

### 2.2 참조 코드
1. **현재 다이얼로그**: `src/App.tsx:834-851`
   ```typescript
   <Dialog open={isRecurringDeleteDialogOpen}>
     <DialogTitle>반복 일정 삭제</DialogTitle>
     <DialogContent>
       <DialogContentText>
         이 반복 시리즈의 모든 일정을 삭제하시겠습니까?
         <br />이 작업은 되돌릴 수 없습니다.
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

2. **반복 일정 수정 다이얼로그**: `src/App.tsx:757-832`
   - 유사한 패턴: "해당 일정만" vs "시리즈 전체" 선택
   - 참조할 UX 패턴

3. **API 로직**: `src/hooks/useEventOperations.ts`
   - `deleteEvent(id: string)`: 단일 삭제
   - `deleteRecurringSeries(repeatId: string)`: 시리즈 전체 삭제

### 2.3 데이터 구조
```typescript
interface Event {
  id: string;                // 개별 일정 식별자
  repeat: {
    type: RepeatType;        // 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'
    id?: string;             // repeatId (시리즈 식별자)
    interval: number;
    endDate?: string;
  };
  // ... 기타 필드
}
```

---

## 3. Requirements (요구사항)

### 3.1 기능 요구사항

#### FR-1: 다이얼로그 메시지
- **현재**: "이 반복 시리즈의 모든 일정을 삭제하시겠습니까?"
- **변경**: "해당 일정만 삭제하시겠어요?"
- **보조 메시지**: "이 작업은 되돌릴 수 없습니다."

#### FR-2: 선택지 (3가지)
1. **"예"**: 해당 일정만 삭제 → `deleteEvent(event.id)`
2. **"아니오"**: 전체 시리즈 삭제 → `deleteRecurringSeries(event.repeat.id)`
3. **"취소"**: 작업 취소 → 다이얼로그 닫기

#### FR-3: 버튼 배치 및 스타일
- 왼쪽: "취소" (기본 스타일)
- 중앙: "예" (기본 스타일 또는 primary)
- 오른쪽: "아니오" (color="error", 가장 위험한 작업)

#### FR-4: 피드백 메시지
- 단일 삭제 성공: "일정이 삭제되었습니다." (info)
- 시리즈 삭제 성공: "반복 일정 시리즈가 삭제되었습니다." (info)
- 삭제 실패: "일정 삭제 실패" (error)

### 3.2 UX 요구사항

#### UX-1: 명확한 의도 전달
- 사용자가 "예"를 선택하면 **하나만** 삭제됨을 명확히
- "아니오"를 선택하면 **전체 시리즈**가 삭제됨을 명확히

#### UX-2: 안전장치
- 가장 위험한 작업(전체 삭제)을 색상으로 구분 (color="error")
- "취소" 버튼을 쉽게 찾을 수 있도록 배치

#### UX-3: 일관성
- 반복 일정 수정 다이얼로그와 유사한 패턴 사용
- 기존 Material-UI 스타일 가이드 준수

### 3.3 접근성 요구사항

#### A11Y-1: data-testid 속성
- 다이얼로그: `data-testid="recurring-delete-dialog"`
- "예" 버튼: `data-testid="delete-single-button"`
- "아니오" 버튼: `data-testid="delete-series-button"`
- "취소" 버튼: `data-testid="cancel-delete-button"`

#### A11Y-2: aria-label
- 명확한 한글 레이블
- 스크린 리더 지원

---

## 4. Design Constraints (설계 제약조건)

### 4.1 기술 제약
- Material-UI Dialog 컴포넌트 사용
- React 함수형 컴포넌트
- TypeScript strict mode
- 기존 State 구조 유지 (`isRecurringDeleteDialogOpen`, `selectedRecurringEvent`)

### 4.2 코드 제약
- App.tsx에 구현 (컴포넌트 분리하지 않음)
- 기존 핸들러 패턴 따르기
- Import 순서 준수 (CLAUDE.md)

### 4.3 UX 제약
- 3-click 이내로 작업 완료
- 모바일 환경 고려 (터치 타겟 크기)
- 다이얼로그 외부 클릭 시 닫기 (기본 동작)

---

## 5. Expected Outputs (기대 산출물)

### 5.1 산출물 1: Feature Design Document
**파일명**: `handoff/phase1-feature-design.md`

**필수 포함 내용**:
1. **UX Flow Diagram**
   - 사용자 클릭 → 다이얼로그 표시 → 선택 → 결과
   - 플로우차트 또는 시퀀스 다이어그램 (텍스트 기반)

2. **UI Component Specification**
   - Dialog 구조 (제목, 내용, 버튼)
   - 버튼 레이블 및 스타일
   - 레이아웃 (왼쪽/중앙/오른쪽)

3. **User Interaction Scenarios**
   - 시나리오 1: 단일 일정 삭제 선택
   - 시나리오 2: 전체 시리즈 삭제 선택
   - 시나리오 3: 취소 선택
   - 시나리오 4: 다이얼로그 외부 클릭

4. **Edge Cases**
   - repeatId가 없는 경우 (방어 코드)
   - selectedRecurringEvent가 null인 경우
   - API 에러 발생 시

5. **Success Criteria**
   - 사용자가 의도를 명확히 이해할 수 있는가?
   - 실수로 잘못된 작업을 수행할 위험이 최소화되었는가?
   - 기존 UX와 일관성이 있는가?

6. **Wireframe (Text-based)**
   ```
   ┌─────────────────────────────────────┐
   │  반복 일정 삭제                     │
   ├─────────────────────────────────────┤
   │                                     │
   │  해당 일정만 삭제하시겠어요?        │
   │  이 작업은 되돌릴 수 없습니다.      │
   │                                     │
   ├─────────────────────────────────────┤
   │  [취소]    [예]    [아니오]         │
   │                          ^^^        │
   │                       (red color)   │
   └─────────────────────────────────────┘
   ```

### 5.2 산출물 2: Implementation Guide
**다음 Phase (Test Design)를 위한 가이드**:

1. **Component Props**
   - 어떤 props가 필요한가?
   - State 변경이 필요한가?

2. **Handler Functions Signature**
   ```typescript
   const handleDeleteSingleOccurrence: () => Promise<void>;
   const handleDeleteEntireSeries: () => Promise<void>;
   ```

3. **Test Scenarios Outline**
   - 각 시나리오별로 테스트해야 할 포인트
   - Mock 데이터 요구사항

---

## 6. Success Criteria (성공 기준)

### 6.1 Completeness Checklist
- [ ] UX Flow Diagram 작성
- [ ] UI Component Specification 완성
- [ ] 4가지 User Interaction Scenarios 문서화
- [ ] Edge Cases 식별 (최소 3개)
- [ ] Text-based Wireframe 제공
- [ ] Implementation Guide 작성
- [ ] data-testid 속성 명세 포함

### 6.2 Quality Criteria
- [ ] 문서가 비개발자도 이해 가능한가?
- [ ] 개발자가 이 문서만으로 구현 가능한가?
- [ ] 테스트 설계자가 테스트 케이스를 도출할 수 있는가?
- [ ] 기존 UX 패턴과 일관성이 있는가?

### 6.3 Review Points
- 다이얼로그 메시지가 명확한가?
- 버튼 배치가 직관적인가?
- 위험한 작업이 시각적으로 구분되는가?
- 접근성 요구사항이 모두 포함되었는가?

---

## 7. References (참고 자료)

### 7.1 코드 파일 경로
- Planning: `handoff/phase0-planning.md`
- 프로젝트 규칙: `CLAUDE.md`
- 메인 컴포넌트: `src/App.tsx`
- API 로직: `src/hooks/useEventOperations.ts`
- 타입 정의: `src/types.ts`

### 7.2 유사 기능 참조
- 반복 일정 수정 다이얼로그 (App.tsx:757-832)
- 겹침 감지 다이얼로그 (App.tsx:835-879)

### 7.3 외부 문서
- Material-UI Dialog: https://mui.com/material-ui/react-dialog/
- Material-UI Button: https://mui.com/material-ui/react-button/

---

## 8. Next Steps (다음 단계)

1. **Read all input artifacts** (모든 입력 자료 읽기)
   - `handoff/phase0-planning.md`
   - `src/App.tsx` (반복 일정 수정 다이얼로그 참조)
   - `CLAUDE.md`

2. **Design the UX flow** (UX 플로우 설계)
   - 사용자 여정 맵핑
   - 의사결정 포인트 식별

3. **Create UI specification** (UI 명세 작성)
   - 다이얼로그 구조
   - 버튼 레이블 및 스타일

4. **Document edge cases** (에지 케이스 문서화)
   - 에러 시나리오
   - 예외 상황

5. **Write Feature Design Document** (설계 문서 작성)
   - `handoff/phase1-feature-design.md` 생성

6. **Complete and signal** (완료 및 신호)
   - 체크리스트 확인
   - Orchestrator에게 완료 보고

---

## 9. Contract Validation (계약 검증)

**Orchestrator가 검증할 항목**:

1. **문서 존재 확인**
   - [ ] `handoff/phase1-feature-design.md` 파일 생성됨

2. **필수 섹션 포함**
   - [ ] UX Flow Diagram
   - [ ] UI Component Specification
   - [ ] User Interaction Scenarios (4개)
   - [ ] Edge Cases (3개 이상)
   - [ ] Text-based Wireframe
   - [ ] Implementation Guide

3. **품질 기준**
   - [ ] data-testid 속성 명세 포함
   - [ ] 한글 UI 텍스트
   - [ ] 기존 패턴과의 일관성 확인

4. **완성도**
   - [ ] 다음 Phase (Test Design)가 이 문서만으로 진행 가능

---

**Handoff 작성자**: Orchestrator
**Handoff 수신자**: feature-designer
**검증 필요**: Phase 1 완료 시 Orchestrator가 재검토
**다음 Handoff**: `handoff/phase2.md` (Test Design용)

---

**Important Notes**:
- 기존 코드를 직접 수정하지 마세요. 설계만 하세요.
- 구현 세부사항은 Phase 4에서 다룹니다.
- 이 Phase의 목표는 "무엇을 만들 것인가"를 정의하는 것입니다.
