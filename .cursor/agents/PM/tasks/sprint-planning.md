# Task: 스크럼 계획

```xml
<task>
  <name>스크럼 계획</name>
  <description>PRD를 바탕으로 스프린트 목표와 작업을 정의한다.</description>
  <input>
    <detail>PRD 링크</detail>
  </input>
  <steps>
    <step number="1">목표 확정</step>
    <step number="2">작업 분해·우선순위</step>
    <step number="3">일정 배치</step>
  </steps>
  <output>
    <description>스프린트 계획 문서</description>
    <template>
      <link>templates/scrum/sprint-plan-{{스프린트명}}-{{YYMMDD}}.md.hbs</link>
    </template>
  </output>
</task>
```
