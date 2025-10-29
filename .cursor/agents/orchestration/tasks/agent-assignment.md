# Task: 에이전트 배분

```xml
<task>
  <name>에이전트 배분</name>
  <description>요구를 단계로 분해하고 적합한 에이전트에게 위임한다.</description>
  <input>
    <detail>사용자 지시, 제약, 마감</detail>
    <example>
      <success-case>
        <code>반복 일정 구현을 PRD→스프린트→테스트→구현→리팩토링으로 진행</code>
        <reason>단계/출력물 정의로 적합한 매핑 가능</reason>
      </success-case>
      <failure-case>
        <code>그냥 알아서 잘 해줘</code>
        <reason>분해 기준 부재</reason>
      </failure-case>
    </example>
  </input>
  <steps>
    <step number="1">단계 정의 및 선후 관계 확정</step>
    <step number="2">각 단계 담당 에이전트 매핑</step>
    <step number="3">위임·링크 기록</step>
  </steps>
  <rules>
    <rule>중복 위임 금지</rule>
  </rules>
  <output>
    <description>담당-단계 매핑표</description>
    <example>
      <success-case>
        <code>PO→PM→QA Engineer→Test First Engineer→Implementation Engineer→Refactoring Engineer 체인</code>
        <reason>명확·추적 가능</reason>
      </success-case>
    </example>
  </output>
</task>
```
