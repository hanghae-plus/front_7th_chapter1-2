# Feature Designer 에이전트 시작 가이드

> **목적**: Feature Designer 에이전트를 처음 사용하는 사용자를 위한 빠른 시작 가이드
> **대상**: Orchestrator, 개발 팀
> **소요 시간**: 약 15분

---

## 📖 문서 읽기 순서

Feature Designer 에이전트를 이해하기 위해 다음 순서로 문서를 읽어주세요:

### 1️⃣ 첫 번째: 역할과 정체성 이해
📄 **[feature-designer.md](../../agents/feature-designer.md)** - "나는 누구인가?"

**읽는 목적**:
- Feature Designer가 무엇을 하는 에이전트인지 이해
- Phase 1 (Feature Design)에서의 역할 파악
- 언제 이 에이전트를 사용해야 하는지 판단
- Orchestrator와의 상호작용 방식 이해

**핵심 개념**:
- 기술 명세서 작성 전문가
- 요구사항 분석 및 설계 문서 생성
- 단순성 원칙: 설계에만 집중, 코드는 작성하지 않음

**예상 소요 시간**: 5분

---

### 2️⃣ 두 번째: 입출력 계약 이해
📄 **[contract.md](./contract.md)** - "무엇을 주고받는가?"

**읽는 목적**:
- Phase 1의 입력/출력 형식 이해
- Handoff 문서 구조 파악
- spec.md 작성 요구사항 확인
- 검증 기준 확인

**핵심 개념**:
- Input Contract: Handoff 문서 → 요구사항 분석
- Output Contract: 기술 명세서(spec.md) 생성
- Validation Contract: Phase 1 완료 조건
- Isolation Contract: 에이전트 독립성 보장

**예상 소요 시간**: 10분

---

### 3️⃣ 세 번째: 실행 방법 학습
📄 **[prompt.md](./prompt.md)** - "어떻게 하는가?"

**읽는 목적**:
- Phase 1 실행 절차 학습 (10단계)
- spec.md 작성 가이드 습득
- 검증 절차 이해
- 문제 해결 방법 학습

**핵심 개념**:
- 10단계 실행 워크플로우
- 명세서 작성 템플릿
- GWT 패턴으로 테스트 시나리오 작성
- 자가 검증 체크리스트

**예상 소요 시간**: 15분

---

### 4️⃣ 네 번째: 프로젝트 규칙 확인
📄 **[CLAUDE.md](../../../CLAUDE.md)** - 프로젝트 전체 규칙

**읽는 목적**:
- 코드 컨벤션 확인
- 아키텍처 패턴 이해
- 파일 구조 숙지

**주요 항목**:
- Hooks vs Utils 분리 원칙
- 명명 규칙 (camelCase, PascalCase, etc.)
- Import 순서 규칙
- 타입 시스템 (EventForm vs Event)

**예상 소요 시간**: 10분

---

## 🚀 빠른 시작 가이드

### 전제 조건

다음 파일들이 존재해야 합니다:

- ✅ `CLAUDE.md` - 프로젝트 규칙 및 컨벤션
- ✅ `.claude/agents/feature-designer.md` - Feature Designer 역할 정의
- ✅ `.claude/agent-docs/orchestrator/handoff/phase1.md` - Orchestrator의 Phase 1 Handoff 문서

### 폴더 구조 확인

```bash
.claude/
├── agents/
│   └── feature-designer.md           # 역할 정의
└── agent-docs/
    ├── orchestrator/
    │   └── handoff/
    │       └── phase1.md              # Handoff 입력 문서
    └── feature-designer/
        ├── getting-started.md         # 이 문서
        ├── contract.md                # 계약 명세
        ├── prompt.md                  # 실행 매뉴얼
        ├── logs/                      # 산출물 (작업 중 생성)
        │   └── spec.md
        └── references/                # 참조 자료 (선택)
            ├── clarifications.md      # 질문 사항
            └── alternatives.md        # 대안 분석
```

---

## 🎯 Feature Designer의 역할

### 핵심 책임

Feature Designer는 **Phase 1**에서 다음 작업을 수행합니다:

1. **요구사항 분석**: Orchestrator로부터 받은 Handoff 문서 분석
2. **명확화**: 모호한 부분 식별 및 질문 작성
3. **아키텍처 설계**: 컴포넌트, 훅, 유틸 구조 설계
4. **데이터 흐름 설계**: 상태 관리 및 API 통신 전략 수립
5. **타입 정의**: TypeScript 타입 명세 작성
6. **테스트 전략**: 테스트 시나리오 GWT 패턴으로 작성
7. **기술 명세서**: spec.md 생성

### 해야 할 것 (✅)

- 기술 명세서(spec.md) 작성
- 컴포넌트 아키텍처 다이어그램
- TypeScript 타입 정의
- API 인터페이스 설계
- 테스트 시나리오 (GWT 패턴)
- 구현 계획 및 단계 정의
- 위험 평가 및 대안 분석

### 하지 말아야 할 것 (❌)

- 실제 코드 구현 (Code Writer의 역할)
- 테스트 코드 작성 (Test Writer의 역할)
- 외부 라이브러리 도입 결정 (아키텍처 검토 필요)
- 프로덕션 코드 파일 수정
- Git 커밋 생성

---

## 🔄 언제 Feature Designer를 사용하는가?

### 사용 시나리오

Feature Designer는 **Orchestrator의 Phase 1**에서 자동으로 호출됩니다.

#### 시나리오 1: 새 기능 추가
```
사용자 요구사항:
"캘린더에 카테고리별 필터링 기능 추가"
↓
Orchestrator가 분석
↓
Feature Designer 호출 (Phase 1)
↓
spec.md 생성 후 Test Designer로 전달 (Phase 2)
```

#### 시나리오 2: 기능 개선
```
사용자 요구사항:
"드래그 앤 드롭으로 일정 시간 변경"
↓
Orchestrator가 분석
↓
Feature Designer 호출 (Phase 1)
↓
spec.md 생성 후 Test Designer로 전달 (Phase 2)
```

#### 시나리오 3: 버그 수정
```
사용자 요구사항:
"겹치는 일정 감지 로직 오류 수정"
↓
Orchestrator가 분석
↓
Feature Designer 호출 (Phase 1)
↓
spec.md 생성 후 Test Designer로 전달 (Phase 2)
```

---

## 📋 단계별 워크플로우

### Feature Designer의 7단계 실행 프로세스

```
Handoff 문서 읽기
      ↓
컨텍스트 파일 분석
      ↓
요구사항 명확화
      ↓
아키텍처 설계
      ↓
API 인터페이스 설계
      ↓
타입 정의 및 테스트 전략
      ↓
명세서 작성 및 검증
      ↓
Orchestrator에 보고
```

### Phase 1 입력 → 출력 흐름

```yaml
# 입력 (Orchestrator의 Handoff 문서)
---
phase: 1
agent: feature-designer
inputs:
  requirement: "사용자 요구사항"
  context_files:
    - CLAUDE.md
    - src/types.ts
    - [관련 파일들]
---

# 처리 (Feature Designer의 작업)
↓ 요구사항 분석
↓ 컴포넌트 설계
↓ 데이터 흐름 설계
↓ 테스트 전략 수립

# 출력 (명세서 생성)
.claude/agent-docs/feature-designer/logs/spec.md
```

---

## 🔍 실제 예시: 카테고리 필터링 기능

### 요구사항

```
사용자가 일정을 카테고리(업무, 개인, 기타)별로 필터링할 수 있는 기능.
사이드바에 드롭다운 UI를 추가하여 선택한 카테고리의 이벤트만 표시.
```

### Phase 1: Handoff 문서 입력

```yaml
---
phase: 1
agent: feature-designer
timestamp: 2025-10-30T10:00:00Z

inputs:
  requirement: |
    카테고리별 이벤트 필터링
    - "업무", "개인", "기타" 카테고리 선택 가능
    - 선택한 카테고리의 이벤트만 표시
    - "전체" 선택 시 모든 이벤트 표시

  context_files:
    - CLAUDE.md
    - src/types.ts
    - src/App.tsx
    - src/hooks/useSearch.ts

output_requirements:
  path: .claude/agent-docs/feature-designer/logs/spec.md
  required_sections:
    - 요구사항 요약
    - 기술 설계
    - 컴포넌트 구조
    - 테스트 전략
---
```

### Phase 1: Feature Designer의 명세서 출력 (spec.md 일부)

```markdown
# 기능: 카테고리별 이벤트 필터링

## 1. 요구사항 요약

### 1.1 기능 개요
사용자가 일정을 카테고리별로 필터링하는 기능.
사이드바에 드롭다운을 추가하여 "업무", "개인", "기타", "전체" 중 선택 가능.

### 1.2 사용자 스토리
- 사용자는 "업무" 카테고리 선택 시 업무 일정만 봄
- "전체" 선택 시 모든 일정 표시
- 필터는 달력 뷰와 일정 목록 모두에 적용

### 1.3 성공 기준
- [x] 드롭다운에서 카테고리 선택 가능
- [x] 선택한 카테고리의 이벤트만 표시
- [x] "전체" 선택 시 모든 이벤트 표시

## 2. 기술 설계

### 2.1 컴포넌트 아키텍처

#### 컴포넌트 계층
```
App
├── Sidebar
│   ├── CategoryFilter (신규)
│   └── SearchBar (기존)
├── CalendarView
└── EventList
```

#### Props 인터페이스
```typescript
interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
}
```

### 2.2 데이터 흐름

#### 상태 흐름
```
User selects category
  ↓
handleCategoryChange
  ↓
setSelectedCategory (App.tsx state)
  ↓
useSearch 훅의 filteredEvents 재계산
  ↓
CalendarView + EventList 리렌더
```

### 2.4 타입 정의

#### 새 타입
```typescript
// src/types.ts에 추가
export type CategoryType = 'all' | '업무' | '개인' | '기타';

export interface CategoryFilterState {
  selectedCategory: CategoryType;
}
```

## 3. 테스트 가능한 동작

### 3.1 핵심 동작

#### 동작 1: 카테고리 선택 시 필터링
- **Given**: 여러 카테고리의 이벤트가 존재
- **When**: 사용자가 "업무" 카테고리 선택
- **Then**: 업무 이벤트만 표시됨
- **테스트 유형**: 통합 테스트

#### 동작 2: 전체 선택 시 모든 이벤트 표시
- **Given**: "업무" 카테고리가 선택된 상태
- **When**: "전체" 선택
- **Then**: 모든 이벤트 표시
- **테스트 유형**: 통합 테스트

### 3.2 엣지 케이스

#### 케이스 1: 선택한 카테고리에 이벤트가 없음
- **입력**: 이벤트가 없는 카테고리 선택
- **예상**: 빈 목록 + "일정이 없습니다" 메시지
- **오류 처리**: UI 피드백

## 4. 구현 계획

### 4.1 단계별 구현
1. useSearch 훅에 category 파라미터 추가
2. App.tsx에 CategoryFilter 컴포넌트 추가
3. selectedCategory 상태 관리
4. 필터 로직 구현
5. UI 통합 및 스타일링

### 4.2 우선순위
- **P0 (필수)**: 카테고리 필터 기본 기능
- **P1 (중요)**: 빈 상태 UI 처리

## 5. 통합 지점

### 5.1 기존 코드와의 통합
- useSearch 훅의 기존 검색 기능과 AND 조건으로 결합
- 검색어 + 카테고리 필터 동시 적용 가능

### 5.2 영향 받는 파일
- `src/App.tsx` - 컴포넌트 추가, 상태 관리
- `src/hooks/useSearch.ts` - 필터 로직 확장
```

### Phase 1 → Phase 2 전달

```
Feature Designer가 spec.md 작성 완료
  ↓
Orchestrator가 검증
  ↓
검증 통과 → Phase 2 Handoff 생성
  ↓
Test Designer가 호출 (테스트 전략 수립)
```

---

## ⚠️ 주의사항

### 1. Handoff 문서는 필수

Feature Designer는 항상 **Orchestrator의 Handoff 문서**를 입력으로 받아야 합니다:

```bash
# ✅ 올바른 순서
Orchestrator (Phase 0)
  ↓ Handoff 생성
Feature Designer (Phase 1)
  ↓ spec.md 생성

# ❌ 잘못된 순서
Feature Designer 직접 호출 (Handoff 없음)
```

### 2. 명확화 문서 작성

요구사항이 모호하면 `references/clarifications.md`를 작성하세요:

```markdown
# 명확화 필요 사항

## 질문 1: 카테고리 다중 선택 여부

**현재 이해**: 단일 선택만 지원
**불명확한 점**: 사용자가 여러 카테고리를 동시에 선택할 수 있어야 하는가?

**가능한 해석**:
1. 옵션 A: 단일 선택 (현재 설계)
2. 옵션 B: 다중 선택 (체크박스 UI 필요)

**권장 해석**: 옵션 A (단순성)

**영향**: 다중 선택 시 UI 복잡도 증가, 개발 시간 +2일
```

### 3. 아키텍처 규칙 준수

CLAUDE.md의 규칙을 **반드시** 준수하세요:

```typescript
// ✅ 올바른 패턴

// Hooks: 상태 관리
export const useSearch = (events: Event[], options?: SearchOptions) => {
  const [searchTerm, setSearchTerm] = useState('');
  // ... API 호출, 상태 관리
  return { searchTerm, filteredEvents };
};

// Utils: 순수 함수만
export const filterEventsByCategory = (
  events: Event[],
  category: string
): Event[] => {
  if (category === 'all') return events;
  return events.filter(event => event.category === category);
};

// ❌ 잘못된 패턴
export const filterEvents = (events: Event[], category: string) => {
  // API 호출 금지
  const data = await fetch('/api/events');
  // ...
};
```

### 4. 테스트 시나리오는 GWT 패턴 필수

```markdown
# ❌ 나쁜 예
### 동작: 필터링이 작동한다
- 테스트하면 됨

# ✅ 좋은 예
### 동작: 카테고리 선택 시 필터링
- **Given**: 여러 카테고리의 이벤트가 존재 (초기 상태)
- **When**: 사용자가 "업무" 카테고리 선택 (동작)
- **Then**: 업무 이벤트만 표시됨 (결과)
- **테스트 유형**: 통합 테스트 (분류)
```

---

## 🔧 Common Pitfalls과 해결책

### Pitfall 1: 코드 작성 시작

**증상**: spec.md에 완전한 TypeScript 코드 포함

**문제**: 설계와 구현의 경계를 흐리게 함

**해결책**:
```typescript
// ❌ 완전한 구현 코드
export const CategoryFilter = () => {
  const [selected, setSelected] = useState('all');
  useEffect(() => {
    // 복잡한 로직
  }, []);
  return <Select value={selected} onChange={...} />;
};

// ✅ 설계 수준의 코드 예시
interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: CategoryType[];
}

// Material-UI Select 컴포넌트 사용
// Props: selectedCategory, onCategoryChange
// 이벤트: onChange → onCategoryChange 호출
```

### Pitfall 2: 모호한 요구사항 무시

**증상**: "요구사항을 명확히 하기 어렵다고 생각"

**문제**: Test Designer와 Code Writer가 다른 해석으로 구현

**해결책**:
```bash
1. clarifications.md 작성
2. 가능한 해석 모두 나열
3. 권장 해석 제시 (근거 포함)
4. spec.md에서 참조

예시:
"질문 1: 다중 선택 지원"
- 옵션 A: 단일 선택 (권장, 단순)
- 옵션 B: 다중 선택 (고급)

명세서는 옵션 A로 작성. 필요 시 옵션 B로 확장.
```

### Pitfall 3: 프로젝트 규칙 위반

**증상**: Import 순서, 파일명 규칙 등 무시

**문제**: 코드 리뷰 시 규칙 위반 지적

**해결책**:
```typescript
// ❌ 틀린 Import 순서
import { useSearch } from '../hooks/useSearch';
import React from 'react';
import { Box } from '@mui/material';

// ✅ 올바른 Import 순서
import React from 'react';
import { Box } from '@mui/material';

import { useSearch } from '../hooks/useSearch';
```

### Pitfall 4: 반복 일정 기능 설계

**증상**: RepeatInfo 타입 활용, 반복 로직 포함

**문제**: 8주차 예정 기능이므로 현재 제외해야 함

**해결책**:
```typescript
// ❌ 사용하지 말 것
export interface Event extends EventForm {
  id: string;
  repeat?: RepeatInfo;  // 현재 주석 처리됨
}

// ✅ 올바른 접근
// 반복 일정은 8주차(Phase 구간 추후)에 구현
// 현재는 단일 일정만 설계
```

---

## 📚 FAQ

### Q1: spec.md의 길이는 어느 정도여야 하나?

**A**: 요구사항의 복잡도에 따라 다릅니다:

| 요구사항 | 예상 길이 | 작성 시간 |
|---------|----------|---------|
| 단순 (UI 추가) | 500-1000줄 | 1-2시간 |
| 중간 (새 훅) | 1000-2000줄 | 2-4시간 |
| 복잡 (API+훅+UI) | 2000-3000줄 | 4-6시간 |

**중요**: 모든 필수 섹션이 포함되어야 함. 길이보다 **완전성**이 중요합니다.

---

### Q2: 모호한 요구사항이 받으면 어떻게 하나?

**A**: 다음 절차를 따르세요:

1. **분석**: 가능한 모든 해석 나열
2. **기록**: clarifications.md에 작성
3. **설계**: 가장 합리적인 해석으로 설계
4. **참조**: spec.md에서 clarifications.md 링크
5. **보고**: Orchestrator가 사용자 확인

**예시**:
```markdown
## 🤔 명확화 필요

자세한 내용: [clarifications.md](../references/clarifications.md)

### 요약
- 질문 1: 다중 선택 지원 여부
- 질문 2: 필터 상태 저장 여부

### 현재 가정
명세서는 다음 가정 하에 작성:
- 단일 선택만 지원
- 상태 저장 안 함
```

---

### Q3: 테스트 시나리오는 몇 개 정도 작성해야 하나?

**A**: 핵심 동작에 대해 **최소 3-5개**의 시나리오를 작성하세요:

```markdown
## 3. 테스트 가능한 동작

### 3.1 핵심 동작 (필수)
- 동작 1: 기본 기능 (Happy Path)
- 동작 2: 대체 동작 (Alternative Path)
- 동작 3: 경계 조건 (Edge Case)

### 3.2 엣지 케이스
- 엣지 케이스 1: 빈 데이터
- 엣지 케이스 2: 최대값
- 엣지 케이스 3: 최소값

### 3.3 오류 시나리오 (필요 시)
- 오류 1: 네트워크 실패
- 오류 2: 유효성 검사 실패
```

**팁**: 너무 많으면 Test Designer가 구현하기 어렵습니다. **정말 중요한 것**에만 집중하세요.

---

### Q4: 기존 코드와의 통합 방법을 모를 때는?

**A**: 다음 파일들을 참조하세요:

```bash
# 기존 훅 패턴
cat src/hooks/useEventOperations.ts
cat src/hooks/useSearch.ts

# 기존 유틸 패턴
cat src/utils/dateUtils.ts
cat src/utils/eventUtils.ts

# 타입 정의
cat src/types.ts

# 메인 컴포넌트 구조
head -100 src/App.tsx
```

불확실하면 `references/integration-notes.md`를 작성하고 Orchestrator에 보고하세요.

---

### Q5: 컴포넌트를 분리할지 App.tsx에 인라인으로 작성할지 어떻게 결정하나?

**A**: 다음 기준으로 판단하세요:

| 판단 기준 | 분리 (O) | 인라인 (X) |
|---------|---------|-----------|
| 재사용 가능성 | 있음 | 없음 |
| 크기 | 100줄 이상 | 100줄 이하 |
| 상태 관리 | 복잡 | 단순 |
| 테스트 필요성 | 높음 | 낮음 |

**예시**:
```typescript
// ❌ 분리 불필요 (단순 드롭다운)
const CategoryFilter = () => {
  return (
    <Select value={selected} onChange={handleChange}>
      <MenuItem value="all">전체</MenuItem>
      <MenuItem value="업무">업무</MenuItem>
      <MenuItem value="개인">개인</MenuItem>
      <MenuItem value="기타">기타</MenuItem>
    </Select>
  );
};

// ✅ 분리 필요 (복잡한 폼)
const EventForm = () => {
  const { form, setForm, handleSubmit, error } = useEventForm();
  // 100줄 이상의 복잡한 로직
};
```

---

### Q6: API 설계는 얼마나 상세해야 하나?

**A**: 다음 수준으로 작성하세요:

```typescript
// 필수 정보
- 메서드 (GET, POST, PUT, DELETE)
- 경로 (/api/events)
- 요청 타입 및 필드
- 응답 타입 및 필드
- 에러 케이스

// 예시
/**
 * POST /api/events
 *
 * Request:
 * {
 *   title: string;          // 필수
 *   date: string;           // YYYY-MM-DD
 *   startTime: string;      // HH:mm
 *   endTime: string;        // HH:mm
 *   description?: string;   // 선택
 * }
 *
 * Response (201 Created):
 * {
 *   id: string;             // 서버에서 생성
 *   ...EventForm 필드들
 * }
 *
 * Error (400):
 * {
 *   error: "제목을 입력해주세요"
 * }
 */
```

---

## 🆘 문제 해결

### 문제 1: Handoff 문서가 불완전함

**증상**:
- 필수 항목 누락
- 요구사항이 너무 모호함

**조치**:
```markdown
## ⚠️ 입력 검증 실패

### 누락 항목
- [ ] context_files에 src/types.ts 미포함
- [ ] 성공 기준 불명확

### 필요한 조치
Orchestrator에게 보고하여 Handoff 문서 보완 요청.
```

---

### 문제 2: 요구사항이 아키텍처와 충돌

**증상**:
- 전역 상태 관리 라이브러리 필요
- 반복 일정 기능 관련

**조치**:
```markdown
## ⚠️ 아키텍처 충돌

### 문제
요구사항: 반복 일정 관리
현재: RepeatInfo는 주석 처리됨 (8주차 예정)

### 권장
현재 반복 일정 기능은 설계하지 않음.
8주차에 별도 기능으로 진행.

### 영향
현재 설계는 단일 일정만 포함.
```

---

### 문제 3: 테스트 시나리오가 너무 추상적임

**증상**:
```markdown
# ❌ 나쁜 예
동작: 필터링이 작동한다
```

**조치**:
```markdown
# ✅ 좋은 예
동작: 카테고리 선택 시 필터링
- **Given**: 업무, 개인, 기타 카테고리의 이벤트가 각 1개씩 존재
- **When**: 사용자가 "업무" 카테고리 선택
- **Then**: 업무 이벤트 1개만 표시됨
- **테스트 유형**: 통합 테스트
```

---

### 문제 4: 설계와 구현의 경계가 모호함

**증상**:
- spec.md에 완전한 운영 코드 포함
- 구현 세부사항 과다

**조치**:
```typescript
// ❌ 피할 것 (구현 수준)
export const CategoryFilter: React.FC<Props> = ({
  categories,
  onSelect
}) => {
  const [open, setOpen] = useState(false);
  const handleClick = useCallback(() => {
    setOpen(prev => !prev);
  }, []);

  return (
    <Box sx={{ position: 'relative' }}>
      <Button onClick={handleClick}>
        {selectedLabel}
        <ExpandMoreIcon sx={{ transform: open ? 'rotate(180deg)' : '' }} />
      </Button>
      {open && <Menu>...</Menu>}
    </Box>
  );
};

// ✅ 올바른 설계 수준
- **컴포넌트**: CategoryFilter
- **Props**: selectedCategory, onCategoryChange, categories
- **상태**: 없음 (부모에서 관리)
- **이벤트**: onChange → onCategoryChange 호출
- **UI**: Material-UI Select 컴포넌트 사용
```

---

## ✅ Phase 1 완료 체크리스트

### 시작 전

- [ ] Handoff 문서 읽음
- [ ] 필수 항목 모두 확인
- [ ] CLAUDE.md 읽음
- [ ] contract.md 및 prompt.md 숙지

### 작업 중

- [ ] Handoff 문서 분석 완료
- [ ] context_files 모두 검토
- [ ] 요구사항 명확화 완료
- [ ] 모호한 부분 clarifications.md에 기록
- [ ] 컴포넌트 아키텍처 설계
- [ ] 상태 관리 전략 수립
- [ ] API 인터페이스 설계
- [ ] TypeScript 타입 정의
- [ ] 테스트 시나리오 작성 (GWT)
- [ ] 구현 단계 명확히 정의
- [ ] 엣지 케이스 고려
- [ ] 에러 시나리오 고려

### 완료 전

- [ ] 모든 필수 섹션 작성
  - [ ] 1. 요구사항 요약
  - [ ] 2. 기술 설계
  - [ ] 3. 테스트 가능한 동작
  - [ ] 4. 구현 계획
  - [ ] 5. 통합 지점
  - [ ] 6. 위험 평가
  - [ ] 7. 미해결 질문
- [ ] 타입 정의 완전성 확인
- [ ] API 설계 완전성 확인
- [ ] 테스트 전략 구체성 확인
- [ ] 프로젝트 규칙(CLAUDE.md) 준수 확인
- [ ] 자가 검증 체크리스트 통과
- [ ] spec.md 파일 저장
- [ ] 필요 시 clarifications.md 작성

### Phase 1 → Phase 2 전환 준비

- [ ] spec.md 최종 검토
- [ ] Orchestrator 보고 메시지 준비
- [ ] 다음 Phase (Test Design) 준비

---

## 📚 추가 학습 자료

### 필수 문서
- [feature-designer.md](../../agents/feature-designer.md) - 역할 정의
- [contract.md](./contract.md) - 계약 명세
- [prompt.md](./prompt.md) - 실행 매뉴얼
- [CLAUDE.md](../../../CLAUDE.md) - 프로젝트 규칙

### 참조 문서
- [orchestrator.md](../../agents/orchestrator.md) - Orchestrator 역할 (참조용)
- [orchestrator/contract.md](../orchestrator/contract.md) - Orchestrator 계약 (참조용)
- [orchestrator/getting-started.md](../orchestrator/getting-started.md) - Orchestrator 가이드

### 코드 예시
- `src/hooks/useEventForm.ts` - 훅 패턴 예시
- `src/hooks/useEventOperations.ts` - API 통신 패턴
- `src/utils/dateUtils.ts` - 유틸 함수 패턴
- `src/App.tsx` - 컴포넌트 구조

---

## 🎓 핵심 개념 복습

### 1. 설계의 목표

```
요구사항 (모호)
    ↓
분석 (Feature Designer)
    ↓
명세서 (구체적, 테스트 가능)
    ↓
구현 (Code Writer)
```

Feature Designer의 명세서는 **구현자가 추가 질문 없이 바로 코드를 작성할 수 있는 수준**이어야 합니다.

---

### 2. Hooks vs Utils 원칙

```typescript
// Hooks: 상태, API, 부수 효과 관리
export const useEventForm = (initialEvent?: Event) => {
  const [form, setForm] = useState<EventForm>(/* ... */);
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = async () => {
    // API 호출, 상태 업데이트 등
  };

  return { form, errors, handleSubmit };
};

// Utils: 순수 함수만
export const formatDate = (date: string): string => {
  // 항상 같은 입력 → 같은 출력
  return new Date(date).toLocaleDateString('ko-KR');
};

// ❌ Utils에 넣으면 안 됨
export const fetchEvents = async () => {
  // API 호출 → Hooks에 넣어야 함
};
```

---

### 3. GWT 패턴의 중요성

```markdown
# ❌ GWT 없음
테스트: 필터링이 작동한다

# ✅ GWT 포함
테스트: 선택한 카테고리의 이벤트만 표시된다
- **Given**: 업무(1), 개인(2), 기타(3)의 이벤트 존재
- **When**: "업무" 카테고리 선택
- **Then**: 업무 이벤트 1개만 표시
```

**차이점**: GWT는 구체적이므로 Test Writer가 정확한 테스트 코드를 작성할 수 있습니다.

---

## ✅ 시작 전 최종 체크

다음 항목을 모두 확인했다면 Phase 1 (Feature Design)을 시작할 준비가 되었습니다:

- [ ] [feature-designer.md](../../agents/feature-designer.md) 읽기 완료
- [ ] [contract.md](./contract.md) 읽기 완료
- [ ] [prompt.md](./prompt.md) 읽기 완료
- [ ] [CLAUDE.md](../../../CLAUDE.md) 읽기 완료
- [ ] Orchestrator의 Handoff 문서(phase1.md) 존재
- [ ] `.claude/agent-docs/feature-designer/logs/` 폴더 접근 가능
- [ ] 프로젝트의 기존 코드 구조 파악
- [ ] GWT 패턴 이해
- [ ] Hooks vs Utils 분리 원칙 이해
- [ ] 설계와 구현의 경계 이해

---

## 🚀 다음 단계

### Orchestrator로부터 호출될 때

Orchestrator가 다음과 같은 메시지를 보낼 때 Phase 1을 시작합니다:

```text
Phase 1: Feature Design을 시작합니다.

Handoff 문서: .claude/agent-docs/orchestrator/handoff/phase1.md
출력 파일: .claude/agent-docs/feature-designer/logs/spec.md

진행하세요.
```

### 실행 순서

1. Handoff 문서 읽기
2. 컨텍스트 파일 분석
3. 10단계 워크플로우 수행
4. spec.md 작성 및 검증
5. Orchestrator에 완료 보고

---

## 🆘 도움이 필요할 때

### 질문이 있을 때

1. **prompt.md의 "문제 해결" 섹션** 참조
2. **contract.md의 "에러 처리" 섹션** 참조
3. **FAQ 섹션** 검토

### 막혔을 때

1. Handoff 문서 재검토
2. CLAUDE.md의 프로젝트 규칙 재확인
3. 기존 코드 예시(`src/hooks/`, `src/utils/`) 참조
4. clarifications.md에 문제 기록

---

**마지막 업데이트**: 2025-10-30
**버전**: 1.0.0
**작성자**: Feature Designer 개발팀

---

**준비 완료? 이제 Orchestrator의 Handoff 문서를 읽고 Phase 1을 시작하세요.**
