# Step: 테스트 케이스 작성

```xml
<step>
  <purpose>
    정의한 시나리오를 바탕으로 실행 가능한 테스트 케이스를 작성합니다.
  </purpose>

  <how-to>
    <action n="1">
      <do>테스트 구조 설계</do>
      <detail>
        Vitest의 describe/it 구조를 사용하여 테스트를 그룹화합니다:
        - describe: 기능 그룹
        - it: 구체적인 테스트 케이스
      </detail>
    </action>

    <action n="2">
      <do>AAA 패턴으로 작성</do>
      <detail>
        각 테스트를 AAA 패턴으로 작성합니다:
        - Arrange (준비): 테스트 데이터 준비
        - Act (실행): 함수 실행
        - Assert (검증): 결과 검증
      </detail>
    </action>

    <action n="3">
      <do>명확한 테스트 이름 작성</do>
      <detail>
        테스트 이름은 다음 원칙을 따릅니다:
        - "~할 수 있다" 형식
        - 구체적인 동작 명시
        - 기대 결과 포함
      </detail>
    </action>

    <action n="4">
      <do>테이블 테스트 활용</do>
      <detail>
        반복적인 케이스는 test.each를 사용하여 테이블 테스트로 작성합니다.
        여러 입력값에 대해 동일한 검증 로직을 적용할 때 유용합니다.
      </detail>
    </action>
  </how-to>

  <constraints>
    <constraint>모든 수용 기준이 테스트로 작성되어야 함</constraint>
    <constraint>경계값 케이스가 포함되어야 함</constraint>
    <constraint>예외 케이스가 포함되어야 함</constraint>
    <constraint>테스트 이름이 명확해야 함</constraint>
    <constraint>AAA 패턴을 따라야 함</constraint>
  </constraints>

  <success-criteria>
    <criterion>모든 수용 기준이 테스트로 작성됨</criterion>
    <criterion>경계값 케이스가 포함됨</criterion>
    <criterion>예외 케이스가 포함됨</criterion>
    <criterion>테스트 이름이 명확함</criterion>
    <criterion>AAA 패턴을 따름</criterion>
  </success-criteria>
</step>
```
