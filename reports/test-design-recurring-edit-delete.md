# 테스트 설계 문서: 반복 일정 종료/수정/삭제

> **작성일**: 2025-10-31
> **담당**: Test Planner
> **명세**: REQ-006 (반복 종료), REQ-007~010 (수정/삭제)
> **우선순위**: Critical

---

## 목차

1. [개요](#개요)
2. [명세 분석 결과](#명세-분석-결과)
3. [테스트 TODO List](#테스트-todo-list)
4. [테스트 커버리지 맵](#테스트-커버리지-맵)
5. [테스트 파일 구조](#테스트-파일-구조)
6. [구현 가이드](#구현-가이드)

---

## 개요

### 테스트 대상 기능

| 요구사항 ID | 기능명               | 우선순위 | 상태          |
|-------------|---------------------|----------|---------------|
| REQ-006     | 반복 종료 조건       | Critical | 구현 완료     |
| REQ-007     | 단일 일정 수정       | Critical | 미구현 (NEW)  |
| REQ-008     | 전체 일정 수정       | Critical | 미구현 (NEW)  |
| REQ-009     | 단일 일정 삭제       | Critical | 미구현 (NEW)  |
| REQ-010     | 전체 일정 삭제       | Critical | 미구현 (NEW)  |

### 테스트 범위

- **REQ-006**: 반복 종료 날짜 검증 (최대 2025-12-31)
- **REQ-007/008**: 수정 다이얼로그 UI 및 단일/전체 수정 로직
- **REQ-009/010**: 삭제 다이얼로그 UI 및 단일/전체 삭제 로직

### 테스트 전략

- **Primary**: Integration Tests (사용자 시나리오 중심)
- **Secondary**: Unit Tests (헬퍼 함수, Hook)
- **Focus**: 다이얼로그 상호작용, 반복 그룹 식별 (`repeat.id`)

---

## 명세 분석 결과

### 1. REQ-006: 반복 종료 조건 (구현 완료)

#### 요구사항
- 반복 종료 날짜를 지정할 수 있다
- 최대 종료 날짜: `2025-12-31`

#### 현재 상태
- ✅ UI: `repeatEndDate` 입력 필드 존재 (App.tsx:485)
- ✅ 로직: `generateRecurringEvents` 함수에서 처리
- ⚠️ **테스트 누락**: 종료 날짜 검증 테스트 필요

#### 테스트 포인트
1. 종료 날짜가 없으면 무한 반복 (제한 없음)
2. 종료 날짜가 2025-12-31 이하인 경우 정상 동작
3. 종료 날짜가 2025-12-31을 초과하는 경우 제한
4. 종료 날짜가 시작 날짜보다 이전인 경우 에러

---

### 2. REQ-007: 단일 일정 수정 (미구현)

#### 요구사항
- 다이얼로그: "해당 일정만 수정하시겠어요?"
- **"예" 선택 시**:
  - 선택한 일정만 수정
  - `repeat.type`을 `'none'`으로 변경 (단일 일정화)
  - 반복 아이콘 제거

#### 구현 필요 사항
- [ ] 다이얼로그 UI 추가
- [ ] 단일 수정 로직 (PUT `/api/events/:id` + `repeat.type='none'`)
- [ ] 아이콘 상태 변화 확인 (`isActiveRecurring` 헬퍼)

#### 테스트 포인트
1. 다이얼로그 표시 여부 (반복 일정 수정 시에만)
2. "예" 버튼 클릭 → 선택한 일정만 수정
3. 수정된 일정의 `repeat.type === 'none'`
4. 반복 아이콘 제거 확인
5. 다른 반복 일정은 영향 없음

---

### 3. REQ-008: 전체 일정 수정 (미구현)

#### 요구사항
- 다이얼로그: "해당 일정만 수정하시겠어요?"
- **"아니오" 선택 시**:
  - 같은 `repeat.id`를 가진 모든 일정 수정
  - `repeat` 속성 유지
  - 반복 아이콘 유지

#### 구현 필요 사항
- [ ] 다이얼로그 UI (REQ-007과 공유)
- [ ] 전체 수정 로직 (PUT `/api/events/recurring/:repeatId`)
- [ ] 반복 그룹 식별 (`repeat.id` 기준)

#### 테스트 포인트
1. "아니오" 버튼 클릭 → 모든 반복 일정 수정
2. 같은 `repeat.id`를 가진 모든 이벤트 업데이트
3. `repeat` 속성 유지 (type, interval, endDate)
4. 반복 아이콘 유지 확인

---

### 4. REQ-009: 단일 일정 삭제 (미구현)

#### 요구사항
- 다이얼로그: "해당 일정만 삭제하시겠어요?"
- **"예" 선택 시**:
  - 선택한 일정만 삭제
  - 다른 반복 일정 유지

#### 구현 필요 사항
- [ ] 삭제 다이얼로그 UI
- [ ] 단일 삭제 로직 (DELETE `/api/events/:id`)

#### 테스트 포인트
1. 다이얼로그 표시 여부 (반복 일정 삭제 시에만)
2. "예" 버튼 클릭 → 선택한 일정만 삭제
3. 다른 반복 일정은 남아있음

---

### 5. REQ-010: 전체 일정 삭제 (미구현)

#### 요구사항
- 다이얼로그: "해당 일정만 삭제하시겠어요?"
- **"아니오" 선택 시**:
  - 같은 `repeat.id`를 가진 모든 일정 삭제

#### 구현 필요 사항
- [ ] 삭제 다이얼로그 UI (REQ-009와 공유)
- [ ] 전체 삭제 로직 (DELETE `/api/events/recurring/:repeatId`)

#### 테스트 포인트
1. "아니오" 버튼 클릭 → 모든 반복 일정 삭제
2. 같은 `repeat.id`를 가진 모든 이벤트 삭제
3. 캘린더에서 모두 사라짐

---

## 테스트 TODO List

### Phase 1: 반복 종료 조건 검증 (REQ-006) - **Priority: High**

#### 📌 Simple → Complex 순서

> REQ-006은 이미 구현되어 있으므로 **테스트만 추가**합니다.

- **TODO-001**: [HIGH] 반복 종료 날짜를 설정하지 않으면 무한 반복된다
  - **검증**: `repeatEndDate`가 비어있을 때, 생성된 반복 일정이 계속 표시됨
  - **명세**: REQ-006 (종료 조건 미설정)

- **TODO-002**: [CRITICAL] 종료 날짜가 2025-12-31 이하면 정상적으로 반복 일정이 생성된다
  - **검증**: `repeatEndDate='2025-06-30'` 입력 → 해당 날짜까지만 일정 생성
  - **명세**: REQ-006 (최대 종료 날짜 제약)

- **TODO-003**: [CRITICAL] 종료 날짜가 2025-12-31을 넘으면 2025-12-31까지만 일정이 생성된다
  - **검증**: `repeatEndDate='2026-12-31'` 입력 → 2025-12-31까지만 생성
  - **명세**: REQ-006, CONS-002 (최대 제한)

- **TODO-004**: [MEDIUM] 종료 날짜가 시작 날짜보다 이전이면 에러를 표시한다
  - **검증**: 시작일=2025-06-01, 종료일=2025-05-01 → 에러 메시지
  - **명세**: REQ-006 (유효성 검증)

- **TODO-005**: [HIGH] 종료 날짜를 지난 반복 일정은 반복 아이콘을 표시하지 않는다
  - **검증**: `isActiveRecurring` 헬퍼 함수 동작 확인 (REQ-005 연동)
  - **명세**: REQ-006 + REQ-005
  - **Note**: 기존 REQ-005 테스트에서 일부 커버됨

---

### Phase 2: 반복 일정 수정 다이얼로그 UI (REQ-007/008) - **Priority: Critical**

#### 📌 UI 상호작용 먼저 확인

> 이 Phase는 **구현과 테스트가 함께 진행**됩니다.

- **TODO-006**: [CRITICAL] 단일 일정 수정 시 다이얼로그가 표시되지 않는다
  - **검증**: `repeat.type='none'` 일정 수정 → 다이얼로그 없이 바로 수정
  - **명세**: REQ-007 (단일 일정 예외 케이스)

- **TODO-007**: [CRITICAL] 반복 일정 수정 시 "해당 일정만 수정하시겠어요?" 다이얼로그가 표시된다
  - **검증**: `repeat.type !== 'none'` 일정 수정 버튼 클릭 → 다이얼로그 표시
  - **UI 요소**: 제목, "예" 버튼, "아니오" 버튼
  - **명세**: REQ-007/008 (트리거 조건)

- **TODO-008**: [CRITICAL] 다이얼로그의 "취소" 또는 닫기 버튼 클릭 시 수정이 취소된다
  - **검증**: 다이얼로그 닫기 → 일정이 수정되지 않음
  - **명세**: UI-003 (사용자 경험)

---

### Phase 3: 단일 일정 수정 (REQ-007) - **Priority: Critical**

- **TODO-009**: [CRITICAL] "예" 버튼 클릭 시 선택한 일정만 수정된다
  - **검증**:
    - 반복 일정 3개 중 2번째 수정 → 2번째만 제목 변경
    - `repeat.type`이 `'none'`으로 변경
  - **API**: PUT `/api/events/:id` + `{...data, repeat: {type: 'none'}}`
  - **명세**: REQ-007 (단일 수정 동작)

- **TODO-010**: [CRITICAL] 단일 수정된 일정은 반복 아이콘이 사라진다
  - **검증**: 수정 후 `isActiveRecurring(event)` → `false`
  - **UI**: 🔁 아이콘 미표시
  - **명세**: REQ-007 (아이콘 제거)

- **TODO-011**: [CRITICAL] 단일 수정 시 다른 반복 일정은 영향받지 않는다
  - **검증**: 같은 `repeat.id`를 가진 다른 일정들이 원본 유지
  - **명세**: REQ-007 (격리성)

---

### Phase 4: 전체 일정 수정 (REQ-008) - **Priority: Critical**

- **TODO-012**: [CRITICAL] "아니오" 버튼 클릭 시 모든 반복 일정이 수정된다
  - **검증**:
    - 반복 일정 3개 중 하나 수정 → 모두 제목 변경
    - 같은 `repeat.id`를 가진 모든 이벤트 업데이트
  - **API**: PUT `/api/events/recurring/:repeatId`
  - **명세**: REQ-008 (전체 수정 동작)

- **TODO-013**: [CRITICAL] 전체 수정 시 반복 속성이 유지된다
  - **검증**: 수정 후 `repeat.type`, `repeat.interval`, `repeat.endDate` 동일
  - **명세**: REQ-008 (반복 유지)

- **TODO-014**: [CRITICAL] 전체 수정 시 반복 아이콘이 유지된다
  - **검증**: 수정 후 모든 일정에 🔁 아이콘 표시
  - **명세**: REQ-008 (아이콘 유지)

---

### Phase 5: 반복 일정 삭제 다이얼로그 UI (REQ-009/010) - **Priority: Critical**

- **TODO-015**: [CRITICAL] 단일 일정 삭제 시 다이얼로그가 표시되지 않는다
  - **검증**: `repeat.type='none'` 일정 삭제 → 다이얼로그 없이 바로 삭제
  - **명세**: REQ-009 (단일 일정 예외 케이스)

- **TODO-016**: [CRITICAL] 반복 일정 삭제 시 "해당 일정만 삭제하시겠어요?" 다이얼로그가 표시된다
  - **검증**: `repeat.type !== 'none'` 일정 삭제 버튼 클릭 → 다이얼로그 표시
  - **UI 요소**: 제목, "예" 버튼, "아니오" 버튼
  - **명세**: REQ-009/010 (트리거 조건)

- **TODO-017**: [CRITICAL] 다이얼로그의 "취소" 또는 닫기 버튼 클릭 시 삭제가 취소된다
  - **검증**: 다이얼로그 닫기 → 일정이 삭제되지 않음
  - **명세**: UI-003 (사용자 경험)

---

### Phase 6: 단일 일정 삭제 (REQ-009) - **Priority: Critical**

- **TODO-018**: [CRITICAL] "예" 버튼 클릭 시 선택한 일정만 삭제된다
  - **검증**:
    - 반복 일정 3개 중 2번째 삭제 → 2번째만 사라짐
    - 캘린더 및 이벤트 목록에서 제거 확인
  - **API**: DELETE `/api/events/:id`
  - **명세**: REQ-009 (단일 삭제 동작)

- **TODO-019**: [CRITICAL] 단일 삭제 시 다른 반복 일정은 남아있다
  - **검증**: 같은 `repeat.id`를 가진 다른 일정들이 존재
  - **명세**: REQ-009 (격리성)

---

### Phase 7: 전체 일정 삭제 (REQ-010) - **Priority: Critical**

- **TODO-020**: [CRITICAL] "아니오" 버튼 클릭 시 모든 반복 일정이 삭제된다
  - **검증**:
    - 반복 일정 3개 중 하나 삭제 → 모두 사라짐
    - 같은 `repeat.id`를 가진 모든 이벤트 삭제
  - **API**: DELETE `/api/events/recurring/:repeatId`
  - **명세**: REQ-010 (전체 삭제 동작)

- **TODO-021**: [CRITICAL] 전체 삭제 시 캘린더에서 모든 반복 일정이 제거된다
  - **검증**:
    - Week View 및 Month View에서 모두 사라짐
    - 이벤트 목록에서도 제거됨
  - **명세**: REQ-010 (UI 반영)

---

### Phase 8: Edge Cases 및 에러 처리 - **Priority: Medium**

- **TODO-022**: [MEDIUM] 수정 중 API 에러 발생 시 에러 메시지를 표시한다
  - **검증**: 네트워크 에러 시뮬레이션 → "일정 수정 실패" 스낵바 표시
  - **명세**: 비기능 요구사항 (에러 처리)

- **TODO-023**: [MEDIUM] 삭제 중 API 에러 발생 시 에러 메시지를 표시한다
  - **검증**: 네트워크 에러 시뮬레이션 → "일정 삭제 실패" 스낵바 표시
  - **명세**: 비기능 요구사항 (에러 처리)

- **TODO-024**: [LOW] 동일한 반복 일정을 빠르게 여러 번 수정해도 정상 동작한다
  - **검증**: 연속 수정 요청 → 마지막 수정만 반영
  - **명세**: 비기능 요구사항 (동시성)

---

## 테스트 커버리지 맵

### Requirements Coverage

| 요구사항 ID | TODO 항목          | 우선순위 | Phase  |
|-------------|--------------------|----------|--------|
| REQ-006     | TODO-001 ~ 005     | High     | 1      |
| REQ-007     | TODO-006 ~ 011     | Critical | 2, 3   |
| REQ-008     | TODO-012 ~ 014     | Critical | 4      |
| REQ-009     | TODO-015, 018, 019 | Critical | 5, 6   |
| REQ-010     | TODO-020, 021      | Critical | 7      |
| UI-003      | TODO-008, 017      | Critical | 2, 5   |
| 에러처리    | TODO-022, 023      | Medium   | 8      |
| 동시성      | TODO-024           | Low      | 8      |

### Priority Distribution

```
Critical: 17개 (TODO-002, 003, 006~021)
High:     3개  (TODO-001, 005)
Medium:   3개  (TODO-004, 022, 023)
Low:      1개  (TODO-024)
─────────────────────────────
Total:    24개
```

### Test Type Distribution

```
Integration Tests: 20개 (TODO-001 ~ 021)
Error Handling:     2개  (TODO-022, 023)
Edge Cases:         2개  (TODO-004, 024)
```

### Feature Coverage

| 기능                | 테스트 항목 수 | 커버리지 |
|---------------------|----------------|----------|
| 반복 종료 조건      | 5개            | 100%     |
| 수정 다이얼로그     | 3개            | 100%     |
| 단일 일정 수정      | 3개            | 100%     |
| 전체 일정 수정      | 3개            | 100%     |
| 삭제 다이얼로그     | 3개            | 100%     |
| 단일 일정 삭제      | 2개            | 100%     |
| 전체 일정 삭제      | 2개            | 100%     |
| 에러 처리           | 2개            | 100%     |
| Edge Cases          | 1개            | 80%      |

---

## 테스트 파일 구조

### 파일 배치 전략

```
src/__tests__/
├── integration/
│   ├── recurringEndDate.spec.tsx          # Phase 1 (REQ-006)
│   ├── recurringEditDialog.spec.tsx       # Phase 2 (Dialog UI)
│   ├── recurringEditSingle.spec.tsx       # Phase 3 (REQ-007)
│   ├── recurringEditAll.spec.tsx          # Phase 4 (REQ-008)
│   ├── recurringDeleteDialog.spec.tsx     # Phase 5 (Dialog UI)
│   ├── recurringDeleteSingle.spec.tsx     # Phase 6 (REQ-009)
│   └── recurringDeleteAll.spec.tsx        # Phase 7 (REQ-010)
```

### 파일별 책임

#### 1. `recurringEndDate.spec.tsx` (Phase 1)
- **TODO**: 001 ~ 005
- **범위**: 반복 종료 날짜 검증
- **테스트 수**: 5개
- **명세**: REQ-006

#### 2. `recurringEditDialog.spec.tsx` (Phase 2)
- **TODO**: 006 ~ 008
- **범위**: 수정 다이얼로그 UI 및 상호작용
- **테스트 수**: 3개
- **명세**: REQ-007, REQ-008 (공통 UI)

#### 3. `recurringEditSingle.spec.tsx` (Phase 3)
- **TODO**: 009 ~ 011
- **범위**: 단일 일정 수정 로직
- **테스트 수**: 3개
- **명세**: REQ-007

#### 4. `recurringEditAll.spec.tsx` (Phase 4)
- **TODO**: 012 ~ 014
- **범위**: 전체 일정 수정 로직
- **테스트 수**: 3개
- **명세**: REQ-008

#### 5. `recurringDeleteDialog.spec.tsx` (Phase 5)
- **TODO**: 015 ~ 017
- **범위**: 삭제 다이얼로그 UI 및 상호작용
- **테스트 수**: 3개
- **명세**: REQ-009, REQ-010 (공통 UI)

#### 6. `recurringDeleteSingle.spec.tsx` (Phase 6)
- **TODO**: 018 ~ 019
- **범위**: 단일 일정 삭제 로직
- **테스트 수**: 2개
- **명세**: REQ-009

#### 7. `recurringDeleteAll.spec.tsx` (Phase 7)
- **TODO**: 020 ~ 021
- **범위**: 전체 일정 삭제 로직
- **테스트 수**: 2개
- **명세**: REQ-010

---

## 구현 가이드

### 1. 구현 순서 (TDD RED → GREEN)

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7 → Phase 8
   ↓         ↓         ↓         ↓         ↓         ↓         ↓         ↓
REQ-006  Dialog UI  REQ-007  REQ-008  Dialog UI  REQ-009  REQ-010  Errors
```

### 2. API 엔드포인트 (구현 필요)

#### 기존 API (현재 사용 중)
- `GET /api/events` - 모든 일정 조회
- `POST /api/events` - 단일 일정 생성
- `POST /api/events-list` - 반복 일정 생성 (배치)
- `PUT /api/events/:id` - 일정 수정
- `DELETE /api/events/:id` - 일정 삭제

#### 새로 필요한 API
- `PUT /api/events/recurring/:repeatId` - 전체 반복 일정 수정 (REQ-008)
- `DELETE /api/events/recurring/:repeatId` - 전체 반복 일정 삭제 (REQ-010)

### 3. Data Model 변경 사항

#### RepeatInfo (types.ts)
```typescript
export interface RepeatInfo {
  type: RepeatType;
  interval: number;
  endDate?: string;
  id?: string;  // ✅ 이미 존재 (반복 그룹 식별자)
}
```

#### 반복 그룹 식별 로직
- 같은 `repeat.id`를 가진 이벤트들이 하나의 반복 그룹
- 전체 수정/삭제 시 이 ID로 필터링

### 4. UI 컴포넌트 (추가 필요)

#### EditRecurringDialog
```typescript
interface EditRecurringDialogProps {
  open: boolean;
  onClose: () => void;
  onEditSingle: () => void;
  onEditAll: () => void;
}
```

#### DeleteRecurringDialog
```typescript
interface DeleteRecurringDialogProps {
  open: boolean;
  onClose: () => void;
  onDeleteSingle: () => void;
  onDeleteAll: () => void;
}
```

### 5. Helper Functions (추가 필요)

#### `isRecurringEvent(event: Event): boolean`
```typescript
// 반복 일정 여부 확인
return event.repeat.type !== 'none';
```

#### `getRecurringGroupEvents(events: Event[], repeatId: string): Event[]`
```typescript
// 같은 repeat.id를 가진 모든 이벤트 반환
return events.filter(e => e.repeat.id === repeatId);
```

### 6. Hook 수정 (useEventOperations)

#### 추가 필요한 함수
```typescript
const updateRecurringEvents = async (repeatId: string, data: Partial<Event>) => {
  // PUT /api/events/recurring/:repeatId
};

const deleteSingleEvent = async (id: string) => {
  // DELETE /api/events/:id (기존 deleteEvent와 동일)
};

const deleteRecurringEvents = async (repeatId: string) => {
  // DELETE /api/events/recurring/:repeatId
};
```

---

## 테스트 작성 시 주의사항

### 1. MSW 핸들러 설정

```typescript
// 전체 수정 API
http.put('/api/events/recurring/:repeatId', async ({ params, request }) => {
  const { repeatId } = params;
  const updatedData = await request.json();

  // mockEvents에서 같은 repeatId를 가진 모든 이벤트 업데이트
  mockEvents = mockEvents.map(event =>
    event.repeat.id === repeatId
      ? { ...event, ...updatedData }
      : event
  );

  return HttpResponse.json({ success: true });
});

// 전체 삭제 API
http.delete('/api/events/recurring/:repeatId', async ({ params }) => {
  const { repeatId } = params;

  // mockEvents에서 같은 repeatId를 가진 모든 이벤트 삭제
  mockEvents = mockEvents.filter(event => event.repeat.id !== repeatId);

  return HttpResponse.json({ success: true });
});
```

### 2. 반복 일정 테스트 데이터 생성

```typescript
const createRecurringEventGroup = (baseDate: string, count: number = 3) => {
  const repeatId = `repeat-${Date.now()}`;
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i * 7); // 매주
    return {
      id: `event-${i}`,
      title: '주간 회의',
      date: date.toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 미팅',
      location: '회의실',
      category: '업무',
      repeat: {
        type: 'weekly' as const,
        interval: 1,
        endDate: '2025-12-31',
        id: repeatId, // 같은 그룹
      },
      notificationTime: 10,
    };
  });
};
```

### 3. 다이얼로그 테스트 패턴

```typescript
// 1. 다이얼로그 표시 확인
const editButton = screen.getByLabelText('Edit event');
await userEvent.click(editButton);

const dialog = await screen.findByRole('dialog');
expect(dialog).toBeInTheDocument();
expect(within(dialog).getByText('해당 일정만 수정하시겠어요?')).toBeInTheDocument();

// 2. 버튼 클릭
const yesButton = within(dialog).getByRole('button', { name: '예' });
await userEvent.click(yesButton);

// 3. 다이얼로그 닫힘 확인
await waitFor(() => {
  expect(dialog).not.toBeInTheDocument();
});
```

### 4. 아이콘 상태 확인 패턴

```typescript
// 반복 아이콘 있음
const eventItem = screen.getByText('주간 회의').closest('li');
expect(within(eventItem!).getByLabelText('반복 일정')).toBeInTheDocument();

// 반복 아이콘 없음
const singleEventItem = screen.getByText('단일 회의').closest('li');
expect(within(singleEventItem!).queryByLabelText('반복 일정')).not.toBeInTheDocument();
```

---

## 예상 구현 시간

| Phase | TODO 수 | 예상 시간 | 난이도 |
|-------|---------|-----------|--------|
| 1     | 5개     | 2시간     | Easy   |
| 2     | 3개     | 2시간     | Medium |
| 3     | 3개     | 2시간     | Medium |
| 4     | 3개     | 2시간     | Medium |
| 5     | 3개     | 1시간     | Easy   |
| 6     | 2개     | 1.5시간   | Medium |
| 7     | 2개     | 1.5시간   | Medium |
| 8     | 3개     | 1시간     | Easy   |
| **합계** | **24개** | **13시간** | **-** |

---

## 명세 외 항목 (테스트 제외)

다음 항목들은 **명세에 명시되지 않았으므로** TODO List에 포함하지 않습니다:

1. ❌ 매주 반복 시 특정 요일 선택 (명세 없음)
2. ❌ 단일로 변경된 일정을 다시 반복으로 전환 (명세 없음)
3. ❌ 반복 간격(interval) 2 이상 설정 (명세에서 1로 고정)
4. ❌ 반복 종료 조건 "N회 반복 후 종료" (명세에 날짜만 있음)
5. ❌ 반복 일정 일괄 수정 UI (명세에 없음)

---

## 결론

### 테스트 설계 요약

- **총 TODO 항목**: 24개
- **Critical 우선순위**: 17개
- **테스트 파일**: 7개 (모두 Integration)
- **예상 구현 시간**: 13시간

### 다음 단계

1. ✅ 이 문서를 사용자에게 공유하여 승인 받기
2. ⏳ `test-code-implementer` 에이전트에게 전달
3. ⏳ Phase 1부터 순차적으로 RED → GREEN → REFACTOR

### 구현 우선순위

```
1순위: Phase 1 (REQ-006 테스트 추가) - 이미 구현됨
2순위: Phase 2, 5 (다이얼로그 UI) - 공통 UI 먼저
3순위: Phase 3, 6 (단일 수정/삭제) - 간단한 로직
4순위: Phase 4, 7 (전체 수정/삭제) - 복잡한 로직
5순위: Phase 8 (에러 처리) - 안정성 향상
```

---

**문서 작성 완료**
이 설계 문서를 기반으로 `test-code-implementer` 에이전트가 테스트 코드를 작성할 수 있습니다.
