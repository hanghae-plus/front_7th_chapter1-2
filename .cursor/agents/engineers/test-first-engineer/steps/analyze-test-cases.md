# Step: 테스트 케이스 분석

```xml
<step>
  <purpose>
    QA Engineer가 작성한 테스트 케이스를 분석하여 어떤 함수/컴포넌트가 필요한지 파악합니다.
  </purpose>

  <how-to>
    <action n="1">
      <do>테스트 파일 읽기</do>
      <detail>
        QA Engineer가 작성한 테스트 파일을 읽고 다음을 파악합니다:
        - 어떤 함수/컴포넌트를 import하는가?
        - 각 함수의 인터페이스는 무엇인가?
        - 어떤 타입이 필요한가?
      </detail>
    </action>

    <action n="2">
      <do>함수 시그니처 추출</do>
      <detail>
        테스트 코드에서 함수 호출 방식을 보고 시그니처를 추출합니다:
        - 함수명
        - 파라미터 타입
        - 반환 타입
      </detail>
    </action>

    <action n="3">
      <do>타입 정의 추출</do>
      <detail>
        테스트 코드에서 기대하는 반환값을 보고 타입을 추출합니다:
        - 인터페이스 정의
        - 타입 별칭
        - 열거형
      </detail>
    </action>

    <action n="4">
      <do>필요한 파일 목록 작성</do>
      <detail>
        필요한 파일들을 목록으로 정리합니다:
        - types.ts: 타입 정의
        - index.ts: 메인 함수
        - utils.ts: 헬퍼 함수 (필요시)
      </detail>
    </action>
  </how-to>

  <constraints>
    <constraint>테스트 코드에서 요구하는 인터페이스를 정확히 파악할 것</constraint>
    <constraint>추측하지 말고 테스트 코드를 기반으로 할 것</constraint>
    <constraint>모든 필요한 타입을 빠짐없이 정의할 것</constraint>
  </constraints>

  <success-criteria>
    <criterion>모든 필요한 함수가 파악됨</criterion>
    <criterion>각 함수의 시그니처가 명확함</criterion>
    <criterion>필요한 타입이 정의됨</criterion>
    <criterion>파일 구조가 계획됨</criterion>
  </success-criteria>
</step>
```
