---
**문서 유형**: [HUMAN]  
**목적**: 기능별 PRD 인덱스 (function-index.json의 사람 친화적 버전)  
**주요 내용**: 각 기능의 목적, 관련 코드, API, 의존성, 테스트, 구현 상태  
**관련 문서**: [function-index.json](./function-index.json), [project-structure.md](./project-structure.md)  
**최종 수정일**: 2025-10-29
---

# 일정 관리 캘린더 애플리케이션 - 기능별 PRD 인덱스

## 프로젝트 구조 개요

상세한 파일 트리 및 각 파일의 책임은 [project-structure.md](./project-structure.md)를 참조하세요.

## 기능명: 일정 CRUD

**목적**: 사용자가 일정을 생성, 조회, 수정, 삭제할 수 있도록 하여 개인/업무 일정을 관리할 수 있게 한다.

**관련 코드**:

- `src/hooks/useEventOperations.ts` (일정 생성/수정/삭제 API 호출 및 상태 관리)
- `src/hooks/useEventForm.ts` (일정 입력 폼 상태 관리 및 편집 모드 전환)
- `src/App.tsx` (일정 폼 UI 렌더링 및 이벤트 핸들링)
- `src/types.ts` (Event, EventForm 타입 정의)

**관련 API**:

- GET /api/events (일정 목록 조회)
- POST /api/events (일정 생성)
- PUT /api/events/:id (일정 수정)
- DELETE /api/events/:id (일정 삭제)

**내부 의존 모듈**:

- `src/utils/timeValidation.ts` (시작/종료 시간 유효성 검사)
- `src/utils/eventOverlap.ts` (일정 중복 검사 로직)

**테스트 파일**:

- `src/__tests__/hooks/medium.useEventOperations.spec.ts` (일정 CRUD 훅 테스트)
- `src/__tests__/medium.integration.spec.tsx` (일정 추가/수정/삭제 통합 테스트)

**구현 상태**: 구현됨

---

## 기능명: 캘린더 뷰 (월간/주간)

**목적**: 사용자가 월간 또는 주간 단위로 일정을 시각적으로 확인하고 네비게이션할 수 있도록 한다.

**관련 코드**:

- `src/hooks/useCalendarView.ts` (뷰 모드 상태 관리 및 날짜 네비게이션 로직)
- `src/App.tsx` (renderWeekView, renderMonthView 함수로 캘린더 그리드 렌더링)
- `src/utils/dateUtils.ts` (주/월 계산, 날짜 포맷팅, 주별 날짜 배열 생성)

**관련 API**: 없음

**내부 의존 모듈**:

- `src/utils/dateUtils.ts` (날짜 계산 및 포맷팅 유틸리티)
- `src/apis/fetchHolidays.ts` (공휴일 데이터 조회)

**테스트 파일**:

- `src/__tests__/hooks/easy.useCalendarView.spec.ts` (캘린더 뷰 훅 단위 테스트)
- `src/__tests__/unit/easy.dateUtils.spec.ts` (날짜 유틸리티 함수 단위 테스트)

**구현 상태**: 구현됨

---

## 기능명: 일정 검색

**목적**: 사용자가 제목, 설명, 위치를 기반으로 일정을 실시간 검색하고 필터링할 수 있게 한다.

**관련 코드**:

- `src/hooks/useSearch.ts` (검색어 상태 관리 및 필터링된 일정 목록 계산)
- `src/utils/eventUtils.ts` (검색 로직 및 날짜 범위 필터링)
- `src/App.tsx` (검색 입력창 렌더링 및 검색 결과 표시)

**관련 API**: 없음

**내부 의존 모듈**:

- `src/utils/eventUtils.ts` (텍스트 검색 및 날짜 범위 필터링 로직)
- `src/utils/dateUtils.ts` (주/월 날짜 범위 계산)

**테스트 파일**:

- `src/__tests__/hooks/easy.useSearch.spec.ts` (검색 훅 단위 테스트)
- `src/__tests__/unit/easy.eventUtils.spec.ts` (검색 유틸리티 함수 단위 테스트)

**구현 상태**: 구현됨

---

## 기능명: 일정 충돌 감지

**목적**: 동일 날짜에 시간이 겹치는 일정이 있을 경우 사용자에게 경고하여 스케줄 충돌을 방지한다.

**관련 코드**:

- `src/utils/eventOverlap.ts` (일정 시간 중복 감지 로직)
- `src/App.tsx` (중복 경고 다이얼로그 표시 및 처리)

**관련 API**: 없음

**내부 의존 모듈**:

- `src/utils/eventOverlap.ts` (중복 검사 알고리즘: start1 < end2 && start2 < end1)

**테스트 파일**:

- `src/__tests__/unit/easy.eventOverlap.spec.ts` (중복 감지 로직 단위 테스트)

**구현 상태**: 구현됨

---

## 기능명: 알림 시스템

**목적**: 일정 시작 전 설정된 시간(1분/10분/1시간/2시간/1일 전)에 사용자에게 알림을 표시하여 일정을 놓치지 않도록 한다.

**관련 코드**:

- `src/hooks/useNotifications.ts` (1초마다 upcoming 일정 체크 및 알림 상태 관리)
- `src/utils/notificationUtils.ts` (알림 대상 일정 필터링 및 메시지 생성)
- `src/App.tsx` (알림 패널 렌더링 및 알림된 일정 강조 표시)

**관련 API**: 없음

**내부 의존 모듈**:

- `src/utils/notificationUtils.ts` (알림 시간 계산 및 메시지 포맷팅)

**테스트 파일**:

- `src/__tests__/hooks/medium.useNotifications.spec.ts` (알림 훅 단위 테스트)
- `src/__tests__/unit/easy.notificationUtils.spec.ts` (알림 유틸리티 함수 단위 테스트)

**구현 상태**: 구현됨

---

## 기능명: 공휴일 표시

**목적**: 월간 뷰에서 한국 공휴일을 빨간색으로 표시하여 사용자가 휴일을 쉽게 인지할 수 있도록 한다.

**관련 코드**:

- `src/apis/fetchHolidays.ts` (2025년 한국 공휴일 데이터 반환)
- `src/hooks/useCalendarView.ts` (현재 날짜에 따라 공휴일 데이터 조회)
- `src/App.tsx` (renderMonthView에서 공휴일 표시)

**관련 API**: 없음

**내부 의존 모듈**:

- `src/apis/fetchHolidays.ts` (하드코딩된 공휴일 데이터)

**테스트 파일**:

- `src/__tests__/unit/easy.fetchHolidays.spec.ts` (공휴일 조회 함수 단위 테스트)

**구현 상태**: 구현됨

---

## 기능명: 반복 일정

**목적**: 일간/주간/월간/연간 단위로 반복되는 일정을 설정하여 반복 입력 없이 주기적인 일정을 관리할 수 있도록 한다.

**관련 코드**:

- `src/types.ts` (RepeatInfo, RepeatType 타입 정의됨)
- `src/hooks/useEventForm.ts` (반복 관련 상태 필드 존재)
- `src/App.tsx` (반복 설정 UI는 주석 처리됨)

**관련 API**:

- POST /api/events (반복 정보를 포함한 일정 생성 가능하나 로직 미구현)
- PUT /api/events/:id (반복 정보를 포함한 일정 수정 가능하나 로직 미구현)

**내부 의존 모듈**: 없음

**테스트 파일**: 없음

**구현 상태**: 미구현(예정)

---
