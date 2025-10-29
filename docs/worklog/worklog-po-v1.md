# Worklog

- 작성자: PO
- 업무 지시 내용: 반복 일정 기능 요구사항을 바탕으로 PRD 작성
- 참고자료: 사용자가 제공한 반복 일정 요구사항
- 산출물: docs/prd/prd-recurring-events-v1.md

# 업무 과정

- 에이전트 역할 및 단계별 지침 확인
- 현재 소스코드 분석하여 구현 범위 파악 (src/types.ts, src/App.tsx, src/hooks/)
- 반복 일정 관련 타입 정의 및 UI 코드(주석 처리된 부분) 확인
- Breaking Change 여부 분석 (기존 타입 구조와 호환 가능 확인)
- 주어진 요구사항을 테스트 및 구현 가능하도록 구체화
- 반복 종료일을 옵션으로 처리하도록 요구사항 수정
- repeatId 필드 추가 필요성 확인
- 특수 날짜 처리 로직 구체화 (31일 매월, 윤년 29일 매년)
- 단일/전체 수정 및 삭제 시나리오 상세 작성
- PRD 템플릿에 맞춰 문서 작성 (배경, 목표, 범위, 사용자 시나리오)
- 사용자 시나리오를 완전한 문장 형태로 상세하게 작성
- 각 사용자 동작을 개별 시나리오로 분리하여 작성
- PRD 파일 저장 (docs/prd/prd-recurring-events-v1.md)
- 업무 일지 작성

# 참고 파일

- .cursor/agents/po/po.md
- .cursor/agents/po/steps/check-current-code.md
- .cursor/agents/po/steps/spec-refinement.md
- .cursor/agents/po/steps/write-prd.md
- .cursor/agents/common/steps/write-worklog.md
- templates/prd/prd.md.hbs
- templates/worklog/worklog.md.hbs
- src/types.ts
- src/App.tsx
- src/hooks/useEventOperations.ts
- src/hooks/useEventForm.ts

# 다음 작업자에게 남기는 코멘트

반복 일정 기능의 PRD를 작성했습니다. 주요 고려사항은 다음과 같습니다:

1. **타입 확장 필요**: Event 타입에 `repeatId` 필드를 추가하여 같은 반복 그룹의 일정들을 식별할 수 있도록 해야 합니다.

2. **특수 날짜 처리**: 31일 매월 반복 시 31일이 없는 달(2월, 4월, 6월, 9월, 11월)은 건너뛰고, 윤년 2월 29일 매년 반복 시 윤년에만 생성되도록 구현해야 합니다.

3. **반복 종료일**: 선택 사항으로 처리되며, 미선택 시 2025-12-31까지 자동 설정됩니다.

4. **API 변경 사항**:

   - POST /api/events: 반복 일정 생성 시 종료일까지 모든 일정을 생성하여 반환
   - PUT /api/events/:id: 단일 수정 vs 전체 수정 구분을 위한 쿼리 파라미터 추가 필요 (예: ?updateAll=true)
   - DELETE /api/events/:id: 단일 삭제 vs 전체 삭제 구분을 위한 쿼리 파라미터 추가 필요 (예: ?deleteAll=true)

5. **UI 변경 사항**: App.tsx의 441~478줄에 주석 처리된 반복 일정 UI를 활성화하고, 반복 아이콘(MUI Repeat 아이콘) 표시 로직을 추가해야 합니다.

테스트 코드 작성 시에는 특히 특수 날짜 처리 로직과 단일/전체 수정 및 삭제 로직을 집중적으로 테스트해주세요.
