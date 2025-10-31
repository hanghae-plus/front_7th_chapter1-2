# Step: 기존 코드 구조 파악

````xml
<step>
  <purpose>
    현재 코드베이스의 구조를 분석하여 일관된 설계를 유지하기 위한 패턴을 파악합니다.
  </purpose>

  <how-to>
    <action n="1">
      <do>디렉토리 구조 분석</do>
      <detail>
        프로젝트의 디렉토리 구조를 파악합니다:

        ```bash
        # 주요 디렉토리 확인
        ls -la src/
        ```

        일반적인 구조:
        ```
        src/
          ├── utils/          # 유틸리티 함수들
          ├── hooks/          # React 커스텀 훅들
          ├── features/       # 기능별 모듈 (선택적)
          ├── components/     # React 컴포넌트들
          ├── apis/           # API 호출 함수들
          ├── types.ts        # 공통 타입 정의
          └── __tests__/      # 테스트 파일들
              ├── unit/       # 유닛 테스트
              ├── hooks/      # 훅 테스트
              └── *.integration.spec.tsx  # 통합 테스트
        ```

        파악해야 할 정보:
        - 각 디렉토리의 역할과 책임
        - 파일 분리 기준 (기능별, 타입별 등)
        - 테스트 파일 위치 규칙
      </detail>
    </action>

    <action n="2">
      <do>파일 명명 규칙 파악</do>
      <detail>
        기존 파일들의 명명 규칙을 분석합니다:

        ```bash
        # utils 파일 확인
        ls src/utils/

        # hooks 파일 확인
        ls src/hooks/

        # 테스트 파일 확인
        ls src/__tests__/unit/
        ls src/__tests__/hooks/
        ```

        파악해야 할 규칙:
        - 파일명 형식 (camelCase, kebab-case, PascalCase)
        - 함수 파일명 패턴 (예: `generateDates.ts`, `validateTime.ts`)
        - 훅 파일명 패턴 (예: `useEventForm.ts`, `useNotifications.ts`)
        - 테스트 파일명 패턴 (예: `generateDates.spec.ts`, `useEventForm.spec.ts`)

        예시:
        ```
        src/utils/dateUtils.ts          → src/__tests__/unit/dateUtils.spec.ts
        src/hooks/useEventForm.ts       → src/__tests__/hooks/useEventForm.spec.ts
        src/apis/fetchHolidays.ts       → src/__tests__/unit/fetchHolidays.spec.ts
        ```
      </detail>
    </action>

    <action n="3">
      <do>함수 설계 패턴 파악</do>
      <detail>
        기존 코드의 함수 설계 패턴을 분석합니다:

        확인할 파일 예시:
        ```typescript
        // src/utils/dateUtils.ts 예시
        import { Event } from '@/types';

        export function formatDate(date: string): string {
          // ...
        }

        export function parseDate(dateStr: string): Date {
          // ...
        }
        ```

        파악해야 할 패턴:
        1. **타입 정의 위치**
           - 공통 타입: `src/types.ts`
           - 로컬 타입: 해당 파일 내 또는 별도 `types.ts`

        2. **import 패턴**
           - 절대 경로 사용 여부 (`@/` alias)
           - 타입 import 방식

        3. **함수 시그니처 패턴**
           - 매개변수 타입 명시
           - 반환 타입 명시
           - 인터페이스 vs 타입 별칭 사용

        4. **export 패턴**
           - named export vs default export
           - 한 파일에 여러 함수 vs 파일당 하나의 주요 함수

        5. **에러 처리 패턴**
           - throw Error vs Result 타입
           - 옵셔널 반환 vs 예외 발생
      </detail>
    </action>

    <action n="4">
      <do>기존 테스트 패턴 분석</do>
      <detail>
        기존 테스트 파일들의 패턴을 분석합니다:

        ```typescript
        // src/__tests__/unit/dateUtils.spec.ts 예시
        import { describe, it, expect } from 'vitest';
        import { formatDate, parseDate } from '@/utils/dateUtils';

        describe('dateUtils', () => {
          describe('formatDate', () => {
            it('날짜를 YYYY-MM-DD 형식으로 포맷할 수 있다', () => {
              // ...
            });
          });
        });
        ```

        파악해야 할 패턴:
        1. **테스트 구조**
           - describe 중첩 레벨
           - 테스트 그룹화 방식

        2. **테스트 이름 규칙**
           - 한글 vs 영어
           - 명명 패턴 ("~할 수 있다", "~해야 한다" 등)

        3. **Assertion 스타일**
           - expect().toBe() vs expect().toEqual()
           - 사용하는 matcher 종류

        4. **테스트 데이터 준비**
           - 인라인 데이터 vs 별도 변수
           - test.each 사용 여부
      </detail>
    </action>

    <action n="5">
      <do>구조 분석 결과 문서화</do>
      <detail>
        분석한 구조를 간단히 정리합니다:

        ```markdown
        ## 코드 구조 분석 결과

        ### 디렉토리 구조
        - utils: 순수 함수 유틸리티
        - hooks: React 커스텀 훅
        - types.ts: 공통 타입 정의

        ### 파일 명명 규칙
        - 함수 파일: camelCase (예: dateUtils.ts)
        - 훅 파일: use + PascalCase (예: useEventForm.ts)
        - 테스트 파일: [원본파일명].spec.ts

        ### 함수 설계 패턴
        - 타입: 공통 타입은 types.ts, 로컬 타입은 파일 내
        - import: @/ alias 사용
        - export: named export 사용
        - 에러 처리: throw Error 사용

        ### 테스트 패턴
        - describe 중첩: 파일 > 함수 > 케이스
        - 테스트 이름: 한글, "~할 수 있다" 형식
        - test.each: 반복 케이스에 사용
        ```

        이 정보는 다음 단계에서 유닛 테스트와 스켈레톤 코드를 설계할 때 사용됩니다.
      </detail>
    </action>
  </how-to>

  <constraints>
    <constraint>기존 코드의 패턴을 정확히 파악할 것</constraint>
    <constraint>일관성 있는 구조를 유지하기 위해 기존 패턴을 따를 것</constraint>
    <constraint>디렉토리 구조, 파일 명명, 함수 설계, 테스트 패턴을 모두 분석할 것</constraint>
  </constraints>

  <success-criteria>
    <criterion>디렉토리 구조가 파악됨</criterion>
    <criterion>파일 명명 규칙이 파악됨</criterion>
    <criterion>함수 설계 패턴이 파악됨</criterion>
    <criterion>기존 테스트 패턴이 파악됨</criterion>
    <criterion>분석 결과가 문서화됨</criterion>
  </success-criteria>
</step>
````
