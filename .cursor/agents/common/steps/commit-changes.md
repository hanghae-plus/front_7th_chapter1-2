# Step: 변경사항 커밋

````xml
<step>
  <purpose>
    작업한 변경사항을 Git 커밋으로 기록하여 작업 이력을 남깁니다.
  </purpose>

  <how-to>
    <action n="1">
      prettier와 eslint를 실행하여 파일 포맷팅을 진행합니다.
    </action>
    <action n="2">
      <do>커밋 타입 결정</do>
      <detail>
        작업 내용에 따라 적절한 커밋 타입을 선택합니다:
        - feat: 새로운 기능 추가 (코드 구현, 새 기능 개발)
        - fix: 버그 수정 (오류 해결, 버그 픽스)
        - docs: 문서 작성 또는 수정 (PRD, 스프린트 계획, worklog 등)
        - test: 테스트 코드 작성 또는 수정
        - refactor: 코드 리팩토링 (기능 변경 없이 코드 개선)
        - chore: 기타 작업 (템플릿 작성, 설정 변경 등)
      </detail>
    </action>

    <action n="3">
      <do>커밋 제목 작성</do>
      <detail>
        다음 형식으로 커밋 제목을 작성합니다:
        "[타입]: [간단한 작업 설명]"

        예시:
        - "docs: 반복 일정 기능 PRD 작성"
        - "feat: 반복 일정 생성 로직 구현"
        - "fix: 매월 31일 반복 일정 버그 수정"
        - "test: 반복 일정 테스트 케이스 작성"
        - "refactor: 반복 일정 생성기 함수 분리"
        - "chore: PRD 템플릿 작성"

        작성 원칙:
        - 50자 이내로 간결하게
        - 명령형으로 작성 ("작성함" X, "작성" O)
        - 마침표 없이
      </detail>
    </action>

    <action n="4">
      <do>커밋 바디 작성</do>
      <detail>
        다음 형식으로 커밋 바디를 작성합니다:

        ```
        - agent: [에이전트명]
        - [수행한 업무 1]
        - [수행한 업무 2]
        - [수행한 업무 3]
        ```

        예시:
        ```
        - agent: PO
        - 반복 일정 기능 요구사항 구체화
        - PRD 5개 섹션 작성 (배경, 목표, 범위, 시나리오, 설계)
        - 예외 규칙 명시 (매월 31일, 윤년 2/29)
        ```

        작성 원칙:
        - 첫 줄에 agent 정보 명시
        - 수행한 주요 업무를 불릿 포인트로 나열
        - 구체적으로 작성 (파일명, 함수명 등 포함)
        - 3-5개 항목으로 요약
      </detail>
    </action>

    <action n="5">
      <do>변경사항 스테이징 및 커밋</do>
      <detail>
        다음 명령으로 변경사항을 스테이징하고 커밋합니다:

        ```bash
        git add [변경된 파일들]
        git commit -m "[커밋 제목]" -m "[커밋 바디]"
        ```

        예시:
        ```bash
        git add docs/prd/prd-recurring-events-v1.md docs/worklog/worklog-po-v1.md
        git commit -m "docs: 반복 일정 기능 PRD 작성" -m "- agent: PO
        - 반복 일정 기능 요구사항 구체화
        - PRD 5개 섹션 작성 (배경, 목표, 범위, 시나리오, 설계)
        - 예외 규칙 명시 (매월 31일, 윤년 2/29)"
        ```
      </detail>
    </action>
  </how-to>

  <constraints>
    <constraint>커밋 타입은 feat, fix, docs, test, refactor, chore 중 하나를 사용할 것</constraint>
    <constraint>커밋 제목은 50자 이내로 작성할 것</constraint>
    <constraint>커밋 바디 첫 줄에 agent 정보를 명시할 것</constraint>
    <constraint>수행한 업무를 구체적으로 나열할 것</constraint>
    <constraint>작업한 파일만 스테이징할 것</constraint>
  </constraints>

  <success-criteria>
    <criterion>적절한 커밋 타입이 선택됨</criterion>
    <criterion>커밋 제목이 명확하고 간결함</criterion>
    <criterion>커밋 바디에 agent와 수행 업무가 명시됨</criterion>
    <criterion>변경사항이 커밋됨</criterion>
  </success-criteria>
</step>
````
