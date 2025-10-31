# Step: 통합 테스트 분석 및 유닛 테스트 설계

````xml
<step>
  <purpose>
    QA Engineer가 작성한 통합 테스트를 분석하여 필요한 유닛 테스트를 설계하고, 각 구현 파일과 1:1로 매칭되는 테스트 구조를 계획합니다.
  </purpose>

  <how-to>
    <action n="1">
      <do>통합 테스트 분석</do>
      <detail>
        QA Engineer가 작성한 통합 테스트를 읽고 분석합니다:

        ```typescript
        // src/__tests__/recurring-events.integration.spec.tsx 예시
        describe('반복 일정 통합 테스트', () => {
          it('사용자가 반복 일정을 생성할 수 있다', async () => {
            const user = userEvent.setup();
            render(<App />);

            await user.click(screen.getByText('일정 추가'));
            await user.type(screen.getByLabelText('제목'), '매일 회의');
            await user.click(screen.getByLabelText('반복'));
            await user.selectOptions(screen.getByLabelText('반복 유형'), 'daily');
            await user.click(screen.getByText('저장'));

            expect(screen.getByText('매일 회의')).toBeInTheDocument();
          });
        });
        ```

        분석할 내용:
        1. **사용자 플로우**
           - 어떤 동작들이 순서대로 일어나는가?
           - 각 동작에서 어떤 데이터가 필요한가?

        2. **필요한 기능**
           - 반복 일정 생성
           - 반복 유형 선택 (daily, weekly, monthly, yearly)
           - 일정 저장
           - 일정 표시

        3. **데이터 흐름**
           - 입력: 제목, 반복 유형, 시작일, 종료일 등
           - 처리: 반복 일정 인스턴스 생성
           - 출력: 생성된 일정 목록
      </detail>
    </action>

    <action n="2">
      <do>필요한 함수/모듈 추출</do>
      <detail>
        통합 테스트에서 필요한 함수와 모듈을 추출합니다:

        예시:
        ```markdown
        ## 필요한 함수/모듈

        ### 1. 반복 일정 생성 로직
        - 기능: 반복 규칙에 따라 일정 인스턴스 생성
        - 입력: 반복 유형, 시작일, 종료일, 간격
        - 출력: 날짜 배열
        - 위치: src/utils/ (순수 함수)

        ### 2. 반복 일정 관리 훅
        - 기능: 반복 일정 상태 관리
        - 입력: 없음
        - 출력: { events, addEvent, removeEvent }
        - 위치: src/hooks/ (React 훅)

        ### 3. 반복 일정 유효성 검사
        - 기능: 반복 일정 설정 유효성 검사
        - 입력: 반복 설정 객체
        - 출력: boolean 또는 에러 메시지
        - 위치: src/utils/ (순수 함수)
        ```

        추출 기준:
        - **순수 함수**: 상태 없이 입력만으로 출력을 결정 → utils/
        - **React 훅**: 상태 관리, 부수 효과 → hooks/
        - **API 호출**: 외부 데이터 fetch → apis/
        - **컴포넌트**: UI 렌더링 → components/ (통합 테스트로 커버)
      </detail>
    </action>

    <action n="3">
      <do>함수별 유닛 테스트 계획 수립</do>
      <detail>
        각 함수에 대한 유닛 테스트를 계획합니다:

        ```markdown
        ## 유닛 테스트 계획

        ### src/utils/generateRecurringDates.ts
        **테스트 파일**: src/__tests__/unit/generateRecurringDates.spec.ts

        **테스트 케이스**:
        1. 매일 반복
           - 정상 케이스: 7일 간격으로 생성
           - 경계값: 시작일 = 종료일
           - 예외: 종료일 < 시작일

        2. 매주 반복
           - 정상 케이스: 매주 월요일
           - 경계값: 특정 요일만 선택

        3. 매월 반복
           - 정상 케이스: 매월 1일
           - 경계값: 매월 31일 (31일 없는 달)
           - 경계값: 윤년 2월 29일

        4. 매년 반복
           - 정상 케이스: 매년 생일
           - 경계값: 윤년 2월 29일

        ### src/hooks/useRecurringEvents.ts
        **테스트 파일**: src/__tests__/hooks/useRecurringEvents.spec.ts

        **테스트 케이스**:
        1. 초기 상태
           - 빈 배열로 시작

        2. 일정 추가
           - 반복 일정 추가 가능
           - 중복 추가 방지

        3. 일정 삭제
           - ID로 일정 삭제 가능

        4. 일정 수정
           - 기존 일정 수정 가능
        ```

        각 테스트 케이스는:
        - 정상 케이스 (Happy Path)
        - 경계값 케이스 (Edge Cases)
        - 예외 케이스 (Error Cases)
        를 모두 포함해야 합니다.
      </detail>
    </action>

    <action n="4">
      <do>구현 파일과 테스트 파일 1:1 매칭 계획</do>
      <detail>
        각 구현 파일과 테스트 파일을 1:1로 매칭합니다:

        ```markdown
        ## 파일 매칭 계획

        | 구현 파일 | 테스트 파일 | 유형 |
        |----------|------------|------|
        | src/utils/generateRecurringDates.ts | src/__tests__/unit/generateRecurringDates.spec.ts | 유닛 |
        | src/utils/validateRecurringConfig.ts | src/__tests__/unit/validateRecurringConfig.spec.ts | 유닛 |
        | src/hooks/useRecurringEvents.ts | src/__tests__/hooks/useRecurringEvents.spec.ts | 훅 |
        | src/apis/saveRecurringEvent.ts | src/__tests__/unit/saveRecurringEvent.spec.ts | 유닛 |
        ```

        매칭 규칙:
        1. **파일명 일치**: 테스트 파일명은 구현 파일명과 동일 (확장자 제외)
        2. **디렉토리 구조 반영**:
           - utils → __tests__/unit/
           - hooks → __tests__/hooks/
           - apis → __tests__/unit/ (또는 __tests__/apis/)
        3. **1:1 관계**: 하나의 구현 파일은 하나의 테스트 파일을 가짐
        4. **함수 분리**: 여러 함수가 필요하면 파일을 분리하여 각각 테스트
      </detail>
    </action>

    <action n="5">
      <do>타입 정의 계획</do>
      <detail>
        필요한 타입을 정의합니다:

        ```typescript
        // src/types.ts에 추가할 타입

        export interface RecurringConfig {
          type: 'daily' | 'weekly' | 'monthly' | 'yearly';
          startDate: string;  // ISO 8601 format
          endDate: string;
          interval: number;   // 반복 간격 (예: 2 = 격일, 격주 등)
          daysOfWeek?: number[];  // 주간 반복 시 요일 (0=일요일)
          dayOfMonth?: number;    // 월간 반복 시 날짜
        }

        export interface RecurringEvent extends Event {
          recurrence: RecurringConfig;
          instances?: string[];  // 생성된 인스턴스 날짜들
        }
        ```

        타입 정의 위치 결정:
        - **공통 타입**: src/types.ts (여러 파일에서 사용)
        - **로컬 타입**: 해당 파일 내 (한 파일에서만 사용)

        기존 타입 확장:
        - 기존 Event 타입이 있다면 extends로 확장
        - 새로운 필드 추가 시 옵셔널(?)로 시작
      </detail>
    </action>

    <action n="6">
      <do>설계 문서 작성</do>
      <detail>
        설계한 내용을 정리합니다:

        ```markdown
        ## 유닛 테스트 설계

        ### 개요
        - 통합 테스트: recurring-events.integration.spec.tsx
        - 필요한 유닛 테스트: 3개 파일
        - 필요한 구현 파일: 3개 파일

        ### 파일 구조
        ```
        src/
          ├── utils/
          │   ├── generateRecurringDates.ts (신규)
          │   └── validateRecurringConfig.ts (신규)
          ├── hooks/
          │   └── useRecurringEvents.ts (신규)
          └── types.ts (타입 추가)

        src/__tests__/
          ├── unit/
          │   ├── generateRecurringDates.spec.ts (신규)
          │   └── validateRecurringConfig.spec.ts (신규)
          └── hooks/
              └── useRecurringEvents.spec.ts (신규)
        ```

        ### 함수 인터페이스
        1. generateRecurringDates(config: RecurringConfig): string[]
        2. validateRecurringConfig(config: RecurringConfig): boolean
        3. useRecurringEvents(): { events, addEvent, removeEvent }

        ### 다음 단계
        - 각 함수의 스켈레톤 코드 생성
        - 각 함수의 유닛 테스트 작성
        ```

        이 설계 문서는 다음 단계에서 스켈레톤 코드와 테스트 코드를 작성할 때 참고합니다.
      </detail>
    </action>
  </how-to>

  <constraints>
    <constraint>통합 테스트를 정확히 분석하여 필요한 함수를 빠짐없이 추출할 것</constraint>
    <constraint>각 구현 파일과 테스트 파일이 1:1로 매칭되도록 계획할 것</constraint>
    <constraint>기존 코드 구조(utils, hooks 등)를 따를 것</constraint>
    <constraint>정상 케이스, 경계값 케이스, 예외 케이스를 모두 포함할 것</constraint>
  </constraints>

  <success-criteria>
    <criterion>통합 테스트가 분석됨</criterion>
    <criterion>필요한 함수/모듈이 추출됨</criterion>
    <criterion>각 함수별 유닛 테스트가 계획됨</criterion>
    <criterion>구현 파일과 테스트 파일이 1:1로 매칭됨</criterion>
    <criterion>필요한 타입이 정의됨</criterion>
    <criterion>설계 문서가 작성됨</criterion>
  </success-criteria>
</step>
````
