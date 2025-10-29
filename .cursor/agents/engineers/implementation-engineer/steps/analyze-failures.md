# Step: 실패 원인 분석

```xml
<step>
  <purpose>
    각 테스트가 왜 실패하는지 분석하고, 어떤 로직을 구현해야 테스트가 통과할 수 있는지 파악합니다.
  </purpose>

  <how-to>
    <action n="1">
      <do>테스트 실행 및 결과 확인</do>
      <detail>
        npm test 명령으로 테스트를 실행하고 실패 결과를 확인합니다.
      </detail>
    </action>

    <action n="2">
      <do>각 실패 케이스 분석</do>
      <detail>
        각 실패한 테스트에 대해 다음을 기록합니다:
        - 실패 이유: 왜 실패하는가?
        - 기대 동작: 무엇을 기대하는가?
        - 현재 동작: 현재 무엇을 하는가?
        - 필요한 로직: 어떤 로직을 구현해야 하는가?
        - 관련 PRD: PRD의 어떤 요구사항과 관련되는가?
      </detail>
    </action>

    <action n="3">
      <do>구현 우선순위 결정</do>
      <detail>
        의존성과 복잡도를 고려하여 구현 우선순위를 정합니다:
        - 의존성: 어떤 로직이 먼저 구현되어야 하는가?
        - 복잡도: 어떤 로직이 가장 복잡한가?

        일반적으로 헬퍼 함수 → 기본 로직 → 예외 처리 순서로 구현합니다.
      </detail>
    </action>

    <action n="4">
      <do>PRD 요구사항 매핑</do>
      <detail>
        각 실패 테스트를 PRD 요구사항과 매핑하여 빠뜨린 요구사항이 없는지 확인합니다.
      </detail>
    </action>
  </how-to>

  <constraints>
    <constraint>모든 실패 테스트를 분석해야 함</constraint>
    <constraint>실패 이유를 명확히 파악해야 함</constraint>
    <constraint>PRD 요구사항과 매핑해야 함</constraint>
  </constraints>

  <success-criteria>
    <criterion>모든 실패 테스트가 분석됨</criterion>
    <criterion>각 테스트의 실패 이유가 명확함</criterion>
    <criterion>필요한 로직이 파악됨</criterion>
    <criterion>구현 우선순위가 정해짐</criterion>
    <criterion>PRD 요구사항과 매핑됨</criterion>
  </success-criteria>
</step>
```
