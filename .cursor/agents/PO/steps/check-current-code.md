# Step: 현재 구현범위 파악

```xml
<step>
  <purpose>
    현재 코드를 확인하여 어느 정도까지 서비스가 개발되었는지 파악하고, 주어진 요구사항이 기존 코드에 미치는 영향을 분석합니다.
  </purpose>

  <how-to>
    <action n="1">
      <do>현재 소스코드 확인</do>
      <detail>
        src/ 하위 디렉토리의 소스코드들을 확인하여 현재 구현된 기능을 파악합니다.
        - 어떤 컴포넌트가 구현되어 있는가?
        - 어떤 기능이 이미 동작하고 있는가?
        - 어떤 데이터 구조를 사용하고 있는가?
      </detail>
    </action>

    <action n="2">
      <do>요구사항과 현재 코드 비교</do>
      <detail>
        주어진 요구사항을 현재 코드와 비교하여:
        - 이미 구현된 기능이 있는가?
        - 수정이 필요한 기능이 있는가?
        - 새로 추가해야 할 기능이 있는가?
      </detail>
    </action>

    <action n="3">
      <do>Breaking Change 확인</do>
      <detail>
        요구사항 구현 시 기존 코드에 Breaking Change가 발생하는지 확인:
        - 기존 API 변경이 필요한가?
        - 기존 데이터 구조 변경이 필요한가?
        - 기존 컴포넌트 인터페이스 변경이 필요한가?
      </detail>
    </action>

    <action n="4">
      <do>사용자 리뷰 요청 (필요시)</do>
      <detail>
        Breaking Change가 예상되면 사용자에게 리뷰를 요청하고 승인을 받은 후 다음 단계로 진행합니다.
      </detail>
    </action>
  </how-to>

  <constraints>
    <constraint>현재 소스코드는 src/ 하위 디렉토리만 참조할 것</constraint>
    <constraint>Breaking Change 발생 시 반드시 사용자 리뷰를 받을 것</constraint>
    <constraint>기존 코드의 구조와 패턴을 이해하고 존중할 것</constraint>
  </constraints>

  <success-criteria>
    <criterion>현재 구현된 기능이 파악됨</criterion>
    <criterion>요구사항과 현재 코드의 차이가 명확함</criterion>
    <criterion>Breaking Change 여부가 확인됨</criterion>
    <criterion>필요시 사용자 승인을 받음</criterion>
  </success-criteria>
</step>
```
