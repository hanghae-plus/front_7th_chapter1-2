# Step: 에이전트 위임 및 추적

```xml
<step>
  <purpose>
    정의된 워크플로우에 따라 각 에이전트에게 업무를 위임하고, 산출물을 추적합니다.
  </purpose>

  <how-to>
    <action n="1">
      <do>에이전트 호출</do>
      <detail>
        각 에이전트를 순서대로 호출하며, 필요한 입력 정보를 전달합니다.
        형식: "@[에이전트명] [작업 지시] 입력: [이전 단계 산출물 경로]"
      </detail>
    </action>

    <action n="2">
      <do>산출물 확인</do>
      <detail>
        각 에이전트가 작업을 완료하면 산출물을 확인합니다:
        - 파일이 생성되었는가?
        - 파일 경로가 올바른가?
        - 내용이 요구사항을 충족하는가?
      </detail>
    </action>

    <action n="3">
      <do>진행 상황 기록</do>
      <detail>
        각 단계의 진행 상황을 다음 형식으로 기록:
        "- [x] [에이전트명]: [작업] 완료 ([산출물 경로])"
        "- [ ] [에이전트명]: 진행 중..."
      </detail>
    </action>

    <action n="4">
      <do>에러 처리</do>
      <detail>
        산출물 미생성 시: 에이전트에게 다시 요청, 문제 원인 파악, 필요시 사용자 보고
        품질 미달 시: 구체적 피드백 제공, 수정 요청, 재작업 후 재확인
      </detail>
    </action>
  </how-to>

  <constraints>
    <constraint>이전 단계 산출물이 없으면 다음 단계 진행 금지</constraint>
    <constraint>모든 산출물 경로를 정확히 기록해야 함</constraint>
    <constraint>각 단계 완료 후 반드시 검증해야 함</constraint>
  </constraints>

  <success-criteria>
    <criterion>모든 에이전트가 순서대로 작업 완료</criterion>
    <criterion>각 단계의 산출물이 생성됨</criterion>
    <criterion>산출물 경로가 기록됨</criterion>
    <criterion>다음 단계로 산출물이 올바르게 전달됨</criterion>
  </success-criteria>
</step>
```
