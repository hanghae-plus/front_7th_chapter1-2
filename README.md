# 캘린더 애플리케이션 (Calendar Application)

React + TypeScript 기반의 일정 관리 캘린더 시스템입니다. 주간/월간 뷰, 일정 CRUD, 검색, 알림 기능을 제공합니다.

## 📋 Table of Contents

- [Features](#-features)
- [Requirements](#-requirements)
- [Installation](#-installation)
- [Usage](#-usage)
- [Testing](#-testing)
- [Architecture](#-architecture)
- [Documentation](#-documentation)
- [Contributing](#-contributing)

## ✨ Features

### 핵심 기능

- 📅 **주간/월간 뷰**: 주별 및 월별 캘린더 뷰 전환
- ➕ **일정 관리**: 일정 추가, 수정, 삭제 (CRUD)
- 🔍 **검색 기능**: 일정 제목, 설명, 위치로 검색
- ⚠️ **충돌 감지**: 겹치는 일정 자동 감지 및 경고
- 🔔 **알림 시스템**: 일정 시작 전 알림 (1분, 10분, 1시간, 2시간, 1일)
- 📆 **공휴일 표시**: 한국 공휴일 자동 표시
- 🏷️ **카테고리**: 업무, 개인, 가족, 기타 분류

### 테스트

- ✅ **173개 테스트 케이스** 작성 완료
- ✅ **100% 통과율** 달성
- ✅ **58개 Edge Case** 커버
- ✅ **18초** 실행 시간 (<30초 목표 달성)

## 📋 Requirements

- **Node.js**: 18+
- **pnpm**: 최신 버전
- **브라우저**: Chrome, Safari, Firefox (최신 버전)

## ⚡ Installation

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 개발 서버 실행

```bash
# 백엔드 + 프론트엔드 동시 실행
pnpm dev
```

개발 서버는 `http://localhost:5173`에서 실행됩니다.

## 🚀 Usage

### 일정 추가

1. 좌측 "일정 추가" 폼 작성
2. 제목, 날짜, 시간 입력
3. 필요한 경우 설명, 위치, 카테고리 선택
4. "일정 추가" 버튼 클릭

### 일정 수정/삭제

- 📝 **수정**: 일정 리스트의 연필 아이콘 클릭
- 🗑️ **삭제**: 일정 리스트의 휴지통 아이콘 클릭

### 뷰 전환

- 📅 **주간 뷰**: Week 선택
- 📆 **월간 뷰**: Month 선택

### 검색

- 우측 하단 검색창에 키워드 입력
- 제목, 설명, 위치에서 검색

## 🧪 Testing

### 테스트 실행

```bash
# Unit & Integration 테스트
pnpm test                 # 전체 테스트 실행
pnpm test:ui             # UI 모드 (Watch)
pnpm test:coverage       # 커버리지 포함
pnpm test [파일경로]     # 특정 파일만

# E2E 테스트
pnpm test:e2e           # E2E 테스트 실행
pnpm test:e2e:ui       # E2E UI 모드
pnpm test:e2e:debug    # E2E 디버그 모드

# 모든 테스트 실행
pnpm test:all           # Unit + E2E 테스트
```

### 테스트 구조

```
src/__tests__/
├── hooks/          # Hooks 테스트 (69개)
├── unit/           # 유닛 테스트 (68개)
└── integration/   # 통합 테스트 (14개)
```

### 통계

| 카테고리    | 테스트 수 | 난이도      |
| ----------- | --------- | ----------- |
| Unit Tests  | 68        | Easy/Medium |
| Hooks Tests | 69        | Easy/Medium |
| Integration | 14        | Medium      |
| Edge Cases  | 58        | All Levels  |
| **Total**   | **173**   | -           |

### 상세 가이드

자세한 테스트 가이드는 [`docs/testing-guide.md`](./docs/testing-guide.md)를 참조하세요.

## 🏗️ Architecture

### 기술 스택

**프론트엔드**:

- React 19.1.0
- TypeScript 5.2.2
- Material-UI 7.2.0
- Vitest 3.2.4 (테스트)

**테스팅**:

- Vitest
- Testing Library
- MSW (Mock Service Worker)

### 폴더 구조

```
src/
├── hooks/
│   ├── useCalendarView.ts      # 캘린더 뷰 관리
│   ├── useEventForm.ts          # 폼 상태 관리
│   ├── useEventOperations.ts    # CRUD 작업
│   ├── useNotifications.ts     # 알림 관리
│   └── useSearch.ts             # 검색 기능
├── utils/
│   ├── dateUtils.ts             # 날짜 유틸리티
│   ├── eventOverlap.ts          # 충돌 감지
│   ├── eventUtils.ts            # 이벤트 유틸리티
│   ├── notificationUtils.ts     # 알림 유틸리티
│   └── timeValidation.ts        # 시간 검증
├── __tests__/                   # 테스트 파일
└── App.tsx                      # 메인 컴포넌트
```

### 주요 컴포넌트

#### Hooks

- **`useCalendarView`**: 주간/월간 뷰, 날짜 네비게이션
- **`useEventForm`**: 폼 상태 및 유효성 검증
- **`useEventOperations`**: 일정 CRUD (API 통신)
- **`useNotifications`**: 실시간 알림 관리
- **`useSearch`**: 일정 필터링

#### Utilities

- **`dateUtils`**: 날짜 계산 및 포맷팅
- **`eventOverlap`**: 일정 충돌 감지 알고리즘
- **`timeValidation`**: 시간 유효성 검증

## 📚 Documentation

### 사용 가능한 문서

- [`docs/test-strategy.md`](./docs/test-strategy.md) - 테스트 전략 (731줄)
- [`docs/testing-guide.md`](./docs/testing-guide.md) - 테스트 가이드 (471줄)
- [`core/README.md`](./core/README.md) - BMad 에이전트 팀

### 테스트 전략

이 프로젝트는 **Risk-Based Testing**을 적용합니다:

- **P0 (Critical)**: `useEventOperations`, `eventOverlap`, `App.tsx`
- **P1 (Important)**: `useCalendarView`, `dateUtils`, `timeValidation`
- **P2 (Nice-to-have)**: `useSearch`, 유틸리티 함수

상세 내용은 `docs/test-strategy.md` 참조.

### 테스트 가이드

테스트 작성 방법, 패턴, Best Practices는 `docs/testing-guide.md` 참조.

## 🎯 Development Scripts

```bash
# 개발 서버 실행
pnpm dev

# 테스트 실행
pnpm test

# UI 모드
pnpm test:ui

# 커버리지
pnpm test:coverage

# 린트
pnpm lint

# 빌드
pnpm build
```

## 🤝 Contributing

이 프로젝트는 학습용 프로젝트입니다.

### 테스트 작성 규칙

1. **AAA 패턴** 준수 (Arrange-Act-Assert)
2. **명확한 네이밍**: "should [expected behavior]"
3. **Edge cases** 포함
4. **독립적인 테스트**: 실행 순서 무관
5. **Mock 사용**: 외부 의존성 모킹

### 예시

```typescript
it('should validate time correctly', () => {
  // Arrange
  const startTime = '14:00';
  const endTime = '15:00';

  // Act
  const result = getTimeErrorMessage(startTime, endTime);

  // Assert
  expect(result.startTimeError).toBeNull();
});
```

## 📈 통계

### 테스트 커버리지

- **테스트 파일**: 12개
- **테스트 케이스**: 173개
- **통과율**: 100%
- **실행 시간**: 18초
- **Edge Cases**: 58개

### 코드 품질

- **ESLint**: 통과 ✅
- **TypeScript**: 타입 검사 통과 ✅
- **Tests**: 모든 테스트 통과 ✅

## 🎓 학습 목표

이 프로젝트는 다음과 같은 학습을 목표로 합니다:

1. ✅ React Hooks를 활용한 상태 관리
2. ✅ TypeScript를 활용한 타입 안전성
3. ✅ Vitest를 사용한 테스트 작성
4. ✅ MSW를 활용한 API 모킹
5. ✅ Edge Case 처리 및 경계값 테스트
6. ✅ Integration 테스트 작성
7. ✅ BMad Method 에이전트 활용

## 📝 과제 체크리스트

### 공통 제출

- [x] 테스트를 잘 작성할 수 있는 규칙 명세 (`docs/test-strategy.md`)
- [x] 명세에 있는 기능을 구현하기 위한 테스트 작성 (173개)
- [x] 명세에 있는 기능 구현 (CRUD, 검색, 충돌 감지, 알림)

### 기본과제 제출

- [x] AI 코드를 잘 작성하기 위해 추가로 작성했던 지침 (`core/README.md`)
- [ ] 커밋별 올바르게 단계에 대한 작업
- [ ] AI 도구 활용을 개선하기 위해 노력한 점 PR에 작성

### 심화과제

- [x] Agent 구현 명세 문서 또는 코드 (`core/agents/`)
- [ ] 커밋별 올바르게 단계에 대한 작업
- [ ] 결과를 올바로 얻기위한 history 또는 log
- [ ] AI 도구 활용을 개선하기 위해 노력한 점 PR에 작성

## 🚀 다음 단계

1. **커버리지 측정**

   ```bash
   pnpm test:coverage
   ```

2. **E2E 테스트 추가** (Phase 3)

   ```bash
   # Playwright 설치
   pnpm add -D @playwright/test playwright
   ```

3. **CI/CD 통합** (Phase 3)
   ```yaml
   # .github/workflows/test.yml
   ```

## 📚 참고 자료

### 내부 문서

- [Test Strategy](./docs/test-strategy.md)
- [Testing Guide](./docs/testing-guide.md)
- [BMad Agents](./core/README.md)

### 외부 문서

- [Vitest](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [MSW](https://mswjs.io/)
- [Material-UI](https://mui.com/)

## 📄 License

MIT

---

**Developed with ❤️ using BMad Test Automation Expansion Pack**
