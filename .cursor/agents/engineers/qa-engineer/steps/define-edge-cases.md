# Step: 경계값 및 예외 시나리오 정의

```xml
<step>
  <purpose>
    정상 케이스뿐만 아니라 경계값, 예외 케이스, 에러 케이스를 모두 정의합니다.
  </purpose>

  <how-to>
    <action n="1">
      <do>경계값 케이스 정의</do>
      <detail>
        다음 경계값들을 확인합니다:
        - 숫자 경계: 최솟값, 최댓값, 0, 음수, 양수
        - 날짜 경계: 월말 (28, 29, 30, 31일), 윤년/평년, 연도 경계
        - 문자열 경계: 빈 문자열, 최대 길이, 특수 문자
      </detail>
    </action>

    <action n="2">
      <do>예외 케이스 정의</do>
      <detail>
        PRD에 명시된 예외 규칙을 모두 테스트 케이스로 정의합니다.
        각 예외 케이스에 대해:
        - 조건: 어떤 경우에 발생하는가?
        - 기대 동작: 어떻게 처리되어야 하는가?
      </detail>
    </action>

    <action n="3">
      <do>에러 케이스 정의</do>
      <detail>
        잘못된 입력이나 상태에 대한 처리를 정의합니다:
        - 잘못된 형식의 입력
        - 유효하지 않은 값
        - 시스템 제약 위반
      </detail>
    </action>

    <action n="4">
      <do>조합 케이스 정의</do>
      <detail>
        여러 조건이 결합된 케이스를 정의합니다.
        복잡한 시나리오에서 발생할 수 있는 조합을 고려합니다.
      </detail>
    </action>
  </how-to>

  <constraints>
    <constraint>모든 경계값을 빠짐없이 확인할 것</constraint>
    <constraint>PRD의 예외 규칙을 모두 포함할 것</constraint>
    <constraint>에러 케이스의 기대 동작을 명확히 할 것</constraint>
  </constraints>

  <success-criteria>
    <criterion>모든 경계값 케이스가 정의됨</criterion>
    <criterion>PRD의 예외 규칙이 모두 포함됨</criterion>
    <criterion>에러 케이스가 정의됨</criterion>
    <criterion>조합 케이스가 고려됨</criterion>
  </success-criteria>
</step>
```
