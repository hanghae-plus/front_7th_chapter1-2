# Step: 테스트 커버리지 측정

````xml
<step>
  <purpose>
    작성한 테스트의 커버리지를 측정하여 테스트 범위를 확인하고 문서화합니다.
  </purpose>

  <how-to>
    <action n="1">
      <do>커버리지 측정 실행</do>
      <detail>
        Vitest의 커버리지 기능을 사용하여 테스트 커버리지를 측정합니다:

        ```bash
        npm test -- --coverage
        ```

        또는

        ```bash
        npx vitest run --coverage
        ```

        커버리지 도구가 설치되지 않은 경우:
        ```bash
        npm install -D @vitest/coverage-v8
        ```

        측정 항목:
        - Statements (구문 커버리지)
        - Branches (분기 커버리지)
        - Functions (함수 커버리지)
        - Lines (라인 커버리지)
      </detail>
    </action>

    <action n="2">
      <do>커버리지 결과 분석</do>
      <detail>
        커버리지 보고서를 분석하여 다음 정보를 파악합니다:

        1. 전체 커버리지 비율
           - RED 상태에서는 낮은 커버리지가 정상 (스켈레톤 코드만 존재)
           - 일반적으로 10-30% 정도 예상

        2. 파일별 커버리지
           - 테스트 파일: 100% (테스트 코드 자체)
           - 타입 파일: 100% (타입 정의만 존재)
           - 구현 파일: 0-20% (스켈레톤만 존재)

        3. 커버되지 않은 부분
           - 아직 구현되지 않은 함수
           - 빈 구현 블록
           - 미사용 import

        예시:
        ```
        File                                    | % Stmts | % Branch | % Funcs | % Lines
        ----------------------------------------|---------|----------|---------|--------
        src/features/recurring-events/          |   12.5  |    0.0   |   20.0  |   12.5
          index.ts                              |   10.0  |    0.0   |   25.0  |   10.0
          types.ts                              |  100.0  |  100.0   |  100.0  |  100.0
          generateInstances.ts                  |    0.0  |    0.0   |    0.0  |    0.0
        ----------------------------------------|---------|----------|---------|--------
        All files                               |   12.5  |    0.0   |   20.0  |   12.5
        ```
      </detail>
    </action>

    <action n="3">
      <do>테스트 실행 결과 정리</do>
      <detail>
        테스트 실행 결과를 정리합니다:

        ```
        ## 테스트 결과
        - 총 테스트: 15개
        - 실패: 15개 (RED 상태 확인)
        - 통과: 0개
        - 실행 시간: 1.2s
        ```

        실패한 테스트 목록 작성:
        ```
        ## 실패한 테스트 목록
        1. generateRecurringDates › 매일 반복 › 매일 반복 일정을 생성할 수 있다
           - 이유: generateRecurringDates 함수가 빈 배열 반환
           - 기대값: 7개 날짜
           - 실제값: 0개 날짜

        2. generateRecurringDates › 매월 반복 › 매월 31일 반복 시 31일이 없는 달에는 생성되지 않는다
           - 이유: 날짜 생성 로직 미구현
           - 기대값: 2개 날짜 (1월 31일, 3월 31일)
           - 실제값: 0개 날짜
        ```
      </detail>
    </action>

    <action n="4">
      <do>커버리지 보고서 문서화</do>
      <detail>
        커버리지 결과를 worklog에 포함할 형식으로 문서화합니다:

        ```markdown
        # 테스트 실행 결과

        ## 테스트 결과
        - 총 테스트: [총 테스트 수]개
        - 실패: [실패 수]개 (RED 상태 확인)
        - 통과: [통과 수]개
        - 실행 시간: [실행 시간]s

        ## 커버리지
        \```
        File                                    | % Stmts | % Branch | % Funcs | % Lines
        ----------------------------------------|---------|----------|---------|--------
        [파일별 커버리지 정보]
        ----------------------------------------|---------|----------|---------|--------
        All files                               |   XX.X  |   XX.X   |   XX.X  |   XX.X
        \```

        ## 실패한 테스트 목록
        1. [테스트명]
           - 이유: [실패 이유]
           - 기대값: [기대하는 결과]
           - 실제값: [실제 결과]
        ```

        RED 상태 해석:
        - 낮은 커버리지는 정상 (스켈레톤 코드만 존재)
        - 모든 테스트가 실패하는 것이 목표
        - Implementation Engineer가 구현 후 커버리지 향상 예상
      </detail>
    </action>

    <action n="5">
      <do>다음 단계 가이드 작성</do>
      <detail>
        Implementation Engineer를 위한 가이드를 작성합니다:

        ```markdown
        # 다음 작업자에게 남기는 코멘트

        Implementation Engineer는 [함수명] 함수를 구현하여 모든 테스트를 통과(GREEN)시켜주세요.

        ## 구현해야 할 함수
        - [함수명 1]: [설명]
        - [함수명 2]: [설명]

        ## 주의사항
        - 경계값 케이스(매월 31일, 윤년 2/29)를 정확히 처리
        - 현재 커버리지가 [현재 %]%이므로, 구현 후 커버리지가 80% 이상이 되도록 해주세요

        ## 실패하는 테스트
        총 [실패 수]개의 테스트가 실패하고 있습니다.
        각 테스트의 실패 이유는 위의 "실패한 테스트 목록"을 참고해주세요.
        ```
      </detail>
    </action>

    <action n="6">
      <do>커버리지 HTML 보고서 확인 (선택)</do>
      <detail>
        상세한 커버리지 정보가 필요한 경우 HTML 보고서를 확인합니다:

        ```bash
        npm test -- --coverage --coverage.reporter=html
        ```

        생성된 보고서 위치:
        - coverage/index.html

        HTML 보고서에서 확인 가능한 정보:
        - 라인별 커버리지 상태 (실행됨/실행 안됨)
        - 분기별 커버리지 상태
        - 파일별 상세 정보

        주의: HTML 보고서는 worklog에 포함하지 않고, 필요시 참고용으로만 사용
      </detail>
    </action>
  </how-to>

  <constraints>
    <constraint>커버리지 측정은 모든 테스트 실행 후에 수행할 것</constraint>
    <constraint>RED 상태에서는 낮은 커버리지가 정상임을 이해할 것</constraint>
    <constraint>커버리지 결과를 worklog에 명확히 문서화할 것</constraint>
    <constraint>실패한 테스트의 이유를 구체적으로 작성할 것</constraint>
    <constraint>다음 작업자를 위한 가이드를 포함할 것</constraint>
  </constraints>

  <success-criteria>
    <criterion>커버리지가 성공적으로 측정됨</criterion>
    <criterion>테스트 실행 결과가 문서화됨</criterion>
    <criterion>커버리지 보고서가 worklog에 포함됨</criterion>
    <criterion>실패한 테스트 목록이 작성됨</criterion>
    <criterion>다음 작업자를 위한 가이드가 작성됨</criterion>
    <criterion>RED 상태가 확인됨 (모든 테스트 실패)</criterion>
  </success-criteria>
</step>
````
