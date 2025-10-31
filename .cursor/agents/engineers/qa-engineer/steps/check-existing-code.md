# Step: 기존 코드 확인

````xml
<step>
  <purpose>
    현재 코드베이스를 확인하여 이미 작성된 스켈레톤 함수나 구현된 함수를 파악하고, 중복 작업을 방지합니다.
  </purpose>

  <how-to>
    <action n="1">
      <do>기능 관련 디렉토리 확인</do>
      <detail>
        PRD에서 언급된 기능과 관련된 디렉토리를 확인합니다:
        - src/features/ 하위 디렉토리
        - src/hooks/ 하위 파일
        - src/utils/ 하위 파일
        - src/components/ 하위 파일

        예시:
        - 반복 일정 기능 → src/features/recurring-events/
        - 알림 기능 → src/features/notifications/
      </detail>
    </action>

    <action n="2">
      <do>이미 작성된 함수 목록 작성</do>
      <detail>
        각 디렉토리에서 이미 작성된 함수나 컴포넌트를 확인하고 목록을 작성합니다:

        확인 항목:
        - 함수명
        - 파일 경로
        - 구현 상태 (스켈레톤 / 부분 구현 / 완전 구현)
        - export 여부

        예시:
        ```
        이미 작성된 함수:
        - generateRecurringDates (src/features/recurring-events/generateInstances.ts) - 완전 구현
        - repeatText (src/features/recurring-events/repeatText.ts) - 완전 구현
        - repeatGroupId (src/features/recurring-events/repeatGroupId.ts) - 완전 구현
        ```
      </detail>
    </action>

    <action n="3">
      <do>테스트 작성 대상 결정</do>
      <detail>
        이미 작성된 함수를 제외하고 테스트를 작성할 대상을 결정합니다:

        제외 기준:
        - 이미 완전히 구현된 함수 (테스트만 작성)
        - 이미 테스트가 작성된 함수 (스킵)

        포함 기준:
        - 아직 작성되지 않은 함수 (테스트 + 스켈레톤 필요)
        - 부분 구현된 함수 (추가 테스트 필요)

        결과 예시:
        ```
        테스트 작성 대상:
        - createRecurringEvent (미작성) → 통합 테스트 + 유닛 테스트
        - updateRecurringEvent (미작성) → 통합 테스트 + 유닛 테스트

        테스트만 작성 대상:
        - generateRecurringDates (이미 구현됨) → 유닛 테스트

        제외 대상:
        - repeatText (이미 구현 및 테스트 완료)
        ```
      </detail>
    </action>

    <action n="4">
      <do>기존 테스트 파일 확인</do>
      <detail>
        src/__tests__/ 디렉토리를 확인하여 이미 작성된 테스트 파일을 파악합니다:

        확인 항목:
        - 통합 테스트 파일 (*.integration.spec.tsx)
        - 유닛 테스트 파일 (unit/*.spec.ts, hooks/*.spec.ts 등)
        - 각 테스트 파일에서 다루는 함수/기능

        중복 방지:
        - 이미 테스트가 작성된 함수는 추가 테스트 케이스만 작성
        - 완전히 새로운 함수만 새 테스트 파일 생성
      </detail>
    </action>
  </how-to>

  <constraints>
    <constraint>모든 관련 디렉토리를 빠짐없이 확인할 것</constraint>
    <constraint>이미 작성된 함수를 정확히 파악할 것</constraint>
    <constraint>구현 상태를 명확히 구분할 것 (스켈레톤/부분/완전)</constraint>
    <constraint>중복 작업을 방지할 것</constraint>
  </constraints>

  <success-criteria>
    <criterion>모든 관련 디렉토리가 확인됨</criterion>
    <criterion>이미 작성된 함수 목록이 작성됨</criterion>
    <criterion>테스트 작성 대상이 명확히 결정됨</criterion>
    <criterion>중복 작업이 없음</criterion>
  </success-criteria>
</step>
````
