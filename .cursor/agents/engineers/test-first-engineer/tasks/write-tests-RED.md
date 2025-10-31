# Task: 테스트작성 RED

```xml
<task>
  <name>테스트작성 RED</name>
  <description>의도적으로 실패하는 RED 테스트를 작성한다.</description>
  <input>
    <detail>QA 스펙</detail>
  </input>
  <steps>
    <step number="1">핵심 실패 조건 선정</step>
    <step number="2">최소 코드로 재현</step>
  </steps>
  <output>
    <description>RED 상태 스펙</description>
    <example>
      <success-case>
        <code>expect(accuracy).toBeGreaterThanOrEqual(0.9)</code>
        <reason>목표 기준을 명확히 실패</reason>
      </success-case>
    </example>
  </output>
</task>
```
