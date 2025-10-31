# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React + TypeScript 기반 캘린더 일정 관리 애플리케이션. 일정 CRUD, 검색, 알림, 겹침 감지 등의 기능을 제공합니다.

## Development Commands

### Running the Application
```bash
pnpm dev              # Start both backend server (watch mode) and frontend dev server
pnpm server           # Run backend server only
pnpm server:watch     # Run backend server with watch mode
pnpm start            # Start frontend dev server only
```

### Testing
```bash
pnpm test             # Run tests in watch mode
pnpm test:ui          # Run tests with Vitest UI
pnpm test:coverage    # Generate test coverage report (outputs to .coverage/)
```

### Building and Linting
```bash
pnpm build            # TypeScript compile + Vite build
pnpm lint             # Run ESLint and TypeScript checks
pnpm lint:eslint      # Run ESLint only
pnpm lint:tsc         # Run TypeScript compiler checks only
```

## Architecture

### Separation of Concerns

**Custom Hooks** (상태 관리 및 부수 효과):
- `useEventForm` - 폼 상태 및 유효성 검사
- `useEventOperations` - API 통신 (CRUD)
- `useCalendarView` - 달력 뷰 상태 관리 (week/month)
- `useNotifications` - 알림 생성 및 관리
- `useSearch` - 검색 및 필터링

**Utils** (순수 함수만):
- `dateUtils` - 날짜 포맷팅 및 계산
- `eventUtils` - 이벤트 관련 유틸리티
- `eventOverlap` - 일정 겹침 감지
- `timeValidation` - 시간 유효성 검사
- `notificationUtils` - 알림 메시지 생성

모든 utils는 외부 상태에 의존하지 않고 동일한 입력에 동일한 출력을 반환하는 순수 함수로 작성되어야 합니다.

### Backend API Server

Express 서버가 `server.js`에서 실행되며 JSON 파일을 데이터베이스로 사용:
- `src/__mocks__/response/realEvents.json` - 실제 데이터
- `src/__mocks__/response/e2e.json` - E2E 테스트용 (TEST_ENV=e2e)

### API Endpoints

**Single Event Operations:**
- GET `/api/events` - 전체 조회
- POST `/api/events` - 생성 (id는 서버에서 자동 생성)
- PUT `/api/events/:id` - 수정
- DELETE `/api/events/:id` - 삭제

**Batch Operations (반복 일정용, 8주차 과제):**
- POST `/api/events-list` - 여러 일정 일괄 생성
- PUT `/api/events-list` - 여러 일정 일괄 수정
- DELETE `/api/events-list` - 여러 일정 일괄 삭제
- PUT `/api/recurring-events/:repeatId` - 반복 시리즈 수정
- DELETE `/api/recurring-events/:repeatId` - 반복 시리즈 삭제

### Type System

**EventForm vs Event 구분:**
```typescript
EventForm  // 폼 입력용 (id 없음)
Event      // 저장된 데이터 (id 포함, extends EventForm)
```

**RepeatInfo:** 반복 일정 정보 (현재 주석 처리됨, 8주차 과제 예정)

## Code Conventions

### Import Order (필수)
1. External libraries (알파벳 순)
2. Internal modules (parent/sibling)
- 그룹 간 빈 줄 삽입

### Naming Conventions
- 파일명: camelCase (`dateUtils.ts`)
- 컴포넌트: PascalCase (`App.tsx`)
- 테스트: `easy.*.spec.ts`, `medium.*.spec.ts`, `task.*.spec.ts`
- 함수: 동사+명사 (`getWeekDates`, `formatDate`)
- Boolean: `is`/`has` prefix (`isOverlapping`, `hasError`)
- 이벤트 핸들러: `handle` prefix (`handleStartTimeChange`)

### Code Style
- Single quotes
- 세미콜론 필수
- Print width: 100
- Tab width: 2 (spaces)

## Testing

### Test File Naming
- `easy.*.spec.ts` - 단순 로직 (utils, 기본 hooks) - 기존 파일
- `medium.*.spec.ts` - 복잡한 로직 (API 통신, 통합 테스트) - 기존 파일
- `task.*.spec.ts` - 새로 생성하는 테스트 파일

### Testing Tools
- Vitest + @testing-library/react
- MSW (Mock Service Worker) - API 모킹
- Mock handlers: `src/__mocks__/handlers.ts`
- Mock data: `src/__mocks__/response/*.json`

### Testing Structure
GWT 패턴 (Given-When-Then) 사용:
```typescript
describe('그룹명', () => {
  it('명확한 한글 설명으로 작성', () => {
    // Given - 준비 (테스트 데이터 및 환경 설정)
    // When - 실행 (테스트할 동작 수행)
    // Then - 검증 (결과 확인)
  });
});
```

## UI/UX Guidelines

### Layout Structure
```
왼쪽(20%) - 일정 추가/수정 폼
중앙(flex:1) - 달력 뷰 (Week/Month)
오른쪽(30%) - 일정 목록 (검색 가능)
```

### Material-UI Usage
- `Box`, `Stack`으로 레이아웃 구성
- `sx` prop으로 스타일링
- 접근성 속성 필수: `aria-label`, `data-testid`
- 한글 aria-label 허용

### Error Handling
- Early return 패턴 사용
- notistack의 `enqueueSnackbar`로 사용자 피드백
- 에러 메시지는 한글로 작성
- Try-catch로 API 에러 핸들링

## Important Notes

1. **반복 일정 기능은 구현하지 말 것**: 현재 주석 처리되어 있으며 8주차 과제 예정
2. **App.tsx가 661줄로 크므로**: 컴포넌트 분리 고려 가능 (하지만 명시적 요청 전까지 유지)
3. **전역 상태 관리 라이브러리 없음**: 로컬 state + custom hooks로 충분
4. **Vite proxy 설정**: `/api` 요청은 `http://localhost:3000`으로 프록시됨
5. **공휴일 API**: `src/apis/fetchHolidays.ts`에 하드코딩된 데이터 사용 중

## Key Files Reference

- `src/types.ts` - 전역 타입 정의
- `src/App.tsx` - 메인 애플리케이션 (661줄)
- `src/hooks/useEventOperations.ts` - API 통신 패턴 참고
- `src/utils/dateUtils.ts` - 순수 함수 예시
- `vite.config.ts` - Vite + Vitest 설정
- `server.js` - Express 백엔드 서버
