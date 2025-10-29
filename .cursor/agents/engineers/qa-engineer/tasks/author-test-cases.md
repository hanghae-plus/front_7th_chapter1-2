# Task: 테스트 케이스 작성

```xml
<task>
  <name>테스트 케이스 작성</name>
  <description>PRD/마일스톤 기반으로 Vitest 스펙과 케이스를 작성한다.</description>
  <input>
    <detail>PRD, 스프린트 마일스톤</detail>
    <template>
      <link>templates/testcases/{{테스트_유닛_혹은_통합명}}.spec.ts.hbs</link>
    </template>
  </input>
  <steps>
    <step number="1">수용 기준 → 테스트 항목 매핑</step>
    <step number="2">RED/GREEN 분리 설계</step>
    <step number="3">목/경/예 케이스 표 작성</step>
  </steps>
  <output>
    <description>스펙 파일(RED/GREEN 예시 포함)</description>
    <example>
      <success-case>
        <code>describe('알림', ...)</code>
        <reason>기능 단위로 구조화</reason>
      </success-case>
    </example>
  </output>
</task>
```
