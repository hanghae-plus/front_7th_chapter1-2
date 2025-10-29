# Task: PRD 작성

```xml
<task>
  <name>PRD 작성</name>
  <description>간소화 PRD 템플릿에 맞춰 명세를 문서화한다.</description>
  <input>
    <detail>정제된 요구, 목표/지표, 범위</detail>
    <template>
      <link>templates/prd/prd-{{기능명}}-{{YYMMDD_hhmmss}}.md.hbs</link>
    </template>
    <example>
      <success-case>
        <code>## 3. 범위\n### 포함: 검색 로직/알림 스케줄러</code>
        <reason>포함·제외가 분리되어 명확</reason>
      </success-case>
      <failure-case>
        <code>범위 섹션 비어있음</code>
        <reason>스코프 크립 위험</reason>
      </failure-case>
    </example>
  </input>
  <steps>
    <step number="1">템플릿 목차 채우기</step>
    <step number="2">정량 지표·예외 반영</step>
    <step number="3">리뷰 요청</step>
  </steps>
  <rules>
    <rule>링크/레퍼런스 명시</rule>
  </rules>
  <output>
    <description>PRD 문서</description>
    <template>
      <link>templates/prd/prd-{{기능명}}-{{YYMMDD_hhmmss}}.md</link>
    </template>
    <example>
      <success-case>
        <code>## 2. 목표와 성공 지표\n- CS 50% 감소</code>
        <reason>측정 가능</reason>
      </success-case>
    </example>
  </output>
</task>
```
