# Step: 최종 보고

```xml
<step>
  <purpose>
    모든 워크플로우가 완료되면 사용자에게 최종 결과를 명확하게 보고합니다.
  </purpose>

  <how-to>
    <action n="1">
      <do>완료 선언</do>
      <detail>
        "# 워크플로우 완료 보고" 형식으로 시작하여 어떤 기능 작업이 완료되었는지 명시
      </detail>
    </action>

    <action n="2">
      <do>진행된 단계 나열</do>
      <detail>
        각 단계별로 어떤 작업이 수행되었는지 나열:
        "1. **[에이전트명]**: [작업] 완료 - 산출물: [경로]"
        모든 에이전트의 작업을 순서대로 나열
      </detail>
    </action>

    <action n="3">
      <do>최종 산출물 요약</do>
      <detail>
        주요 산출물들을 카테고리별로 정리:
        - 문서: PRD, 스프린트 계획 등
        - 코드: 구현 코드, 테스트 코드
        - 업무 일지: 각 에이전트의 worklog
      </detail>
    </action>

    <action n="4">
      <do>다음 단계 제안 (선택사항)</do>
      <detail>
        필요시 다음 단계를 제안:
        - 통합 테스트 실행 권장
        - UI 컴포넌트 연동 필요
        - 사용자 피드백 수집 권장 등
      </detail>
    </action>
  </how-to>

  <constraints>
    <constraint>모든 단계가 완료된 후에만 보고해야 함</constraint>
    <constraint>모든 산출물 경로를 포함해야 함</constraint>
    <constraint>카테고리별로 산출물을 정리해야 함</constraint>
    <constraint>사용자가 다음 액션을 취할 수 있도록 명확해야 함</constraint>
  </constraints>

  <success-criteria>
    <criterion>모든 단계가 완료되었음을 명시</criterion>
    <criterion>각 단계의 산출물 경로가 포함됨</criterion>
    <criterion>산출물이 카테고리별로 정리됨</criterion>
    <criterion>보고가 명확하고 이해하기 쉬움</criterion>
  </success-criteria>
</step>
```
