# Step: PRD 작성

```xml
<step>
  <purpose>
    구체화한 요구사항을 PRD 문서로 작성하여 저장합니다.
  </purpose>

  <how-to>
    <action n="1">
      <do>템플릿 확인</do>
      <detail>
        templates/prd/prd.md.hbs 템플릿을 확인하여 필수 섹션과 형식을 파악합니다.
        허용된 섹션: 1. 배경과 문제 정의, 2. 목표와 성공 지표, 3. 범위, 4. 사용자 시나리오 / 요구사항, 5. 데이터/설계 고려사항
      </detail>
    </action>

    <action n="2">
      <do>각 섹션 작성</do>
      <detail>
        구체화된 요구사항을 바탕으로 각 섹션을 작성합니다:
        - 배경과 문제 정의: 왜 이 기능이 필요한가?
        - 목표와 성공 지표: 무엇을 달성하고자 하는가?
        - 범위: 무엇을 포함하고 제외하는가?
        - 사용자 시나리오 / 요구사항: 구체적인 동작은 무엇인가?
        - 데이터/설계 고려사항: 기술적으로 고려할 점은?
      </detail>
    </action>

    <action n="3">
      <do>사용자 시나리오 작성</do>
      <detail>
        사용자 시나리오는 완전한 문장 형태로 작성합니다.
        하나의 시나리오는 사용자 혹은 시스템의 한 동작만을 포함합니다.
        최대한 자세하게 작성하여 테스트 케이스 작성에 도움이 되도록 합니다.
      </detail>
    </action>

    <action n="4">
      <do>PRD 파일 저장</do>
      <detail>
        작성한 PRD를 새로운 파일로 저장합니다.
        기존 PRD는 참조하지 않으며, 한 번 작성된 PRD는 수정하지 않습니다.
      </detail>
    </action>
  </how-to>

  <constraints>
    <constraint>기존에 작성한 PRD는 참조하지 말 것</constraint>
    <constraint>반드시 매번 새로운 파일을 작성할 것</constraint>
    <constraint>한번 작성된 PRD는 다시 수정하지 말 것</constraint>
    <constraint>구체화된 요구사항을 초과하는 내용은 절대 작성하지 말 것</constraint>
    <constraint>양식에서 벗어나는 내용은 절대 작성하지 말 것</constraint>
    <constraint>사용자 시나리오는 완전한 문장 형태로 작성할 것</constraint>
    <constraint>사용자 시나리오는 최대한 자세하게 작성할 것</constraint>
    <constraint>하나의 시나리오는 한 동작만 포함할 것</constraint>
  </constraints>

  <success-criteria>
    <criterion>모든 필수 섹션이 작성됨</criterion>
    <criterion>템플릿 양식을 준수함</criterion>
    <criterion>구체화된 요구사항이 모두 반영됨</criterion>
    <criterion>추가 내용이 포함되지 않음</criterion>
    <criterion>사용자 시나리오가 자세하고 명확함</criterion>
  </success-criteria>
</step>
```
