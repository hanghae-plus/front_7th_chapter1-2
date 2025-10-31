# [REFACTOR] Feature 1: 반복 유형 선택 - 구조 개선

## 관련 요구사항
- 1. 반복 유형 선택 (recurring type selection)
  - 31일 선택 시: 매월 31일에만 일정 생성(대체 금지)
  - 2/29 선택 시: 윤년에만 생성(대체 금지)
  - 반복 일정은 겹침 허용

## 목적
- GREEN 단계에서 통과한 동작을 유지하면서, 코드 가독성과 유지보수성 향상
- 규칙(31일, 윤년) 분리로 추후 기능 확장(주간/일간, 종료 상한 등)에 대비

## 변경 파일
- src/utils/eventUtils.ts
  - 순수 함수 분리: `has31stDay(year, month)`, `isLeapYear(year)`, `formatDate(date)`
  - `generateRecurrences` 내부 흐름 간소화(조건 분기/루프 가독성 개선)
  - 모든 주석 한국어 유지, 식별자 영어

## 리팩토링 요약
- 31일 규칙: 월 31일 존재 여부를 `has31stDay`로 캡슐화
- 윤년 규칙: `isLeapYear`로 판별 로직 분리
- 날짜 문자열 변환: `formatDate`로 통일
- `generateRecurrences`는 월/연 로직을 간결한 루프와 분기만 남기도록 정리

## 전후 비교(하이라이트)
- Before: `generateRecurrences` 내부에서 말단 로직/분기 혼재 → 가독성 낮음
- After: 규칙/포맷터 함수 분리, 루프 전개 간결화 → 읽기 쉬움, 테스트 유지됨
- 동작 변화 없음(RED/GREEN 테스트 동일 통과)

## 검증 체크리스트
- [ ] 기존 테스트 모두 GREEN 유지
- [ ] 함수 분리로 로직 중복/노이즈 감소 확인
- [ ] 주석/식별자 언어 정책 준수(주석 한국어, 식별자 영어)

## 차후 확장 아이디어(참고)
- Weekly/Daily 규칙 추가 시 동일한 패턴으로 순수 함수 분리
- 종료 상한(2025-12-31) 클램핑 로직을 공통화

## 차후 커밋 메시지 예시
- refactor: 1. 반복 유형 선택 - 31일/윤년 규칙 분리 및 구조 개선

## 파일/커밋/요구사항 매핑
- 문서: DOCS/feature-1-REFACTOR.md
- 코드: src/utils/eventUtils.ts
- 관련 요구사항 번호: 1
