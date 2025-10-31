# Feature Designer: 계약 명세서 (Contract)

## 목차

1. [개요](#개요)
2. [입력 계약](#입력-계약)
3. [출력 계약](#출력-계약)
4. [검증 기준](#검증-기준)
5. [Handoff 문서 형식](#handoff-문서-형식)
6. [격리 계약](#격리-계약)
7. [에러 처리](#에러-처리)

---

## 개요

Feature Designer는 **Phase 1**에서 동작하며, 사용자 요구사항을 개발 가능한 기술 명세서로 변환하는 역할을 수행한다.

**핵심 책임:**
- 요구사항 분석 및 명확화
- 컴포넌트 아키텍처 설계
- 데이터 흐름 및 상태 관리 전략 수립
- API 인터페이스 설계
- TypeScript 타입 정의
- 테스트 가능한 설계 작성

**선행 조건:**
- Phase 0 (Planning)이 완료되어야 함
- Orchestrator가 생성한 Handoff 문서가 존재해야 함

**후속 단계:**
- Phase 2 (Test Design)로 전달
- Test Designer가 이 명세서를 기반으로 테스트 전략 수립

---

## 입력 계약

### Handoff 문서 경로

```
.claude/agent-docs/orchestrator/handoff/phase1.md
```

### 필수 입력 항목

```yaml
---
phase: 1
agent: feature-designer
timestamp: [ISO 8601 형식]
status: ready

inputs:
  requirement: |
    [사용자 요구사항 상세 설명]
    - 기능 목표
    - 성공 기준
    - 제약 사항

  context_files:
    - CLAUDE.md                    # 프로젝트 규칙
    - .claude/docs/folder-tree.md  # 프로젝트 구조
    - [관련 파일 경로들]

references:
  agent_definition: ../../agents/feature-designer.md
  project_architecture: CLAUDE.md

output_requirements:
  path: .claude/agent-docs/feature-designer/logs/spec.md
  required_sections:
    - 요구사항 요약
    - 기술 설계
    - 컴포넌트 구조
    - 데이터 흐름
    - API 설계
    - 타입 정의
    - 테스트 전략
    - 구현 계획

constraints:
  - CLAUDE.md 컨벤션 준수
  - 기존 아키텍처 패턴 유지 (Hooks vs Utils 분리)
  - 테스트 가능하도록 설계
  - 순수 함수 원칙 준수 (Utils)
  - Material-UI 컴포넌트 사용

validation_criteria:
  - 모든 TypeScript 타입이 정의되었는가
  - API 엔드포인트가 명확히 설계되었는가
  - 컴포넌트 구조가 명확한가
  - 테스트 전략이 구체적인가
  - 엣지 케이스가 고려되었는가
---
```

### 입력 데이터 구조

#### 1. requirement (필수)

```typescript
{
  feature_name: string;           // 기능 명칭
  user_story: string;             // 사용자 스토리 또는 문제 정의
  success_criteria: string[];     // 성공 기준 목록
  constraints: string[];          // 제약 조건
  edge_cases?: string[];          // 고려할 엣지 케이스
  priority: 'critical' | 'high' | 'medium' | 'low';
}
```

#### 2. context_files (필수)

최소 포함 파일:
- `CLAUDE.md` - 프로젝트 규칙
- `.claude/docs/folder-tree.md` - 프로젝트 구조

선택 파일:
- 관련된 기존 컴포넌트 파일
- 수정이 필요한 훅 파일
- 타입 정의 파일 (`src/types.ts`)

#### 3. references (필수)

- `agent_definition`: feature-designer.md 경로
- `project_architecture`: CLAUDE.md 경로

---

## 출력 계약

### 출력 파일 경로

```
.claude/agent-docs/feature-designer/logs/spec.md
```

### 필수 출력 구조

```markdown
# 기능: [기능명]

## 1. 요구사항 요약

### 1.1 기능 개요
[무엇을 왜 만들어야 하는지]

### 1.2 사용자 스토리
[사용자 관점의 시나리오]

### 1.3 성공 기준
- [ ] 기준 1
- [ ] 기준 2

### 1.4 제약 조건
- 제약 1
- 제약 2

## 2. 기술 설계

### 2.1 컴포넌트 아키텍처

#### 컴포넌트 계층
[컴포넌트 트리 구조]

#### Props 인터페이스
```typescript
interface ComponentProps {
  // 타입 정의
}
```

#### 상태 관리 전략
[로컬 상태 vs 커스텀 훅]

### 2.2 데이터 흐름

#### 상태 흐름 다이어그램
```
User Action → Handler → State Update → UI Render
```

#### 이벤트 처리 패턴
[handle 접두사 함수들]

#### API 연동 지점
[useEventOperations 패턴 참고]

### 2.3 API 설계

#### 엔드포인트 명세

**생성 (POST /api/events)**
```typescript
Request: {
  body: EventForm
}
Response: {
  success: Event
  error?: string
}
```

#### 에러 처리 전략
[notistack 통합 방법]

### 2.4 타입 정의

```typescript
// src/types.ts에 추가할 타입들
export interface NewType {
  // 타입 정의
}
```

### 2.5 파일 구조

**생성할 파일:**
- `src/hooks/useNewFeature.ts`
- `src/utils/newFeatureUtils.ts`

**수정할 파일:**
- `src/App.tsx` (통합 지점)
- `src/types.ts` (타입 추가)

## 3. 테스트 가능한 동작

### 3.1 핵심 동작 (반드시 테스트)

1. **동작 이름**: [설명]
   - **Given**: 초기 상태
   - **When**: 동작 트리거
   - **Then**: 예상 결과
   - **테스트 유형**: 단위 / 통합

### 3.2 엣지 케이스

1. **엣지 케이스 이름**: [설명]
   - **입력**: 경계값
   - **예상**: 예상 동작
   - **오류 처리**: 처리 방식

### 3.3 오류 시나리오

1. **오류 이름**: [설명]
   - **트리거**: 발생 원인
   - **예상 메시지**: 한국어 메시지
   - **복구 방법**: 시스템 복구

## 4. 구현 계획

### 4.1 단계별 구현

1. **Phase 1**: 타입 정의
2. **Phase 2**: 유틸 함수 작성
3. **Phase 3**: 커스텀 훅 구현
4. **Phase 4**: UI 컴포넌트 작성
5. **Phase 5**: 통합 및 테스트

### 4.2 우선순위

- **P0 (필수)**: 핵심 기능
- **P1 (중요)**: 주요 기능
- **P2 (선택)**: 부가 기능

## 5. 통합 지점

### 5.1 기존 코드와의 통합
[어디에 어떻게 통합할지]

### 5.2 의존성
[필요한 외부 라이브러리]

## 6. 위험 평가

### 6.1 기술적 난제
[예상되는 어려움]

### 6.2 대안 접근법
[다른 구현 방법]

### 6.3 영향 분석
[기존 코드에 미치는 영향]

## 7. 미해결 질문

- [ ] 질문 1
- [ ] 질문 2
```

---

## 검증 기준

### Phase 1 완료 조건

#### 필수 체크리스트

- ✅ **요구사항 명확성**
  - 모든 요구사항이 구체적으로 정의됨
  - 모호한 부분이 없거나 질문으로 명시됨
  - 성공 기준이 측정 가능함

- ✅ **타입 정의 완전성**
  - 모든 데이터 구조에 TypeScript 타입 정의
  - EventForm vs Event 구분 명확
  - any 타입 미사용

- ✅ **컴포넌트 설계 명확성**
  - 컴포넌트 계층 구조 명확
  - Props 인터페이스 정의 완료
  - 상태 관리 전략 명시

- ✅ **API 설계 완전성**
  - 모든 엔드포인트 정의
  - 요청/응답 스키마 명시
  - 에러 처리 전략 수립

- ✅ **테스트 전략 구체성**
  - 핵심 동작 정의 (Given-When-Then)
  - 엣지 케이스 식별
  - 테스트 유형 분류 (단위/통합/E2E)

- ✅ **프로젝트 규칙 준수**
  - CLAUDE.md 컨벤션 준수
  - 파일 명명 규칙 적용
  - Import 순서 규칙 반영
  - Hooks vs Utils 분리 원칙 준수

### 검증 명령어

```bash
# 명세서 파일 존재 확인
ls -la .claude/agent-docs/feature-designer/logs/spec.md

# 명세서 내용 검토
cat .claude/agent-docs/feature-designer/logs/spec.md | head -50

# 필수 섹션 존재 확인
grep -E "^## [0-9]\." .claude/agent-docs/feature-designer/logs/spec.md
```

### 품질 기준

**구체성 (Specificity)**
- ❌ "사용자 인터페이스를 개선한다"
- ✅ "Material-UI Select 컴포넌트로 카테고리 드롭다운 추가"

**완전성 (Completeness)**
- 모든 컴포넌트, 훅, 유틸, 타입이 정의됨
- API 엔드포인트가 모두 설계됨
- 에러 시나리오가 고려됨

**일관성 (Consistency)**
- 기존 프로젝트 패턴 준수
- 네이밍 규칙 일관성
- 아키텍처 원칙 유지

**명확성 (Clarity)**
- 코드 예시 포함
- 다이어그램 제공
- 개발자가 바로 구현 가능한 수준

---

## Handoff 문서 형식

### Phase 1 → Phase 2 전환

Orchestrator가 다음 Handoff 문서 생성:

```yaml
---
phase: 2
agent: test-designer
timestamp: [ISO 8601]
status: ready
previous_phase: 1

inputs:
  feature_spec: .claude/agent-docs/feature-designer/logs/spec.md
  context_files:
    - CLAUDE.md
    - src/types.ts
    - [관련 파일들]

references:
  agent_definition: ../../agents/test-designer.md
  test_conventions: ../../docs/rule-of-make-good-test.md

output_requirements:
  path: .claude/agent-docs/test-designer/logs/test-strategy.md
  required_sections:
    - 테스트 전략 개요
    - 테스트 케이스 목록
    - 목킹 계획
    - 구현 가이드

validation_criteria:
  - 모든 핵심 동작에 테스트 케이스가 있는가
  - GWT 패턴을 준수하는가
  - 테스트 파일 명명 규칙이 명확한가
---
```

---

## 격리 계약

### Feature Designer가 할 수 있는 것

✅ **허용:**
- Handoff 문서 읽기
- agent-designer.md 참조
- CLAUDE.md 읽기
- 프로젝트 구조 파일 읽기
- context_files에 명시된 파일 읽기
- logs/spec.md 작성
- references/ 디렉토리에 참고 자료 저장

### Feature Designer가 할 수 없는 것

❌ **금지:**
- 다른 Phase의 Handoff 문서 읽기
- Orchestrator의 전체 계획 접근
- 다른 에이전트 실행 컨텍스트 접근
- 프로덕션 코드 직접 수정
- 테스트 코드 작성 (Test Writer의 역할)
- Git 커밋 생성

### 순수 함수 원칙

```typescript
// 개념적 모델
type FeatureDesigner = (handoff: HandoffDoc) => Spec;

// 특성
// - 동일한 Handoff → 동일한 Spec
// - 외부 상태에 의존하지 않음
// - 부수 효과 없음 (파일 쓰기 제외)
// - 다른 에이전트와 독립적
```

---

## 에러 처리

### 입력 검증 실패

**상황:** Handoff 문서가 불완전함

**조치:**
1. 누락된 항목 명확히 기록
2. `references/issues-log.md`에 문제 기록
3. Orchestrator에게 보고 (출력 문서에 명시)

**예시:**
```markdown
## ⚠️ 입력 검증 실패

### 누락 항목
- [ ] 성공 기준 미정의
- [ ] 제약 조건 불명확
- [ ] 엣지 케이스 고려 부족

### 필요한 정보
1. 사용자가 "카테고리 필터"로 무엇을 기대하는가?
2. 필터 적용 시 기존 검색과 어떻게 통합되는가?
3. 성능 요구사항은?
```

### 요구사항 모호성

**상황:** 여러 해석이 가능한 요구사항

**조치:**
1. 가능한 해석 나열
2. 각 해석의 장단점 분석
3. 권장 사항 제시
4. 사용자 결정 대기

**예시:**
```markdown
## 🤔 명확화 필요

### 질문 1: "드래그 앤 드롭"의 범위
**옵션 A:** 일정을 다른 날짜로 이동만
**옵션 B:** 일정 시간 조정도 가능
**옵션 C:** 일정 복사 기능 포함

**권장:** 옵션 A (최소 구현)
**이유:** 복잡도 최소화, 테스트 용이

### 결정 필요
사용자 승인 대기
```

### 아키텍처 충돌

**상황:** 요구사항이 기존 아키텍처와 충돌

**조치:**
1. 충돌 지점 명시
2. 대안 제시
3. 트레이드오프 분석
4. 리팩터링 필요 여부 평가

**예시:**
```markdown
## ⚠️ 아키텍처 충돌

### 문제
요구사항: 전역 알림 큐 필요
현재: 로컬 상태만 사용 (전역 상태 라이브러리 없음)

### 대안
1. **Context API 활용** (권장)
   - 장점: 외부 라이브러리 불필요
   - 단점: 보일러플레이트 코드 증가

2. **Zustand 도입**
   - 장점: 간결한 코드
   - 단점: 아키텍처 원칙 위반

### 권장
대안 1 (Context API)
```

---

## 작업 산출물

### 핵심 파일

```
.claude/agent-docs/feature-designer/
├── logs/
│   ├── spec.md                    # 기술 명세서 (필수)
│   └── clarifications.md          # 질문 사항 (필요 시)
│
└── references/
    ├── architecture-decisions.md  # 아키텍처 결정 기록
    └── alternatives.md            # 대안 분석
```

### spec.md 템플릿

상단 [출력 계약](#출력-계약) 섹션 참조

### clarifications.md 템플릿

```markdown
# 명확화 필요 사항

작성일: [날짜]
기능: [기능명]

## 질문 목록

### 질문 1: [제목]
**현재 이해:**
[현재 이해한 내용]

**불명확한 점:**
[무엇이 모호한지]

**가능한 해석:**
1. 해석 A
2. 해석 B

**권장 해석:**
[추천 방향]

**영향:**
[각 해석에 따른 구현 영향]

---

### 질문 2: [제목]
[위와 동일한 구조]
```

---

## 성공 사례

### 좋은 명세서 예시

```markdown
# 기능: 카테고리별 이벤트 필터링

## 1. 요구사항 요약

### 1.1 기능 개요
사용자가 일정 목록을 카테고리(업무, 개인, 기타)별로 필터링할 수 있는 기능.
사이드바에 드롭다운 UI를 추가하여 선택한 카테고리의 이벤트만 표시.

### 1.2 사용자 스토리
- 사용자는 "업무" 카테고리를 선택하면 업무 일정만 표시됨
- "전체" 선택 시 모든 일정 표시
- 필터는 달력 뷰와 일정 목록 모두에 적용

### 1.3 성공 기준
- [x] 드롭다운에서 카테고리 선택 가능
- [x] 선택한 카테고리의 이벤트만 표시
- [x] "전체" 선택 시 모든 이벤트 표시
- [x] 달력 뷰와 일정 목록이 동기화됨

## 2. 기술 설계

### 2.1 컴포넌트 아키텍처

#### 수정 컴포넌트
- App.tsx: CategoryFilter 컴포넌트 추가

#### 새 컴포넌트
```typescript
// 인라인으로 App.tsx에 추가 (분리하지 않음)
const CategoryFilter = () => {
  return (
    <FormControl sx={{ minWidth: 120 }}>
      <InputLabel id="category-filter-label">카테고리</InputLabel>
      <Select
        labelId="category-filter-label"
        value={selectedCategory}
        onChange={handleCategoryChange}
        label="카테고리"
        data-testid="category-filter"
      >
        <MenuItem value="all">전체</MenuItem>
        <MenuItem value="업무">업무</MenuItem>
        <MenuItem value="개인">개인</MenuItem>
        <MenuItem value="기타">기타</MenuItem>
      </Select>
    </FormControl>
  );
};
```

#### 상태 관리
- 로컬 상태로 selectedCategory 관리
- useSearch 훅에 카테고리 필터 로직 추가

### 2.2 데이터 흐름

```
User selects category
  ↓
handleCategoryChange
  ↓
setSelectedCategory (local state)
  ↓
useSearch 훅의 filteredEvents 재계산
  ↓
Calendar + EventList 리렌더
```

### 2.3 API 설계

**API 변경 없음** (클라이언트 측 필터링)

### 2.4 타입 정의

```typescript
// src/types.ts - 기존 타입 사용, 추가 불필요
// Event 타입에 이미 category 필드 존재
```

### 2.5 파일 구조

**수정할 파일:**
- `src/App.tsx` (CategoryFilter 컴포넌트 추가)
- `src/hooks/useSearch.ts` (카테고리 필터 로직 추가)

**생성할 파일:** 없음

## 3. 테스트 가능한 동작

### 3.1 핵심 동작

1. **카테고리 선택 시 필터링**
   - **Given**: 여러 카테고리의 이벤트가 존재
   - **When**: "업무" 카테고리 선택
   - **Then**: 업무 이벤트만 표시
   - **테스트 유형**: 통합 테스트

2. **전체 선택 시 모든 이벤트 표시**
   - **Given**: 특정 카테고리가 선택된 상태
   - **When**: "전체" 선택
   - **Then**: 모든 이벤트 표시
   - **테스트 유형**: 통합 테스트

### 3.2 엣지 케이스

1. **선택한 카테고리에 이벤트가 없는 경우**
   - **입력**: 이벤트가 없는 카테고리 선택
   - **예상**: 빈 목록 표시 + "일정이 없습니다" 메시지
   - **오류 처리**: UI 피드백

## 4. 구현 계획

### 4.1 단계별 구현

1. **Step 1**: useSearch 훅에 category 파라미터 추가
2. **Step 2**: App.tsx에 CategoryFilter 컴포넌트 추가
3. **Step 3**: selectedCategory 상태 관리
4. **Step 4**: 필터 로직 구현
5. **Step 5**: UI 통합 및 스타일링

### 4.2 우선순위
- **P0**: 카테고리 필터 기본 기능
- **P1**: 빈 상태 UI 처리
- **P2**: 필터 상태 localStorage 저장 (선택)

## 5. 통합 지점

### 5.1 기존 코드와의 통합
- useSearch 훅의 기존 검색 기능과 AND 조건으로 결합
- 검색어 + 카테고리 필터 동시 적용 가능

## 6. 위험 평가

### 6.1 기술적 난제
- 없음 (단순 클라이언트 필터링)

### 6.2 영향 분석
- 기존 검색 로직에 최소 영향
- useSearch 훅만 수정하면 됨
```

**왜 좋은가:**
- ✅ 요구사항이 구체적이고 측정 가능
- ✅ 타입과 컴포넌트가 명확히 정의됨
- ✅ 테스트 시나리오가 GWT로 작성됨
- ✅ 단계별 구현 계획이 명확
- ✅ 프로젝트 규칙 (Hooks vs Utils, 파일 구조) 준수

---

## 참고 자료

- [Feature Designer 역할 정의](../../agents/feature-designer.md)
- [프로젝트 규칙 (CLAUDE.md)](../../../CLAUDE.md)
- [Orchestrator 계약](../orchestrator/contract.md)
- [Test Designer 계약](../test-designer/contract.md)
