# Step: 함수 인터페이스 정의 및 스켈레톤 코드 생성

````xml
<step>
  <purpose>
    설계한 유닛 테스트를 바탕으로 함수 인터페이스를 정의하고, 기존 코드 구조를 참고하여 일관된 패턴으로 스켈레톤 코드를 작성합니다.
  </purpose>

  <how-to>
    <action n="1">
      <do>타입 정의 작성</do>
      <detail>
        필요한 타입을 src/types.ts에 추가합니다:

        ```typescript
        // src/types.ts

        // 기존 타입 확인 후 추가
        export interface RecurringConfig {
          type: 'daily' | 'weekly' | 'monthly' | 'yearly';
          startDate: string;  // ISO 8601 format (YYYY-MM-DD)
          endDate: string;
          interval: number;   // 반복 간격 (1 = 매일/매주/매월/매년)
          daysOfWeek?: number[];  // 주간 반복 시 요일 (0=일요일, 6=토요일)
          dayOfMonth?: number;    // 월간 반복 시 날짜 (1-31)
        }

        // 기존 Event 타입이 있다면 확장
        export interface RecurringEvent extends Event {
          recurrence: RecurringConfig;
          instances?: string[];  // 생성된 인스턴스 날짜들
        }
        ```

        타입 정의 원칙:
        1. **명확한 타입**: any 사용 금지, 구체적인 타입 명시
        2. **문서화**: 각 필드에 주석으로 설명 추가
        3. **옵셔널 필드**: 필수가 아닌 필드는 `?` 사용
        4. **유니온 타입**: 제한된 값은 리터럴 타입으로 명시
        5. **기존 타입 재사용**: 가능하면 extends로 확장
      </detail>
    </action>

    <action n="2">
      <do>Utils 함수 스켈레톤 생성</do>
      <detail>
        src/utils/ 디렉토리에 순수 함수 스켈레톤을 생성합니다:

        ```typescript
        // src/utils/generateRecurringDates.ts
        import { RecurringConfig } from '@/types';

        /**
         * 반복 일정 설정에 따라 날짜 배열을 생성합니다.
         *
         * @param config - 반복 일정 설정
         * @returns ISO 8601 형식의 날짜 문자열 배열
         *
         * @example
         * const dates = generateRecurringDates({
         *   type: 'daily',
         *   startDate: '2025-01-01',
         *   endDate: '2025-01-07',
         *   interval: 1
         * });
         * // ['2025-01-01', '2025-01-02', ..., '2025-01-07']
         */
        export function generateRecurringDates(config: RecurringConfig): string[] {
          // TODO: 구현 필요
          // 테스트가 실패하도록 빈 배열 반환
          return [];
        }
        ```

        스켈레톤 작성 원칙:
        1. **JSDoc 주석**: 함수 설명, 매개변수, 반환값, 예시 포함
        2. **타입 명시**: 모든 매개변수와 반환값에 타입 명시
        3. **빈 구현**: 테스트가 실패하도록 기본값 반환
           - 배열: `[]`
           - 객체: `{}`
           - 숫자: `0`
           - 문자열: `''`
           - boolean: `false`
        4. **TODO 주석**: 구현이 필요함을 명시
        5. **import**: 필요한 타입 import

        기존 코드 패턴 참고:
        ```bash
        # 기존 utils 파일 확인
        cat src/utils/dateUtils.ts
        cat src/utils/timeValidation.ts
        ```
      </detail>
    </action>

    <action n="3">
      <do>Hooks 스켈레톤 생성</do>
      <detail>
        src/hooks/ 디렉토리에 React 훅 스켈레톤을 생성합니다:

        ```typescript
        // src/hooks/useRecurringEvents.ts
        import { useState } from 'react';
        import { RecurringEvent } from '@/types';

        /**
         * 반복 일정 목록을 관리하는 커스텀 훅입니다.
         *
         * @returns 반복 일정 목록과 관리 함수들
         *
         * @example
         * const { events, addEvent, removeEvent } = useRecurringEvents();
         */
        export function useRecurringEvents() {
          const [events, setEvents] = useState<RecurringEvent[]>([]);

          const addEvent = (event: RecurringEvent) => {
            // TODO: 구현 필요
          };

          const removeEvent = (id: string) => {
            // TODO: 구현 필요
          };

          const updateEvent = (id: string, updates: Partial<RecurringEvent>) => {
            // TODO: 구현 필요
          };

          return {
            events,
            addEvent,
            removeEvent,
            updateEvent
          };
        }
        ```

        훅 스켈레톤 작성 원칙:
        1. **useState 초기화**: 적절한 초기값 설정
        2. **함수 정의**: 필요한 모든 함수 정의 (빈 구현)
        3. **반환 객체**: 명확한 인터페이스 정의
        4. **타입 안전성**: 모든 상태와 함수에 타입 명시

        기존 코드 패턴 참고:
        ```bash
        # 기존 hooks 파일 확인
        cat src/hooks/useEventForm.ts
        cat src/hooks/useNotifications.ts
        ```
      </detail>
    </action>

    <action n="4">
      <do>디렉토리 구조 확인 및 생성</do>
      <detail>
        필요한 디렉토리가 없다면 생성합니다:

        ```bash
        # 디렉토리 확인
        ls -la src/utils/
        ls -la src/hooks/

        # 필요시 생성 (일반적으로 이미 존재)
        mkdir -p src/utils
        mkdir -p src/hooks
        ```

        파일 위치 규칙:
        - **순수 함수**: src/utils/
        - **React 훅**: src/hooks/
        - **API 호출**: src/apis/
        - **타입 정의**: src/types.ts (공통) 또는 해당 파일 내 (로컬)
      </detail>
    </action>

    <action n="5">
      <do>import 경로 확인</do>
      <detail>
        프로젝트의 import 경로 설정을 확인합니다:

        ```typescript
        // tsconfig.json 또는 vite.config.ts 확인
        // @/ alias가 src/를 가리키는지 확인

        // 올바른 import 예시
        import { RecurringConfig } from '@/types';
        import { generateRecurringDates } from '@/utils/generateRecurringDates';
        ```

        import 규칙:
        1. **절대 경로 사용**: `@/` alias 사용 (설정되어 있다면)
        2. **상대 경로**: alias가 없다면 `../` 사용
        3. **타입 import**: 타입만 import 시 `import type` 사용 (선택적)

        기존 파일 참고:
        ```bash
        # 기존 import 패턴 확인
        grep -r "import.*from '@/" src/utils/
        grep -r "import.*from '@/" src/hooks/
        ```
      </detail>
    </action>

    <action n="6">
      <do>스켈레톤 코드 검증</do>
      <detail>
        작성한 스켈레톤 코드가 올바른지 검증합니다:

        ```bash
        # 타입 체크
        npx tsc --noEmit

        # Lint 체크
        npx eslint src/utils/ src/hooks/
        ```

        검증 항목:
        1. **타입 오류 없음**: 모든 타입이 올바르게 정의됨
        2. **import 오류 없음**: 모든 import가 올바르게 해결됨
        3. **Lint 오류 최소화**: 불가피한 경고만 남김
           - unused variable: 스켈레톤이므로 허용 (eslint-disable 주석 추가)
           - no-empty-function: 스켈레톤이므로 허용

        eslint-disable 주석 추가 예시:
        ```typescript
        export function generateRecurringDates(config: RecurringConfig): string[] {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { type, startDate, endDate, interval } = config;

          // TODO: 구현 필요
          return [];
        }
        ```
      </detail>
    </action>

    <action n="7">
      <do>스켈레톤 코드 문서화</do>
      <detail>
        생성한 스켈레톤 코드를 정리합니다:

        ```markdown
        ## 생성한 스켈레톤 코드

        ### 타입 정의
        - src/types.ts
          - RecurringConfig 인터페이스 추가
          - RecurringEvent 인터페이스 추가

        ### Utils 함수
        - src/utils/generateRecurringDates.ts
          - generateRecurringDates(config: RecurringConfig): string[]

        - src/utils/validateRecurringConfig.ts
          - validateRecurringConfig(config: RecurringConfig): boolean

        ### Hooks
        - src/hooks/useRecurringEvents.ts
          - useRecurringEvents(): { events, addEvent, removeEvent, updateEvent }

        ### 다음 단계
        - 각 파일에 대응하는 유닛 테스트 작성
        - 테스트 실행하여 RED 상태 확인
        ```
      </detail>
    </action>
  </how-to>

  <constraints>
    <constraint>기존 코드 구조와 패턴을 따를 것</constraint>
    <constraint>각 구현 파일과 테스트 파일이 1:1로 매칭되도록 작성할 것</constraint>
    <constraint>모든 타입을 명확히 정의할 것</constraint>
    <constraint>테스트가 실패하도록 빈 구현을 작성할 것</constraint>
    <constraint>JSDoc 주석으로 함수를 문서화할 것</constraint>
  </constraints>

  <success-criteria>
    <criterion>타입이 정의됨</criterion>
    <criterion>Utils 함수 스켈레톤이 생성됨</criterion>
    <criterion>Hooks 스켈레톤이 생성됨</criterion>
    <criterion>타입 체크가 통과됨</criterion>
    <criterion>각 파일이 기존 코드 구조를 따름</criterion>
    <criterion>스켈레톤 코드가 문서화됨</criterion>
  </success-criteria>
</step>
````
