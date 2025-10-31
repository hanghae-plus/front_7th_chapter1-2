# Phase 2 Handoff: Test Design for Recurring Event Delete

**From**: Orchestrator
**To**: test-designer
**Date**: 2025-10-31
**Feature**: 반복 일정 삭제 기능 테스트 설계

---

## 1. Mission Statement

**목표**: Phase 1 Feature Design을 기반으로 반복 일정 삭제 기능의 포괄적인 테스트 시나리오를 설계하고, Phase 3에서 작성할 테스트 코드의 청사진을 제공하라.

**제약조건**:
- Vitest + @testing-library/react 사용
- GWT (Given-When-Then) 패턴 준수
- MSW (Mock Service Worker)로 API 모킹
- 기존 테스트 파일 패턴 참조 (`medium.useEventOperations.spec.ts`)

---

## 2. Input Artifacts (입력 자료)

### 2.1 필수 읽기 문서
1. **Feature Design**: `handoff/phase1-feature-design.md`
   - UX Flow (Section 2)
   - UI Component Specification (Section 3)
   - User Interaction Scenarios (Section 4)
   - Edge Cases (Section 5)

2. **Planning**: `handoff/phase0-planning.md`
   - 전체 컨텍스트
   - 기능 요구사항

3. **프로젝트 규칙**: `CLAUDE.md`
   - Testing Structure (GWT 패턴)
   - Test File Naming (`task.*.spec.ts`)

### 2.2 참조 테스트 코드
1. **기존 테스트**: `src/__tests__/hooks/medium.useEventOperations.spec.ts`
   - MSW 핸들러 사용 패턴
   - renderHook 사용법
   - waitFor 패턴

2. **Mock 핸들러**: `src/__mocks__/handlers.ts`
   - API 모킹 패턴
   - 에러 시뮬레이션

---

## 3. Test Design Requirements

### 3.1 Test File Structure
**파일명**: `src/__tests__/components/task.recurringDelete.spec.ts`

**Rationale**:
- `task.*` prefix: 새로 작성하는 테스트
- `components/`: UI 인터랙션 테스트이므로 components 디렉토리
- `recurringDelete`: 기능명 명시

### 3.2 Test Scope
1. **UI Rendering**: 다이얼로그 표시 및 요소 확인
2. **User Interaction**: 버튼 클릭 시 동작
3. **API Integration**: 단일/시리즈 삭제 API 호출
4. **Feedback**: Snackbar 표시 확인
5. **Edge Cases**: 에러 처리 및 방어 코드

### 3.3 Test Coverage Goals
- **Line Coverage**: 100% (신규 코드)
- **Branch Coverage**: 모든 분기 (취소/예/아니오)
- **Edge Cases**: 5가지 모두 커버

---

## 4. Test Scenarios (from Feature Design)

### 4.1 Scenario 1: 단일 일정 삭제 (Happy Path)
**Source**: `phase1-feature-design.md` Section 4.1

**Test Name**: "사용자가 '예'를 선택하면 해당 일정만 삭제된다"

**Given**:
- 반복 일정이 렌더링되어 있음
- Event: `{ id: "event-1", repeat: { id: "repeat-123", type: "weekly" } }`

**When**:
- 사용자가 삭제 버튼 클릭
- 다이얼로그가 열림
- "예" 버튼 클릭

**Then**:
- `DELETE /api/events/event-1` 호출됨
- `GET /api/events` (fetchEvents) 호출됨
- Snackbar 표시: "일정이 삭제되었습니다."
- 다이얼로그 닫힘

---

### 4.2 Scenario 2: 전체 시리즈 삭제 (Danger Path)
**Source**: `phase1-feature-design.md` Section 4.2

**Test Name**: "사용자가 '아니오'를 선택하면 반복 시리즈 전체가 삭제된다"

**Given**:
- 반복 일정이 렌더링되어 있음
- Event: `{ id: "event-1", repeat: { id: "repeat-123", type: "weekly" } }`

**When**:
- 사용자가 삭제 버튼 클릭
- 다이얼로그가 열림
- "아니오" 버튼 클릭

**Then**:
- `DELETE /api/recurring-events/repeat-123` 호출됨
- `GET /api/events` (fetchEvents) 호출됨
- Snackbar 표시: "반복 일정 시리즈가 삭제되었습니다."
- 다이얼로그 닫힘

---

### 4.3 Scenario 3: 취소 선택 (Safe Exit)
**Source**: `phase1-feature-design.md` Section 4.3

**Test Name**: "사용자가 '취소'를 선택하면 아무것도 삭제되지 않는다"

**Given**:
- 반복 일정이 렌더링되어 있음
- 다이얼로그가 열림

**When**:
- "취소" 버튼 클릭

**Then**:
- API 호출 없음
- 다이얼로그 닫힘
- Snackbar 표시 없음

---

### 4.4 Scenario 4: 다이얼로그 외부 클릭
**Source**: `phase1-feature-design.md` Section 4.4

**Test Name**: "다이얼로그 외부 클릭 시 닫힌다" (선택 사항)

**Note**: Material-UI의 기본 동작이므로 명시적 테스트는 선택 사항

---

## 5. Edge Case Test Scenarios

### 5.1 Edge Case 1: repeatId가 없는 경우
**Source**: `phase1-feature-design.md` Section 5.1

**Test Name**: "repeatId가 없는 반복 일정은 단일 삭제로 처리된다"

**Given**:
- Event: `{ id: "event-1", repeat: { type: "weekly", interval: 1 } }` (id 없음)

**When**:
- 삭제 버튼 클릭

**Then**:
- 다이얼로그가 열리지 않음 (또는 단일 삭제 즉시 실행)
- `DELETE /api/events/event-1` 호출

---

### 5.2 Edge Case 2: selectedRecurringEvent가 null
**Source**: `phase1-feature-design.md` Section 5.2

**Test Name**: "선택된 일정이 없으면 에러 메시지를 표시한다"

**Given**:
- `selectedRecurringEvent = null` (비정상 상태)

**When**:
- `handleDeleteSingleOccurrence` 직접 호출 (테스트 용)

**Then**:
- 에러 Snackbar: "선택된 일정이 없습니다."
- API 호출 없음
- 다이얼로그 닫힘

---

### 5.3 Edge Case 3: API 에러 발생
**Source**: `phase1-feature-design.md` Section 5.3

**Test Name**: "단일 삭제 API 에러 시 에러 메시지를 표시한다"

**Given**:
- MSW 핸들러가 500 에러 반환

**When**:
- "예" 버튼 클릭

**Then**:
- 에러 Snackbar: "일정 삭제 실패"
- 다이얼로그 닫힘

**Test Name**: "시리즈 삭제 API 에러 시 에러 메시지를 표시한다"

**Given**:
- MSW 핸들러가 404 에러 반환

**When**:
- "아니오" 버튼 클릭

**Then**:
- 에러 Snackbar: "반복 일정 삭제 실패" (또는 "찾을 수 없습니다")
- 다이얼로그 닫힘

---

## 6. Mock Data Specification

### 6.1 Mock Event (반복 일정)
```typescript
const mockRecurringEvent: Event = {
  id: 'event-test-1',
  title: '주간 회의',
  date: '2025-10-31',
  startTime: '10:00',
  endTime: '11:00',
  description: '팀 회의',
  location: '회의실 A',
  category: '업무',
  repeat: {
    type: 'weekly',
    interval: 1,
    endDate: '2025-12-31',
    id: 'repeat-test-123',
  },
  notificationTime: 10,
};
```

### 6.2 Mock API Responses

#### 성공 응답 (단일 삭제)
```typescript
// DELETE /api/events/:id
Response: 204 No Content
```

#### 성공 응답 (시리즈 삭제)
```typescript
// DELETE /api/recurring-events/:repeatId
Response: 200 OK
Body: { message: 'Recurring series deleted' }
```

#### 에러 응답 (404)
```typescript
// DELETE /api/recurring-events/:repeatId
Response: 404 Not Found
Body: { error: 'Recurring series not found' }
```

#### 에러 응답 (500)
```typescript
// DELETE /api/events/:id
Response: 500 Internal Server Error
Body: { error: 'Failed to delete event' }
```

---

## 7. MSW Handlers Design

### 7.1 Handler 1: 단일 삭제 성공
```typescript
http.delete('/api/events/:id', () => {
  return new HttpResponse(null, { status: 204 });
}),
```

### 7.2 Handler 2: 시리즈 삭제 성공
```typescript
http.delete('/api/recurring-events/:repeatId', () => {
  return HttpResponse.json({ message: 'Recurring series deleted' });
}),
```

### 7.3 Handler 3: 단일 삭제 에러
```typescript
http.delete('/api/events/:id', () => {
  return new HttpResponse(null, { status: 500 });
}),
```

### 7.4 Handler 4: 시리즈 삭제 에러 (404)
```typescript
http.delete('/api/recurring-events/:repeatId', () => {
  return HttpResponse.json(
    { error: 'Recurring series not found' },
    { status: 404 }
  );
}),
```

---

## 8. Test Structure Template

### 8.1 File Structure
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { describe, it, expect, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../__mocks__/server';

import App from '../../App';

describe('반복 일정 삭제 기능', () => {
  describe('정상 동작', () => {
    it('사용자가 "예"를 선택하면 해당 일정만 삭제된다', async () => {
      // Given
      // When
      // Then
    });

    it('사용자가 "아니오"를 선택하면 반복 시리즈 전체가 삭제된다', async () => {
      // Given
      // When
      // Then
    });

    it('사용자가 "취소"를 선택하면 아무것도 삭제되지 않는다', async () => {
      // Given
      // When
      // Then
    });
  });

  describe('에지 케이스', () => {
    it('repeatId가 없는 반복 일정은 단일 삭제로 처리된다', async () => {
      // Given
      // When
      // Then
    });

    it('선택된 일정이 없으면 에러 메시지를 표시한다', async () => {
      // Given
      // When
      // Then
    });
  });

  describe('에러 처리', () => {
    it('단일 삭제 API 에러 시 에러 메시지를 표시한다', async () => {
      // Given
      // When
      // Then
    });

    it('시리즈 삭제 API 에러 시 에러 메시지를 표시한다', async () => {
      // Given
      // When
      // Then
    });
  });
});
```

---

## 9. Testing Utilities

### 9.1 Helper Function: Render with Providers
```typescript
const renderApp = () => {
  return render(
    <SnackbarProvider>
      <App />
    </SnackbarProvider>
  );
};
```

### 9.2 Helper Function: Open Delete Dialog
```typescript
const openDeleteDialog = async (user: ReturnType<typeof userEvent.setup>) => {
  // 1. Wait for events to load
  await waitFor(() => {
    expect(screen.getByText('주간 회의')).toBeInTheDocument();
  });

  // 2. Find and click delete button
  const deleteButton = screen.getByTestId('delete-event-button');
  await user.click(deleteButton);

  // 3. Wait for dialog to open
  await waitFor(() => {
    expect(screen.getByTestId('recurring-delete-dialog')).toBeInTheDocument();
  });
};
```

### 9.3 Query Selectors (data-testid)
- Dialog: `recurring-delete-dialog`
- Cancel Button: `cancel-delete-button`
- Yes Button: `delete-single-button`
- No Button: `delete-series-button`

---

## 10. Expected Outputs (기대 산출물)

### 10.1 산출물 1: Test Design Document
**파일명**: `handoff/phase2-test-design.md`

**필수 포함 내용**:
1. **Test File Specification**
   - 파일명 및 위치
   - Import 구조
   - describe 블록 구조

2. **Detailed Test Scenarios** (최소 7개)
   - 정상 동작 3개 (단일/시리즈/취소)
   - 에지 케이스 2개 (repeatId 없음, null 방어)
   - 에러 처리 2개 (단일 에러, 시리즈 에러)
   - 각 시나리오를 GWT 형식으로 상세 작성

3. **Mock Data Specification**
   - mockRecurringEvent 정의
   - API 응답 명세 (성공/실패)

4. **MSW Handlers Design**
   - 각 API 엔드포인트별 핸들러
   - 에러 시뮬레이션 핸들러

5. **Testing Utilities**
   - Helper 함수 설계
   - Query 셀렉터 정의

6. **Test Execution Plan**
   - 테스트 실행 순서
   - 의존성 확인 사항

---

## 11. Success Criteria (성공 기준)

### 11.1 Completeness Checklist
- [ ] Test File Specification 작성
- [ ] 7개 이상의 상세 테스트 시나리오 (GWT 형식)
- [ ] Mock 데이터 명세 완성
- [ ] MSW 핸들러 설계 완료
- [ ] Testing Utilities 정의
- [ ] Test Design Document 생성

### 11.2 Quality Criteria
- [ ] 모든 Feature Design 시나리오가 테스트로 변환됨
- [ ] 모든 Edge Cases가 테스트로 커버됨
- [ ] GWT 패턴이 명확하게 적용됨
- [ ] Phase 3 (Test Writer)가 이 문서만으로 테스트 코드 작성 가능

### 11.3 Review Points
- 테스트 시나리오가 Feature Design과 일치하는가?
- Mock 데이터가 현실적이고 완전한가?
- MSW 핸들러가 모든 케이스를 커버하는가?
- 테스트 실행 순서가 논리적인가?

---

## 12. References (참고 자료)

### 12.1 문서
- Feature Design: `handoff/phase1-feature-design.md`
- Planning: `handoff/phase0-planning.md`
- 프로젝트 규칙: `CLAUDE.md`

### 12.2 코드
- 기존 테스트: `src/__tests__/hooks/medium.useEventOperations.spec.ts`
- Mock 핸들러: `src/__mocks__/handlers.ts`
- App 컴포넌트: `src/App.tsx`

### 12.3 라이브러리 문서
- Vitest: https://vitest.dev/
- Testing Library: https://testing-library.com/docs/react-testing-library/intro/
- MSW: https://mswjs.io/docs/

---

## 13. Next Steps (다음 단계)

1. **Read all input artifacts** (모든 입력 자료 읽기)
   - `handoff/phase1-feature-design.md` (핵심)
   - `src/__tests__/hooks/medium.useEventOperations.spec.ts` (패턴 참조)

2. **Design test scenarios** (테스트 시나리오 설계)
   - Feature Design의 4가지 시나리오 → GWT 테스트로 변환
   - Edge Cases 5개 → 상세 테스트 시나리오로 확장

3. **Design mock data** (Mock 데이터 설계)
   - mockRecurringEvent 정의
   - API 응답 명세

4. **Design MSW handlers** (MSW 핸들러 설계)
   - 성공 케이스 핸들러
   - 에러 케이스 핸들러

5. **Write Test Design Document** (설계 문서 작성)
   - `handoff/phase2-test-design.md` 생성

6. **Complete and signal** (완료 및 신호)
   - 체크리스트 확인
   - Orchestrator에게 완료 보고

---

## 14. Contract Validation (계약 검증)

**Orchestrator가 검증할 항목**:

1. **문서 존재 확인**
   - [ ] `handoff/phase2-test-design.md` 파일 생성됨

2. **필수 섹션 포함**
   - [ ] Test File Specification
   - [ ] Detailed Test Scenarios (7개 이상)
   - [ ] Mock Data Specification
   - [ ] MSW Handlers Design
   - [ ] Testing Utilities

3. **품질 기준**
   - [ ] 모든 시나리오가 GWT 형식
   - [ ] Feature Design과 1:1 매핑
   - [ ] Edge Cases 모두 커버

4. **완성도**
   - [ ] Phase 3 (Test Writer)가 이 문서만으로 진행 가능

---

**Handoff 작성자**: Orchestrator
**Handoff 수신자**: test-designer
**검증 필요**: Phase 2 완료 시 Orchestrator가 재검토
**다음 Handoff**: `handoff/phase3.md` (Test Writer용)

---

**Important Notes**:
- 테스트 코드를 작성하지 마세요. 설계만 하세요.
- 실제 테스트 작성은 Phase 3에서 수행합니다.
- 이 Phase의 목표는 "무엇을 테스트할 것인가"를 정의하는 것입니다.
