## 📄 Description

AI(Claude Code)를 활용한 개발 업무 효율화 및 일관성 확보를 위한 종합적인 문서화 시스템을 구축합니다. AI 인스턴스가 프로젝트 컨텍스트를 이해하고 일관된 개발 방식을 적용할 수 있도록 가이드라인을 정립합니다.

## ✅ TODO

- [x] `CLAUDE.md` AI 가이드 문서 생성
  - [x] AI 역할 정의 (Senior React Developer + QA Engineer)
  - [x] 프로젝트 아키텍처 및 기술 스택 정리
  - [x] 개발 명령어 및 워크플로우 문서화
  - [x] AI 업무 효율화 전략 및 활용 방안
  - [x] 토큰 절약을 위한 커뮤니케이션 가이드라인
- [x] AI 기반 개발 프로세스 문서화
  - [x] `markdowns/process/DEVELOPMENT_WORKFLOW.md` 생성
  - [x] 6단계 개발 프로세스 상세 문서화 (영어/한국어 병기)
  - [x] AI를 통한 원자적 커밋 전략 및 diff 분석 자동화
  - [x] 코드 리뷰 자동화 및 품질 관리 시스템
- [x] AI 활용 코딩 표준 시스템
  - [x] `markdowns/process/CODING_STANDARDS.md` 생성
  - [x] AI가 준수할 네이밍 컨벤션 및 코드 패턴
  - [x] 자동화된 코드 품질 검증 기준
  - [x] Props 분리 및 타입 안전성 자동 관리
- [x] 기존 문서와 AI 시스템 통합
  - [x] `markdowns/code-review/REVIEW_GUIDE.md` AI 리뷰 기준 업데이트
  - [x] 교차 참조 링크 및 일관성 검증 시스템
- [x] AI 코드 리뷰 템플릿 시스템
  - [x] `markdowns/templates/CLAUDE_CODE_REVIEW_TEMPLATE.md` 생성
  - [x] 일관된 리뷰 양식 및 품질 지표 정의
  - [x] 5점 스케일 평가 시스템 및 액션 아이템 구조화

## 🎯 AI 업무 효율화 목표

- **일관성 확보**: 모든 AI 인스턴스가 동일한 코딩 표준과 워크플로우 적용
- **품질 자동화**: 코드 리뷰, 테스트, 문서화 프로세스의 AI 기반 자동화
- **컨텍스트 유지**: 프로젝트 히스토리와 의사결정 배경의 지속적 추적
- **토큰 최적화**: 효율적인 커뮤니케이션으로 비용 절약 및 성능 향상

## 🎸 ETC

- AI 응답은 영문으로 토큰 절약, 코드 주석은 한글 사용
- Props는 `src/types/ComponentName.types.ts`로 AI가 자동 분리
- 폴더명 kebab-case 자동 적용 (event-forms, code-review)
- 함수 길이 15-20줄 AI 자동 검증
- 80줄 초과 파일 이유 AI 자동 문서화

## 🎉 작업 완료 요약

### 생성된 문서

- `CLAUDE.md`: 메인 AI 가이드 문서 (230줄, AI 효율성 섹션 포함)
- `markdowns/process/DEVELOPMENT_WORKFLOW.md`: 6단계 워크플로우 (201줄, 이중언어)
- `markdowns/process/CODING_STANDARDS.md`: 종합 코딩 표준 (515줄, AI 가이드라인 포함)
- `markdowns/templates/CLAUDE_CODE_REVIEW_TEMPLATE.md`: 표준 리뷰 템플릿 (208줄)

### 주요 달성 사항

- 모든 AI 인스턴스가 따를 일관된 개발 표준 수립
- 원자적 커밋 전략 및 diff 분석 프로세스 정의
- 코드 리뷰 자동화를 위한 구조화된 템플릿 시스템
- 토큰 최적화 전략 (영어 응답 + 한국어 주석)
- 교차 참조된 종합 문서화 시스템 구축

### 커밋 히스토리

1. 이슈 생성 (e57a511)
2. 워크플로우 강화 (8067925)
3. 코딩 표준 생성 (30c1a0d)
4. 리뷰 가이드 통합 (5d49076)
5. 메인 가이드 완성 (46b031c)
6. 리뷰 템플릿 추가 (df811a9)
7. 이슈 완료 및 요약 (d1529ba)
8. 리뷰 템플릿 파일 길이 규칙 명확화 (257c92c)
