# Step: 수용 기준 추출

```xml
<step>
  <purpose>
    PRD에서 기능 요구사항과 비기능 요구사항을 추출하여 테스트 가능한 형태로 정리합니다.
  </purpose>

  <how-to>
    <action n="1">
      <do>기능 요구사항 추출</do>
      <detail>
        PRD의 "4. 사용자 시나리오 / 요구사항" 섹션에서 각 기능별로 정리합니다:
        - 입력: 무엇을 입력하는가?
        - 동작: 어떻게 동작하는가?
        - 출력: 무엇을 출력하는가?
        - 예외: 어떤 예외가 있는가?
      </detail>
    </action>

    <action n="2">
      <do>비기능 요구사항 추출</do>
      <detail>
        PRD의 비기능 요구사항 섹션에서 추출합니다:
        - 성능 기준: 응답 시간, 처리량, 메모리 사용량
        - 품질 기준: 접근성, 브라우저 호환성, 에러 처리
      </detail>
    </action>

    <action n="3">
      <do>Given-When-Then 형식으로 변환</do>
      <detail>
        각 요구사항을 테스트 가능한 Given-When-Then 형식으로 변환합니다:
        - Given [전제 조건]
        - When [동작]
        - Then [기대 결과]
      </detail>
    </action>
  </how-to>

  <constraints>
    <constraint>PRD에 명시된 요구사항만 추출할 것</constraint>
    <constraint>모든 요구사항이 테스트 가능한 형태여야 함</constraint>
    <constraint>예외 케이스를 빠뜨리지 말 것</constraint>
  </constraints>

  <success-criteria>
    <criterion>모든 기능 요구사항이 추출됨</criterion>
    <criterion>모든 비기능 요구사항이 추출됨</criterion>
    <criterion>각 요구사항이 테스트 가능한 형태로 정리됨</criterion>
    <criterion>예외 케이스가 명확히 정의됨</criterion>
  </success-criteria>
</step>
```
