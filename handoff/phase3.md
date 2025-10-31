# Phase 3 Handoff: Test Writing (RED Phase)

**From**: Orchestrator
**To**: test-writer
**Date**: 2025-10-31
**Feature**: 반복 일정 삭제 기능 테스트 작성 (TDD RED)

---

## Mission Statement

**목표**: Phase 2 Test Design을 기반으로 실제 테스트 코드를 작성하고, 모든 테스트가 실패(RED)하는 상태를 만들어라.

**제약조건**:
- 테스트만 작성, 구현 코드는 작성하지 않음
- 모든 테스트는 실패해야 함 (RED 상태)
- GWT (Given-When-Then) 패턴 엄격히 준수

---

## Input Artifacts

1. **Test Design**: `handoff/phase2-test-design.md`
   - Section 5: Detailed Test Scenarios (구현 템플릿)
   - Section 3: Mock Data Specification
   - Section 6: Testing Utilities

2. **Feature Design**: `handoff/phase1-feature-design.md`
   - UI Component Specification
   - Expected behavior

---

## Expected Output

1. **Test File**: `src/__tests__/components/task.recurringDelete.spec.ts`
   - 8개 테스트 작성
   - 모두 실패 (RED)

2. **Handoff Document**: `handoff/phase3-test-implementation.md`
   - 테스트 실행 결과
   - 실패 원인 분석
   - Phase 4 구현 가이드

---

## Test Implementation Guidelines

### 1. 파일 생성
- 위치: `src/__tests__/components/task.recurringDelete.spec.ts`
- Phase 2의 Section 5 템플릿 사용

### 2. Mock Data Setup
- Section 3의 mockRecurringEvent 사용
- resetEventsState() 호출

### 3. Helper Functions
- Section 6의 renderApp, openDeleteDialog 구현

### 4. Test Execution
```bash
pnpm test task.recurringDelete.spec.ts
```

### 5. Expected Result
- 모든 테스트 실패
- 에러 메시지 확인:
  - "handleDeleteSingleOccurrence is not defined"
  - "data-testid not found"
  - "Button text not match"

---

## Next Step
Phase 4 (GREEN)에서 App.tsx를 수정하여 모든 테스트를 통과시킴

---

**Handoff 작성자**: Orchestrator
**Handoff 수신자**: test-writer
