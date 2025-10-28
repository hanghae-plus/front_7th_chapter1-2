# Agent Documentation Structure

이 폴더는 TDD 워크플로우에서 사용하는 에이전트들이 생성하고 참조하는 문서들을 관리합니다.

## 폴더 구조

```
.agents/
├── specs/              # 기능 상세 명세서 (1-feature-designer 생성)
│   └── RECURRING_EVENTS_SPEC.md
├── tests/              # 테스트 케이스 설계 (2-test-designer 생성)
│   └── TEST_DESIGN.md
├── guides/             # 개발 가이드 및 참고 문서
└── README.md           # 이 파일
```

## 각 폴더의 역할

### specs/ (기능 명세)
- **용도**: 기능의 상세 요구사항, 데이터 모델, API 명세, 비즈니스 로직 등을 정의
- **생성자**: 1-feature-designer 에이전트
- **독자**: 2-test-designer, 3-test-implementer, 4-code-implementer
- **파일 명명**: `{FEATURE_NAME}_SPEC.md`

### tests/ (테스트 설계)
- **용도**: 테스트 케이스 명세, Given-When-Then 형식의 테스트 시나리오
- **생성자**: 2-test-designer 에이전트
- **독자**: 3-test-implementer
- **파일 명명**: `{FEATURE_NAME}_TEST_DESIGN.md`

### guides/ (개발 가이드)
- **용도**: 프로젝트 전반적인 개발 가이드, 컨벤션, 아키텍처 문서
- **독자**: 모든 에이전트
- **파일 예시**: 코딩 스타일 가이드, 아키텍처 결정 기록(ADR) 등

## 문서 관리 원칙

1. **명확한 분리**: 각 에이전트가 생성한 문서는 해당 폴더에 저장
2. **버전 관리**: 문서는 Git으로 버전 관리하며, 기능 구현과 함께 커밋
3. **참조 용이성**: 에이전트는 `.agents/` 폴더 내 문서를 우선적으로 참조
4. **일관된 명명**: 관련 문서는 동일한 접두사를 사용 (예: RECURRING_EVENTS_*)
