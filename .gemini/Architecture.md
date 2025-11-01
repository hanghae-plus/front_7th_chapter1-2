# 아키텍처 설계 문서 V1.0

## 1. 핵심 아키텍처 결정: 반복 일정 저장 방식

### 1.1. PRD 요구사항 분석
- PM의 PRD 4번(반복 일정 단일 수정) 및 5번(반복 일정 단일 삭제) 요구사항은 반복 시리즈 내 개별 일정에 대한 독립적인 관리가 필요함을 명시합니다.

### 1.2. 채택 아키텍처: 개별 인스턴스(Individual Instances) 저장 방식
- 반복 일정 생성 시, 반복 종료일까지의 모든 개별 일정 데이터를 미리 생성하여 저장하는 방식을 채택합니다.
- 각 개별 일정은 고유한 `id`를 가지며, 동일한 반복 시리즈에 속하는 일정들은 공통의 `seriesId` (반복 그룹 ID)를 가집니다.

### 1.3. 설계 상세
- **반복 일정 생성:**
    - 사용자가 반복 일정을 생성하면, 시작일부터 반복 종료일까지의 모든 개별 일정 인스턴스가 계산되어 데이터베이스에 저장됩니다.
    - 각 인스턴스는 고유한 `id`와 해당 반복 시리즈를 식별하는 `seriesId`를 가집니다.
- **단일 일정 수정 (PRD 4번 '예'):**
    - 특정 일정 인스턴스만 수정할 경우, 해당 인스턴스의 `seriesId`를 `null`로 변경하여 반복 그룹과의 연결을 끊고 독립적인 '단일 일정'으로 취급합니다.
    - 이로써 해당 일정은 더 이상 반복 시리즈의 영향을 받지 않습니다.
- **전체 반복 일정 수정 (PRD 4번 '아니오'):**
    - 특정 일정 인스턴스를 포함한 전체 반복 시리즈를 수정할 경우, 해당 인스턴스의 `seriesId`와 동일한 `seriesId`를 가진 모든 일정 인스턴스를 대상으로 수정 작업을 수행합니다.
- **단일 일정 삭제 (PRD 5번 '예'):**
    - 특정 일정 인스턴스만 삭제할 경우, 해당 인스턴스만 데이터베이스에서 제거합니다.
- **전체 반복 일정 삭제 (PRD 5번 '아니오'):**
    - 특정 일정 인스턴스를 포함한 전체 반복 시리즈를 삭제할 경우, 해당 인스턴스의 `seriesId`와 동일한 `seriesId`를 가진 모든 일정 인스턴스를 데이터베이스에서 제거합니다.

### 1.4. 데이터 타입 정의 변경
- `src/types.ts` 파일의 `Event` 타입에 `seriesId: string | null;` 필드를 추가합니다.
    ```typescript
    // src/types.ts (예시)
    interface Event {
      id: string;
      title: string;
      start: string; // YYYY-MM-DDTHH:mm:ss
      end: string;   // YYYY-MM-DDTHH:mm:ss
      seriesId: string | null; // 반복 일정 그룹 ID (단일 일정일 경우 null)
      // ... 기타 필드
    }
    ```

## 2. 기술 스택 및 컨벤션

### 2.1. 핵심 기술 스택
- **Core:** React (TypeScript)
- **Testing:** Vitest (단위/통합 테스트), React Testing Library (RTL) (컴포넌트 상호작용 테스트)
- **API Mocking:** MSW (Mock Service Worker) (네트워크 레벨 모킹)

### 2.2. 공식 컨벤션 참조
- 모든 테스트 및 코드 구현은 다음 3개의 공식 규칙 문서를 준수해야 합니다.
    - `docs/kentcdodds-rtl-rules.md` (RTL 쿼리 철학 및 전략)
    - `docs/rtl-official-query-guide.md` (RTL 쿼리 문법 가이드)
    - `docs/tidy-first-tdd-workflow.md` (Tidy First 및 TDD 워크플로우)

## 3. 도구 설정

### 3.1. MSW (Mock Service Worker) 설정
- `Dev-Junior`는 API 모킹을 위해 MSW를 사용해야 합니다.
- Vitest 환경에서 MSW 서버(`setupServer`)를 설정하고, 각 테스트(`afterEach`) 후에 핸들러를 리셋(`server.resetHandlers()`)하도록 `src/setupTests.ts` 파일에 설정해야 합니다.
- 공통 핸들러는 `src/__mocks__/handlers.ts`에 정의합니다.

### 3.2. Vitest Mocking 컨벤션
- 모듈 모킹 시 `jest.fn()` 대신 Vitest의 `vi.fn()` 또는 `vi.spyOn()`을 사용하도록 합니다.

## 4. 컴포넌트 설계 제안

### 4.1. `src/App.tsx` 및 관련 Hooks/Utils
- `PRD.md`의 반복 일정 기능을 구현하기 위해 `src/App.tsx`, `src/hooks/useEventForm.ts`, `src/hooks/useEventOperations.ts`, 그리고 `src/utils/` 내의 관련 유틸리티 함수들을 수정/확장해야 합니다.
- `App.tsx`의 기존 코드 구조를 반드시 참고하여 일관성 있는 설계를 유지합니다.

### 4.2. 데이터 흐름 및 상태 관리
- **`useEventForm` Hook:**
    - 반복 유형, 반복 간격, 반복 종료일, `seriesId` 등의 상태를 추가하고 관련 로직을 처리하도록 확장합니다.
    - 폼 제출 시, 선택된 반복 설정에 따라 개별 일정 인스턴스들을 생성하는 로직을 호출합니다.
- **`useEventOperations` Hook:**
    - 일정 생성, 수정, 삭제 로직을 포함하며, 반복 일정의 경우 `seriesId`를 기반으로 단일/전체 처리를 분기합니다.
    - API 호출 시 `seriesId`를 포함하여 백엔드에 전달합니다.
- **`src/utils/` 유틸리티 함수:**
    - 반복 유형(매일, 매주, 매월, 매년)과 간격, 시작일, 종료일을 기반으로 개별 일정 날짜들을 계산하는 함수들을 구현합니다. (예: `calculateDailyDates`, `calculateWeeklyDates` 등)

### 4.3. API Endpoint 제안
- **`POST /api/events-series`:** 새로운 반복 일정 시리즈를 생성합니다. (백엔드에서 개별 인스턴스 생성 로직 처리)
- **`PUT /api/events-series/:seriesId`:** 특정 `seriesId`를 가진 전체 반복 일정 시리즈를 수정합니다.
- **`DELETE /api/events-series/:seriesId`:** 특정 `seriesId`를 가진 전체 반복 일정 시리즈를 삭제합니다.
- **`PUT /api/events/:id/detach`:** 특정 `id`를 가진 단일 일정을 반복 시리즈에서 분리합니다. (해당 일정의 `seriesId`를 `null`로 변경)
- **`PUT /api/events/:id`:** 단일 일정의 내용을 수정합니다. (seriesId가 null인 경우 또는 detach된 일정)
- **`DELETE /api/events/:id`:** 단일 일정을 삭제합니다. (seriesId가 null인 경우 또는 detach된 일정)