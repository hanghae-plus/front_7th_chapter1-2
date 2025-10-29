# Step: 명세 구체화

```xml
<step>
  <purpose>
    주어진 요구사항을 구체화하여 테스트 코드와 구현 코드를 작성할 수 있는 수준으로 만듭니다.
  </purpose>

  <how-to>
    <action n="1">
      <do>모호한 부분 식별</do>
      <detail>
        주어진 요구사항에서 모호하거나 불명확한 부분을 식별합니다:
        - 동작이 명확하지 않은 부분
        - 예외 처리가 명시되지 않은 부분
        - 경계값이 정의되지 않은 부분
        - 성공/실패 기준이 불명확한 부분
      </detail>
    </action>

    <action n="2">
      <do>구체화 질문 작성</do>
      <detail>
        모호한 부분에 대해 구체화 질문을 작성합니다:
        - "~한 경우 어떻게 동작해야 하는가?"
        - "~의 최대/최소값은 무엇인가?"
        - "~가 실패하면 어떤 메시지를 표시하는가?"
      </detail>
    </action>

    <action n="3">
      <do>구체화된 요구사항 작성</do>
      <detail>
        질문에 대한 답변을 바탕으로 구체화된 요구사항을 작성합니다.
        각 요구사항은 테스트 가능한 수준으로 구체적이어야 합니다.
      </detail>
    </action>

    <action n="4">
      <do>사용자 리뷰 요청</do>
      <detail>
        구체화된 요구사항을 사용자에게 보여주고 리뷰를 받습니다.
        승인을 받은 후 다음 단계로 진행합니다.
      </detail>
    </action>
  </how-to>

  <constraints>
    <constraint>주어진 요구사항에서 벗어나는 요구사항을 추가하지 말 것</constraint>
    <constraint>모호한 부분을 명확히 하는 것까지가 목표임</constraint>
    <constraint>반드시 사용자 리뷰를 받고 진행할 것</constraint>
    <constraint>추측이나 가정을 하지 말고 명확히 할 것</constraint>
  </constraints>

  <success-criteria>
    <criterion>모든 모호한 부분이 명확해짐</criterion>
    <criterion>각 요구사항이 테스트 가능한 수준으로 구체화됨</criterion>
    <criterion>사용자 리뷰와 승인을 받음</criterion>
    <criterion>추가 요구사항이 포함되지 않음</criterion>
  </success-criteria>
</step>
```
