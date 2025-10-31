# 테스트 설계 문서: 반복 일정 아이콘 표시 (간소화)

> **작성일**: 2025-10-31
> **기능 명세**: REQ-005 - 반복 일정 시각적 표시
> **우선순위**: High
> **설계자**: Test Planner Agent
> **버전**: 2.0 (간소화)

---

## 목차

1. [명세 요약](#명세-요약)
2. [재검토 결과](#재검토-결과)
3. [테스트 TODO 리스트](#테스트-todo-리스트)
4. [테스트 커버리지 맵](#테스트-커버리지-맵)
5. [구현 가이드](#구현-가이드)

---

## 명세 요약

### REQ-005: 반복 일정 시각적 표시

#### 기본 동작
캘린더 뷰에서 반복 일정을 아이콘으로 구분하여 표시한다.

#### UI 요구사항
- 반복 일정에는 **🔁 이모지**를 표시한다.
- 단일 일정과 명확히 구분된다.
- 아이콘은 일정 제목 옆에 표시된다.
- **월간/주간 뷰만 지원** (일간 뷰는 구현하지 않음)

#### 예시
```
일반 일정:  "회의"
반복 일정:  "회의 🔁"
```

#### 종료 조건 (REQ-006 연계)
- **`repeat.endDate`가 지난 일정은 아이콘을 표시하지 않는다.**
- 종료일이 지나면 더 이상 반복 일정으로 취급하지 않음

#### 비기능 요구사항 (NFR-003: 접근성)
- 반복 아이콘은 스크린 리더에서 "반복 일정"으로 읽혀야 한다.

---

## 재검토 결과

### 명확해진 요구사항

1. **일간 뷰**: 구현하지 않음 → 월간/주간 뷰만 테스트
2. **아이콘 종류**: 🔁 이모지 사용 (확정)
3. **종료된 반복 일정**: `endDate` 지난 일정은 아이콘 표시 안 함 (REQ-006)

### 제거된 TODO (9개)

| TODO | 제목 | 제거 이유 |
|------|------|----------|
| ~~TODO-006~~ | 아이콘 위치 - 제목 바로 옆 | 구현 세부사항, 기능 검증과 무관 |
| ~~TODO-007~~ | 아이콘 배치 - 가로 정렬 | 구현 세부사항, 기능 검증과 무관 |
| ~~TODO-008~~ | 다중 반복 일정 아이콘 표시 | TODO-001~005로 충분히 검증됨 |
| ~~TODO-011~~ | 일간 뷰 아이콘 표시 | **일간 뷰 구현하지 않음** |
| ~~TODO-013~~ | 반복 종료일 이후 아이콘 표시 | **명세로 명확해짐**: TODO-008에 통합 |
| ~~TODO-014~~ | 잘못된 반복 타입 예외 처리 | TypeScript로 방지, 과도한 방어 코드 |
| ~~TODO-015~~ | 반복 일정 생성 후 아이콘 표시 | TODO-001~005로 검증, 중복 |
| ~~TODO-016~~ | 단일 → 반복 수정 시 아이콘 표시 | TODO-001~005로 검증, 중복 |
| ~~TODO-017~~ | 반복 → 단일 수정 시 아이콘 제거 | TODO-005로 검증, 중복 |

### 유지된 TODO (8개)

**핵심 기능 검증에 필요한 최소한의 테스트만 유지**

- **Phase 1**: 반복 유형별 아이콘 표시 (5개)
- **Phase 2**: 캘린더 뷰별 검증 (2개)
- **Phase 3**: 접근성 + 종료 조건 (1개)

---

## 테스트 TODO 리스트

### Phase 1: 반복 유형별 아이콘 표시 (Unit Tests)

#### ✅ TODO-001: 매일 반복 일정 아이콘 표시
- **명세**: REQ-005
- **우선순위**: Critical
- **검증 내용**:
  - `repeat.type === 'daily'`인 일정에 반복 아이콘(🔁) 표시
  - `aria-label="반복 일정"` 속성 존재
- **테스트 데이터**:
  ```typescript
  {
    id: '1',
    title: '매일 운동',
    date: '2025-06-15',
    repeat: { type: 'daily', interval: 1, endDate: '2025-12-31' }
  }
  ```
- **예상 결과**:
  - `screen.getByLabelText('반복 일정')` 존재
  - 🔁 이모지 표시
- **테스트 파일**: `src/__tests__/unit/recurringEventIcon.spec.tsx`

#### ✅ TODO-002: 매주 반복 일정 아이콘 표시
- **명세**: REQ-005
- **우선순위**: Critical
- **검증 내용**:
  - `repeat.type === 'weekly'`인 일정에 반복 아이콘 표시
- **테스트 데이터**:
  ```typescript
  {
    id: '2',
    title: '주간 회의',
    date: '2025-06-15',
    repeat: { type: 'weekly', interval: 1, endDate: '2025-12-31' }
  }
  ```
- **테스트 파일**: `src/__tests__/unit/recurringEventIcon.spec.tsx`

#### ✅ TODO-003: 매월 반복 일정 아이콘 표시
- **명세**: REQ-005
- **우선순위**: Critical
- **검증 내용**:
  - `repeat.type === 'monthly'`인 일정에 반복 아이콘 표시
- **테스트 데이터**:
  ```typescript
  {
    id: '3',
    title: '월간 리뷰',
    date: '2025-06-15',
    repeat: { type: 'monthly', interval: 1, endDate: '2025-12-31' }
  }
  ```
- **테스트 파일**: `src/__tests__/unit/recurringEventIcon.spec.tsx`

#### ✅ TODO-004: 매년 반복 일정 아이콘 표시
- **명세**: REQ-005
- **우선순위**: Critical
- **검증 내용**:
  - `repeat.type === 'yearly'`인 일정에 반복 아이콘 표시
- **테스트 데이터**:
  ```typescript
  {
    id: '4',
    title: '생일',
    date: '2025-06-15',
    repeat: { type: 'yearly', interval: 1, endDate: '2025-12-31' }
  }
  ```
- **테스트 파일**: `src/__tests__/unit/recurringEventIcon.spec.tsx`

#### ✅ TODO-005: 단일 일정 아이콘 미표시
- **명세**: REQ-005
- **우선순위**: Critical
- **검증 내용**:
  - `repeat.type === 'none'`인 일정에 반복 아이콘 **미표시**
  - `queryByLabelText('반복 일정')` 결과가 `null`
- **테스트 데이터**:
  ```typescript
  {
    id: '5',
    title: '단일 회의',
    date: '2025-06-15',
    repeat: { type: 'none', interval: 1 }
  }
  ```
- **예상 결과**:
  - 반복 아이콘 요소 없음
  - 제목에 🔁 포함 안 됨
- **테스트 파일**: `src/__tests__/unit/recurringEventIcon.spec.tsx`

---

### Phase 2: 캘린더 뷰별 검증 (Integration Tests)

#### ✅ TODO-006: 월간 뷰 아이콘 표시
- **명세**: REQ-005
- **우선순위**: High
- **검증 내용**:
  - 월간 뷰(`data-testid="month-view"`)에서 아이콘 표시
  - 반복 일정이 캘린더 셀에 아이콘과 함께 렌더링
- **구현 위치**: App.tsx `renderMonthView()` (Line 224-313)
- **현재 코드**:
  ```tsx
  // Line 290-296: 아이콘 없이 제목만 표시
  <Typography variant="caption" noWrap>
    {event.title}
  </Typography>
  ```
- **테스트 파일**: `src/__tests__/integration/recurringIconViews.spec.tsx`

#### ✅ TODO-007: 주간 뷰 아이콘 표시
- **명세**: REQ-005
- **우선순위**: High
- **검증 내용**:
  - 주간 뷰(`data-testid="week-view"`)에서 아이콘 표시
- **구현 위치**: App.tsx `renderWeekView()` (Line 147-222)
- **현재 코드**:
  ```tsx
  // Line 203-209: 아이콘 없이 제목만 표시
  <Typography variant="caption" noWrap>
    {event.title}
  </Typography>
  ```
- **테스트 파일**: `src/__tests__/integration/recurringIconViews.spec.tsx`

---

### Phase 3: 접근성 및 종료 조건 (Integration Tests)

#### ✅ TODO-008: ARIA 레이블 + 종료일 지난 일정 처리
- **명세**: NFR-003 (접근성) + REQ-006 (종료 조건)
- **우선순위**: Critical
- **검증 내용**:
  1. **ARIA 레이블**: 반복 아이콘에 `aria-label="반복 일정"` 존재
  2. **종료일 검증**: `repeat.endDate`가 현재 날짜보다 이전이면 아이콘 미표시
- **테스트 데이터 1 (ARIA)**:
  ```typescript
  {
    id: '6',
    title: '활성 반복 일정',
    date: '2025-06-15',
    repeat: { type: 'daily', interval: 1, endDate: '2025-12-31' }
  }
  ```
- **테스트 데이터 2 (종료일)**:
  ```typescript
  {
    id: '7',
    title: '종료된 반복 일정',
    date: '2025-06-15',
    repeat: { type: 'daily', interval: 1, endDate: '2025-06-10' }
    // 종료일(06-10)이 일정 날짜(06-15)보다 이전 → 아이콘 미표시
  }
  ```
- **예상 결과**:
  - 데이터 1: `getByLabelText('반복 일정')` 존재, ARIA 속성 확인
  - 데이터 2: `queryByLabelText('반복 일정')` null (아이콘 미표시)
- **테스트 파일**: `src/__tests__/integration/recurringIconViews.spec.tsx`

---

## 테스트 커버리지 맵

### 기능별 커버리지

| 기능 | 테스트 항목 | 커버리지 달성 조건 |
|------|------------|------------------|
| **반복 유형별 아이콘 표시** | TODO-001 ~ TODO-005 | 5개 반복 타입(daily/weekly/monthly/yearly/none) 모두 검증 ✅ |
| **캘린더 뷰 통합** | TODO-006 ~ TODO-007 | 월간/주간 뷰 검증 (일간 뷰 제외) ✅ |
| **접근성** | TODO-008 (Part 1) | ARIA 레이블 검증 ✅ |
| **종료 조건** | TODO-008 (Part 2) | endDate 지난 일정 아이콘 미표시 ✅ |

### 우선순위별 분류

#### Critical (반드시 통과해야 함)
- TODO-001, TODO-002, TODO-003, TODO-004, TODO-005
- TODO-008 (ARIA + 종료일)

#### High (중요하지만 일부 실패 허용)
- TODO-006, TODO-007 (뷰별 검증)

### 코드 커버리지 목표

| 메트릭 | 목표 |
|--------|------|
| **라인 커버리지** | 90% 이상 |
| **분기 커버리지** | 85% 이상 |
| **함수 커버리지** | 100% (아이콘 표시 로직 함수) |

### 구현 위치별 매핑

| 파일/함수 | 테스트 항목 | 구현 필요 사항 |
|-----------|------------|---------------|
| **App.tsx - renderMonthView()** (Line 224-313) | TODO-001~008, TODO-006 | Line 290-296에 아이콘 추가 |
| **App.tsx - renderWeekView()** (Line 147-222) | TODO-007 | Line 203-209에 아이콘 추가 |
| **App.tsx - event-list section** (Line 519-589) | TODO-001~005, TODO-008 | Line 542-548에 아이콘 추가 |

---

## 구현 가이드

### 아이콘 표시 로직 (의사 코드)

```typescript
// 반복 일정 판단 함수
const isRecurringEvent = (event: Event): boolean => {
  // 1. 반복 타입이 'none'이 아니어야 함
  if (event.repeat.type === 'none') return false;

  // 2. 종료일이 없으면 반복 일정으로 표시
  if (!event.repeat.endDate) return true;

  // 3. 종료일이 현재 날짜보다 이후면 반복 일정으로 표시
  const today = new Date().toISOString().split('T')[0];
  return event.repeat.endDate >= today;
};

// 아이콘 렌더링 (예시)
<Stack direction="row" spacing={1} alignItems="center">
  {isNotified && <Notifications fontSize="small" />}
  <Typography variant="caption" noWrap>
    {event.title}
  </Typography>
  {isRecurringEvent(event) && (
    <span aria-label="반복 일정">🔁</span>
  )}
</Stack>
```

### 수정 위치 요약

#### 1. 월간 뷰 (renderMonthView - Line 290-296)
**Before**:
```tsx
<Typography variant="caption" noWrap>
  {event.title}
</Typography>
```

**After**:
```tsx
<Stack direction="row" spacing={0.5} alignItems="center">
  <Typography variant="caption" noWrap>
    {event.title}
  </Typography>
  {isRecurringEvent(event) && (
    <span aria-label="반복 일정">🔁</span>
  )}
</Stack>
```

#### 2. 주간 뷰 (renderWeekView - Line 203-209)
- 월간 뷰와 동일한 패턴 적용

#### 3. 일정 목록 (event-list - Line 542-548)
**Before**:
```tsx
<Typography
  fontWeight={notifiedEvents.includes(event.id) ? 'bold' : 'normal'}
  color={notifiedEvents.includes(event.id) ? 'error' : 'inherit'}
>
  {event.title}
</Typography>
```

**After**:
```tsx
<Stack direction="row" spacing={1} alignItems="center">
  <Typography
    fontWeight={notifiedEvents.includes(event.id) ? 'bold' : 'normal'}
    color={notifiedEvents.includes(event.id) ? 'error' : 'inherit'}
  >
    {event.title}
  </Typography>
  {isRecurringEvent(event) && (
    <span aria-label="반복 일정">🔁</span>
  )}
</Stack>
```

### 테스트 주석 해제 순서

Kent Beck의 TDD 철학에 따라 다음 순서로 진행:

1. **TODO-001 (가장 단순)**: 매일 반복 아이콘 표시
   - RED: 테스트 주석 해제 → 실패 확인
   - GREEN: App.tsx 수정 → 테스트 통과
   - REFACTOR: 코드 정리

2. **TODO-002 ~ TODO-004**: 다른 반복 타입
   - 같은 로직으로 자동 통과 가능

3. **TODO-005**: 단일 일정 (반대 케이스)
   - 반복 아이콘 미표시 검증

4. **TODO-006 ~ TODO-007**: 뷰별 검증
   - 월간/주간 뷰 통합 테스트

5. **TODO-008**: 접근성 + 종료 조건
   - ARIA 레이블 + endDate 검증

---

## 실행 계획 (구현 에이전트용)

### Step 1: 환경 확인
- [ ] Vitest 실행 가능 확인
- [ ] 현재 테스트 상태 확인 (모두 주석 처리됨)

### Step 2: TODO-001 구현 (첫 번째 RED-GREEN-REFACTOR)
- [ ] `src/__tests__/unit/recurringEventIcon.spec.tsx` TODO-001 주석 해제
- [ ] 테스트 실행 → 실패 확인 (RED)
- [ ] `src/App.tsx` Line 542-548 수정 (일정 목록)
- [ ] 테스트 실행 → 통과 확인 (GREEN)
- [ ] 코드 정리 (REFACTOR)

### Step 3: TODO-002 ~ TODO-005 구현
- [ ] 각 테스트 주석 해제 → 자동 통과 확인
- [ ] TODO-005 (단일 일정) 검증

### Step 4: TODO-006 ~ TODO-007 구현
- [ ] `renderMonthView()` Line 290-296 수정
- [ ] `renderWeekView()` Line 203-209 수정
- [ ] 통합 테스트 주석 해제

### Step 5: TODO-008 구현
- [ ] ARIA 레이블 검증
- [ ] endDate 종료 조건 처리
- [ ] 엣지 케이스 검증

### Step 6: 최종 검증
- [ ] 모든 테스트 통과 확인
- [ ] 커버리지 리포트 확인
- [ ] 코드 리뷰 및 정리

---

## 참고 자료

### 관련 명세
- **REQ-005**: 반복 일정 시각적 표시 (Primary)
- **REQ-006**: 반복 종료 조건 (Edge Case - endDate)
- **NFR-003**: 접근성 (ARIA 레이블)

### 관련 파일
- **구현 대상**: `src/App.tsx`
- **테스트 파일**:
  - `src/__tests__/unit/recurringEventIcon.spec.tsx`
  - `src/__tests__/integration/recurringIconViews.spec.tsx`
- **타입 정의**: `src/types.ts`

### 데이터 구조
```typescript
type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

interface RepeatInfo {
  type: RepeatType;
  interval: number;
  endDate?: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  // ... 다른 필드
  repeat: RepeatInfo;
}
```

---

## 변경 이력

| 날짜 | 변경 내용 | 작성자 |
|------|----------|--------|
| 2025-10-31 | 초안 작성 (17개 TODO) | Test Planner Agent |
| 2025-10-31 | 간소화 (8개 TODO) - 명확해진 요구사항 반영 | Test Planner Agent |

---

## 요약

### 간소화 결과

- **Before**: 17개 TODO
- **After**: 8개 TODO (53% 감소)
- **제거 항목**: 구현 세부사항, 중복 테스트, 미지원 기능
- **유지 항목**: 핵심 기능 검증에 필요한 최소한의 테스트

### 핵심 변경사항

1. ✅ **일간 뷰 제거**: 구현하지 않음
2. ✅ **아이콘 확정**: 🔁 이모지 사용
3. ✅ **종료 조건 명확화**: endDate 지난 일정은 아이콘 미표시
4. ✅ **워크플로우 통합**: 생성/수정 시나리오를 기본 테스트로 커버
5. ✅ **UI 세부사항 제거**: 위치/정렬 테스트 삭제

---

**다음 단계**: 이 문서를 `test-code-implementer` 에이전트에게 전달하여 테스트 구현을 시작합니다.
