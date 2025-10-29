# Task: 워크플로우 관리

```xml
<task>
  <name>워크플로우 관리</name>
  <description>산출물 검토와 다음 단계 트리거, 종결 보고까지 관리.</description>
  <input>
    <detail>각 단계 산출물 링크</detail>
    <example>
      <success-case>
        <code>PRD 링크→스프린트→테스트케이스→RED→GREEN→리팩토링</code>
        <reason>연결 경로가 살아있음</reason>
      </success-case>
    </example>
  </input>
  <steps>
    <step number="1">산출물 수령·체크</step>
    <step number="2">기준 미달 시 재작업 요청</step>
    <step number="3">다음 단계 트리거</step>
    <step number="4">최종 종결 보고</step>
  </steps>
  <rules>
    <rule>링크/경로 없는 산출물은 반려</rule>
  </rules>
  <output>
    <description>진행 리포트, 종결 리포트</description>
    <example>
      <success-case>
        <code>각 단계 산출물 경로가 모아진 리포트</code>
        <reason>감사/재현 가능</reason>
      </success-case>
    </example>
  </output>
</task>
```
