# Phase 0: Planning - 반복 일정 삭제 기능

**일시**: 2025-10-31
**Orchestrator**: Claude Code
**목표**: 반복 일정 삭제 기능 요구사항 분석 및 6단계 TDD 파이프라인 수립

---

## 1. 요구사항 분석

### 1.1 사용자 스토리
**AS A** 캘린더 사용자
**I WANT** 반복 일정을 삭제할 때 단일 일정만 삭제할지, 전체 시리즈를 삭제할지 선택하고 싶다
**SO THAT** 내가 원하는 범위의 일정만 정확하게 삭제할 수 있다

### 1.2 기능 요구사항

#### FR-1: 반복 일정 삭제 다이얼로그
- **현재 상태**: 다이얼로그는 존재하지만 "전체 삭제"만 가능
- **요구사항 변경**:
  - 메시지: "해당 일정만 삭제하시겠어요?"
  - 버튼 1: "예" (단일 일정 삭제)
  - 버튼 2: "아니오" (전체 시리즈 삭제)
  - 버튼 3: "취소" (작업 취소)

#### FR-2: 단일 일정 삭제
- **API**: `DELETE /api/events/:id`
- **동작**: 선택한 일정(Event)의 id를 사용하여 해당 일정만 삭제
- **성공 메시지**: "일정이 삭제되었습니다."

#### FR-3: 전체 시리즈 삭제
- **API**: `DELETE /api/recurring-events/:repeatId`
- **동작**: 선택한 일정의 `repeat.id`(repeatId)를 사용하여 같은 시리즈의 모든 일정 삭제
- **성공 메시지**: "반복 일정 시리즈가 삭제되었습니다."

### 1.3 비기능 요구사항

#### NFR-1: 코드 컨벤션 준수
- Import 순서: 외부 라이브러리 → 내부 모듈
- 한글 UI 텍스트 및 에러 메시지
- 접근성: `aria-label`, `data-testid` 필수

#### NFR-2: 테스트 커버리지
- 단일 삭제 시나리오
- 시리즈 전체 삭제 시나리오
- 다이얼로그 취소 시나리오
- API 에러 핸들링

#### NFR-3: 사용자 경험
- 명확한 선택지 제공
- 되돌릴 수 없는 작업임을 명시
- 즉각적인 피드백 (Snackbar)

---

## 2. 현재 코드베이스 분석

### 2.1 이미 구현된 것들 ✅

#### 타입 시스템
```typescript
// src/types.ts
export interface RepeatInfo {
  type: RepeatType;
  interval: number;
  endDate?: string;
  id?: string;  // repeatId로 사용
}

export interface Event extends EventForm {
  id: string;  // 개별 일정 id
}
```

#### API 통신 로직
```typescript
// src/hooks/useEventOperations.ts
const deleteEvent = async (id: string) => {
  // 단일 삭제: DELETE /api/events/:id
};

const deleteRecurringSeries = async (repeatId: string) => {
  // 시리즈 삭제: DELETE /api/recurring-events/:repeatId
};
```

#### UI State 관리
```typescript
// src/App.tsx
const [isRecurringDeleteDialogOpen, setIsRecurringDeleteDialogOpen] = useState(false);
const [selectedRecurringEvent, setSelectedRecurringEvent] = useState<Event | null>(null);
```

#### 삭제 트리거
```typescript
// src/App.tsx
const handleDeleteClick = (event: Event) => {
  if (event.repeat.type !== 'none' && event.repeat.id) {
    setSelectedRecurringEvent(event);
    setIsRecurringDeleteDialogOpen(true);
  } else {
    deleteEvent(event.id);
  }
};
```

### 2.2 수정 필요한 부분 ⚠️

#### 다이얼로그 UI (App.tsx:834-851)
**현재**:
```jsx
<DialogContentText>
  이 반복 시리즈의 모든 일정을 삭제하시겠습니까?
  <br />이 작업은 되돌릴 수 없습니다.
</DialogContentText>
<DialogActions>
  <Button onClick={() => setIsRecurringDeleteDialogOpen(false)}>취소</Button>
  <Button onClick={handleRecurringSeriesDelete} color="error">
    전체 삭제
  </Button>
</DialogActions>
```

**요구사항**:
```jsx
<DialogContentText>
  해당 일정만 삭제하시겠어요?
  <br />이 작업은 되돌릴 수 없습니다.
</DialogContentText>
<DialogActions>
  <Button onClick={handleDeleteSingleOccurrence}>예</Button>
  <Button onClick={handleDeleteEntireSeries} color="error">
    아니오
  </Button>
  <Button onClick={() => setIsRecurringDeleteDialogOpen(false)}>취소</Button>
</DialogActions>
```

#### 핸들러 함수 (App.tsx)
**추가 필요**:
```typescript
const handleDeleteSingleOccurrence = async () => {
  if (!selectedRecurringEvent) return;
  await deleteEvent(selectedRecurringEvent.id);  // 단일 삭제
  setIsRecurringDeleteDialogOpen(false);
  setSelectedRecurringEvent(null);
};

// handleRecurringSeriesDelete는 이미 존재하지만 이름 변경 고려
const handleDeleteEntireSeries = async () => {
  if (!selectedRecurringEvent?.repeat.id) return;
  await deleteRecurringSeries(selectedRecurringEvent.repeat.id);
  setIsRecurringDeleteDialogOpen(false);
  setSelectedRecurringEvent(null);
};
```

---

## 3. 작업 우선순위 및 의존성

### 3.1 우선순위 분석

**P0 (Critical)**:
- ✅ 타입 시스템: 이미 완료 (Event.id, RepeatInfo.id 존재)
- ✅ API 로직: 이미 완료 (deleteEvent, deleteRecurringSeries)
- 🔧 UI 수정: 다이얼로그 메시지 및 버튼 구조 변경
- 🔧 핸들러 추가: handleDeleteSingleOccurrence

**P1 (High)**:
- 🔧 테스트 작성: task.recurringDelete.spec.ts
- 🔧 접근성 속성: data-testid 추가

**P2 (Medium)**:
- 🔧 리팩토링: 핸들러 함수 정리
- 🔧 문서화: JSDoc 주석

### 3.2 의존성 그래프

```
타입 시스템 (완료) ✅
    ↓
API 로직 (완료) ✅
    ↓
테스트 설계 (Phase 2)
    ↓
테스트 작성 (Phase 3)
    ↓
UI/핸들러 구현 (Phase 4)
    ↓
리팩토링 (Phase 5)
    ↓
통합 검증 (Phase 6)
```

---

## 4. 6단계 TDD 파이프라인 계획

### Phase 1: Feature Design
**담당**: feature-designer
**산출물**: `handoff/phase1-feature-design.md`
**작업**:
- UX 플로우 상세 설계
- 다이얼로그 와이어프레임
- 사용자 시나리오 문서화
- 에러 케이스 정의

**입력**:
- 이 Planning 문서
- CLAUDE.md (프로젝트 규칙)
- 현재 코드베이스 (src/App.tsx, src/hooks/useEventOperations.ts)

**출력**:
- 다이얼로그 UI 명세
- 사용자 인터랙션 플로우
- 에지 케이스 목록
- 성공/실패 기준

---

### Phase 2: Test Design
**담당**: test-designer
**산출물**: `handoff/phase2-test-design.md`
**작업**:
- 테스트 시나리오 설계
- Given-When-Then 구조 정의
- Mock 데이터 설계
- 테스트 케이스 우선순위

**입력**:
- phase1-feature-design.md
- 기존 테스트 패턴 (medium.useEventOperations.spec.ts)

**출력**:
- 테스트 시나리오 목록
- Mock 데이터 명세
- 테스트 파일 구조 (task.recurringDelete.spec.ts)

---

### Phase 3: RED - Test Writing
**담당**: test-writer
**산출물**:
- `src/__tests__/hooks/task.recurringDelete.spec.ts`
- `handoff/phase3-test-implementation.md`

**작업**:
- 테스트 코드 작성 (실패하는 테스트)
- MSW 핸들러 설정
- 테스트 실행 및 RED 확인

**입력**:
- phase2-test-design.md
- src/__mocks__/handlers.ts (기존 패턴 참조)

**출력**:
- 실패하는 테스트 파일
- 테스트 실행 결과 로그
- 다음 단계 구현 가이드

---

### Phase 4: GREEN - Implementation
**담당**: code-writer
**산출물**:
- 수정된 `src/App.tsx`
- `handoff/phase4-implementation-summary.md`

**작업**:
- handleDeleteSingleOccurrence 구현
- 다이얼로그 UI 수정
- data-testid 속성 추가
- 테스트 통과 확인

**입력**:
- phase3-test-implementation.md
- 실패하는 테스트
- 기존 코드베이스

**출력**:
- 모든 테스트 통과 (GREEN)
- 기능 완전 구현
- 커버리지 보고서

---

### Phase 5: REFACTOR - Code Quality
**담당**: refactoring-expert
**산출물**:
- 리팩토링된 `src/App.tsx`
- `handoff/phase5-refactoring-report.md`

**작업**:
- 코드 중복 제거
- 함수 분리 검토
- 네이밍 개선
- JSDoc 주석 추가
- ESLint/TypeScript 검증

**입력**:
- phase4-implementation-summary.md
- 구현 완료된 코드
- CLAUDE.md 컨벤션

**출력**:
- 리팩토링된 코드
- 여전히 통과하는 테스트
- 코드 품질 보고서

---

### Phase 6: VALIDATE - Final Verification
**담당**: orchestrator (자체 검증)
**산출물**: `handoff/phase6-validation-report.md`

**작업**:
- 전체 테스트 스위트 실행
- 빌드 검증
- 린트 검증
- 기능 통합 테스트
- 최종 보고서 작성

**입력**:
- 모든 Phase 산출물
- 전체 코드베이스

**출력**:
- 최종 검증 보고서
- 배포 준비 완료 확인
- Git 커밋 및 태그

---

## 5. 성공 기준 (Definition of Done)

### 5.1 기능 요구사항
- ✅ 반복 일정 삭제 시 3가지 선택지 제공 (단일 삭제 / 시리즈 삭제 / 취소)
- ✅ 단일 삭제: 해당 일정만 삭제
- ✅ 시리즈 삭제: 같은 repeatId의 모든 일정 삭제
- ✅ 적절한 사용자 피드백 (Snackbar)

### 5.2 품질 요구사항
- ✅ 모든 테스트 통과 (100%)
- ✅ TypeScript 에러 없음
- ✅ ESLint 에러 없음
- ✅ 테스트 커버리지: 신규 코드 100%

### 5.3 코드 품질
- ✅ CLAUDE.md 컨벤션 준수
- ✅ 접근성 속성 추가
- ✅ 한글 UI/에러 메시지
- ✅ JSDoc 주석

### 5.4 문서화
- ✅ 모든 Phase Handoff 문서 완성
- ✅ 테스트 시나리오 문서화
- ✅ 최종 검증 보고서

---

## 6. 리스크 및 제약사항

### 6.1 기술적 리스크
- **Low**: 기존 코드가 이미 대부분의 로직을 포함하고 있어 리스크 낮음
- **UI 변경**: 다이얼로그 구조 변경으로 기존 테스트 영향 가능 (확인 필요)

### 6.2 제약사항
- 백엔드 API는 이미 구현되어 있음 (변경 불가)
- App.tsx가 661줄로 크지만 분리하지 않음 (명시적 요청 전까지)
- 기존 반복 일정 수정 기능과 일관성 유지 필요

### 6.3 의존성
- Material-UI Dialog 컴포넌트
- notistack (Snackbar)
- MSW (테스트 모킹)
- Vitest + @testing-library/react

---

## 7. 다음 단계

### 7.1 즉시 실행
1. ✅ 이 Planning 문서 작성 완료
2. 🔄 Git 커밋 및 태그 생성 (`phase-0-recurring-delete`)
3. 📝 Phase 1 Handoff 문서 생성 (`handoff/phase1.md`)
4. 🤖 feature-designer 에이전트 호출

### 7.2 Phase 1 입력 자료
- 이 Planning 문서 전체
- `src/App.tsx` (기존 다이얼로그 구조 참조)
- `src/hooks/useEventOperations.ts` (API 패턴 참조)
- CLAUDE.md (프로젝트 규칙)

---

## 8. 참고 자료

### 8.1 관련 파일
- `/Users/daehyun/Desktop/hh99_fe_7th/front_7th_chapter1-2/src/types.ts`
- `/Users/daehyun/Desktop/hh99_fe_7th/front_7th_chapter1-2/src/App.tsx`
- `/Users/daehyun/Desktop/hh99_fe_7th/front_7th_chapter1-2/src/hooks/useEventOperations.ts`
- `/Users/daehyun/Desktop/hh99_fe_7th/front_7th_chapter1-2/CLAUDE.md`

### 8.2 기존 반복 일정 기능
- 반복 일정 생성: `saveRecurringEvents` (useEventOperations.ts:25-58)
- 반복 일정 수정: 다이얼로그 참조 (App.tsx:757-832)
- 반복 일정 수정 핸들러: `handleEditSingleOccurrence`, `handleRecurringSeriesEdit`

### 8.3 데이터 예시
```json
{
  "id": "1c0fab10-e5fa-498f-a5b1-96ab0b6148f7",
  "title": "test",
  "date": "2025-10-12",
  "repeat": {
    "type": "weekly",
    "interval": 2,
    "endDate": "2025-10-30",
    "id": "fb318291-ceef-4f26-a986-27c9a19117bf"
  }
}
```

---

**Phase 0 완료 체크리스트**:
- [x] 요구사항 분석 완료
- [x] 현재 코드베이스 분석 완료
- [x] 6단계 파이프라인 설계 완료
- [x] 우선순위 및 의존성 정의 완료
- [x] 성공 기준 명확화 완료
- [x] 리스크 식별 완료
- [ ] Git 커밋 및 태그 생성
- [ ] Phase 1 Handoff 문서 작성
- [ ] feature-designer 호출

**Orchestrator 서명**: Claude Code
**다음 에이전트**: feature-designer
**다음 Handoff**: `handoff/phase1.md`
