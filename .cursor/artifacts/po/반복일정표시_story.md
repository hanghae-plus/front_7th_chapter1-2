# User Story: 반복 일정 표시

**Status**: User Story Complete 완료
**Next Action**: 사용자 승인되면 이 문서를 @test-architect에게 전달하여 테스트 케이스 작성을 요청합니다.

---

## Story

**As a** 캘린더 앱을 사용하는 사용자  
**I want** 캘린더에서 반복 일정과 일반 일정을 시각적으로 구분할수있기를  
**So that** 어떤 일정이 반복 일정인지 빠르게 식별하고 관리할 수 있다

---

## Description

### 배경

현재 캘린더에서 일반 일정과 반복일정이 동일하게 보여져 사용자가 어떤 일정이 반복되는 일정인지 구분할 수 없다. 사용자는 반복 일정에 대한 시각적 표시가 필요하다.

### 사용자 여정

1. 사용자가 월간 뷰나 주간 뷰에 접근한다.
2. 반복 일정(`repeat.type !== 'none'`)인 경우 반복 아이콘이 제목 앞에 표시된다.
3. 아이콘을 보고 사용자는 해당 일정이 반복 일정임을 빠르게 인식할 수 있다.
4. 일반 일정(`repeat.type === 'none'`)인 경우 반복 아이콘이 표시되지 않는다.

### 주요 시나리오

**시나리오 1: 반복 일정 식별**

- 사용자가 매주 회의 일정이 캘린더에 표시됨
- 해당 일정에는 반복 아이콘이 표시되어 식별
- "이것은 반복일정이다"라고 인지

**시나리오 2: 일반 vs 반복 일정**

- 같은 날에 일반 일정과 반복 일정이 있음
- 반복 일정만 반복 아이콘이 표시되어 시각적 구분됨
- 사용자가 빠르게 구분할 수 있음

---

## Acceptance Criteria

### AC-1: 반복 일정에 아이콘 표시

**Given** 월간 뷰에서 반복 일정으로 설정된 일정(`repeat.type !== 'none'`)이 있을 때  
**When** 캘린더가 렌더링되면  
**Then** 해당 일정에 반복 아이콘(`Repeat`)이 제목 앞에 표시되어야함  
**And** 아이콘 크기는 `fontSize="small"`이어야함  
**And** 접근성을 위해 `aria-label="반복 일정"` 속성이 설정되어야함

---

### AC-2: 일반 일정에는 아이콘 미표시

**Given** 월간 뷰에서 일반 일정으로 설정된 일정(`repeat.type === 'none'`)이 있을 때  
**When** 캘린더가 렌더링되면  
**Then** 반복 아이콘이 표시되지 않아야함

---

### AC-3: 아이콘 배치와 레이아웃 정렬

**Given** 알림과 반복이 모두 설정된 일정이 있을 때  
**When** 캘린더가 렌더링되면  
**Then** 알림 아이콘이 가장 앞에 위치해야함  
**And** 반복 아이콘이 알림 아이콘 다음 위치에 표시되어야함  
**And** 아이콘 간 간격이 `spacing={1}`로 적절하게 설정되어야함

---

### AC-4: 모든 반복 타입에서 아이콘 표시

**Given** 반복 타입이 `daily`, `weekly`, `monthly`, `yearly` 중 하나로 설정된 일정이 있을 때  
**When** 캘린더가 렌더링되면  
**Then** 모든 타입에 대해서 동일한 반복 아이콘이 표시되어야함

---

### AC-5: 반복 간격이 1이 아닌 경우에도 표시

**Given** 반복 간격이 1이 아닌 설정(예: 2주마다)으로 설정된 일정이 있을 때  
**When** 캘린더가 렌더링되면  
**Then** 반복 아이콘이 표시되어야함

---

### AC-6: 종료날짜 설정 여부와 무관한 표시

**Given** 종료날짜(`repeat.endDate`)가 있거나 없는 반복 일정이 있을 때  
**When** 캘린더가 렌더링되면  
**Then** 반복 아이콘이 표시되어야함

---

### AC-7: 반복 정보가 없는 레거시 데이터 처리

**Given** `event.repeat`이 `undefined` 또는 `null`인 기존의 일정이 있을 때  
**When** 캘린더가 렌더링되면  
**Then** 오류 없이 렌더링되어야함  
**And** 반복 아이콘이 표시되지 않아야함

---

### AC-8: 제목 길이와 아이콘 표시 조화

**Given** 일정 제목이 매우 긴 반복 일정이 있을 때  
**When** 화면에 렌더링될때  
**Then** 아이콘이 먼저 표시되고 제목이 말줄임으로 처리되어야함  
**And** 아이콘은 고정적으로 표시되어야함

---

## Tasks

### 작업 Phase 1: Test Setup

**Task 1.1: 필요한 아이콘 import 확인** (Small, ~5분)

- `src/App.tsx`에 `Repeat` 아이콘 import를 위한 준비
- 현재 `@mui/icons-material`에서 `Repeat` import 확인

**Task 1.2: 테스트용 Mock 데이터 작성** (Small, ~10분)

- 반복 일정 테스트 데이터 (`repeat.type: 'weekly'`)
- 일반 일정 테스트 데이터 (`repeat.type: 'none'`)
- 알림 + 반복 일정 테스트 데이터
- `repeat`이 `undefined`인 레거시 데이터

---

### 작업 Phase 2: Red - Test First

**Task 2.1: 반복 일정 아이콘 표시 테스트** (Small, ~15분)

- 위치: `src/__tests__/unit/easy.eventIconDisplay.spec.tsx` (새로 생성)
- 반복 일정에서만 `Repeat` 아이콘이 렌더링되는지 확인
- `getByRole('img', { name: /반복 일정/ })`로 검증

**Task 2.2: 일반 일정 아이콘 미표시 테스트** (Small, ~10분)

- 일반 일정에서 반복 아이콘이 표시되지 않는지 확인
- `queryByRole('img', { name: /반복 일정/ })`가 `null` 인지 검증

**Task 2.3: 아이콘 배치와 순서 테스트** (Small, ~15분)

- 알림 + 반복 일정에서 두 아이콘의 순서 올바른지 확인
- 아이콘 간격 검증 (순서 및 배치 순서)

**Task 2.4: 접근성 테스트** (Small, ~10분)

- 반복 아이콘의 `aria-label="반복 일정"` 속성 확인
- 스크린 리더에서 올바르게 읽히는지 확인

**Task 2.5: 엣지 케이스 테스트** (Medium, ~20분)

- `repeat`이 `undefined`인 경우 오류 없이 처리
- 반복 간격이 1이 아닌 경우에도 아이콘 표시
- 종료날짜 설정 여부와 관련없이 아이콘 표시

**Task 2.6: 통합 테스트 - 월간 뷰** (Medium, ~20분)

- 위치: `src/__tests__/medium.recurringEventIcon.integration.spec.tsx` (새로 생성)
- 월간 뷰에서 반복 일정 아이콘 표시 통합테스트
- 실제 월간 뷰 렌더링에서 아이콘 확인

---

### 작업 Phase 3: Green - Implementation

**Task 3.1: Repeat 아이콘 import 추가** (Small, ~5분)

- `src/App.tsx` 상단에 `import { Repeat } from '@mui/icons-material';` 추가

**Task 3.2: 반복 일정 판별 로직 구현** (Small, ~10분)

- `renderMonthView` 함수 내 일정표시 부분에 반복 판별 추가
- `const isRecurring = event.repeat?.type !== 'none';` 로직 추가

**Task 3.3: 반복 아이콘 렌더링 로직 구현** (Small, ~15분)

- 기존 알림 아이콘과 함께 반복 아이콘을 렌더링하는 로직 추가
- `{isRecurring && <Repeat fontSize="small" aria-label="반복 일정" />}` 추가

**Task 3.4: 주간 뷰 지원 (향후 계획)** (Small, ~10분)

- `renderWeekView` 함수에도 동일한 아이콘 표시 로직 추가
- 월간 뷰와 일관된 표시방식 적용

---

### 작업 Phase 4: Refactor

**Task 4.1: 반복 판별 로직 유틸화 (선택사항)** (Medium, ~15분)

- 반복 일정 판별 로직을 재사용 가능한 유틸로 분리 (향후 확장)
- `utils/eventUtils.ts`에 `isRecurringEvent(event: Event): boolean` 함수

**Task 4.2: 컴포넌트 분리 고려 (선택사항)** (Large, ~30분)

- 일정 표시 부분을 별도의 컴포넌트로 분리하는 것 고려
- `components/EventItem.tsx` 컴포넌트 생성 (향후 계획)

---

### 작업 Phase 5: Documentation

**Task 5.1: 코드 주석 작성** (Small, ~10분)

- 반복 아이콘 표시 로직에 대한 설명 주석 추가
- 접근성 관련 설명 추가

---

## Story Points

**총점**: 3 Story Points (Small)

**근거**:

- 구현 복잡도: 낮음 (단순한 아이콘 추가)
- 테스트성: 높음 (아이콘 표시/미표시)
- 의존성: 낮음/없음 (기존 반복 데이터 활용)
- 예상 시간: 2-3시간

---

## Technical Notes

### 기술 스택

- React + TypeScript
- Material-UI (MUI) Icons
- Vitest + Testing Library (테스트)

### 타입정의 참조

- `Event` 인터페이스의 `repeat` 필드 사용
- `RepeatInfo` 인터페이스:
  ```typescript
  interface RepeatInfo {
    type: RepeatType; // 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'
    interval: number;
    endDate: string;
  }
  ```

### 파일 위치

- 위치: `src/App.tsx`
- 함수: `renderMonthView` (305-334행 중 일정표시 부분 수정)
- 추가: `renderWeekView` (향후 주간 뷰 구현)

### 의존성

- 기존 반복 일정 생성 기능이 구현되어 있어야함
- Material-UI Icons 라이브러리 설치 필요

---

## Definition of Done

- 모든 테스트가 통과함 (Red 에서 Green)
- 모든 반복 일정에 아이콘이 표시됨
- 모든 일반 일정에는 아이콘이 표시되지 않음
- 모든 반복 아이콘이 제목 앞에 위치함 (알림 아이콘 다음)
- 모든 접근성 라벨(`aria-label`) 설정됨
- 모든 엣지 케이스 처리됨
- 모든 브라우저에서 아이콘이 정상적으로 표시됨
- 모든 테스트가 작성되어 통과함
- 모든 코드 리뷰 및 승인 완료 (동료 검토)

---

**Version**: 1.0.0
**Created**: 2025-01-XX
