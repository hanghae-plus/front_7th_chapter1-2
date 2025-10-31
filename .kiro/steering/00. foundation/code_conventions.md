---
alwaysApply: true
---

# Code Convention Rule

## 목적
- 코드 작성 시 일관된 스타일을 유지하고 리뷰 부담을 줄인다.
- 자동화 도구와 충돌 없이 AI가 코드를 생성할 수 있도록 기준을 명확히 한다.
- **Cursor를 포함한 모든 코드 생성 에이전트는 본 규칙을 절대 준수해야 하며, 위반이 예상되면 코드를 생성하지 말고 수정안을 제시해야 한다.**

## 일반 원칙
- ECMAScript 2020 이상, TypeScript 5 기반 프로젝트를 기본 대상으로 한다.
- 모든 코드 변경은 테스트 우선(TDD) 흐름을 방해하지 않아야 하며, 테스트 없는 기능 추가를 금지한다.
- 불필요한 주석, console.log, 디버깅 코드는 금지한다.
- 명시된 규칙을 따를 수 없는 상황이 발생하면 즉시 보고하고 대체안을 제안한다.

## 프레임워크 및 라이브러리 버전
- React 19.1.0 / React DOM 19.1.0
- TypeScript ^5.2.2 (strict)
- Vite ^7.0.2 + `@vitejs/plugin-react-swc`
- Material UI 7.2.0 (`@mui/material`, `@mui/icons-material`)
- Emotion 11.11.x (`@emotion/react`, `@emotion/styled`)
- Vitest ^3.2.4 (테스트 러너) / Testing Library 16.x
- Express ^4.19.2 (백엔드 프록시)
- MSW ^2.10.3, Framer Motion ^12.23.0, Notistack ^3.0.2
- 위 버전과 호환되지 않는 API 사용 시 반드시 버전 업 또는 다운그레이드 계획을 사전에 명시한다.

## 스타일 가이드
1. **언어별 규칙**
   - TypeScript: `strict` 모드 전제, 모든 함수와 변수는 명시적 타입 또는 타입 추론이 가능한 타입 가드 사용.
   - React: 함수형 컴포넌트 사용, `useEffect` 의존성 배열 엄격 관리, 상태는 가능한 한 로컬 범위에서 관리. 전역 상태/환경 공유가 필요하면 프로젝트 표준 커스텀 훅 `useContext7`(없을 경우 `src/hooks/useContext7.ts` 로 추가 후 사용)을 통해 Context 를 소비하며, `useContext` 직접 호출은 지양한다.
   - Node 서버: 비동기 함수는 `async/await` 사용, 오류는 `try/catch` 또는 오류 핸들러로 전파.
2. **명명 규칙**
   - 파일: React 컴포넌트는 `PascalCase.tsx`, 공용 유틸은 `camelCase.ts`.
   - 상수: 전역 상수는 `UPPER_SNAKE_CASE`, 함수 스코프 상수는 `camelCase`.
   - 테스트: 테스트 파일은 `<module>.spec.ts`.
3. **포맷팅**
   - Prettier 기본 설정(2 space, single quote false 유지, trailing comma: es5)을 따른다. 자체 포맷 명령 없이 규칙만 준수.
   - Import 순서는 외부 라이브러리 → 내부 절대 경로 → 상대 경로. 그룹 간 한 줄 비우고, 그룹 내 알파벳 순.
4. **주석**
   - 필수 주석만 유지. 복잡한 알고리즘, 외부 의존성, 비자명한 비즈니스 규칙 외에는 주석 사용 금지.
   - TODO 주석은 추적 가능한 이슈 ID와 함께 작성: `// TODO(#123): ...`.
5. **테스트 배치**
   - 모든 테스트 파일은 `src/__tests__` 하위에 저장한다. 기능 또는 TDD 단계(예: `src/__tests__/red`, `src/__tests__/green`) 별로 폴더를 신설하거나 기존 폴더를 재사용해 목적을 명확히 한다.
   - 단위 테스트는 `<feature>/unit/<name>.spec.ts`, 통합 테스트는 `<feature>/integration/<name>.spec.ts` 와 같이 하위 폴더 이름으로 책임을 구분한다.
   - 테스트에서 사용할 목/픽스처는 같은 폴더의 `__mocks__` 또는 `fixtures` 서브폴더에 둔다.

## 품질 기준
- 함수는 단일 책임 원칙에 따라 30줄 이내 유지. 필요하면 분리.
- 오류 처리는 사용자/호출자에게 의미 있는 메시지와 함께 전달.
- DOM 접근, 데이터 요청 등 부작용을 가진 코드는 테스트가 감시할 수 있는 추상화로 감싼다.

## 금지 패턴
- any 타입 사용, 강제 캐스팅(`as unknown as`) 남용.
- Promise 체이닝에 then/catch 혼용 → `async/await` 로 대체.
- 하드코딩 비밀값, 환경 변수 직접 문자열 사용.

## self-check
- 생성한 코드가 ESLint/TypeScript 컴파일에 통과한다고 가정되는지 확인한다.
- 테스트는 `pnpm test` 또는 명시된 명령으로 실행 가능한 형태인지 검증한다.
- 새로운 규칙이나 예외가 필요하면 wrap-up 단계에 전달한다.
# Code Convention Rule

## 목적
- 코드 작성 시 일관된 스타일을 유지하고 리뷰 부담을 줄인다.
- 자동화 도구와 충돌 없이 AI가 코드를 생성할 수 있도록 기준을 명확히 한다.
- **Cursor를 포함한 모든 코드 생성 에이전트는 본 규칙을 절대 준수해야 하며, 위반이 예상되면 코드를 생성하지 말고 수정안을 제시해야 한다.**

## 일반 원칙
- ECMAScript 2020 이상, TypeScript 5 기반 프로젝트를 기본 대상으로 한다.
- 모든 코드 변경은 테스트 우선(TDD) 흐름을 방해하지 않아야 하며, 테스트 없는 기능 추가를 금지한다.
- 불필요한 주석, console.log, 디버깅 코드는 금지한다.
- 명시된 규칙을 따를 수 없는 상황이 발생하면 즉시 보고하고 대체안을 제안한다.

## 프레임워크 및 라이브러리 버전
- React 19.1.0 / React DOM 19.1.0
- TypeScript ^5.2.2 (strict)
- Vite ^7.0.2 + `@vitejs/plugin-react-swc`
- Material UI 7.2.0 (`@mui/material`, `@mui/icons-material`)
- Emotion 11.11.x (`@emotion/react`, `@emotion/styled`)
- Vitest ^3.2.4 (테스트 러너) / Testing Library 16.x
- Express ^4.19.2 (백엔드 프록시)
- MSW ^2.10.3, Framer Motion ^12.23.0, Notistack ^3.0.2
- 위 버전과 호환되지 않는 API 사용 시 반드시 버전 업 또는 다운그레이드 계획을 사전에 명시한다.

## 스타일 가이드
1. **언어별 규칙**
   - TypeScript: `strict` 모드 전제, 모든 함수와 변수는 명시적 타입 또는 타입 추론이 가능한 타입 가드 사용.
   - React: 함수형 컴포넌트 사용, `useEffect` 의존성 배열 엄격 관리, 상태는 가능한 한 로컬 범위에서 관리. 전역 상태/환경 공유가 필요하면 프로젝트 표준 커스텀 훅 `useContext7`(없을 경우 `src/hooks/useContext7.ts` 로 추가 후 사용)을 통해 Context 를 소비하며, `useContext` 직접 호출은 지양한다.
   - Node 서버: 비동기 함수는 `async/await` 사용, 오류는 `try/catch` 또는 오류 핸들러로 전파.
2. **명명 규칙**
   - 파일: React 컴포넌트는 `PascalCase.tsx`, 공용 유틸은 `camelCase.ts`.
   - 상수: 전역 상수는 `UPPER_SNAKE_CASE`, 함수 스코프 상수는 `camelCase`.
   - 테스트: 테스트 파일은 `<module>.spec.ts`.
3. **포맷팅**
   - Prettier 기본 설정(2 space, single quote false 유지, trailing comma: es5)을 따른다. 자체 포맷 명령 없이 규칙만 준수.
   - Import 순서는 외부 라이브러리 → 내부 절대 경로 → 상대 경로. 그룹 간 한 줄 비우고, 그룹 내 알파벳 순.
4. **주석**
   - 필수 주석만 유지. 복잡한 알고리즘, 외부 의존성, 비자명한 비즈니스 규칙 외에는 주석 사용 금지.
   - TODO 주석은 추적 가능한 이슈 ID와 함께 작성: `// TODO(#123): ...`.
5. **테스트 배치**
   - 모든 테스트 파일은 `src/__tests__` 하위에 저장한다. 기능 또는 TDD 단계(예: `src/__tests__/red`, `src/__tests__/green`) 별로 폴더를 신설하거나 기존 폴더를 재사용해 목적을 명확히 한다.
   - 단위 테스트는 `<feature>/unit/<name>.spec.ts`, 통합 테스트는 `<feature>/integration/<name>.spec.ts` 와 같이 하위 폴더 이름으로 책임을 구분한다.
   - 테스트에서 사용할 목/픽스처는 같은 폴더의 `__mocks__` 또는 `fixtures` 서브폴더에 둔다.

## 품질 기준
- 함수는 단일 책임 원칙에 따라 30줄 이내 유지. 필요하면 분리.
- 오류 처리는 사용자/호출자에게 의미 있는 메시지와 함께 전달.
- DOM 접근, 데이터 요청 등 부작용을 가진 코드는 테스트가 감시할 수 있는 추상화로 감싼다.

## 금지 패턴
- any 타입 사용, 강제 캐스팅(`as unknown as`) 남용.
- Promise 체이닝에 then/catch 혼용 → `async/await` 로 대체.
- 하드코딩 비밀값, 환경 변수 직접 문자열 사용.

## self-check
- 생성한 코드가 ESLint/TypeScript 컴파일에 통과한다고 가정되는지 확인한다.
- 테스트는 `pnpm test` 또는 명시된 명령으로 실행 가능한 형태인지 검증한다.
- 새로운 규칙이나 예외가 필요하면 wrap-up 단계에 전달한다.

## TDD 테스트 규칙
- 테스트 프레임워크: Vitest 사용, `import { vi } from 'vitest'` (jest 사용 금지)
- 모든 테스트 케이스 포함: 정상/예외/경계/부정적 케이스
- 테스트 실행: 생성된 파일만 지정하여 실행 (`pnpm test [파일명들]`)
- 빈 구현 파일 생성으로 import 에러 방지