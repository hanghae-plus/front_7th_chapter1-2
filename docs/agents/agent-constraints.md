---
**문서 유형**: [AI]  
**목적**: AI 에이전트별 권한 및 제약사항 정의  
**주요 내용**: 역할별 수정 가능/금지 파일, Input/Output 스키마, 필수 업데이트 규칙  
**관련 문서**: [function-index.json](../function-index.json), [architecture-guidelines.md](../architecture-guidelines.md)  
**최종 수정일**: 2025-10-30
---

# AI 에이전트 제약사항 및 권한

## 에이전트 역할 정의

### 1. 테스트코드 에이전트 (Agent-Test)

**책임**: 테스트 코드 작성 및 커버리지 관리

### 2. 기능 구현 에이전트 (Agent-Implementation)

**책임**: 새로운 기능 구현 및 기존 기능 확장

### 3. 코드리뷰 에이전트 (Agent-Review)

**책임**: 코드 품질 검증 및 규칙 준수 확인

### 4. 리팩토링 에이전트 (Agent-Refactoring)

**책임**: 코드 구조 개선 및 최적화

---

## 공통 제약사항

### 절대 수정 금지 파일

```
- src/setupTests.ts          # 테스트 환경 설정 (모든 에이전트)
- src/vite-env.d.ts          # Vite 타입 정의 (모든 에이전트)
- docs/README.md             # 문서 인덱스는 수동 관리
- docs/prd-v1.md             # 아카이브 문서
```

### 필수 업데이트 규칙

#### 새 파일 추가 시

1. `docs/project-structure.md`에 파일 추가 및 책임 설명
2. `docs/function-index.json`의 해당 기능 `files` 배열에 추가

#### 새 기능 추가 시

1. `docs/function-index.json`에 새 feature 객체 추가
2. 관련 API가 있다면 `api` 배열 작성
3. 테스트 파일 `tests` 배열에 등록

#### 파일 이동/삭제 시

1. `docs/project-structure.md` 업데이트
2. `docs/function-index.json`의 모든 경로 업데이트
3. import 경로 일괄 변경

---

## 1. 테스트코드 에이전트 (Agent-Test)

### Input Schema

```typescript
{
  featureName: string;           // 기능명 (예: "일정 CRUD")
  testType: "unit" | "hook" | "integration";
  targetFile: string;            // 테스트 대상 파일
  testScenarios: string[];       // 테스트할 시나리오 목록
}
```

### Output Schema

```typescript
{
  testFilePath: string;          // 생성된 테스트 파일 경로
  testCode: string;              // 테스트 코드
  coverage: {
    statements: number;
    branches: number;
    functions: number;
    lines: number;
  };
  updatedDocs: string[];         // 업데이트한 문서 목록
}
```

### 수정 권한

#### ✅ 수정 가능

```
src/__tests__/**               # 모든 테스트 파일
src/__mocks__/response/**      # 테스트 데이터 추가
```

#### ⚠️ 조건부 수정

```
src/__mocks__/handlers.ts      # 새 API 핸들러 추가만 가능 (기존 수정 금지)
src/__mocks__/handlersUtils.ts # 헬퍼 함수 추가만 가능
```

#### ❌ 수정 금지

```
src/setupTests.ts              # 테스트 환경 설정
src/**/*.ts (테스트 파일 제외)  # 실제 구현 코드
```

### 필수 준수 사항

1. **파일 명명 규칙**

   - `{난이도}.{대상}.spec.{ts|tsx}`
   - 난이도: `easy` (단순) | `medium` (복잡)
   - 예: `easy.dateUtils.spec.ts`, `medium.integration.spec.tsx`

2. **테스트 위치**

   - 단위 테스트: `src/__tests__/unit/`
   - 훅 테스트: `src/__tests__/hooks/`
   - 통합 테스트: `src/__tests__/`

3. **필수 업데이트**
   - `docs/function-index.json`의 해당 기능 `tests` 배열에 추가:
     ```json
     {
       "path": "src/__tests__/unit/easy.newUtil.spec.ts",
       "scope": "newUtil 함수 단위 테스트"
     }
     ```

### 체크리스트

**작업 전**

- [ ] `docs/test-strategy.md`의 테스트 작성 패턴 확인
- [ ] `docs/function-index.json`에서 기존 테스트 패턴 참조
- [ ] 테스트할 코드의 책임 범위 확인

**작업 후**

- [ ] 모든 테스트 통과 확인
- [ ] `docs/function-index.json` 업데이트
- [ ] 커버리지 목표 달성 확인 (유틸: 90%+, 훅: 80%+)

---

## 2. 기능 구현 에이전트 (Agent-Implementation)

### Input Schema

```typescript
{
  featureName: string;           // 기능명
  featureType: "hook" | "util" | "api" | "component";
  requirements: string;          // 요구사항 (자연어)
  relatedFeatures: string[];     // 의존하는 다른 기능
  apiEndpoints?: {               // 필요한 API (선택)
    method: string;
    endpoint: string;
    description: string;
  }[];
}
```

### Output Schema

```typescript
{
  createdFiles: string[];        // 생성된 파일 목록
  modifiedFiles: string[];       // 수정된 파일 목록
  typesAdded: string;            // types.ts에 추가한 타입
  impactAnalysis: {
    affectedFeatures: string[];  // 영향받는 기능
    breakingChanges: boolean;    // 하위 호환성 깨짐 여부
  };
  updatedDocs: string[];         // 업데이트한 문서 목록
}
```

### 수정 권한

#### ✅ 수정 가능

```
src/hooks/**                   # 커스텀 훅
src/utils/**                   # 유틸리티 함수
src/apis/**                    # API 함수
src/App.tsx                    # 메인 컴포넌트
src/types.ts                   # 타입 정의 (추가만)
```

#### ⚠️ 조건부 수정

```
src/types.ts                   # 기존 타입 수정 시 하위 호환성 필수
src/main.tsx                   # 전역 설정 변경 시만
```

#### ❌ 수정 금지

```
src/__tests__/**               # 테스트는 Agent-Test 담당
src/__mocks__/**               # 목 데이터는 Agent-Test 담당
```

### 파일 생성 규칙

#### hooks/ 디렉토리

```typescript
// 명명: use + PascalCase
// 예: useNewFeature.ts

export const useNewFeature = () => {
  // 1. 다른 훅 import 가능
  // 2. 컴포넌트 import 금지
  // 3. 부수 효과는 useEffect 내부에서만

  return {
    /* 훅 반환값 */
  };
};
```

#### utils/ 디렉토리

```typescript
// 명명: camelCase
// 예: newHelper.ts

// ✅ 순수 함수만
export function newHelper(input: string): string {
  // 부수 효과 금지
  // API 호출 금지
  // 전역 상태 변경 금지
  return result;
}

// ❌ 금지 패턴
export function badHelper() {
  fetch('/api/data'); // API 호출 금지
  window.location.href = '/'; // 부수 효과 금지
}
```

#### apis/ 디렉토리

```typescript
// 명명: fetch + PascalCase
// 예: fetchNewData.ts

export async function fetchNewData(): Promise<DataType> {
  // 반환 타입 명시 필수
  const response = await fetch('/api/new-data');
  return response.json();
}
```

### 필수 준수 사항

1. **명명 규칙** (`docs/architecture-guidelines.md` 참조)

   - 파일명: camelCase (utils), PascalCase (components)
   - 함수명: camelCase, 동사로 시작
   - 타입명: PascalCase
   - 상수명: UPPER_SNAKE_CASE

2. **타입 안정성**

   - `any` 타입 사용 금지
   - 모든 함수 반환 타입 명시
   - Strict mode 준수

3. **설계 원칙** (`docs/architecture-guidelines.md` 참조)

   - 단일 책임 원칙
   - 순수 함수 우선 (utils/)
   - 관심사의 분리

4. **필수 업데이트**
   - `docs/project-structure.md`: 새 파일 추가
   - `docs/function-index.json`: 새 기능 또는 files 배열 업데이트
   - 타입 변경 시: 영향받는 모든 기능 확인

### 영향 범위 분석 절차

새 파일 생성 시:

1. `docs/function-index.json`에서 관련 기능 찾기
2. `internalDependencies`에 추가할지 결정
3. 여러 기능에서 사용될 가능성 평가

기존 파일 수정 시:

1. `docs/function-index.json`에서 해당 파일을 사용하는 모든 기능 검색
2. 각 기능의 영향 범위 확인
3. 하위 호환성 검토

### 체크리스트

**작업 전**

- [ ] `docs/function-index.json`에서 기능 구조 확인
- [ ] `docs/architecture-guidelines.md`에서 규칙 확인
- [ ] 의존하는 기능의 API 확인

**작업 후**

- [ ] 린트 에러 없음
- [ ] 타입 에러 없음
- [ ] `docs/project-structure.md` 업데이트
- [ ] `docs/function-index.json` 업데이트
- [ ] 영향받는 기능 목록 작성

---

## 3. 코드리뷰 에이전트 (Agent-Review)

### Input Schema

```typescript
{
  changedFiles: string[];        // 변경된 파일 목록
  diff: string;                  // 변경 내용
  changeReason: string;          // 변경 이유
  author: "Agent-Implementation" | "Agent-Test" | "Agent-Refactoring";
}
```

### Output Schema

```typescript
{
  approved: boolean;             // 승인 여부
  violations: {
    file: string;
    rule: string;                // 위반한 규칙
    violation: string;           // 위반 내용
    suggestion: string;          // 수정 제안
    severity: "error" | "warning" | "info";
  }[];
  impactAnalysis: {
    affectedFiles: string[];     // 영향받는 파일
    affectedFeatures: string[];  // 영향받는 기능
    breakingChange: boolean;     // 하위 호환성
  };
  docsUpdated: boolean;          // 문서 업데이트 여부
}
```

### 리뷰 권한

#### ✅ 검토 대상

```
src/**/*.{ts,tsx}              # 모든 소스 코드
docs/function-index.json       # 기능 인덱스
docs/project-structure.md      # 프로젝트 구조
```

#### 수정 불가

- 리뷰 에이전트는 코드 수정 권한 없음
- 오직 승인/거부 및 피드백만 제공

### 자동 거부 조건 (Error)

```typescript
const autoReject = [
  'any 타입 사용',
  'utils/ 디렉토리에 부수 효과 있는 함수',
  '테스트 없이 새 public 함수 추가',
  'function-index.json 미업데이트 (새 기능 추가 시)',
  'project-structure.md 미업데이트 (새 파일 추가 시)',
  '린트 에러 존재',
  '타입 에러 존재',
];
```

### 경고 조건 (Warning)

```typescript
const warnings = [
  '100줄 이상의 컴포넌트/함수',
  '5개 이상의 함수 파라미터',
  '3단계 이상 중첩된 조건문',
  '순환 의존성 감지',
  '주석 없는 복잡한 로직',
  'TODO/FIXME 주석 존재',
];
```

### 리뷰 체크리스트

#### 1. 명명 규칙 (`docs/architecture-guidelines.md`)

- [ ] 파일명이 규칙에 맞는가?
- [ ] 변수/함수명이 camelCase인가?
- [ ] 타입명이 PascalCase인가?
- [ ] boolean 변수가 is/has prefix를 사용하는가?

#### 2. 타입 안정성

- [ ] any 타입 사용 여부
- [ ] 모든 함수에 반환 타입 명시
- [ ] 암묵적 타입 추론이 명확한가?

#### 3. 설계 원칙

- [ ] 단일 책임 원칙 준수
- [ ] utils/는 순수 함수인가?
- [ ] 관심사가 적절히 분리되었는가?

#### 4. 테스트

- [ ] 새 함수에 대한 테스트가 있는가?
- [ ] 기존 테스트가 여전히 통과하는가?

#### 5. 문서

- [ ] `project-structure.md` 업데이트 (새 파일)
- [ ] `function-index.json` 업데이트 (새 기능/파일)
- [ ] 복잡한 로직에 주석이 있는가?

#### 6. 영향 범위

- [ ] 공용 모듈 변경인가?
- [ ] 타입 변경이 다른 파일에 영향을 주는가?
- [ ] API 변경이 있는가?
- [ ] 하위 호환성이 유지되는가?

### 영향 범위 분석 방법

```typescript
// 1. function-index.json에서 영향받는 기능 찾기
function findAffectedFeatures(changedFile: string): string[] {
  const features = readFunctionIndex();
  return features
    .filter(
      (f) =>
        f.files.some((file) => file.path === changedFile) ||
        f.internalDependencies.some((dep) => dep.path === changedFile)
    )
    .map((f) => f.name);
}

// 2. 각 기능의 모든 관련 파일 확인
function findAffectedFiles(featureNames: string[]): string[] {
  const features = readFunctionIndex();
  return features
    .filter((f) => featureNames.includes(f.name))
    .flatMap((f) => f.files.map((file) => file.path));
}
```

### 리뷰 프로세스

```
1. 변경 파일 목록 확인
   ↓
2. 각 파일에 대해 자동 거부 조건 검사
   ↓
3. 경고 조건 검사
   ↓
4. function-index.json에서 영향받는 기능 찾기
   ↓
5. 문서 업데이트 여부 확인
   ↓
6. 승인/거부 결정 및 피드백 생성
```

---

## 4. 리팩토링 에이전트 (Agent-Refactoring)

### Input Schema

```typescript
{
  targetType: 'file' | 'function' | 'feature';
  targetPath: string; // 대상 경로
  refactoringType: 'rename' | 'move' | 'extract' | 'inline' | 'optimize';
  reason: 'performance' | 'readability' | 'maintainability';
  keepCompatibility: boolean; // 하위 호환성 유지 여부
}
```

### Output Schema

```typescript
{
  modifiedFiles: string[];       // 수정된 파일
  movedCode: {
    from: string;
    to: string;
  }[];
  typeChanges: {
    before: string;
    after: string;
  }[];
  impactAnalysis: {
    affectedFeatures: string[];  // 영향받는 기능
    affectedTests: string[];     // 영향받는 테스트
    breakingChange: boolean;     // 하위 호환성
  };
  migrationGuide?: string;       // 마이그레이션 가이드 (breaking change 시)
  updatedDocs: string[];         // 업데이트한 문서
}
```

### 수정 권한

#### ✅ 수정 가능

```
src/hooks/**                   # 내부 구현 리팩토링
src/utils/**                   # 내부 구현 리팩토링
src/apis/**                    # 내부 구현 리팩토링
src/App.tsx                    # 컴포넌트 구조 개선
```

#### ⚠️ 조건부 수정

```
src/types.ts                   # public 타입 변경 시 하위 호환성 필수
export된 함수 시그니처         # 기존 사용처 모두 업데이트 필요
```

#### ❌ 수정 금지

```
public API 시그니처 (하위 호환성 깨는 변경)
테스트 결과를 변경시키는 리팩토링
```

### 절대 불변 규칙

#### 1. Public API 하위 호환성

```typescript
// ❌ 금지: 기존 함수 시그니처 변경
// Before
export function getData(id: string): Data;

// After (Breaking Change!)
export function getData(id: number): Data;

// ✅ 허용: 오버로드 추가
export function getData(id: string): Data;
export function getData(id: number): Data;
export function getData(id: string | number): Data {
  // ...
}
```

#### 2. Export된 타입 변경

```typescript
// ❌ 금지: 기존 속성 제거/이름 변경
export interface Event {
  id: string;
  title: string; // 이 필드 제거 금지
}

// ✅ 허용: 새 속성 추가 (optional)
export interface Event {
  id: string;
  title: string;
  subtitle?: string; // optional 추가는 OK
}
```

#### 3. 테스트 결과

- 리팩토링 전후 모든 테스트가 동일하게 통과해야 함
- 테스트 실패 시 리팩토링 롤백

### 리팩토링 전 필수 체크리스트

```typescript
// 1. 영향 범위 분석
const impactAnalysis = {
  // function-index.json에서 찾기
  affectedFeatures: findFeaturesUsingFile(targetFile),

  // grep으로 실제 import 문 찾기
  realDependencies: grepImports(targetFile),

  // 테스트 파일 의존성
  affectedTests: findTestsFor(targetFile),
};

// 2. 하위 호환성 체크
const compatibilityCheck = {
  isPublicAPI: isExportedFunction(targetFunction),
  isUsedByMultipleFeatures: impactAnalysis.affectedFeatures.length > 1,
  hasExternalDependents: checkExternalUsage(targetFile),
};

// 3. 테스트 커버리지 확인
const testCoverage = getTestCoverage(targetFile);
if (testCoverage < 80) {
  throw new Error('리팩토링 전 테스트 커버리지 80% 이상 필요');
}
```

### 리팩토링 유형별 규칙

#### 1. 파일 이동 (move)

```typescript
// 필수 업데이트
const updates = [
  'docs/project-structure.md', // 파일 경로 변경
  'docs/function-index.json', // 모든 경로 업데이트
  '모든 import 문', // 일괄 변경
  '관련 테스트의 import 경로',
];
```

#### 2. 함수 추출 (extract)

```typescript
// 기존 함수에서 로직 분리
// ✅ 허용: private 헬퍼 함수 추출
function complexFunction() {
  const result = helperFunction(); // 추출된 함수
  // ...
}

function helperFunction() {
  // 새로 추출된 함수 (export 안 함)
  // ...
}
```

#### 3. 함수 병합 (inline)

```typescript
// 작은 함수를 호출 지점에 병합
// ✅ 허용: 한 곳에서만 사용되는 함수
// ❌ 금지: 여러 곳에서 사용되는 함수
```

#### 4. 이름 변경 (rename)

```typescript
// ✅ 허용: 내부 변수/함수
// ⚠️ 주의: export된 함수 (모든 사용처 변경 필요)
// ❌ 금지: public API 함수 (하위 호환성)
```

### 리팩토링 프로세스

```
1. 리팩토링 대상 분석
   ↓
2. function-index.json에서 영향 범위 확인
   ↓
3. 테스트 커버리지 확인 (80% 이상)
   ↓
4. 모든 기존 테스트 실행 (Before)
   ↓
5. 리팩토링 실행
   ↓
6. 모든 테스트 실행 (After) - 동일한 결과 확인
   ↓
7. 영향받는 파일들 업데이트
   ↓
8. 문서 업데이트
   ↓
9. 린트/타입 체크
   ↓
10. Agent-Review에게 제출
```

### 필수 업데이트 문서

#### 파일 이동 시

```
- docs/project-structure.md
- docs/function-index.json (모든 경로)
```

#### 공용 모듈 변경 시

```
- docs/function-index.json의 internalDependencies
- 영향받는 모든 기능의 files 배열
```

#### Breaking Change 시

```
- CHANGELOG.md에 마이그레이션 가이드 작성
- 영향받는 기능 목록 문서화
```

### 체크리스트

**리팩토링 전**

- [ ] 테스트 커버리지 80% 이상
- [ ] 모든 테스트 통과 확인
- [ ] 영향 범위 분석 완료
- [ ] 하위 호환성 체크 완료

**리팩토링 중**

- [ ] 단계별 커밋
- [ ] 테스트 결과 모니터링

**리팩토링 후**

- [ ] 모든 테스트 통과 (Before와 동일)
- [ ] 린트/타입 에러 없음
- [ ] import 경로 모두 업데이트
- [ ] 문서 모두 업데이트
- [ ] Agent-Review 승인 획득

---

## 문서 업데이트 우선순위

### Priority 1 (필수)

```
docs/function-index.json        # 모든 에이전트
docs/project-structure.md       # 파일 변경 시
```

### Priority 2 (권장)

```
docs/architecture-guidelines.md # 규칙 변경 시
docs/test-strategy.md           # 테스트 패턴 변경 시
```

### Priority 3 (선택)

```
docs/tech-stack.md              # 새 의존성 추가 시
docs/prd-v2.md                  # 기능 설명 보완 시
```

---

## 에이전트 간 협업 프로세스

```
[Agent-Implementation]
  ↓ 구현 완료
[Agent-Test]
  ↓ 테스트 추가
[Agent-Review]
  ↓ 승인/거부
[Agent-Refactoring] (필요 시)
  ↓ 최적화
[Agent-Review]
  ↓ 최종 승인
[Deploy]
```

---

## 충돌 해결 규칙

### 동일 파일 수정 시

1. function-index.json: 마지막 에이전트가 병합
2. 실제 코드: Agent-Review가 판단
3. 문서: 각 에이전트가 자신의 섹션만 수정

### 우선순위

```
1. Agent-Review (최종 결정권)
2. Agent-Implementation (기능 변경)
3. Agent-Refactoring (구조 변경)
4. Agent-Test (테스트 추가)
```

