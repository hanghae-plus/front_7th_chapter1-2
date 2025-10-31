# Step: 테스트 유형 분류

````xml
<step>
  <purpose>
    작성할 테스트를 통합 테스트와 유닛 테스트로 분류하여 적절한 위치와 형식으로 작성할 수 있도록 합니다.
  </purpose>

  <how-to>
    <action n="1">
      <do>통합 테스트 대상 식별</do>
      <detail>
        사용자 시나리오 기반의 통합 테스트 대상을 식별합니다:

        통합 테스트 대상:
        - 사용자가 직접 상호작용하는 전체 플로우
        - 여러 컴포넌트/함수가 함께 동작하는 시나리오
        - UI 컴포넌트와 비즈니스 로직이 결합된 기능

        예시:
        - "사용자가 반복 일정을 생성한다"
        - "사용자가 반복 일정을 수정한다"
        - "사용자가 반복 일정을 삭제한다"
        - "사용자가 반복 일정 목록을 조회한다"

        파일 위치: src/__tests__/<기능명>.integration.spec.tsx
        파일명 예시: recurring-events.integration.spec.tsx
      </detail>
    </action>

    <action n="2">
      <do>유닛 테스트 대상 식별 및 분류</do>
      <detail>
        개별 함수/모듈 기반의 유닛 테스트 대상을 식별하고 유형별로 분류합니다:

        유닛 테스트 유형:

        1. unit/ - 순수 함수, 유틸리티 함수
           예시:
           - generateRecurringDates (날짜 생성 로직)
           - validateRecurringRule (반복 규칙 검증)
           - calculateNextOccurrence (다음 발생 날짜 계산)

        2. hooks/ - React 커스텀 훅
           예시:
           - useRecurringEvents (반복 일정 관리 훅)
           - useRecurringForm (반복 일정 폼 훅)

        3. components/ - React 컴포넌트 (필요시)
           예시:
           - RecurringEventForm (반복 일정 폼 컴포넌트)
           - RecurringEventList (반복 일정 목록 컴포넌트)

        파일 위치: src/__tests__/<유형>/<함수명>.spec.ts(x)
        파일명 예시:
        - src/__tests__/unit/generateRecurringDates.spec.ts
        - src/__tests__/hooks/useRecurringEvents.spec.ts
      </detail>
    </action>

    <action n="3">
      <do>확장자 결정</do>
      <detail>
        각 테스트 파일의 확장자를 JSX 포함 여부에 따라 결정합니다:

        .tsx 사용:
        - React 컴포넌트 테스트
        - JSX를 사용하는 통합 테스트
        - 훅 테스트 중 컴포넌트를 렌더링하는 경우

        .ts 사용:
        - 순수 함수 테스트
        - 유틸리티 함수 테스트
        - JSX를 사용하지 않는 모든 테스트

        예시:
        - recurring-events.integration.spec.tsx (JSX 사용)
        - generateRecurringDates.spec.ts (순수 함수)
        - useRecurringEvents.spec.ts (훅, JSX 미사용)
      </detail>
    </action>

    <action n="4">
      <do>테스트 분류 문서 작성</do>
      <detail>
        분류한 테스트 목록을 정리하여 문서화합니다:

        ```
        ## 통합 테스트
        - recurring-events.integration.spec.tsx
          - 사용자가 반복 일정을 생성한다
          - 사용자가 반복 일정을 수정한다
          - 사용자가 반복 일정을 삭제한다

        ## 유닛 테스트

        ### unit/
        - generateRecurringDates.spec.ts
          - 매일 반복 일정 생성
          - 매주 반복 일정 생성
          - 매월 반복 일정 생성 (경계값 포함)

        ### hooks/
        - useRecurringEvents.spec.ts
          - 반복 일정 목록 조회
          - 반복 일정 추가
          - 반복 일정 수정
        ```
      </detail>
    </action>
  </how-to>

  <constraints>
    <constraint>통합 테스트는 사용자 시나리오 기반일 것</constraint>
    <constraint>유닛 테스트는 개별 함수/모듈 기반일 것</constraint>
    <constraint>유닛 테스트는 적절한 유형 디렉토리에 위치할 것</constraint>
    <constraint>확장자는 JSX 포함 여부에 따라 결정할 것</constraint>
    <constraint>통합 테스트 파일명은 .integration.spec.tsx 형식을 따를 것</constraint>
  </constraints>

  <success-criteria>
    <criterion>모든 테스트가 통합/유닛으로 분류됨</criterion>
    <criterion>유닛 테스트가 적절한 유형으로 분류됨</criterion>
    <criterion>각 테스트의 파일 경로와 확장자가 결정됨</criterion>
    <criterion>테스트 분류 문서가 작성됨</criterion>
  </success-criteria>
</step>
````
