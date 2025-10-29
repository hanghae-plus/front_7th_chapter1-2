# PO Agent Templates

User Story 작성을 위한 표준 템플릿 모음입니다. 상황에 맞는 템플릿을 선택하여 사용하세요.

## Artifacts 저장 규칙

모든 User Story는 사용자 승인 후 다음 경로에 저장됩니다:

**저장 위치**: `.cursor/calendar/artifacts/po/`

**파일명 규칙**:

- User Story: `us###-[feature-name].md` (예: `us001-event-creation.md`)
- Epic: `epic###-[epic-name].md` (예: `epic001-calendar-system.md`)
- Technical Story: `ts###-[tech-task].md` (예: `ts001-api-refactor.md`)

**특수 케이스**:

- 버그 수정: Standard User Story로 작성, 제목에 "Bug Fix:" 포함
  - 예: `us005-bugfix-event-deletion.md`
- 기술 조사: Technical Story로 작성, 제목에 "Research:" 또는 "POC:" 포함
  - 예: `ts003-research-date-library.md`

**저장 목적**:

- @test-writer가 테스트 케이스 작성 시 참고
- 프로젝트 문서화 및 추적성
- 팀 간 협업 및 지식 공유

---

## 1. Standard User Story Template

일반적인 기능 개발에 사용하는 기본 템플릿입니다.

````markdown
# User Story: [기능명을 사용자 관점으로]

## 📋 Story

**As a** [사용자 역할]
**I want** [원하는 기능/목표]
**So that** [비즈니스 가치/이유]

## 📖 Description

[기능에 대한 상세 설명]

- 배경 및 맥락
- 사용자 시나리오 예시
- 관련된 기존 기능과의 연관성

### User Journey

1. [사용자의 첫 번째 행동]
2. [시스템 반응]
3. [사용자의 다음 행동]
4. [최종 결과]

## ✅ Acceptance Criteria

### Scenario 1: [정상 케이스]

```gherkin
Given [초기 상태/전제 조건]
When [사용자 행동/트리거]
Then [예상 결과]
  And [추가 확인 사항]
```
````

### Scenario 2: [엣지 케이스 1]

```gherkin
Given [초기 상태]
When [특정 조건의 행동]
Then [예상되는 다른 결과]
```

### Scenario 3: [에러 케이스]

```gherkin
Given [에러 발생 조건]
When [사용자 행동]
Then [에러 처리 결과]
  And [사용자 피드백]
```

## 📝 Tasks

### 🧪 Phase 1: Test Setup

**목표**: 테스트 환경 구성 및 Mock 데이터 준비

- [ ] MSW 핸들러 정의
  - Express API 엔드포인트 mock
  - 성공 시나리오 (200, 201)
  - 클라이언트 에러 (400, 404)
  - 서버 에러 (500)
  - 네트워크 에러
- [ ] Test 유틸리티 함수 작성
- [ ] Mock 데이터 생성 (API 응답 형식)
- [ ] 테스트 환경 설정 (`setupTests.ts`)

**예상 소요**: [Small/Medium/Large]

---

### 🔴 Phase 2: Red - Test First

**목표**: 실패하는 테스트 작성 (TDD Red Phase)

#### 2.1 Unit Tests

- [ ] [컴포넌트명] 렌더링 테스트
- [ ] [함수명] 로직 테스트
- [ ] Props 전달 테스트
- [ ] State 변경 테스트

#### 2.2 Integration Tests

- [ ] 컴포넌트 간 상호작용 테스트
- [ ] API 호출 및 응답 처리 테스트
- [ ] 에러 핸들링 테스트
- [ ] 로딩 상태 테스트

#### 2.3 User Interaction Tests

- [ ] 사용자 이벤트 시뮬레이션 (클릭, 입력 등)
- [ ] 폼 제출 테스트
- [ ] 유효성 검증 테스트

**예상 소요**: [Small/Medium/Large]

---

### 🟢 Phase 3: Green - Implementation

**목표**: 테스트를 통과시키는 최소 구현 (TDD Green Phase)

#### 3.1 Component 구현

- [ ] [컴포넌트명] 로직 구현
- [ ] Props 인터페이스 정의
- [ ] State 관리 (useState, useReducer)
- [ ] Event 핸들러 구현
- [ ] 기존 MUI 컴포넌트 활용

#### 3.2 비즈니스 로직 구현

- [ ] [핵심 함수] 구현
- [ ] 데이터 변환/가공 로직
- [ ] 유효성 검증 로직

#### 3.3 API 연동

- [ ] Express API 호출 함수 구현
- [ ] 응답 데이터 처리
- [ ] 에러 핸들링
- [ ] 로딩 상태 관리
- [ ] 재시도 로직 (필요 시)

**예상 소요**: [Small/Medium/Large]
**의존성**: Phase 2 완료 필수

---

### 🔵 Phase 4: Refactor

**목표**: 코드 품질 개선 (TDD Refactor Phase)

#### 4.1 코드 정리

- [ ] 중복 코드 제거
- [ ] 함수 분리 (단일 책임 원칙)
- [ ] 매직 넘버/문자열 상수화
- [ ] 타입 안정성 강화

#### 4.2 성능 최적화

- [ ] 불필요한 리렌더링 방지 (useMemo, useCallback)
- [ ] 컴포넌트 분리 (lazy loading 고려)
- [ ] 디바운싱/쓰로틀링 적용

#### 4.3 재사용성 향상

- [ ] 커스텀 훅 추출
- [ ] 공통 컴포넌트화
- [ ] 유틸리티 함수 분리

**예상 소요**: [Small/Medium/Large]
**의존성**: Phase 3 완료 필수

---

### 📝 Phase 5: Documentation

**목표**: 문서화 및 최종 검증

- [ ] JSDoc 주석 추가
- [ ] README 업데이트
- [ ] Storybook 스토리 작성 (선택사항)
- [ ] 코드 리뷰 요청 준비
- [ ] 최종 테스트 실행 및 커버리지 확인

**예상 소요**: Small

---

## 📊 Story Points

**복잡도**: [1/2/3/5/8/13]

**추정 근거**:

- 구현 복잡도: [상/중/하]
- 테스트 복잡도: [상/중/하]
- UI 복잡도: [상/중/하]
- 기술적 불확실성: [상/중/하]

## 🔧 Technical Notes

### 기술 스택

- **Frontend**: React + TypeScript
- **Backend**: Express.js REST API (기구현됨)
- **Database**: JSON 파일 기반 (서버 측)
- **UI Library**: MUI (Material-UI) - 기구현됨
- **State**: [useState/Context/Redux 등]
- **Testing**: Vitest + Testing Library
- **Mocking**: MSW (Express API mock)

### 구현 고려사항

- [특정 기술적 제약사항]
- [성능 관련 주의사항]
- [Express API 호출 방식]
- [에러 처리 및 재시도 로직]

### API 엔드포인트 (해당 시)

```typescript
// GET /api/events
// POST /api/events
// PUT /api/events/:id
// DELETE /api/events/:id

// 요청/응답 형식, 상태 코드 등
interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}
```

### 데이터 모델

```typescript
interface DataModel {
  // 관련 인터페이스 정의
}
```

## 📚 Definition of Done

- [ ] 모든 Acceptance Criteria 충족
- [ ] Unit Test 커버리지 80% 이상
- [ ] Integration Test 작성 완료
- [ ] 코드 리뷰 승인
- [ ] 문서화 완료
- [ ] 수동 테스트 완료
- [ ] 성능 기준 충족

## 🔗 Related

- **Epic**: [관련 Epic 링크]
- **Dependencies**: [선행 작업]
- **Related Stories**: [연관 스토리]
- **Specification**: [원본 명세 링크]

---

**Created**: YYYY-MM-DD
**Priority**: [High/Medium/Low]
**Status**: User Story Complete ✅
**Next Action**: 내용을 확인하신 후 승인해주시면 @test-writer에게 테스트 케이스 작성을 요청하겠습니다.

---

**승인 후 저장 경로**: `.cursor/calendar/artifacts/po/us###-[feature-name].md`
**예시**: `.cursor/calendar/artifacts/po/us001-event-creation.md`

````

---

## 2. Epic Template

여러 User Story를 포함하는 큰 기능 단위입니다.

```markdown
# Epic: [큰 기능 영역]

## 🎯 Epic Goal

**As a** [사용자]
**I want** [큰 목표]
**So that** [비즈니스 가치]

## 📖 Overview

[Epic의 전체적인 목적과 범위]

### Business Value
- [비즈니스 관점의 가치 1]
- [비즈니스 관점의 가치 2]

### Success Metrics
- [측정 가능한 성공 지표 1]
- [측정 가능한 성공 지표 2]

## 📋 User Stories

### Must Have (MVP)
1. **[Story 1]**: [간단한 설명] - [Story Points]
2. **[Story 2]**: [간단한 설명] - [Story Points]

### Should Have
3. **[Story 3]**: [간단한 설명] - [Story Points]

### Could Have
4. **[Story 4]**: [간단한 설명] - [Story Points]

### Won't Have (This Release)
5. **[Story 5]**: [간단한 설명] - [Story Points]

## 🗓️ Timeline

**Total Story Points**: [합계]
**Estimated Sprints**: [예상 스프린트 수]

```mermaid
gantt
    title Epic Timeline
    dateFormat  YYYY-MM-DD
    section Phase 1
    Story 1           :2025-11-01, 5d
    Story 2           :2025-11-06, 3d
    section Phase 2
    Story 3           :2025-11-09, 5d
````

## ✅ Epic Acceptance Criteria

- [ ] [Epic 레벨의 완료 조건 1]
- [ ] [Epic 레벨의 완료 조건 2]
- [ ] [Epic 레벨의 완료 조건 3]

## 🔧 Technical Architecture

### Components

- [주요 컴포넌트 1]
- [주요 컴포넌트 2]

### Data Flow

```
[User] → [Component] → [API] → [Storage]
```

### Dependencies

- [기술적 의존성 1]
- [기술적 의존성 2]

## 📊 Story Points Summary

| Story     | Points | Status   |
| --------- | ------ | -------- |
| Story 1   | 5      | ⏳ To Do |
| Story 2   | 3      | ⏳ To Do |
| **Total** | **8**  |          |

---

**Priority**: [High/Medium/Low]
**Status**: Epic Planning Complete
**Next Action**: Epic을 확인하신 후, 개별 Story 작성을 시작하겠습니다.

---

**승인 후 저장 경로**: `.cursor/calendar/artifacts/po/epic###-[epic-name].md`
**예시**: `.cursor/calendar/artifacts/po/epic001-calendar-system.md`

````

---

## 3. Technical Story Template

기술적 개선, 리팩토링, 인프라 작업을 위한 템플릿입니다.

```markdown
# Technical Story: [기술 작업명]

## 📋 Technical Goal

**As a** Developer
**I want** [기술적 목표]
**So that** [기대 효과]

## 🎯 Purpose

### Current Problem
[현재의 기술적 문제점 또는 개선이 필요한 이유]

### Proposed Solution
[제안하는 해결 방법]

### Expected Benefits
- ⚡ **성능**: [성능 개선 내용]
- 🧹 **코드 품질**: [품질 개선 내용]
- 🔧 **유지보수성**: [유지보수 개선 내용]
- 📈 **확장성**: [확장성 개선 내용]

## ✅ Acceptance Criteria

### Technical Requirements
- [ ] [기술적 요구사항 1]
- [ ] [기술적 요구사항 2]
- [ ] [기술적 요구사항 3]

### Quality Gates
- [ ] 기존 테스트 모두 통과
- [ ] 새로운 테스트 추가 (해당 시)
- [ ] 코드 커버리지 유지 또는 향상
- [ ] 성능 저하 없음 (또는 개선)
- [ ] 문서 업데이트 완료

## 📝 Tasks

### 🔍 Phase 1: Analysis & Planning
- [ ] 현재 코드 분석
- [ ] 영향 범위 파악
- [ ] 마이그레이션 계획 수립 (해당 시)
- [ ] 롤백 계획 수립

### 🧪 Phase 2: Test Preparation
- [ ] 기존 기능 보호를 위한 테스트 추가
- [ ] 리팩토링 후 검증 테스트 작성
- [ ] 성능 테스트 준비

### 🔧 Phase 3: Implementation
- [ ] [구체적 작업 1]
- [ ] [구체적 작업 2]
- [ ] [구체적 작업 3]

### ✅ Phase 4: Verification
- [ ] 모든 테스트 실행 및 통과 확인
- [ ] 성능 벤치마크 실행
- [ ] 수동 테스트 (해당 시)
- [ ] 코드 리뷰

### 📝 Phase 5: Documentation
- [ ] 변경 사항 문서화
- [ ] README 업데이트
- [ ] 마이그레이션 가이드 (해당 시)

## 📊 Story Points

**복잡도**: [1/2/3/5/8]

**위험도**: [High/Medium/Low]

## 🔧 Technical Details

### Before
```typescript
// 기존 코드 예시
````

### After

```typescript
// 개선된 코드 예시
```

### Breaking Changes

- [ ] [Breaking change 1] - 영향 범위: [...]
- [ ] [Breaking change 2] - 영향 범위: [...]

### Migration Guide (해당 시)

1. [마이그레이션 단계 1]
2. [마이그레이션 단계 2]

## 📈 Success Metrics

- **Before**: [현재 지표]
- **After**: [목표 지표]
- **Measurement**: [측정 방법]

---

**Priority**: [High/Medium/Low]
**Status**: Technical Story Complete
**Next Action**: 내용을 확인하신 후 승인해주시면 @test-writer에게 테스트 케이스 작성을 요청하겠습니다.

---

**승인 후 저장 경로**: `.cursor/calendar/artifacts/po/ts###-[tech-task-name].md`
**예시**: `.cursor/calendar/artifacts/po/ts001-state-management-refactor.md`

```

---

## 템플릿 선택 가이드

### 언제 어떤 템플릿을 사용할까?

| 상황 | 템플릿 | 예시 |
|------|--------|------|
| 새로운 기능 추가 | Standard User Story | "일정 추가 기능", "필터링 기능" |
| 큰 기능 영역 | Epic | "캘린더 뷰 전체", "반복 일정 시스템" |
| 코드 개선/리팩토링 | Technical Story | "상태 관리 개선", "성능 최적화" |
| 기술 조사 필요 | Spike | "날짜 라이브러리 선정", "저장소 방식 결정" |
| 버그 수정 | Bug Fix | "일정 삭제 오류", "날짜 표시 버그" |

### 템플릿 커스터마이징

- 프로젝트 특성에 맞게 섹션 추가/제거 가능
- 팀의 워크플로우에 맞게 조정
- 중요한 것은 **일관성** 유지

---

**Version**: 1.0.0
**Last Updated**: 2025-10-29
**Maintained by**: PO Agent
```
