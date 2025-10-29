# Step: 지시사항 분석

```xml
<step>
  <purpose>
    사용자의 지시사항을 명확히 이해하고, 업무 수행에 필요한 모든 정보를 확보합니다.
  </purpose>

  <how-to>
    <action n="1">
      <do>핵심 정보 추출</do>
      <detail>
        지시사항에서 다음 항목들을 추출하세요:
        - 목표: 무엇을 달성해야 하는가?
        - 범위: 어디까지 작업해야 하는가?
        - 기한: 언제까지 완료해야 하는가?
        - 제약사항: 어떤 제약이 있는가? (기술 스택, 브라우저, 환경 등)
      </detail>
    </action>

    <action n="2">
      <do>누락 정보 확인</do>
      <detail>
        다음 정보가 누락되었는지 확인하세요:
        - 구체적인 기능 명세가 있는가?
        - 성공 기준이 명확한가?
        - 우선순위가 정해져 있는가?
      </detail>
    </action>

    <action n="3">
      <do>질문 준비</do>
      <detail>
        누락된 정보가 있다면 사용자에게 질문하세요.
        예시: "다음 정보가 필요합니다: 1. [누락된 정보 1] 2. [누락된 정보 2]"
      </detail>
    </action>
  </how-to>

  <constraints>
    <constraint>모호한 지시사항은 반드시 명확히 해야 함</constraint>
    <constraint>추측으로 정보를 채우지 말고 사용자에게 질문할 것</constraint>
    <constraint>모든 제약사항을 명시적으로 확인할 것</constraint>
  </constraints>

  <success-criteria>
    <criterion>목표가 명확히 정의됨</criterion>
    <criterion>범위가 구체적으로 정해짐</criterion>
    <criterion>필요한 모든 정보가 확보됨</criterion>
    <criterion>제약사항이 모두 파악됨</criterion>
  </success-criteria>
</step>
```
