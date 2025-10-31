# Worklog

- 작성자: QA Engineer
- 업무 지시 내용: 반복 일정 기능에 대한 통합 테스트 케이스 문서 작성
- 참고자료: docs/prd/prd-recurring-events-v1.md, docs/sprint/sprint-plan-recurring-events-20251029.md
- 산출물: docs/testcases/recurring-events-testcases.md

# 업무 과정

- 기존 코드 확인하여 이미 작성된 함수 파악
- PRD에서 기능/비기능 요구사항 추출
- 경계값 케이스 정의 (매월 31일, 윤년 2/29)
- 테스트 유형 분류 (통합 테스트 vs 유닛 테스트)
- 통합 테스트 시나리오 작성 (사용자 플로우 기반)
- 유닛 테스트 작성 가이드 작성 (Test First Engineer 참고용)
- 경계값 케이스와 테스트 데이터 예시 문서화

# 참고 파일

- docs/prd/prd-recurring-events-v1.md
- docs/sprint/sprint-plan-recurring-events-20251029.md
- src/**tests**/medium.integration.spec.tsx (통합 테스트 참고)
- templates/testcases/testcases.md.hbs

# 다음 작업자에게 남기는 코멘트

Test First Engineer는 이 테스트 케이스 문서를 바탕으로 실제 테스트 코드를 작성해주세요.

## 통합 테스트 작성 시

- src/**tests**/medium.integration.spec.tsx 패턴을 참고하세요
- 파일명: {{기능명}}.integration.spec.tsx
- 사용자 시나리오대로 userEvent를 사용하여 작성하세요

## 유닛 테스트 작성 시

- 문서의 "유닛 테스트 작성 시 고려사항" 섹션을 참고하세요
- 각 함수별로 별도 파일로 분리하세요 (1:1 매칭)
- 경계값 케이스를 빠짐없이 포함하세요
- 테스트 데이터 예시를 활용하세요

특히 경계값 케이스(매월 31일, 윤년 2/29)에 대한 테스트를 꼼꼼히 작성해주세요.
