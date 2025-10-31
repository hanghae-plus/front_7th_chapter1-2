---
**문서 유형**: [HUMAN]  
**목적**: 사용 기술 스택 상세 정보  
**주요 내용**: 프레임워크, 라이브러리, 도구, 의존성 목록 및 선택 이유  
**관련 문서**: [architecture-guidelines.md](./architecture-guidelines.md)  
**최종 수정일**: 2025-10-29
---

# 기술 스택

## 프론트엔드 프레임워크

### React

**버전**: v18+

**역할**: UI 라이브러리

**사용 이유**:

- 컴포넌트 기반 아키텍처
- 가상 DOM으로 효율적인 렌더링
- 풍부한 생태계

**핵심 기능 사용**:

- 함수형 컴포넌트
- Hooks (useState, useEffect, useMemo, useCallback)
- 커스텀 훅

---

### TypeScript

**역할**: 타입 시스템 및 정적 분석

**사용 이유**:

- 컴파일 타임 타입 검사
- IDE 자동완성 지원
- 리팩토링 안정성

**설정**:

- Strict mode 활성화
- 명시적 타입 정의 우선
- any 타입 사용 금지

---

## UI 라이브러리

### Material-UI (MUI)

**버전**: v5+

**역할**: 디자인 시스템 및 컴포넌트 라이브러리

**사용 이유**:

- Google Material Design 기반
- 즉시 사용 가능한 컴포넌트
- 접근성 내장
- 반응형 디자인 지원

**사용 컴포넌트**:

- Layout: Box, Stack, Grid
- Form: TextField, Select, Checkbox, Button
- Display: Table, Dialog, Alert, Typography
- Navigation: IconButton
- Feedback: Tooltip

**스타일링 방법**:

- `sx` prop 사용 (인라인 스타일링)
- Theme 커스터마이징 가능

---

### MUI Icons

**역할**: 아이콘 세트

**사용 아이콘**:

- Notifications: 알림 표시
- ChevronLeft/ChevronRight: 네비게이션
- Edit: 일정 수정
- Delete: 일정 삭제
- Close: 닫기

---

## 상태 관리

### React Hooks

**역할**: 상태 관리 및 부수 효과 처리

**사용 Hooks**:

- `useState`: 로컬 상태 관리
- `useEffect`: 부수 효과 (API 호출, 이벤트 리스너, 타이머)
- `useMemo`: 계산 비용이 큰 값 메모이제이션
- `useCallback`: 함수 메모이제이션 (최적화)

**커스텀 훅**:

- `useCalendarView`: 캘린더 뷰 상태
- `useEventForm`: 폼 상태
- `useEventOperations`: 일정 CRUD
- `useNotifications`: 알림 시스템
- `useSearch`: 검색 및 필터링

**전역 상태 관리**:

- 현재 사용하지 않음 (Context API, Redux 등 미사용)
- 커스텀 훅으로 충분히 관리 가능한 규모

---

## 알림 시스템

### notistack

**역할**: 토스트 알림 라이브러리

**사용 이유**:

- MUI와 완벽 호환
- 다중 알림 스택 관리
- 커스터마이징 가능

**사용 API**:

- `enqueueSnackbar`: 알림 표시
- `variant`: success, error, info, warning

**사용 위치**:

- API 성공/실패 알림
- 폼 유효성 검사 에러
- 일정 추가/수정/삭제 완료 메시지

---

## 빌드 도구

### Vite

**역할**: 빌드 도구 및 개발 서버

**사용 이유**:

- 빠른 개발 서버 시작
- HMR (Hot Module Replacement)
- ES Module 네이티브 지원
- 최적화된 프로덕션 빌드

**설정 파일**: `vite.config.ts`

---

## 테스트 도구

### Vitest

**역할**: 테스트 프레임워크

**사용 이유**:

- Vite 기반으로 빠른 실행
- Jest 호환 API
- ES Module 지원

**사용 API**:

- `describe`, `it`, `expect`
- `beforeEach`, `afterEach`
- `vi.fn()`: 모킹

---

### Testing Library

**패키지**: `@testing-library/react`, `@testing-library/user-event`

**역할**: React 컴포넌트 테스트 유틸리티

**사용 이유**:

- 사용자 관점 테스트
- 접근성 중심 쿼리
- React 베스트 프랙티스 강제

**사용 API**:

- `render`: 컴포넌트 렌더링
- `renderHook`: 커스텀 훅 테스트
- `screen`: 쿼리 접근
- `fireEvent`: 이벤트 트리거
- `waitFor`: 비동기 대기
- `act`: 상태 업데이트 래핑

---

### MSW (Mock Service Worker)

**버전**: v2+

**역할**: API 모킹

**사용 이유**:

- 네트워크 레벨 모킹
- 실제 fetch 호출 인터셉트
- 브라우저/Node 환경 모두 지원

**설정**:

- `src/__mocks__/handlers.ts`: API 핸들러 정의
- `src/setupTests.ts`: MSW 서버 설정

**모킹 API**:

- GET /api/events
- POST /api/events
- PUT /api/events/:id
- DELETE /api/events/:id

---

## 코드 품질

### ESLint

**역할**: 정적 분석 및 코드 스타일 검사

**설정 파일**: `eslint.config.js`

**사용 이유**:

- 코드 일관성 유지
- 잠재적 버그 사전 발견
- 베스트 프랙티스 강제

---

### TypeScript Strict Mode

**역할**: 엄격한 타입 검사

**활성화된 옵션**:

- `noImplicitAny`: 암묵적 any 금지
- `strictNullChecks`: null/undefined 체크
- `strictFunctionTypes`: 함수 타입 엄격 검사
- `noImplicitThis`: this 타입 명시 강제

---

## 패키지 매니저

### pnpm

**역할**: 의존성 관리

**사용 이유**:

- 디스크 공간 효율적
- 빠른 설치 속도
- 엄격한 의존성 관리 (Phantom dependencies 방지)

**주요 명령어**:

- `pnpm install`: 의존성 설치
- `pnpm dev`: 개발 서버 실행
- `pnpm build`: 프로덕션 빌드
- `pnpm test`: 테스트 실행

---

## 의존성 목록

### 프로덕션 의존성 (dependencies)

```json
{
  "react": "^18.x",
  "react-dom": "^18.x",
  "@mui/material": "^5.x",
  "@mui/icons-material": "^5.x",
  "@emotion/react": "^11.x",
  "@emotion/styled": "^11.x",
  "notistack": "^3.x"
}
```

### 개발 의존성 (devDependencies)

```json
{
  "vite": "^5.x",
  "typescript": "^5.x",
  "vitest": "^1.x",
  "@testing-library/react": "^14.x",
  "@testing-library/user-event": "^14.x",
  "msw": "^2.x",
  "eslint": "^8.x",
  "@typescript-eslint/parser": "^6.x",
  "@typescript-eslint/eslint-plugin": "^6.x"
}
```

---

## 브라우저 지원

### 타겟 브라우저

- Chrome (최신 2개 버전)
- Firefox (최신 2개 버전)
- Safari (최신 2개 버전)
- Edge (최신 2개 버전)

### 최소 요구사항

- ES2020 지원
- ES Module 지원
- Service Worker 지원 (MSW)

---

## 개발 서버

### Vite Dev Server

**포트**: 기본 5173

**특징**:

- HMR (Hot Module Replacement)
- ES Module 네이티브 지원
- 빠른 시작 시간

### API Mock Server

**파일**: `server.js`

**역할**: 로컬 개발용 API 모킹 서버

**포트**: /api 경로로 프록시

---

## 향후 도입 검토 기술

### 상태 관리

- Zustand / Jotai (전역 상태 필요 시)

### 라우팅

- React Router (다중 페이지 전환 시)

### 폼 관리

- React Hook Form (복잡한 폼 검증 시)

### 날짜 라이브러리

- date-fns / dayjs (현재는 네이티브 Date 사용)

### 스타일링

- CSS-in-JS 대안 (성능 최적화 필요 시)

### API 클라이언트

- Axios / TanStack Query (복잡한 API 관리 시)
