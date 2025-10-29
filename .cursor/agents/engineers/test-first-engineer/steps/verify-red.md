# Step: RED 상태 확인

```xml
<step>
  <purpose>
    테스트를 실행하여 모든 테스트가 실패(RED)하는지 확인하고, 실패 이유를 명확히 파악합니다.
  </purpose>

  <how-to>
    <action n="1">
      <do>테스트 실행</do>
      <detail>
        npm test 또는 npx vitest run 명령으로 테스트를 실행합니다.
      </detail>
    </action>

    <action n="2">
      <do>실패 확인</do>
      <detail>
        모든 테스트가 실패하는지 확인합니다.
        통과하는 테스트가 있다면 스켈레톤 코드를 수정해야 합니다.
      </detail>
    </action>

    <action n="3">
      <do>실패 이유 분석</do>
      <detail>
        각 테스트가 왜 실패하는지 기록합니다:
        - 실패 이유
        - 기대값
        - 실제값
        - 구현 필요 사항
      </detail>
    </action>

    <action n="4">
      <do>예상치 못한 에러 확인</do>
      <detail>
        다음 에러가 발생하지 않았는지 확인합니다:
        - 컴파일 에러: 타입 정의 수정 필요
        - 런타임 에러: 스켈레톤 코드 수정 필요 (null 대신 빈 배열 반환)

        에러는 assertion 실패여야 하며, 런타임 크래시가 아니어야 합니다.
      </detail>
    </action>
  </how-to>

  <constraints>
    <constraint>모든 테스트가 실행되어야 함 (컴파일 에러 없음)</constraint>
    <constraint>모든 테스트가 실패해야 함 (통과하는 테스트 없음)</constraint>
    <constraint>실패 이유가 assertion 실패여야 함 (런타임 에러 아님)</constraint>
    <constraint>각 테스트의 실패 이유가 명확해야 함</constraint>
  </constraints>

  <success-criteria>
    <criterion>테스트가 실행됨</criterion>
    <criterion>모든 테스트가 실패(RED)</criterion>
    <criterion>실패 이유가 기록됨</criterion>
    <criterion>예상치 못한 에러가 없음</criterion>
  </success-criteria>
</step>
```
