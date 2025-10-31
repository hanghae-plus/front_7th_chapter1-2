# Step: Worklog 작성

```xml
<step>
  <purpose>
    진행한 업무에 대한 업무일지를 작성하여 작업 이력을 남기고, 다음 작업자에게 유용한 정보를 전달합니다.
  </purpose>

  <how-to>
    <action n="1">
      <do>템플릿 확인</do>
      <detail>
        templates/worklog/worklog.md.hbs 템플릿을 확인하여 필수 섹션과 형식을 파악합니다.
      </detail>
    </action>

    <action n="2">
      <do>헤더 정보 작성</do>
      <detail>
        다음 정보를 작성합니다:
        - 작성자: 에이전트명
        - 업무 지시 내용: 무엇을 해야 했는가
        - 참고자료: 참고한 파일/문서 경로
        - 산출물: 생성한 파일/문서 경로
      </detail>
    </action>

    <action n="3">
      <do>업무 과정 작성</do>
      <detail>
        수행한 작업을 시간 순서대로 나열합니다 (5-10개 항목):
        - 구체적으로 작성 (무엇을 했는지 명확히)
        - 중요한 결정 사항 포함
        - 발생한 문제와 해결 방법 포함
        - 각 항목은 한 문장으로 간결하게
      </detail>
    </action>

    <action n="4">
      <do>참고 파일 나열</do>
      <detail>
        실제로 읽거나 참고한 파일만 나열합니다:
        - 절대 경로 또는 프로젝트 루트 기준 상대 경로 사용
        - 템플릿 파일, PRD, 코드 파일 등 모두 포함
      </detail>
    </action>

    <action n="5">
      <do>다음 작업자에게 코멘트 작성</do>
      <detail>
        다음 작업자가 알아야 할 정보를 작성합니다:
        - 다음 작업자가 누구인지 명시
        - 주의해야 할 점 강조
        - 개선 제안 포함
        - 미해결 이슈 명시
      </detail>
    </action>
  </how-to>

  <constraints>
    <constraint>템플릿 양식을 반드시 따를 것</constraint>
    <constraint>양식에 없는 섹션을 추가하지 말 것</constraint>
    <constraint>모든 필수 섹션을 작성할 것</constraint>
    <constraint>참고 파일 경로를 정확히 작성할 것</constraint>
    <constraint>실제로 수행한 작업만 기록할 것</constraint>
    <constraint>추상적인 표현을 사용하지 말 것</constraint>
  </constraints>

  <success-criteria>
    <criterion>모든 필수 섹션이 포함됨</criterion>
    <criterion>내용이 구체적이고 유용함</criterion>
    <criterion>다음 작업자가 이해할 수 있음</criterion>
    <criterion>참고 파일 경로가 정확함</criterion>
  </success-criteria>
</step>
```
