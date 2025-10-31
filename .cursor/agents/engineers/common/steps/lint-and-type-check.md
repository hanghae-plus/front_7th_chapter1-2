# Step: Lint 및 타입 검사

````xml
<step>
  <purpose>
    작성한 코드에 린트 오류나 타입 오류가 없는지 확인하여 코드 품질을 보장합니다.
  </purpose>

  <how-to>
    <action n="1">
      <do>타입 검사 실행</do>
      <detail>
        TypeScript 타입 검사를 실행하여 타입 오류를 확인합니다:

        ```bash
        npx tsc --noEmit
        ```

        확인 항목:
        - 타입 불일치
        - 누락된 타입 정의
        - 잘못된 타입 사용
        - import 오류

        모든 타입 오류를 수정해야 합니다.
      </detail>
    </action>

    <action n="2">
      <do>ESLint 검사 실행</do>
      <detail>
        ESLint를 실행하여 코드 스타일 및 잠재적 오류를 확인합니다:

        ```bash
        npx eslint src/
        ```

        확인 항목:
        - 코드 스타일 위반
        - 사용하지 않는 변수/import
        - 잠재적 버그
        - 베스트 프랙티스 위반
      </detail>
    </action>

    <action n="3">
      <do>오류 분석 및 분류</do>
      <detail>
        발견된 오류를 분석하고 분류합니다:

        1. 반드시 수정해야 하는 오류:
           - 타입 오류
           - 문법 오류
           - import 오류
           - 논리적 오류

        2. RED 상태에서 불가피한 오류:
           - unused variable (스켈레톤 함수의 매개변수)
           - unused import (아직 사용하지 않는 import)
           - empty function (빈 구현)

        3. 수정 가능한 스타일 오류:
           - 들여쓰기
           - 세미콜론
           - 따옴표 스타일
      </detail>
    </action>

    <action n="4">
      <do>오류 수정</do>
      <detail>
        분류한 오류를 적절히 수정합니다:

        반드시 수정:
        - 모든 타입 오류 수정
        - 모든 문법 오류 수정
        - 모든 import 오류 수정

        RED 상태 불가피한 오류 처리:
        ```typescript
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        export function createRecurringEvent(config: RecurringEventConfig): RecurringEvent {
          // TODO: 구현 필요
          return {
            id: '',
            instances: []
          };
        }
        ```

        주의사항:
        - eslint-disable 주석은 최소한으로 사용
        - 각 disable 주석에 이유를 명시
        - RED 상태가 아닌 경우 절대 사용 금지
        - 가능하면 코드를 수정하여 오류 해결
      </detail>
    </action>

    <action n="5">
      <do>재검사</do>
      <detail>
        오류 수정 후 다시 검사를 실행하여 모든 오류가 해결되었는지 확인합니다:

        ```bash
        npx tsc --noEmit
        npx eslint src/
        ```

        성공 기준:
        - 타입 검사 통과 (0 errors)
        - ESLint 검사 통과 또는 불가피한 경고만 남음
        - 모든 disable 주석이 정당화됨
      </detail>
    </action>

    <action n="6">
      <do>검사 결과 문서화</do>
      <detail>
        검사 결과를 문서화합니다:

        ```
        ## Lint 및 타입 검사 결과

        ### 타입 검사
        - 상태: ✅ 통과
        - 오류: 0개

        ### ESLint 검사
        - 상태: ⚠️ 경고 있음
        - 오류: 0개
        - 경고: 2개

        ### 불가피한 경고 (RED 상태)
        1. src/features/recurring-events/index.ts:5
           - 경고: @typescript-eslint/no-unused-vars
           - 이유: 스켈레톤 함수의 매개변수, 구현 시 사용 예정
           - 처리: eslint-disable-next-line 추가

        2. src/features/recurring-events/types.ts:10
           - 경고: @typescript-eslint/no-unused-vars
           - 이유: 타입 정의, 구현 시 사용 예정
           - 처리: eslint-disable-next-line 추가
        ```
      </detail>
    </action>
  </how-to>

  <constraints>
    <constraint>모든 타입 오류는 반드시 수정할 것</constraint>
    <constraint>모든 문법 오류는 반드시 수정할 것</constraint>
    <constraint>eslint-disable 주석은 RED 상태의 불가피한 경우에만 사용할 것</constraint>
    <constraint>각 eslint-disable 주석에 이유를 명시할 것</constraint>
    <constraint>가능한 한 코드를 수정하여 오류를 해결할 것</constraint>
    <constraint>GREEN 상태에서는 eslint-disable 주석을 사용하지 말 것</constraint>
  </constraints>

  <success-criteria>
    <criterion>타입 검사가 통과함</criterion>
    <criterion>ESLint 검사가 통과하거나 정당한 경고만 남음</criterion>
    <criterion>모든 eslint-disable 주석이 문서화됨</criterion>
    <criterion>불필요한 eslint-disable 주석이 없음</criterion>
    <criterion>검사 결과가 문서화됨</criterion>
  </success-criteria>
</step>
````
