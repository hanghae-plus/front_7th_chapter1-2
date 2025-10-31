# Step: 스켈레톤 코드 생성

```xml
<step>
  <purpose>
    테스트가 실행될 수 있도록 최소한의 스켈레톤 코드를 작성합니다.
  </purpose>

  <how-to>
    <action n="1">
      <do>타입 정의 파일 생성</do>
      <detail>
        types.ts 파일에 모든 타입을 정의합니다:
        - 인터페이스
        - 타입 별칭
        - 열거형
        테스트에서 요구하는 모든 타입을 정확히 정의합니다.
      </detail>
    </action>

    <action n="2">
      <do>메인 함수 스켈레톤 생성</do>
      <detail>
        index.ts 파일에 빈 구현 함수를 작성합니다:
        - 타입은 정확히: 입력/출력 타입은 테스트와 일치
        - 구현은 최소한: 빈 배열, 빈 문자열, 기본값만 반환
        - 컴파일 가능: TypeScript 컴파일 에러 없어야 함
        - 테스트 실패: 모든 테스트가 실패(RED)해야 함
      </detail>
    </action>

    <action n="3">
      <do>헬퍼 함수 스켈레톤 생성 (필요시)</do>
      <detail>
        utils.ts 파일에 헬퍼 함수 스켈레톤을 작성합니다.
        빈 구현 또는 false/null 등 기본값을 반환하도록 합니다.
      </detail>
    </action>

    <action n="4">
      <do>Export 정리</do>
      <detail>
        index.ts에서 필요한 모든 타입과 함수를 export합니다.
        테스트에서 import할 수 있도록 경로를 확인합니다.
      </detail>
    </action>
  </how-to>

  <constraints>
    <constraint>타입은 테스트와 정확히 일치해야 함</constraint>
    <constraint>구현은 최소한으로 하되 컴파일 가능해야 함</constraint>
    <constraint>모든 테스트가 실패(RED)해야 함</constraint>
    <constraint>null 반환으로 런타임 에러가 발생하지 않도록 할 것</constraint>
  </constraints>

  <success-criteria>
    <criterion>모든 필요한 파일이 생성됨</criterion>
    <criterion>타입이 정확히 정의됨</criterion>
    <criterion>함수가 컴파일 가능함</criterion>
    <criterion>함수가 빈 구현 또는 기본값 반환</criterion>
    <criterion>import 경로가 올바름</criterion>
  </success-criteria>
</step>
```
