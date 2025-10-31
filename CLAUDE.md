# CLAUDE.md

이 파일은 이 저장소의 코드를 작업할 때 Claude Code (claude.ai/code)에게 가이드를 제공합니다.

## 테스트 코드 작성 전 반드시 참고

- **server.js** : Express 기반의 개발용 로컬 API 서버. 이벤트 CRUD(생성/조회/수정/삭제), 반복 이벤트 관리, 다중 이벤트 처리 등의 엔드포인트를 제공합니다. `TEST_ENV` 환경변수에 따라 `e2e.json` 또는 `realEvents.json`을 데이터베이스로 사용합니다.

- **src/**mocks**/handlers.ts** : MSW(Mock Service Worker)의 기본 HTTP 핸들러를 정의합니다. 단위 테스트에서 실제 API 호출을 가로채고 모킹된 응답을 반환하기 위한 핸들러들을 포함합니다.

- **src/**mocks**/handlerUtils.ts** : 통합 테스트에서 사용하는 MSW 핸들러 유틸리티 함수들을 제공합니다. 각 테스트 시나리오에 맞는 동적 모킹 핸들러를 설정할 수 있습니다.
<!-- @ -->
- **src/setupTests.ts** : Vitest 테스트 환경의 전역 설정 파일입니다. MSW 서버 초기화, 타임존 설정(UTC), Fake Timer 설정, 테스트 전후 훅(`beforeAll`, `beforeEach`, `afterEach`, `afterAll`)을 관리합니다. 모든 테스트가 일관된 환경에서 실행되도록 보장합니다.

- **src/**tests\*\*\*\* : 테스트 파일들이 위치한 디렉토리입니다. `hooks/` (커스텀 훅 테스트), `unit/` (유틸리티 함수 단위 테스트), 그리고 `medium.integration.spec.tsx` (통합 테스트)로 구조화되어 있습니다. `utils.ts`는 테스트에서 공통으로 사용하는 헬퍼 함수들을 포함합니다.

- **Select 컴포넌트 접근 예시**

```jsx
await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
await user.click(screen.getByRole('option', { name: `${category}-option` }));
```

## 프로젝트 개요

반복 이벤트 기능을 갖춘 React 기반 캘린더 애플리케이션입니다. AI 지원을 통한 테스트 주도 개발(TDD) 실습에 초점을 프로젝트 입니다.

## 개발 명령어

### 애플리케이션 실행

```bash
pnpm dev              # API 백엔드(포트 3000)와 Vite(기본 포트)가 포함된 개발 서버 시작
pnpm start            # Vite 개발 서버만 실행
pnpm server           # API 서버만 실행
pnpm server:watch     # 자동 재시작 기능이 있는 API 서버
```

### 테스트

```bash
pnpm test             # watch 모드로 테스트 실행
pnpm test:ui          # Vitest UI로 테스트 실행
pnpm test:coverage    # 커버리지 리포트 생성 (.coverage/에 출력)
```

### 린팅 및 타입 체킹

```bash
pnpm lint             # ESLint와 TypeScript 검사 모두 실행
pnpm lint:eslint      # ESLint만 실행
pnpm lint:tsc         # TypeScript 타입 체킹만 실행
```

### 빌드

```bash
pnpm build            # TypeScript 컴파일 + Vite 빌드
```

## 아키텍처

### 핵심 데이터 모델

애플리케이션은 `Event`와 `EventForm` 타입을 중심으로 구성됩니다 (src/types.ts):

- **RepeatInfo**: 반복 이벤트 동작 정의 (type, interval, endDate)
- **RepeatType**: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'
- **EventForm**: 이벤트 생성/편집을 위한 사용자 입력 형태
- **Event**: id를 가진 영속화된 이벤트

### 컴포넌트 구조

**모놀리식 App 컴포넌트** (src/App.tsx):

- 관심사 분리를 위해 커스텀 훅을 사용하는 단일 파일 컴포넌트
- 모든 UI 렌더링이 하나의 파일에 있음
- 로직은 훅으로 추출됨

### 커스텀 훅 패턴

모든 비즈니스 로직은 src/hooks/에 구성되어 있습니다:

- `useCalendarView.ts` - 월/주 뷰 상태 및 탐색
- `useEventForm.ts` - 이벤트 생성/편집 폼 상태 (3347줄)
- `useEventOperations.ts` - 이벤트 CRUD 작업 (2465줄)
- `useNotifications.ts` - 알림 스케줄링 및 표시
- `useSearch.ts` - 이벤트 검색 기능

### 유틸리티 모듈

src/utils/에서 도메인별로 구성됨:

- `dateUtils.ts` - 날짜 포맷팅, 주/월 계산, 날짜별 이벤트 필터링
- `eventUtils.ts` - 이벤트 조작 (업데이트, 삭제)
- `eventOverlap.ts` - 겹치는 이벤트 감지
- `timeValidation.ts` - 시간 범위 검증
- `notificationUtils.ts` - 알림 로직

### API 레이어

- **백엔드**: 포트 3000의 Express 서버 (server.js)
- **데이터베이스**: JSON 파일 (개발용 src/**mocks**/response/realEvents.json, E2E 테스트용 e2e.json)
- **클라이언트**: 공휴일 데이터를 위한 src/apis/fetchHolidays.ts

### 테스트 인프라

**테스트 설정** (src/setupTests.ts):

- API 모킹을 위한 MSW (Mock Service Worker) 서버
- UTC 타임존의 가짜 타이머
- 일관된 날짜 테스트를 위해 시스템 시간을 '2025-10-01'로 고정
- beforeEach에서 `expect.hasAssertions()` 강제 적용

**테스트 구성**:

- 단위 테스트: src/**tests**/unit/easy.\*.spec.ts
- 통합 테스트: src/**tests**/medium.integration.spec.tsx
- 훅 테스트: src/**tests**/hooks/
- 테스트 유틸리티: src/**tests**/utils.ts
- MSW 핸들러: src/**mocks**/handlers.ts, handlersUtils.ts

**주요 테스트 패턴**:

- 모든 테스트는 가짜 타이머와 고정된 시스템 시간 사용
- MSW가 서버로의 API 호출 가로채기
- TEST_ENV 환경 변수에 따라 데이터베이스 전환

## 특별한 프로젝트 컨텍스트

### TDD 에이전트 시스템

이 프로젝트는 .claude/agents/에 정의된 커스텀 Claude Code 에이전트를 사용합니다:

- **spec-analyzer**: 요구사항 분석 및 엣지 케이스 식별
- 에이전트 출력은 docs/outputs/에 저장됨

### 반복 이벤트 엣지 케이스

.claude/spec/SPEC_1.md 요구사항에서:

1. **31일에 월간 반복**: 31일이 있는 달에만 생성 (2월, 4월, 6월, 9월, 11월은 건너뜀)
2. **2월 29일에 연간 반복**: 윤년에만 생성
3. **종료 날짜**: 최대 2025-12-31
4. **겹침 검사 없음**: 반복 이벤트는 겹침 검증하지 않음
5. **단일 vs 전체 수정**: 반복 이벤트 편집 시, 사용자가 하나의 인스턴스만 수정할지 모든 인스턴스를 수정할지 선택
6. **단일 vs 전체 삭제**: 반복 이벤트 삭제 시, 사용자가 하나의 인스턴스만 삭제할지 모든 인스턴스를 삭제할지 선택

### 파일 경로 프로토콜

에이전트 출력은 한글 인코딩 문제를 피하기 위해 블록쿼트 메타데이터 형식을 사용합니다 (YAML frontmatter 아님):

```markdown
> **메타데이터**
>
> - Agent: agent-name
> - Status: success | failed
> - Timestamp: ISO-8601
```

## 개발 노트

- **React 19**: 최신 React 버전 사용 (19.1.0)
- **Material-UI**: UI 컴포넌트 라이브러리 (@mui/material 7.2.0)
- **상태 관리**: React 훅만 사용 (Redux/Zustand 없음)
- **스타일링**: Emotion (@emotion/react, @emotion/styled)
- **알림**: 토스트 알림을 위한 notistack
- **애니메이션**: UI 애니메이션을 위한 framer-motion

## Vite 설정

API 프록시 구성됨 (vite.config.ts): `/api/*` → `http://localhost:3000`

이를 통해 프론트엔드에서 `/api/events`를 호출하면 Express 서버로 프록시됩니다.
