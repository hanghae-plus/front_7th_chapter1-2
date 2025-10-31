# Step: 로직 구현

```xml
<step>
  <purpose>
    테스트를 통과시키는 로직을 구현합니다. PRD의 요구사항을 정확히 반영해야 합니다.
  </purpose>

  <how-to>
    <action n="1">
      <do>헬퍼 함수부터 구현</do>
      <detail>
        다른 로직에서 사용되는 헬퍼 함수를 먼저 구현합니다.
        예: hasDay, isLeapYear, formatDate 등
      </detail>
    </action>

    <action n="2">
      <do>기본 로직 구현</do>
      <detail>
        단계별로 구현합니다:
        1. 가장 단순한 케이스부터 (예: daily)
        2. 중간 복잡도 (예: weekly, yearly)
        3. 가장 복잡한 케이스 (예: monthly with 예외 처리)

        각 반복 유형별로 함수를 분리하여 구현합니다.
      </detail>
    </action>

    <action n="3">
      <do>PRD 요구사항 체크</do>
      <detail>
        구현 중 PRD를 계속 참고하여 모든 요구사항이 반영되었는지 확인합니다:
        - 모든 기능이 구현되었는가?
        - 예외 규칙이 정확히 구현되었는가?
        - 경계값이 올바르게 처리되는가?
      </detail>
    </action>

    <action n="4">
      <do>코드 품질 체크</do>
      <detail>
        다음 사항을 확인합니다:
        - 함수가 단일 책임 원칙을 따르는가?
        - 매직 넘버가 없는가?
        - 변수명이 명확한가?
        - 복잡한 로직에 주석이 있는가?
      </detail>
    </action>
  </how-to>

  <constraints>
    <constraint>PRD의 모든 요구사항을 반영해야 함</constraint>
    <constraint>예외 규칙을 정확히 구현해야 함</constraint>
    <constraint>코드가 읽기 쉬워야 함</constraint>
    <constraint>매직 넘버/문자열을 사용하지 말 것</constraint>
  </constraints>

  <success-criteria>
    <criterion>모든 반복 유형이 구현됨</criterion>
    <criterion>예외 규칙이 정확히 구현됨</criterion>
    <criterion>PRD 요구사항이 모두 반영됨</criterion>
    <criterion>코드가 읽기 쉬움</criterion>
  </success-criteria>
</step>
```
