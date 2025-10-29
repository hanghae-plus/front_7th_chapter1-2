# Worklog

- 작성자: QA Engineer
- 업무 지시 내용: 반복 일정 기능에 대한 테스트 케이스 작성
- 참고자료: docs/prd/prd-recurring-events-v3.md, docs/sprint/sprint-plan-recurring-events-20251029.md
- 산출물: src/__tests__/recurring-events.spec.ts

# 업무 과정

- PRD v3에서 반복 일정 기능의 요구사항 추출
- 4가지 반복 유형(매일, 매주, 매월, 매년)에 대한 테스트 케이스 정의
- 특수 날짜 처리 경계값 케이스 정의 (매월 31일, 윤년 2/29)
- 반복 일정 수정 시나리오 테스트 케이스 작성 (단일/전체 분기)
- 반복 일정 삭제 시나리오 테스트 케이스 작성 (단일/전체 분기)
- 반복 일정 분할 로직 경계 케이스 정의 (첫/마지막 일정 수정/삭제)
- repeatGroupId 관리 테스트 케이스 작성
- MUI Repeat 아이콘 표시 테스트 케이스 작성
- 반복 정보 텍스트 표시 테스트 케이스 작성
- UI 컴포넌트 (체크박스, 드롭다운, 다이얼로그) 테스트 케이스 작성
- 총 90개의 테스트 케이스를 ONLY_TC 형식으로 작성

# 참고 파일

- docs/prd/prd-recurring-events-v3.md
- docs/sprint/sprint-plan-recurring-events-20251029.md
- .cursor/agents/engineers/qa-engineer/steps/extract-acceptance-criteria.md
- .cursor/agents/engineers/qa-engineer/steps/define-edge-cases.md
- .cursor/agents/engineers/qa-engineer/steps/write-test-cases.md
- templates/testcases/{{테스트_유닛_혹은_통합명}}.spec.ts.hbs
- templates/testcases/only-tc.spec.ts.example
- src/types.ts
- src/__tests__/unit/easy.eventUtils.spec.ts
- src/__tests__/hooks/medium.useEventOperations.spec.ts

# 다음 작업자에게 남기는 코멘트

Test First Engineer는 이 테스트 케이스를 RED 상태로 만들어주세요.
특히 다음 사항에 주의해서 구현해주세요:

1. 특수 날짜 처리 경계값 케이스
   - 매월 31일 반복: 2월, 4월, 6월, 9월, 11월 제외
   - 매년 윤년 2/29 반복: 평년 제외
   
2. 반복 일정 분할 로직
   - 단일 수정/삭제 시 3개의 일정으로 분할 (이전 반복/수정 또는 삭제/이후 반복)
   - 첫/마지막 일정 처리 경계 케이스
   
3. repeatGroupId 관리
   - 고유한 ID 생성
   - 분할된 일정도 동일한 repeatGroupId 유지
   
4. 데이터 모델 업데이트
   - Event 타입에 repeatGroupId 필드 추가 필요

모든 테스트는 실패하도록 스켈레톤만 작성하거나, 필요한 유틸 함수의 인터페이스만 정의해주세요.

