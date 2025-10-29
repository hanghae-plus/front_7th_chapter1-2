# Step: 워크플로우 정의

```xml
<step>
  <purpose>
    분석한 지시사항을 바탕으로 어떤 에이전트들이 어떤 순서로 작업해야 하는지 정의합니다.
  </purpose>

  <how-to>
    <action n="1">
      <do>기본 워크플로우 확인</do>
      <detail>
        전체 플로우: PO → PM → QA Engineer → Test First Engineer → Implementation Engineer → Refactoring Engineer

        각 단계별 산출물:
        1. PO: PRD 문서 (docs/prd/)
        2. PM: 스프린트 계획 (docs/sprint/)
        3. QA Engineer: 테스트 케이스 (src/__tests__/)
        4. Test First Engineer: 스켈레톤 코드 + RED 테스트
        5. Implementation Engineer: 구현 코드 (GREEN)
        6. Refactoring Engineer: 리팩토링된 코드
      </detail>
    </action>

    <action n="2">
      <do>워크플로우 선택</do>
      <detail>
        지시사항에 따라 적절한 워크플로우 선택:
        - 전체 플로우: "처음부터", "PRD부터", "전체" 등 → PO부터 시작
        - 부분 플로우: "테스트만" → QA Engineer부터, "구현만" → Implementation Engineer부터
        - 문서만: "PRD 작성" → PO만, "스프린트 계획" → PM만
      </detail>
    </action>

    <action n="3">
      <do>워크플로우 문서화</do>
      <detail>
        각 단계를 다음 형식으로 문서화:
        "워크플로우: 1. [에이전트명] - [작업 내용] → [산출물 경로] 2. [에이전트명] - [작업 내용] → [산출물 경로] ..."
      </detail>
    </action>
  </how-to>

  <constraints>
    <constraint>각 단계의 산출물이 다음 단계의 입력이 되어야 함</constraint>
    <constraint>의존성을 고려하여 순서를 정해야 함</constraint>
    <constraint>모든 에이전트와 산출물 경로를 명시해야 함</constraint>
  </constraints>

  <success-criteria>
    <criterion>각 단계의 에이전트가 명확히 정의됨</criterion>
    <criterion>각 단계의 산출물 경로가 명시됨</criterion>
    <criterion>단계 간 의존성이 올바름</criterion>
    <criterion>워크플로우가 문서화됨</criterion>
  </success-criteria>
</step>
```
