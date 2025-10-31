---
**문서 유형**: [AI/HUMAN]  
**목적**: 아키텍처 철학 및 개발 가이드라인  
**주요 내용**: 레이어 구조, 설계 원칙, 명명 규칙, 코딩 컨벤션  
**관련 문서**: [test-strategy.md](./test-strategy.md), [tech-stack.md](./tech-stack.md)  
**최종 수정일**: 2025-10-29
---

# 아키텍처 가이드라인

## 아키텍처 레이어

### 1. 프레젠테이션 레이어 (Presentation Layer)

- **역할**: UI 렌더링 및 사용자 인터랙션 처리
- **특징**: React 함수형 컴포넌트로 구성, Material-UI 사용
- **구성**: 일정 입력 폼, 캘린더 그리드(월간/주간), 일정 목록, 다이얼로그, 알림 패널

### 2. 상태 관리 레이어 (State Management Layer)

- **역할**: 비즈니스 로직 및 애플리케이션 상태 관리
- **특징**: 커스텀 훅으로 관심사 분리, React Hooks(useState, useEffect, useMemo) 활용
- **구성**: 캘린더 뷰 관리, 일정 CRUD, 폼 상태, 검색/필터링, 알림 시스템

### 3. 유틸리티 레이어 (Utility Layer)

- **역할**: 순수 함수로 구성된 재사용 가능한 공통 로직
- **특징**: 부수 효과 없음, 테스트 용이성 높음
- **구성**: 날짜 계산, 시간 유효성 검사, 일정 검색/필터링, 중복 감지, 알림 메시지 생성

### 4. API 레이어 (API Layer)

- **역할**: 외부 데이터 소스와의 통신
- **특징**: REST API 호출, 공휴일 데이터 제공
- **구성**: 일정 CRUD API, 공휴일 데이터 조회

### 5. 타입 정의 레이어 (Type Definition Layer)

- **역할**: 애플리케이션 전역 타입 시스템 정의
- **특징**: TypeScript 타입 안전성 보장
- **구성**: Event, EventForm, RepeatInfo, RepeatType 등

### 6. 테스트 레이어 (Test Layer)

- **역할**: 코드 품질 보장 및 회귀 방지
- **특징**: 단위/통합 테스트로 구성, MSW로 API 모킹
- **구성**: 유틸리티 단위 테스트, 훅 테스트, 통합 테스트

## 데이터 흐름

```
사용자 인터랙션
    ↓
프레젠테이션 레이어 (컴포넌트)
    ↓
상태 관리 레이어 (커스텀 훅)
    ↓
유틸리티 레이어 (순수 함수)
    ↓
API 레이어 (fetch 호출)
    ↓
상태 업데이트 (useState)
    ↓
UI 리렌더링 (React)
```

## 설계 원칙

### 1. 관심사의 분리 (Separation of Concerns)

- UI, 비즈니스 로직, 유틸리티를 명확히 분리
- 각 레이어는 독립적으로 개발 및 테스트 가능
- 컴포넌트는 UI에만 집중, 로직은 훅으로 분리

### 2. 단일 책임 원칙 (Single Responsibility Principle)

- 각 파일과 함수는 하나의 명확한 책임만 가짐
- 유틸리티 함수는 순수 함수로 작성
- 훅은 특정 도메인 로직만 담당

### 3. 재사용성 (Reusability)

- 커스텀 훅으로 로직 재사용
- 유틸리티 함수로 공통 로직 추출
- 타입 정의를 통한 인터페이스 통일

### 4. 타입 안정성 (Type Safety)

- TypeScript로 모든 코드 작성
- 명시적 타입 정의로 런타임 에러 방지
- any 타입 사용 금지

### 5. 테스트 가능성 (Testability)

- 순수 함수 우선 설계
- 의존성 주입으로 테스트 용이성 확보
- 단위 테스트와 통합 테스트 조합

> **참고**: 상세한 테스트 전략은 [test-strategy.md](./test-strategy.md) 참조

## 명명 규칙

### 파일명

- **컴포넌트**: PascalCase (예: App.tsx)
- **훅**: camelCase with `use` prefix (예: useCalendarView.ts)
- **유틸리티**: camelCase (예: dateUtils.ts)
- **타입**: camelCase (예: types.ts)
- **테스트**: 난이도 prefix + 대상 + `.spec.ts/tsx` (예: easy.dateUtils.spec.ts)

### 변수/함수명

- **변수**: camelCase (예: currentDate, searchTerm)
- **함수**: camelCase, 동사로 시작 (예: getWeekDates, formatMonth)
- **상수**: UPPER_SNAKE_CASE (예: HOLIDAY_RECORD)
- **타입/인터페이스**: PascalCase (예: Event, EventForm)
- **boolean 변수**: is/has prefix (예: isRepeating, hasError)

### 훅 명명 규칙

- 항상 `use`로 시작
- 훅의 목적을 명확히 표현 (예: useEventOperations, useNotifications)

> **참고**: 기술 스택 상세 정보는 [tech-stack.md](./tech-stack.md) 참조

## 코딩 컨벤션

### TypeScript

- Strict mode 활성화
- 명시적 타입 정의 우선
- any 타입 사용 금지
- 인터페이스보다 타입 별칭 선호 (일관성 있게 사용)

### React

- 함수형 컴포넌트 사용
- Hooks 사용 권장
- Props drilling 최소화
- 컴포넌트 분리를 통한 재사용성 확보

### 스타일링

- Material-UI의 `sx` prop 사용
- 인라인 스타일링 선호
- 반응형 디자인 고려

### 에러 처리

- API 호출은 try-catch로 래핑
- 에러 발생 시 사용자에게 알림 표시 (notistack)
- 콘솔 에러 로깅

### 접근성

- aria-label 속성 사용
- 시맨틱 HTML 사용
- 키보드 네비게이션 지원
