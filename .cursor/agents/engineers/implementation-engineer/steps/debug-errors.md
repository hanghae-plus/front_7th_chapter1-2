# Step: 오류 디버깅

````xml
<step>
  <purpose>
    테스트 실패 또는 사용자가 오류 수정을 지시한 경우, Root Cause를 정확히 파악하고 적절히 대응합니다.
    문제의 원인이 다른 에이전트의 작업에 있는지 구현에 있는지 판단합니다.
  </purpose>

  <how-to>
    <action n="1">
      <do>오류 현상 정확히 파악</do>
      <detail>
        발생한 오류를 정확히 파악합니다:

        1. **테스트 실패 오류**
           ```bash
           npm test
           ```

           확인할 내용:
           - 어떤 테스트가 실패했는가?
           - 에러 메시지는 무엇인가?
           - Expected vs Actual 값은?
           - 스택 트레이스는?

        2. **런타임 오류**
           - 어떤 동작에서 발생하는가?
           - 콘솔 에러 메시지는?
           - 재현 가능한가?

        3. **타입 오류**
           ```bash
           npx tsc --noEmit
           ```

           - 어떤 파일의 몇 번째 줄인가?
           - 어떤 타입이 기대되고 실제로는?

        4. **Lint 오류**
           ```bash
           npx eslint src/
           ```

           - 어떤 규칙을 위반했는가?
           - 의도적인 코드인가 실수인가?

        오류 정보를 정리:
        ```markdown
        ## 오류 현상

        - 오류 유형: 테스트 실패
        - 실패한 테스트: "매월 31일 반복 시 31일이 없는 달은 건너뜀"
        - 에러 메시지: Expected 2, Received 4
        - 발생 위치: src/__tests__/unit/recurringUtils.spec.ts:45
        ```
      </detail>
    </action>

    <action n="2">
      <do>PRD와 현재 코드 비교</do>
      <detail>
        PRD의 요구사항과 현재 코드를 비교하여 불일치를 찾습니다:

        비교 체크리스트:

        1. **PRD 요구사항 확인**
           ```bash
           cat docs/prd/prd-{{기능명}}-v{{버전}}.md
           ```

           해당 기능에 대한 PRD 요구사항을 찾아 읽습니다.

        2. **현재 코드 확인**
           ```bash
           cat src/{{구현파일}}.ts
           ```

           현재 구현된 코드를 읽습니다.

        3. **비교 분석**
           | 항목 | PRD 요구사항 | 현재 코드 | 일치 여부 |
           |------|-------------|----------|----------|
           | 매월 31일 규칙 | 31일 없는 달 건너뜀 | 모든 달에 생성 | ❌ 불일치 |
           | 윤년 규칙 | 평년에는 생성 안 함 | 구현됨 | ✅ 일치 |
           | 에러 처리 | 시작일 > 종료일 에러 | 미구현 | ❌ 불일치 |

        불일치가 발견되면 다음 단계로 진행합니다.
      </detail>
    </action>

    <action n="3">
      <do>Root Cause 분석 - 원인 분류</do>
      <detail>
        불일치의 원인을 분석하고 분류합니다:

        ## 원인 분류 트리

        ```
        오류 발생
        ├─ PRD와 코드 불일치
        │  ├─ 1. PRD가 잘못됨
        │  │  └─ PO의 요구사항 분석 오류
        │  ├─ 2. 테스트 케이스가 잘못됨
        │  │  ├─ QA Engineer의 테스트 케이스 설계 오류
        │  │  └─ Test First Engineer의 테스트 코드 작성 오류
        │  └─ 3. 구현이 잘못됨
        │     ├─ PRD 요구사항 누락
        │     ├─ 잘못된 로직 구현
        │     └─ 예외 케이스 미처리
        └─ PRD와 코드 일치하지만 테스트 실패
           ├─ 4. 테스트가 PRD와 불일치
           │  ├─ QA Engineer의 테스트 케이스 설계 오류
           │  └─ Test First Engineer의 테스트 코드 작성 오류
           └─ 5. 환경 문제
              ├─ 의존성 버전 문제
              └─ Mock 설정 문제
        ```

        각 원인을 체계적으로 확인:

        ### 1단계: PRD 확인
        ```bash
        cat docs/prd/prd-{{기능명}}-v{{버전}}.md
        ```

        질문:
        - PRD에 해당 요구사항이 명시되어 있는가?
        - PRD의 요구사항이 명확한가?
        - PRD의 요구사항이 모순되지 않는가?

        ### 2단계: 테스트 케이스 문서 확인
        ```bash
        cat docs/testcases/{{기능명}}-testcases.md
        ```

        질문:
        - 테스트 케이스가 PRD와 일치하는가?
        - 테스트 시나리오가 올바른가?
        - 경계값 케이스가 정확한가?

        ### 3단계: 테스트 코드 확인
        ```bash
        cat src/__tests__/{{테스트파일}}.spec.ts
        ```

        질문:
        - 테스트 코드가 테스트 케이스 문서와 일치하는가?
        - Expected 값이 올바른가?
        - Mock 설정이 올바른가?

        ### 4단계: 구현 코드 확인
        ```bash
        cat src/{{구현파일}}.ts
        ```

        질문:
        - PRD 요구사항을 모두 구현했는가?
        - 로직이 올바른가?
        - 예외 케이스를 처리했는가?

        ### 5단계: 다른 에이전트의 worklog 확인
        ```bash
        ls -lt docs/worklog/ | head -10
        cat docs/worklog/worklog-qa-engineer-v{{버전}}.md
        cat docs/worklog/worklog-test-first-engineer-v{{버전}}.md
        ```

        질문:
        - 다른 에이전트가 특별히 언급한 사항이 있는가?
        - 불명확한 요구사항에 대한 가정이 있는가?
        - 알려진 이슈나 제약사항이 있는가?
      </detail>
    </action>

    <action n="4">
      <do>Root Cause 결론 도출</do>
      <detail>
        분석 결과를 바탕으로 Root Cause를 결론짓습니다:

        결론 템플릿:
        ```markdown
        ## Root Cause 분석 결과

        ### 오류 현상
        - {{오류 설명}}

        ### 분석 과정
        1. PRD 확인: {{결과}}
        2. 테스트 케이스 문서 확인: {{결과}}
        3. 테스트 코드 확인: {{결과}}
        4. 구현 코드 확인: {{결과}}
        5. Worklog 확인: {{결과}}

        ### Root Cause
        - 원인 분류: {{1~5 중 선택}}
        - 구체적 원인: {{상세 설명}}
        - 책임 에이전트: {{에이전트명 또는 Implementation Engineer}}

        ### 증거
        - PRD 요구사항: "{{PRD 내용}}"
        - 현재 코드: "{{코드 내용}}"
        - 불일치 내용: {{설명}}
        ```

        예시 1 (구현 오류):
        ```markdown
        ## Root Cause 분석 결과

        ### 오류 현상
        - 매월 31일 반복 테스트 실패
        - Expected: 2개 (1월, 3월), Received: 4개 (1월, 2월, 3월, 4월)

        ### 분석 과정
        1. PRD 확인: "매월 31일 반복 시 31일이 없는 달은 건너뜀" 명시됨
        2. 테스트 케이스 확인: PRD와 일치
        3. 테스트 코드 확인: 테스트 케이스와 일치
        4. 구현 코드 확인: hasDay() 함수를 사용하지 않고 무조건 생성
        5. Worklog 확인: 특이사항 없음

        ### Root Cause
        - 원인 분류: 3. 구현이 잘못됨 - 예외 케이스 미처리
        - 구체적 원인: generateMonthlyDates() 함수에서 hasDay() 검증을 누락
        - 책임 에이전트: Implementation Engineer

        ### 증거
        - PRD 요구사항: "매월 31일 반복 시 31일이 없는 달(2월, 4월, 6월, 9월, 11월)은 건너뜀"
        - 현재 코드:
          ```typescript
          for (let d = new Date(start); d <= end; d.setMonth(d.getMonth() + 1)) {
            instances.push({ date: formatDate(d), ... });
          }
          ```
        - 불일치 내용: hasDay() 검증 없이 무조건 생성
        ```

        예시 2 (테스트 오류):
        ```markdown
        ## Root Cause 분석 결과

        ### 오류 현상
        - 윤년 2월 29일 반복 테스트 실패
        - Expected: 1개 (2024년만), Received: 2개 (2024년, 2025년)

        ### 분석 과정
        1. PRD 확인: "윤년 2월 29일 반복 시 평년에는 생성되지 않음" 명시됨
        2. 테스트 케이스 확인: PRD와 일치
        3. 테스트 코드 확인: Expected 값이 잘못됨 (2025년은 평년이므로 생성 안 됨)
        4. 구현 코드 확인: isLeapYear() 검증 로직 정확히 구현됨
        5. Worklog 확인: Test First Engineer가 윤년 계산 실수 언급

        ### Root Cause
        - 원인 분류: 2. 테스트 코드가 잘못됨 - Test First Engineer의 테스트 코드 작성 오류
        - 구체적 원인: 테스트의 Expected 값 계산 오류 (2025년을 윤년으로 잘못 계산)
        - 책임 에이전트: Test First Engineer

        ### 증거
        - PRD 요구사항: "윤년 2월 29일 반복 시 평년에는 생성되지 않음"
        - 테스트 코드:
          ```typescript
          expect(dates).toHaveLength(2); // 잘못됨, 1이어야 함
          ```
        - 구현 코드:
          ```typescript
          if (month === 2 && day === 29 && !isLeapYear(year)) {
            continue; // 평년 건너뜀 - 정확함
          }
          ```
        - 불일치 내용: 테스트가 2025년도 포함할 것으로 기대하지만, 2025년은 평년
        ```
      </detail>
    </action>

    <action n="5">
      <do>대응 방안 결정</do>
      <detail>
        Root Cause에 따라 대응 방안을 결정합니다:

        ## 대응 방안 결정 트리

        ```
        Root Cause
        ├─ 구현 오류 (Implementation Engineer 책임)
        │  └─ → 구현 수정 후 계속 진행
        │     1. 오류 수정
        │     2. 테스트 재실행
        │     3. Worklog에 Root Cause 및 수정 내용 기록
        │     4. 커밋 (커밋 타입: fix)
        │
        └─ 다른 에이전트 오류 (PO, QA, Test First Engineer 책임)
           └─ → Worklog 작성 후 업무 중단
              1. Root Cause 분석 결과를 Worklog에 상세히 기록
              2. 어떤 에이전트의 어떤 작업이 수정되어야 하는지 명시
              3. 수정이 필요한 구체적인 내용 명시
              4. 커밋 (커밋 타입: docs)
              5. 사용자에게 보고
        ```

        ### Case 1: 구현 오류인 경우

        다음 단계로 진행:
        1. action 6 (구현 수정) 수행
        2. 테스트 재실행하여 GREEN 확인
        3. Worklog에 다음 내용 포함:
           ```markdown
           ## 디버깅 수행

           ### Root Cause
           - {{Root Cause 분석 결과}}

           ### 수정 내용
           - {{수정한 파일}}
           - {{수정한 내용}}
           - {{수정 이유}}

           ### 검증 결과
           - 테스트 통과: {{통과한 테스트 수}}
           - 수정 후 동작: {{예상대로 동작함}}
           ```

        ### Case 2: 다른 에이전트 오류인 경우

        Worklog 작성 후 중단:
        ```markdown
        ## 디버깅 수행 - 업무 중단

        ### Root Cause
        {{Root Cause 분석 결과}}

        ### 수정이 필요한 에이전트
        - 에이전트: {{에이전트명}}
        - 작업: {{작업명}}
        - 산출물: {{산출물 경로}}

        ### 수정이 필요한 내용

        1. **{{수정 항목 1}}**
           - 현재: {{현재 상태}}
           - 수정 필요: {{수정해야 할 내용}}
           - 이유: {{이유}}

        2. **{{수정 항목 2}}**
           - 현재: {{현재 상태}}
           - 수정 필요: {{수정해야 할 내용}}
           - 이유: {{이유}}

        ### 권장 조치
        {{에이전트명}}가 {{산출물}}을 수정한 후,
        Test First Engineer가 테스트 코드를 재작성하고,
        Implementation Engineer가 다시 구현을 시도해야 합니다.
        ```

        그리고 사용자에게 보고:
        ```
        오류의 Root Cause를 분석한 결과, {{에이전트명}}의 {{작업}}에 문제가 있습니다.

        상세한 분석 결과는 docs/worklog/worklog-implementation-engineer-v{{버전}}.md에 기록했습니다.

        {{에이전트명}}가 다음 사항을 수정해야 합니다:
        - {{수정 항목 1}}
        - {{수정 항목 2}}
        ```
      </detail>
    </action>

    <action n="6">
      <do>구현 수정 (구현 오류인 경우에만)</do>
      <detail>
        Root Cause가 구현 오류인 경우에만 수행합니다:

        수정 프로세스:

        1. **수정 계획 수립**
           - 어떤 파일을 수정할 것인가?
           - 어떤 함수/로직을 수정할 것인가?
           - 다른 부분에 영향은 없는가?

        2. **코드 수정**
           - PRD 요구사항에 맞게 수정
           - 예외 케이스 처리 추가
           - 경계값 검증 추가

        3. **테스트 재실행**
           ```bash
           npm test
           ```

           - 수정한 부분의 테스트가 통과하는가?
           - 다른 테스트에 영향은 없는가?

        4. **Lint 및 타입 검사**
           ```bash
           npx tsc --noEmit
           npx eslint src/
           ```

        5. **수정 내용 문서화**
           Worklog에 기록:
           ```markdown
           ### 수정 내용

           **파일**: src/utils/generateRecurringDates.ts

           **수정 전**:
           ```typescript
           for (let d = new Date(start); d <= end; d.setMonth(d.getMonth() + 1)) {
             instances.push({ date: formatDate(d), ... });
           }
           ```

           **수정 후**:
           ```typescript
           for (let d = new Date(start); d <= end; d.setMonth(d.getMonth() + 1)) {
             if (hasDay(d.getFullYear(), d.getMonth() + 1, day)) {
               instances.push({ date: formatDate(d), ... });
             }
           }
           ```

           **수정 이유**:
           PRD 요구사항 "매월 31일 반복 시 31일이 없는 달은 건너뜀"을 구현하기 위해
           hasDay() 검증 로직 추가

           **검증 결과**:
           - 테스트 통과: 15/15
           - 매월 31일 테스트 통과 확인
           ```
      </detail>
    </action>
  </how-to>

  <constraints>
    <constraint>Root Cause를 정확히 파악할 것</constraint>
    <constraint>PRD와 코드를 반드시 비교할 것</constraint>
    <constraint>다른 에이전트의 worklog를 확인할 것</constraint>
    <constraint>구현 오류가 아닌 경우 업무를 중단하고 보고할 것</constraint>
    <constraint>Root Cause 분석 결과를 worklog에 상세히 기록할 것</constraint>
  </constraints>

  <success-criteria>
    <criterion>오류 현상을 정확히 파악함</criterion>
    <criterion>PRD와 코드를 비교 분석함</criterion>
    <criterion>Root Cause를 정확히 분류함</criterion>
    <criterion>적절한 대응 방안을 결정함</criterion>
    <criterion>구현 오류인 경우 수정 완료함</criterion>
    <criterion>다른 에이전트 오류인 경우 상세히 보고함</criterion>
  </success-criteria>
</step>
````
