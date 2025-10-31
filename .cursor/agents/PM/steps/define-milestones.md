# Step: 마일스톤 분해

```xml
<step>
  <purpose>
    스프린트 목표를 달성하기 위한 구체적인 마일스톤을 정의합니다.
  </purpose>

  <how-to>
    <action n="1">
      <do>마일스톤 작성</do>
      <detail>
        각 마일스톤을 "누가 무엇을 한다" 형식으로 작성합니다.
        형식: "[에이전트명]이(가) [구체적인 작업]을(를) 완료한다."

        기본 순서:
        1. QA Engineer → 테스트 케이스 작성
        2. Test First Engineer → RED 테스트 작성
        3. Implementation Engineer → 로직 구현 (GREEN)
        4. Refactoring Engineer → 리팩토링
      </detail>
    </action>

    <action n="2">
      <do>마일스톤 세분화</do>
      <detail>
        각 마일스톤은 한 에이전트가 한 번에 수행 가능한 크기로 조정합니다:
        - 너무 크면 분해
        - 너무 작으면 통합
      </detail>
    </action>

    <action n="3">
      <do>완료 조건 명시</do>
      <detail>
        각 마일스톤의 완료 조건을 명확히 정의합니다.
        예시: "- 완료 조건: 모든 반복 유형에 대한 테스트 포함"
      </detail>
    </action>
  </how-to>

  <constraints>
    <constraint>각 마일스톤은 "누가 무엇을 한다" 형식으로 작성할 것</constraint>
    <constraint>마일스톤 순서는 의존성을 고려할 것</constraint>
    <constraint>각 마일스톤은 적절한 크기여야 함</constraint>
    <constraint>완료 조건이 명확해야 함</constraint>
  </constraints>

  <success-criteria>
    <criterion>각 마일스톤이 "누가 무엇을 한다" 형식으로 작성됨</criterion>
    <criterion>마일스톤 순서가 의존성을 고려함</criterion>
    <criterion>각 마일스톤이 적절한 크기임</criterion>
    <criterion>완료 조건이 명확함</criterion>
  </success-criteria>
</step>
```
