# 문서 인덱스

이 디렉토리는 AI 에이전트 및 개발자가 프로젝트를 이해하고 작업하는 데 필요한 구조화된 문서를 포함합니다.

## 문서 간 의존 관계 요약

```
[핵심 구조]
function-index.json     → 기능 중심 데이터베이스 (기능명으로 관련 코드 검색)
project-structure.md    → 파일 중심 인덱스 (파일 경로로 책임 확인)
architecture-guidelines.md → 원칙 중심 문서 (어떻게 코드를 작성할지)

[보조 문서]
test-strategy.md        → 테스트 작성 방법론
tech-stack.md           → 사용 기술 상세 설명
prd-v2.md              → function-index.json의 사람 친화적 버전

[의존 흐름]
1. 기능 작업 시: function-index.json → project-structure.md → 실제 코드
2. 새 파일 생성 시: architecture-guidelines.md → project-structure.md
3. 테스트 작성 시: test-strategy.md → function-index.json (기존 패턴 참조)
```

---

## 문서 분류 태그

각 문서는 주 대상 사용자에 따라 태그로 분류됩니다:

- **[AI]**: AI 에이전트가 파싱하여 사용하기 최적화된 문서 (구조화된 데이터)
- **[HUMAN]**: 사람이 읽기 위한 문서 (상세 설명 및 맥락 포함)
- **[AI/HUMAN]**: AI와 사람 모두 활용 가능한 문서 (규칙 및 가이드라인)
- **[ARCHIVE]**: 참고용 아카이브 문서

---

## 문서 목록 및 역할

### 1. `function-index.json` [AI] ⭐

**용도**: 기능별 코드 매핑 - AI 에이전트가 특정 기능을 수정/확장할 때 참조

**내용**:

- 7개 기능 (일정 CRUD, 캘린더 뷰, 검색, 충돌 감지, 알림, 공휴일, 반복 일정)
- 각 기능별 관련 파일, API 엔드포인트, 내부 의존성, 테스트 파일, 구현 상태

**형식**: JSON (프로그래밍 방식으로 파싱 가능)

**활용 시나리오**:

- "일정 CRUD 기능을 수정해줘" → `function-index.json`에서 "일정 CRUD" 검색 → 관련 파일 목록 확인
- "알림 시스템 테스트 추가해줘" → 기존 테스트 파일 패턴 확인
- "검색 기능이 어떤 API를 사용하는지 확인" → api 필드 확인

**JSON 스키마**:

```typescript
{
  "features": [
    {
      "name": string,                    // 기능명 (예: "일정 CRUD")
      "purpose": string,                 // 기능 목적 한 줄 설명
      "files": [                         // 이 기능의 핵심 구현 파일들
        {
          "path": string,                // 파일 경로 (예: "src/hooks/useEventOperations.ts")
          "role": string                 // 이 파일이 기능에서 하는 역할
        }
      ],
      "api": [                           // 관련 API 엔드포인트 (없으면 빈 배열)
        {
          "method": "GET" | "POST" | "PUT" | "DELETE",
          "endpoint": string,            // API 경로 (예: "/api/events")
          "description": string          // API 역할 설명
        }
      ],
      "internalDependencies": [          // src/ 내부의 공용 의존 모듈들
        {
          "path": string,                // 의존 모듈 경로
          "description": string          // 왜 이 모듈에 의존하는지 설명
        }
      ],
      "tests": [                         // 관련 테스트 파일들 (없으면 빈 배열)
        {
          "path": string,                // 테스트 파일 경로
          "scope": string                // 테스트 범위 설명
        }
      ],
      "status": "implemented" | "planned"  // 구현 상태
    }
  ]
}
```

---

### 2. `project-structure.md` [AI] ⭐

**용도**: 파일 트리 및 각 파일의 책임

**내용**:

- src/ 디렉토리의 전체 구조
- 각 파일의 한 줄 책임 설명
- 폴더별 역할 구분 (apis, hooks, utils, **tests**, **mocks**)

**형식**: Markdown

**활용 시나리오**:

- "프로젝트 구조를 보여줘" → 전체 파일 트리 확인
- "날짜 관련 유틸리티 파일이 어디 있어?" → utils/dateUtils.ts 찾기
- "테스트 파일은 어디에 있어?" → **tests** 디렉토리 확인

---

### 3. `architecture-guidelines.md` [AI/HUMAN]

**용도**: 아키텍처 철학 및 개발 가이드라인

**내용**:

- 아키텍처 레이어 (프레젠테이션, 상태 관리, 유틸리티, API, 타입, 테스트)
- 데이터 흐름
- 설계 원칙 (관심사 분리, 단일 책임, 재사용성, 타입 안정성, 테스트 가능성)
- 명명 규칙
- 코딩 컨벤션

**형식**: Markdown

**활용 시나리오**:

- "새로운 훅을 만들 때 어떤 규칙을 따라야 해?" → 명명 규칙 확인
- "이 프로젝트의 설계 원칙은 뭐야?" → 설계 원칙 섹션 확인
- "코딩 컨벤션은?" → 코딩 컨벤션 섹션 확인

---

### 4. `test-strategy.md` [AI/HUMAN]

**용도**: 테스트 전략 및 작성 가이드

**내용**:

- 테스트 피라미드 (단위/훅/통합 테스트)
- 테스트 범위 및 커버리지 목표
- 테스트 난이도 분류
- 테스트 도구 (Vitest, Testing Library, MSW)
- 테스트 작성 패턴 및 베스트 프랙티스

**형식**: Markdown

**활용 시나리오**:

- "테스트를 어떻게 작성해야 해?" → 테스트 작성 가이드 확인
- "테스트 파일명은 어떻게 지어?" → 파일 명명 규칙 확인
- "API 모킹은 어떻게 해?" → MSW 사용법 확인

---

### 5. `tech-stack.md` [HUMAN]

**용도**: 사용 기술 스택 상세 정보

**내용**:

- 프론트엔드 프레임워크 (React, TypeScript)
- UI 라이브러리 (Material-UI)
- 상태 관리 (React Hooks)
- 빌드 도구 (Vite)
- 테스트 도구 (Vitest, Testing Library, MSW)
- 의존성 목록

**형식**: Markdown

**활용 시나리오**:

- "이 프로젝트는 어떤 라이브러리를 사용해?" → 전체 기술 스택 확인
- "Material-UI를 왜 선택했어?" → 사용 이유 확인
- "새로운 의존성을 추가해도 돼?" → 현재 스택과의 호환성 검토

---

### 6. `prd-v2.md` [HUMAN]

**용도**: 기능별 PRD 인덱스 (사람이 읽기 좋은 Markdown 버전)

**내용**:

- function-index.json과 동일한 내용을 Markdown 형식으로 작성
- 각 기능의 목적, 관련 코드, API, 의존성, 테스트, 구현 상태
- 프로젝트 구조 개요

**형식**: Markdown

**활용 시나리오**:

- 사람이 읽기 편한 형태로 기능 전체 개요 파악
- function-index.json의 사람 친화적 버전

**참고**: AI 에이전트는 `function-index.json` 사용 권장 (파싱 용이)

---

### 7. `prd-v1.md` [ARCHIVE]

**용도**: 초기 기능 명세서 (아카이브)

**내용**:

- 프로젝트 초기 작성된 상세 기능 명세서
- 개요, 핵심 기능, 데이터 모델, API 명세, 컴포넌트 구조, 기술 스택 등

**형식**: Markdown

**활용 시나리오**:

- 프로젝트 초기 기획 의도 확인
- 상세한 기능 설명 참조

**참고**: 구조화된 정보는 function-index.json 및 architecture-guidelines.md 참조 권장

---

### 8. `agents/agent-constraints.md` [AI] ⭐

**용도**: AI 에이전트별 권한 및 제약사항 정의

**내용**:

- 4가지 에이전트 역할 (테스트/구현/리뷰/리팩토링)
- 각 에이전트별 Input/Output 스키마
- 수정 가능/금지 파일 목록
- 필수 업데이트 규칙 및 체크리스트
- 에이전트 간 협업 프로세스

**형식**: Markdown

**활용 시나리오**:

- "테스트 코드 작성할 때 어떤 파일 수정 가능해?" → Agent-Test 섹션 확인
- "새 기능 구현 시 어떤 문서 업데이트 필요해?" → Agent-Implementation 섹션 확인
- "리팩토링 시 지켜야 할 규칙은?" → Agent-Refactoring 섹션 확인
- "코드리뷰 시 자동 거부 조건은?" → Agent-Review 섹션 확인

---

## AI 에이전트 사용 가이드

### 시나리오별 참조 문서

| 목적                           | 참조 문서                                                     | 순서          |
| ------------------------------ | ------------------------------------------------------------- | ------------- |
| 특정 기능 수정/확장            | `function-index.json` → `project-structure.md`                | 1순위         |
| 파일 위치 찾기                 | `project-structure.md`                                        | 1순위         |
| 새 파일/함수 생성 시 명명 규칙 | `architecture-guidelines.md`                                  | 1순위         |
| 테스트 작성                    | `test-strategy.md` → `function-index.json` (기존 테스트 패턴) | 1순위 → 2순위 |
| 코딩 스타일 확인               | `architecture-guidelines.md`                                  | 1순위         |
| 아키텍처 이해                  | `architecture-guidelines.md` → `project-structure.md`         | 1순위 → 2순위 |
| 기술 스택 확인                 | `tech-stack.md`                                               | 1순위         |
| 상세 기능 설명                 | `prd-v2.md` 또는 `function-index.json`                        | 1순위         |

### 권장 워크플로우

1. **초기 프로젝트 이해**

   ```
   README.md (현재 파일)
   → architecture-guidelines.md (아키텍처 개요)
   → project-structure.md (파일 구조)
   → function-index.json (기능별 코드 매핑)
   ```

2. **특정 기능 작업**

   ```
   function-index.json (기능 검색)
   → 관련 파일 코드 읽기
   → 수정/확장 작업
   → architecture-guidelines.md (명명 규칙/컨벤션 확인)
   ```

3. **새 기능 추가**
   ```
   architecture-guidelines.md (설계 원칙/컨벤션)
   → project-structure.md (파일 위치 결정)
   → 코드 작성
   → function-index.json 업데이트
   ```

---

## 문서 유지보수 규칙

### 코드 변경 시 업데이트 필요

- 새 파일 추가 → `project-structure.md` 업데이트
- 새 기능 추가 → `function-index.json` 및 `prd-v2.md` 업데이트
- 아키텍처 변경 → `architecture-guidelines.md` 업데이트

### 문서 간 일관성 유지

- `function-index.json`과 `prd-v2.md`는 내용이 동일해야 함 (형식만 다름)
- `project-structure.md`의 파일 목록은 실제 코드베이스와 일치해야 함
- `architecture-guidelines.md`의 규칙은 실제 코드에 반영되어야 함

---

## 문서 우선순위

### AI 에이전트용 (파싱 우선)

1. `agents/agent-constraints.md` - **에이전트별 권한 및 제약사항** (필수)
2. `function-index.json` - 기능별 코드 매핑
3. `project-structure.md` - 파일 구조
4. `architecture-guidelines.md` - 아키텍처 및 컨벤션
5. `test-strategy.md` - 테스트 전략
6. `tech-stack.md` - 기술 스택 정보

### 사람용 (가독성 우선)

1. `prd-v2.md` - 기능별 명세서
2. `architecture-guidelines.md` - 아키텍처 가이드
3. `test-strategy.md` - 테스트 가이드
4. `tech-stack.md` - 기술 스택 설명
5. `project-structure.md` - 파일 구조
6. `prd-v1.md` - 초기 기획서 (참고용)
