# Step: PRD 분석

```xml
<step>
  <purpose>
    PO가 작성한 PRD 문서를 읽고 목표, 범위, 요구사항을 명확히 파악합니다.
  </purpose>

  <how-to>
    <action n="1">
      <do>PRD 문서 읽기</do>
      <detail>
        다음 섹션들을 주의 깊게 읽습니다:
        - 1. 배경과 문제 정의: 왜 이 기능이 필요한가?
        - 2. 목표와 성공 지표: 무엇을 달성해야 하는가?
        - 3. 범위: 무엇을 포함하고, 무엇을 제외하는가?
        - 4. 사용자 시나리오 / 요구사항: 구체적으로 어떤 기능이 필요한가?
        - 5. 데이터/설계 고려사항: 기술적으로 고려해야 할 점은?
      </detail>
    </action>

    <action n="2">
      <do>핵심 정보 추출</do>
      <detail>
        다음 항목들을 추출합니다:
        - 기능 요구사항: 구현해야 할 기능 목록과 세부 동작
        - 비기능 요구사항: 성능 기준, 접근성, 브라우저 호환성
        - 제약사항: 기술 스택, 일정, 리소스 제약
        - 예외 처리 규칙: 특별히 처리해야 할 케이스
      </detail>
    </action>

    <action n="3">
      <do>불명확한 부분 확인</do>
      <detail>
        다음을 확인합니다:
        - 모호한 요구사항이 있는가?
        - 상충하는 요구사항이 있는가?
        - 누락된 정보가 있는가?
        불명확한 부분이 있다면 PO에게 질문합니다.
      </detail>
    </action>
  </how-to>

  <constraints>
    <constraint>PRD의 모든 섹션을 빠짐없이 읽을 것</constraint>
    <constraint>추측하지 말고 불명확한 부분은 질문할 것</constraint>
    <constraint>기능/비기능 요구사항을 명확히 구분할 것</constraint>
  </constraints>

  <success-criteria>
    <criterion>PRD의 모든 섹션을 읽고 이해함</criterion>
    <criterion>기능 요구사항 목록이 작성됨</criterion>
    <criterion>비기능 요구사항이 파악됨</criterion>
    <criterion>제약사항이 명확함</criterion>
  </success-criteria>
</step>
```
