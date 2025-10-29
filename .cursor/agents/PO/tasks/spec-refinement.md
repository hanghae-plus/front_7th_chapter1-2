# Task: 명세 구체화

```xml
<task>
  <name>명세 구체화</name>
  <description>모호한 요구를 테스트 가능한 문장으로 정제한다.</description>
  <input>
    <detail>원시 요구 명세</detail>
    <example>
      <success-case>
        <code>31일 규칙/2월29일 규칙/겹침 정책/종료 조건 명시</code>
        <reason>예외와 완조건 존재</reason>
      </success-case>
      <failure-case>
        <code>반복 일정 만들어줘</code>
        <reason>테스트 불가</reason>
      </failure-case>
    </example>
  </input>
  <steps>
    <step number="1">5W1H 정규화</step>
    <step number="2">예외/경계값 추출</step>
    <step number="3">Gherkin 수용 기준 작성</step>
  </steps>
  <rules>
    <rule>정량화 우선</rule>
  </rules>
  <output>
    <description>구체화된 요구 리스트</description>
    <example>
      <success-case>
        <code>매월 31일 반복은 31일 없는 달 미생성</code>
        <reason>명확·검증 가능</reason>
      </success-case>
    </example>
  </output>
</task>
```
