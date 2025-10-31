# 테스트 명세서: 반복 일정 표시

**Status**: Test Specification Complete 완료
**Next Action**: 사용자 검토 완료되면 이 문서를 @developer에게 전달하여 구현을 요청합니다.

---

## 개요

### 테스트 목적

캘린더 뷰에서 반복일정과 일반일정을 시각적으로 구분할 수 있는 아이콘 표시 기능을 검증한다.

### 테스트 범위

- 반복 일정에 아이콘 표시 및 접근성
- 일반 일정에서 아이콘 미표시
- 접근성 라벨 (aria-label)
- 엣지 케이스 (undefined, interval !== 1, endDate)
- 제목 길이와 아이콘 조화

### 제외 사항

- 주간 뷰나 일간 뷰에서 아이콘 표시 기능 (향후 계획 또는 별도 테스트)
- 아이콘 클릭/상호작용 기능 테스트 (현재 범위 아님)

---

## 테스트 파일 정보

### 파일명

`src/__tests__/medium.recurringEventIcon.integration.spec.tsx`

### 테스트 유형

**Integration Test** - App 컴포넌트 렌더링과 실제 일정 데이터를 통한 아이콘 표시 검증

### 파일 구조

- 파일명: `medium.recurringEventIcon.integration.spec.tsx`
- describe: Acceptance Criteria 단위별로 그룹핑
- it: Given-When-Then 패턴으로 시나리오 작성

---

## 테스트 시나리오

### AC-1: 반복 일정에 아이콘 표시

#### 테스트 1.1: 반복 일정 아이콘 표시

**Given** 반복 일정(`repeat.type !== 'none'`)이 있을 때  
**When** 캘린더가 렌더링되면  
**Then** 반복 아이콘(`Repeat`)이 표시되어야함

**검증 방법**:

- `getByRole('img', { name: /반복 일정/ })`를 통해 아이콘 존재 확인

---

#### 테스트 1.2: 아이콘 속성 확인

**Given** 반복 아이콘이 표시될 때  
**When** 캘린더가 렌더링되면  
**Then** 아이콘 크기는 `fontSize="small"`이어야함  
**And** `aria-label="반복 일정"` 속성이 설정되어야함

**검증 방법**:

- `toHaveAttribute('aria-label', '반복 일정')` 검증

---

### AC-2: 일반 일정에는 아이콘 미표시

#### 테스트 2.1: 일반 일정 아이콘 미표시

**Given** 일반 일정(`repeat.type === 'none'`)이 있을 때  
**When** 캘린더가 렌더링되면  
**Then** 반복 아이콘이 표시되지 않아야함

**검증 방법**:

- `queryByRole('img', { name: /반복 일정/ })`가 `null` 인지 확인

---

### AC-3: 아이콘 배치와 레이아웃 정렬

#### 테스트 3.1: 알림 + 반복 아이콘 순서 확인

**Given** 알림과 반복이 모두 설정된 일정이 있을 때  
**When** 캘린더가 렌더링되면  
**Then** 알림 아이콘이 가장 앞에 위치해야함  
**And** 반복 아이콘이 알림 아이콘 다음 위치에 표시되어야함

**검증 방법**:

- 두 아이콘의 DOM 순서 확인
- DOM 구조 검증 (알림 아이콘이 먼저 나타나고 반복 아이콘이 뒤에 위치)

---

### AC-4: 모든 반복 타입에서 아이콘 표시

#### 테스트 4.1: 각 반복 타입별 아이콘 표시

**Given** 반복 타입이 `daily`, `weekly`, `monthly`, `yearly` 중 하나로 설정된 일정이 있을 때  
**When** 캘린더가 렌더링되면  
**Then** 모든 타입에 대해서 동일한 반복 아이콘이 표시되어야함

**검증 방법**:

- `it.each`를 사용한 반복 타입별 테스트
- 모든 타입에서 동일한 아이콘 표시 확인

---

### AC-5: 반복 간격이 1이 아닌 경우에도 표시

#### 테스트 5.1: 반복 간격이 2인 경우

**Given** 반복 간격이 2로 설정된 일정(예: 2주마다)이 있을 때  
**When** 캘린더가 렌더링되면  
**Then** 반복 아이콘이 표시되어야함

**검증 방법**:

- `interval: 2`로 설정된 테스트 데이터
- 반복 아이콘 표시 확인

---

### AC-6: 종료날짜 설정 여부와 무관한 표시

#### 테스트 6.1: 종료날짜 있는 반복 일정

**Given** 종료날짜(`repeat.endDate`)가 설정된 반복 일정이 있을 때  
**When** 캘린더가 렌더링되면  
**Then** 반복 아이콘이 표시되어야함

**검증 방법**:

- `endDate: '2025-11-30'` 등을 포함한 테스트 데이터
- 반복 아이콘 표시 확인

---

### AC-7: 반복 정보가 없는 레거시 데이터 처리

#### 테스트 7.1: repeat이 undefined인 경우

**Given** `event.repeat`이 `undefined`인 기존의 일정이 있을 때  
**When** 캘린더가 렌더링되면  
**Then** 오류 없이 렌더링되어야함  
**And** 반복 아이콘이 표시되지 않아야함

**검증 방법**:

- `repeat` 속성이 없는 레거시 테스트 데이터
- 오류 없이 렌더링되고 반복 아이콘 없음 확인

---

### AC-8: 제목 길이와 아이콘 표시 조화

#### 테스트 8.1: 긴 제목과 아이콘 배치

**Given** 일정 제목이 매우 긴 반복 일정이 있을 때  
**When** 화면에 렌더링될때  
**Then** 아이콘이 먼저 표시되고 제목이 말줄임으로 처리되어야함  
**And** 아이콘은 고정적으로 표시되어야함

**검증 방법**:

- 매우 긴 제목을 가진 테스트 데이터
- 아이콘 우선 표시되고 제목 말줄임 처리 확인
- 아이콘이 잘리지 않고 정상 표시됨 확인

---

## 테스트 케이스 총계

### 총 테스트 수

- 총 반복 테스트: 반복 일정 아이콘 표시
- 총 일반 테스트: 일반 일정 아이콘 미표시
- 총 배치 테스트: 알림 + 반복 아이콘 순서
- 총 타입 테스트: 모든 반복 타입 (daily, weekly, monthly, yearly)
- 총 간격 테스트: 반복 간격이 1이 아닌 경우
- 총 날짜 테스트: 종료날짜 설정 여부
- 총 레거시 테스트: repeat이 undefined인 경우
- 총 레이아웃 테스트: 제목 길이와 아이콘 조화

### 총 예상 테스트 수량

**9개 핵심 테스트 케이스**

---

## 설정 정보

### 테스트 도구

- **Vitest**: 테스트 러너
- **React Testing Library**: 컴포넌트 테스트
- **MSW**: API 목킹
- **MUI Theme**: 테마 설정

### 목킹 설정

```typescript
// MSW 핸들러로 일정 데이터 설정
const setupMockEventsWithRepeat = (events: Event[]) => {
  server.use(
    http.get('http://localhost:3001/api/events', () => {
      return HttpResponse.json({ events });
    })
  );
};
```

### 아이콘 검증방법

- 1순위: `getByRole('img', { name: /반복 일정/ })` - 아이콘 존재
- 2순위: `getByText('반복 일정')` - 라벨 존재
- 미존재 확인: `queryByRole` 사용 (없을 경우 확인)

---

## TDD Red 단계 완료

**현재 상태**: 모든 테스트 작성 완료 (실패)

**의미**: 실제 구현이 없어 모든 테스트가 실패하는 상태입니다.

**다음 단계**: @developer에게 실제 구현을 통해 모든 테스트가 통과(Green)하도록 요청.

---

## 검증 기준

### 기능 요구

- 모든 반복 일정에 아이콘이 표시됨
- 모든 일반 일정에는 아이콘이 미표시됨
- 모든 아이콘이 제목 앞에 위치함
- 모든 반복 타입에서 아이콘 표시
- 모든 엣지 케이스 올바르게 처리

### 접근성 요구

- 모든 `aria-label="반복 일정"` 속성 설정
- 모든 스크린 리더에서 올바른 읽기

### 성능 요구

- 모든 반복 판별 로직이 효율적으로 실행됨
- 모든 제목 길이와 아이콘 조화

---

## 구현 요청 사항

### 담당자

**@developer**

TDD Red 단계가 완료되었습니다. 이제 Green + Refactor 단계를 진행해주세요.

**구현 요청사항**:

- 파일: `src/__tests__/medium.recurringEventIcon.integration.spec.tsx`
- 총 9개 핵심 테스트 케이스 (모두 실패중)
- 현재 상태: 모든 테스트 실패 (구현 전 상태 - 정상)
- 목표 결과: green 단계로 모든 테스트 통과

**관련 문서**:

- 명세서: `.cursor/artifacts/test-architect/반복일정표시_test.md`
- 구현파일: `src/__tests__/medium.recurringEventIcon.integration.spec.tsx`
- 기능 명세: `.cursor/artifacts/spec-writer/반복일정표시_spec.md`
- User Story: `.cursor/artifacts/po/반복일정표시_story.md`

**구현 가이드**:

1. `src/App.tsx`에 `Repeat` 아이콘 import 추가
2. `renderMonthView` 함수 내 반복 일정 판별 로직 추가
3. 반복 아이콘 렌더링 로직 추가
4. 접근성 라벨 및 아이콘 배치 (순서 포함)
5. 모든 엣지 케이스 처리

모든 테스트가 통과할 때까지 구현을 진행해주세요.

---

**Version**: 1.0.0
**Created**: 2025-01-XX
