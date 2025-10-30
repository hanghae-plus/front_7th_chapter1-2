# Step: 유닛 테스트 코드 작성

````xml
<step>
  <purpose>
    설계한 유닛 테스트를 실제 Vitest 코드로 작성하며, 각 구현 파일과 1:1로 매칭되는 테스트 파일을 생성합니다.
  </purpose>

  <how-to>
    <action n="1">
      <do>Utils 함수 유닛 테스트 작성</do>
      <detail>
        src/__tests__/unit/ 디렉토리에 유닛 테스트를 작성합니다:

        ```typescript
        // src/__tests__/unit/generateRecurringDates.spec.ts
        import { describe, it, expect } from 'vitest';
        import { generateRecurringDates } from '@/utils/generateRecurringDates';

        describe('generateRecurringDates', () => {
          describe('매일 반복', () => {
            it('매일 반복 일정을 생성할 수 있다', () => {
              const dates = generateRecurringDates({
                type: 'daily',
                startDate: '2025-01-01',
                endDate: '2025-01-07',
                interval: 1
              });

              expect(dates).toHaveLength(7);
              expect(dates[0]).toBe('2025-01-01');
              expect(dates[6]).toBe('2025-01-07');
            });

            it('격일 반복 일정을 생성할 수 있다', () => {
              const dates = generateRecurringDates({
                type: 'daily',
                startDate: '2025-01-01',
                endDate: '2025-01-07',
                interval: 2
              });

              expect(dates).toHaveLength(4);
              expect(dates).toEqual([
                '2025-01-01',
                '2025-01-03',
                '2025-01-05',
                '2025-01-07'
              ]);
            });
          });

          describe('매월 반복', () => {
            it('매월 31일 반복 시 31일이 없는 달에는 생성되지 않는다', () => {
              const dates = generateRecurringDates({
                type: 'monthly',
                startDate: '2025-01-31',
                endDate: '2025-04-30',
                interval: 1,
                dayOfMonth: 31
              });

              // 1월(31일), 3월(31일)만 생성, 2월은 제외
              expect(dates).toHaveLength(2);
              expect(dates).toContain('2025-01-31');
              expect(dates).toContain('2025-03-31');
              expect(dates).not.toContain('2025-02-31'); // 존재하지 않는 날짜
            });

            it('윤년 2월 29일 반복을 생성할 수 있다', () => {
              const dates = generateRecurringDates({
                type: 'yearly',
                startDate: '2024-02-29',
                endDate: '2028-02-29',
                interval: 1
              });

              // 2024(윤년), 2028(윤년)만 생성
              expect(dates).toHaveLength(2);
              expect(dates).toContain('2024-02-29');
              expect(dates).toContain('2028-02-29');
            });
          });

          describe('경계값 테스트', () => {
            it('시작일과 종료일이 같으면 하나의 날짜만 생성한다', () => {
              const dates = generateRecurringDates({
                type: 'daily',
                startDate: '2025-01-01',
                endDate: '2025-01-01',
                interval: 1
              });

              expect(dates).toHaveLength(1);
              expect(dates[0]).toBe('2025-01-01');
            });

            it('종료일이 시작일보다 이전이면 빈 배열을 반환한다', () => {
              const dates = generateRecurringDates({
                type: 'daily',
                startDate: '2025-01-07',
                endDate: '2025-01-01',
                interval: 1
              });

              expect(dates).toHaveLength(0);
            });
          });

          describe('테이블 테스트', () => {
            it.each([
              { type: 'daily', interval: 1, expected: 7 },
              { type: 'daily', interval: 2, expected: 4 },
              { type: 'daily', interval: 3, expected: 3 },
            ])('$type 반복, interval $interval → $expected개 생성', ({ type, interval, expected }) => {
              const dates = generateRecurringDates({
                type: type as 'daily',
                startDate: '2025-01-01',
                endDate: '2025-01-07',
                interval
              });

              expect(dates).toHaveLength(expected);
            });
          });
        });
        ```

        유닛 테스트 작성 원칙:
        1. **AAA 패턴**: Arrange(준비) - Act(실행) - Assert(검증)
        2. **describe 중첩**: 파일 > 함수 > 기능 > 케이스
        3. **명확한 테스트 이름**: "~할 수 있다", "~해야 한다" 형식
        4. **구체적인 검증**:
           - 길이 검증: `toHaveLength()`
           - 값 검증: `toBe()`, `toEqual()`
           - 포함 검증: `toContain()`, `not.toContain()`
        5. **테이블 테스트**: 반복 케이스는 `it.each()` 사용
        6. **경계값 케이스**: 최소값, 최대값, 경계 조건 테스트
        7. **예외 케이스**: 잘못된 입력, 에러 상황 테스트
      </detail>
    </action>

    <action n="2">
      <do>Hooks 유닛 테스트 작성</do>
      <detail>
        src/__tests__/hooks/ 디렉토리에 훅 테스트를 작성합니다:

        ```typescript
        // src/__tests__/hooks/useRecurringEvents.spec.ts
        import { describe, it, expect } from 'vitest';
        import { renderHook, act } from '@testing-library/react';
        import { useRecurringEvents } from '@/hooks/useRecurringEvents';

        describe('useRecurringEvents', () => {
          describe('초기 상태', () => {
            it('빈 배열로 초기화된다', () => {
              const { result } = renderHook(() => useRecurringEvents());

              expect(result.current.events).toEqual([]);
            });
          });

          describe('일정 추가', () => {
            it('반복 일정을 추가할 수 있다', () => {
              const { result } = renderHook(() => useRecurringEvents());

              const newEvent = {
                id: '1',
                title: '매일 회의',
                recurrence: {
                  type: 'daily' as const,
                  startDate: '2025-01-01',
                  endDate: '2025-01-07',
                  interval: 1
                }
              };

              act(() => {
                result.current.addEvent(newEvent);
              });

              expect(result.current.events).toHaveLength(1);
              expect(result.current.events[0]).toEqual(newEvent);
            });

            it('여러 일정을 추가할 수 있다', () => {
              const { result } = renderHook(() => useRecurringEvents());

              act(() => {
                result.current.addEvent({ id: '1', title: '일정 1', recurrence: {} as any });
                result.current.addEvent({ id: '2', title: '일정 2', recurrence: {} as any });
              });

              expect(result.current.events).toHaveLength(2);
            });
          });

          describe('일정 삭제', () => {
            it('ID로 일정을 삭제할 수 있다', () => {
              const { result } = renderHook(() => useRecurringEvents());

              act(() => {
                result.current.addEvent({ id: '1', title: '일정 1', recurrence: {} as any });
                result.current.addEvent({ id: '2', title: '일정 2', recurrence: {} as any });
              });

              act(() => {
                result.current.removeEvent('1');
              });

              expect(result.current.events).toHaveLength(1);
              expect(result.current.events[0].id).toBe('2');
            });

            it('존재하지 않는 ID를 삭제해도 오류가 발생하지 않는다', () => {
              const { result } = renderHook(() => useRecurringEvents());

              expect(() => {
                act(() => {
                  result.current.removeEvent('non-existent');
                });
              }).not.toThrow();
            });
          });

          describe('일정 수정', () => {
            it('기존 일정을 수정할 수 있다', () => {
              const { result } = renderHook(() => useRecurringEvents());

              act(() => {
                result.current.addEvent({
                  id: '1',
                  title: '원래 제목',
                  recurrence: {} as any
                });
              });

              act(() => {
                result.current.updateEvent('1', { title: '수정된 제목' });
              });

              expect(result.current.events[0].title).toBe('수정된 제목');
            });
          });
        });
        ```

        훅 테스트 작성 원칙:
        1. **renderHook 사용**: `@testing-library/react`의 `renderHook` 사용
        2. **act로 감싸기**: 상태 변경은 `act()` 안에서 실행
        3. **result.current**: 훅의 반환값은 `result.current`로 접근
        4. **비동기 처리**: 비동기 훅은 `waitFor` 사용
      </detail>
    </action>

    <action n="3">
      <do>테스트 파일 구조 확인</do>
      <detail>
        테스트 파일이 올바른 위치에 생성되었는지 확인합니다:

        ```bash
        # 테스트 파일 구조 확인
        tree src/__tests__/
        ```

        기대하는 구조:
        ```
        src/__tests__/
          ├── unit/
          │   ├── generateRecurringDates.spec.ts
          │   └── validateRecurringConfig.spec.ts
          ├── hooks/
          │   └── useRecurringEvents.spec.ts
          └── recurring-events.integration.spec.tsx (QA Engineer가 작성)
        ```

        파일 매칭 확인:
        - src/utils/generateRecurringDates.ts ↔ src/__tests__/unit/generateRecurringDates.spec.ts
        - src/hooks/useRecurringEvents.ts ↔ src/__tests__/hooks/useRecurringEvents.spec.ts
      </detail>
    </action>

    <action n="4">
      <do>테스트 import 확인</do>
      <detail>
        모든 import가 올바르게 해결되는지 확인합니다:

        ```typescript
        // 필수 import
        import { describe, it, expect } from 'vitest';

        // 훅 테스트용 (필요시)
        import { renderHook, act } from '@testing-library/react';

        // 테스트 대상 함수/훅
        import { generateRecurringDates } from '@/utils/generateRecurringDates';
        import { useRecurringEvents } from '@/hooks/useRecurringEvents';

        // 타입 (필요시)
        import type { RecurringConfig } from '@/types';
        ```

        import 오류 확인:
        ```bash
        npx tsc --noEmit
        ```
      </detail>
    </action>

    <action n="5">
      <do>테스트 코드 품질 확인</do>
      <detail>
        작성한 테스트 코드의 품질을 확인합니다:

        체크리스트:
        1. **명확한 테스트 이름**: 무엇을 테스트하는지 명확
        2. **독립적인 테스트**: 각 테스트는 서로 독립적
        3. **구체적인 검증**: 모호한 검증 없음
        4. **경계값 포함**: 최소값, 최대값, 특수 케이스 포함
        5. **예외 케이스 포함**: 에러 상황 테스트
        6. **테이블 테스트 활용**: 반복 케이스는 test.each 사용

        나쁜 예시:
        ```typescript
        it('동작한다', () => {
          const result = someFunction();
          expect(result).toBeTruthy(); // 너무 모호
        });
        ```

        좋은 예시:
        ```typescript
        it('매일 반복 일정을 7개 생성할 수 있다', () => {
          const dates = generateRecurringDates({
            type: 'daily',
            startDate: '2025-01-01',
            endDate: '2025-01-07',
            interval: 1
          });

          expect(dates).toHaveLength(7);
          expect(dates[0]).toBe('2025-01-01');
          expect(dates[6]).toBe('2025-01-07');
        });
        ```
      </detail>
    </action>

    <action n="6">
      <do>테스트 코드 문서화</do>
      <detail>
        작성한 테스트 코드를 정리합니다:

        ```markdown
        ## 작성한 유닛 테스트

        ### Utils 테스트
        - src/__tests__/unit/generateRecurringDates.spec.ts
          - 매일 반복: 2개 케이스
          - 매월 반복: 2개 케이스 (경계값 포함)
          - 경계값 테스트: 2개 케이스
          - 테이블 테스트: 3개 케이스
          - 총 9개 테스트

        - src/__tests__/unit/validateRecurringConfig.spec.ts
          - 유효성 검사: 5개 케이스
          - 총 5개 테스트

        ### Hooks 테스트
        - src/__tests__/hooks/useRecurringEvents.spec.ts
          - 초기 상태: 1개 케이스
          - 일정 추가: 2개 케이스
          - 일정 삭제: 2개 케이스
          - 일정 수정: 1개 케이스
          - 총 6개 테스트

        ### 전체 통계
        - 총 테스트 파일: 3개
        - 총 테스트 케이스: 20개
        - 통합 테스트: 1개 (QA Engineer 작성)

        ### 다음 단계
        - 모든 테스트 실행하여 RED 상태 확인
        - 커버리지 측정
        ```
      </detail>
    </action>
  </how-to>

  <constraints>
    <constraint>각 구현 파일과 테스트 파일이 1:1로 매칭되어야 함</constraint>
    <constraint>AAA 패턴을 따를 것</constraint>
    <constraint>명확한 테스트 이름을 사용할 것</constraint>
    <constraint>경계값과 예외 케이스를 포함할 것</constraint>
    <constraint>독립적인 테스트를 작성할 것</constraint>
  </constraints>

  <success-criteria>
    <criterion>Utils 함수 유닛 테스트가 작성됨</criterion>
    <criterion>Hooks 유닛 테스트가 작성됨</criterion>
    <criterion>각 테스트 파일이 올바른 위치에 생성됨</criterion>
    <criterion>모든 import가 올바르게 해결됨</criterion>
    <criterion>테스트 코드 품질이 확인됨</criterion>
    <criterion>테스트 코드가 문서화됨</criterion>
  </success-criteria>
</step>
````
