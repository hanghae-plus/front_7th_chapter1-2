# PM Agent Output Templates

**버전:** 1.0.0
**생성일:** 2025-10-28
**목적:** PM 에이전트의 산출물 형식 및 구조 정의

---

## 산출물 개요

PM 에이전트는 **PRD (Product Requirements Document)** 를 주요 산출물로 생성한다.

모든 산출물은 `.claude/outputs/` 디렉토리에 저장된다.

---

## 1. PRD (Product Requirements Document)

### 파일 정보
- **파일명**: `prd.md`
- **경로**: `.claude/outputs/{project-id}/prd.md`
- **예시**: `.claude/outputs/PROJ-001-20250130/prd.md`
- **목적**: 프로젝트의 목표, 범위, 기능, 기술 스택, 제약사항을 명확히 정의

### 템플릿 구조

```markdown
# Product Requirements Document (PRD)

**프로젝트명**: [프로젝트 이름]
**버전**: 1.0.0
**작성일**: YYYY-MM-DD
**작성자**: Product Manager (PM Agent)
**상태**: Draft | In Review | Approved

---

## 1. 프로젝트 개요

### 1.1 프로젝트 목표
[프로젝트의 핵심 목표와 달성하고자 하는 비즈니스 가치를 명시]

### 1.2 배경 및 동기
[프로젝트가 필요한 이유, 해결하고자 하는 문제]

### 1.3 성공 기준
[프로젝트 성공을 측정할 수 있는 명확한 지표]
- [ ] 기준 1
- [ ] 기준 2
- [ ] 기준 3

---

## 2. 범위 (Scope)

### 2.1 포함 사항 (In Scope)
[이번 프로젝트에서 반드시 구현해야 할 기능과 요소]
-
-
-

### 2.2 제외 사항 (Out of Scope)
[이번 프로젝트에서 다루지 않는 기능과 요소]
-
-
-

### 2.3 향후 고려 사항 (Future Considerations)
[차후 버전에서 고려할 수 있는 기능]
-
-

---

## 3. 주요 기능 (Features)

### Feature 1: [기능명]
**우선순위**: High | Medium | Low
**설명**: [기능에 대한 간략한 설명]
**핵심 요구사항**:
-
-
-

### Feature 2: [기능명]
**우선순위**: High | Medium | Low
**설명**: [기능에 대한 간략한 설명]
**핵심 요구사항**:
-
-
-

[추가 기능들...]

---

## 4. 사용자 및 이해관계자

### 4.1 대상 사용자 (Target Users)
[주요 사용자 그룹 정의]
- **그룹 1**: [설명]
- **그룹 2**: [설명]

### 4.2 이해관계자 (Stakeholders)
[프로젝트 관련 이해관계자]
- **이름/역할**: 책임 범위
- **이름/역할**: 책임 범위

---

## 5. 기술 스택 및 요구사항

### 5.1 기술 스택
[프로젝트에서 사용할 기술 스택 명시]
- **프레임워크**: React 18.x
- **언어**: TypeScript
- **상태 관리**: Zustand (필요 시)
- **스타일링**: Tailwind CSS
- **테스트**: Vitest, React Testing Library
- **빌드 도구**: Vite
- **기타 라이브러리**: [필요한 라이브러리 명시]

### 5.2 성능 요구사항
[성능 관련 요구사항]
- **로딩 시간**: [예: 초기 로딩 3초 이내]
- **번들 사이즈**: [예: 500KB 이하]
- **렌더링 성능**: [예: 60fps 유지]

### 5.3 접근성 요구사항
[접근성 관련 요구사항]
- **WCAG 기준**: [예: AA 수준]
- **키보드 네비게이션**: 모든 기능 접근 가능
- **스크린 리더**: 지원 필요
- **색상 대비**: 4.5:1 이상

### 5.4 테스트 커버리지 목표
- **단위 테스트**: 70% 이상
- **통합 테스트**: 주요 사용자 플로우 커버
- **E2E 테스트**: 핵심 기능 커버

---

## 6. 제약사항 (Constraints)

### 6.1 일정 및 리소스
[프로젝트 기간, 팀 구성 등]
- **예상 기간**:
- **팀 규모**:
- **마일스톤**:

### 6.2 기타 제약사항
[법적, 규제, 비즈니스 제약사항]
-
-

---

## 7. 의존성 (Dependencies)

### 7.1 외부 의존성
[외부 API, 서비스, 시스템]
-
-

### 7.2 내부 의존성
[다른 프로젝트, 팀과의 의존성]
-
-

---

## 8. 리스크 및 가정 사항

### 8.1 주요 리스크
[예상 리스크와 완화 방안]
| 리스크 | 영향도 | 확률 | 완화 방안 |
|--------|--------|------|-----------|
| [리스크 1] | High/Medium/Low | High/Medium/Low | [방안] |
| [리스크 2] | High/Medium/Low | High/Medium/Low | [방안] |

### 8.2 가정 사항 (Assumptions)
[프로젝트 진행을 위한 가정]
-
-

---

## 9. 승인 및 이력

### 9.1 승인
- **PM**: [이름] - [날짜]
- **기술 리드**: [이름] - [날짜]
- **Product Owner**: [이름] - [날짜]

### 9.2 변경 이력
| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|-----------|
| 1.0.0 | YYYY-MM-DD | PM | 초안 작성 |

---

**다음 단계**: Test Designer에게 전달
```

---
## 출력 위치 및 파일 관리

### 디렉토리 구조

모든 산출물은 프로젝트별 디렉토리에 저장된다.

```
.claude/outputs/
└── {project-id}/                    # 예: PROJ-001-20250130
    ├── prd.md                       # PM 산출물 (티켓: PROJ-001)
    ├── test-scenarios.md            # Test Designer 산출물 (티켓: PROJ-002)
    ├── tests/                       # Test Writer 산출물 (티켓: PROJ-003)
    │   ├── unit/                    # 단위 테스트 코드
    │   └── integration/             # 통합 테스트 코드
    ├── implementation/              # Implementer 산출물 (티켓: PROJ-004)
    │   └── code files               # 구현 코드 (실제로는 src/에 구현)
    ├── qa-report.md                 # QA 산출물 (티켓: PROJ-005)
    ├── refactoring-report.md        # Refactorer 산출물 (티켓: PROJ-006)
    └── doc-index.md                 # Doc Keeper 산출물 (티켓: PROJ-007)
```

### 프로젝트 ID 형식
- **형식**: `{PREFIX}-{NUMBER}-{YYYYMMDD}`
- **PREFIX**: 프로젝트 접두사 (기본값: `PROJ`)
- **NUMBER**: 프로젝트 순번 (3자리, 예: `001`, `042`)
- **YYYYMMDD**: 프로젝트 시작일
- **예시**: `PROJ-001-20250130`, `PROJ-042-20250315`

### 파일 명명 규칙
- 소문자 사용 (test-scenarios.md, qa-report.md)
- 단어 구분은 하이픈(-) 사용
- 프로젝트 디렉토리는 한 번에 하나만 활성화

### 경로 예시
- PRD: `.claude/outputs/PROJ-001-20250130/prd.md`
- Test Scenarios: `.claude/outputs/PROJ-001-20250130/test-scenarios.md`
- Tests: `.claude/outputs/PROJ-001-20250130/tests/unit/`
- QA Report: `.claude/outputs/PROJ-001-20250130/qa-report.md`
- Refactoring Report: `.claude/outputs/PROJ-001-20250130/refactoring-report.md`

---

**이 템플릿은 PM 에이전트가 산출물을 생성할 때 반드시 따라야 하는 표준 형식이다.**
