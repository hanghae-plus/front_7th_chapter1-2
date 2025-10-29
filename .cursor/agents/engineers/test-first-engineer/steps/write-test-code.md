# Step: 테스트 코드 작성

````xml
<step>
  <purpose>
    QA Engineer가 작성한 테스트 케이스 문서를 실제 Vitest 테스트 코드로 변환합니다.
  </purpose>

  <how-to>
    <action n="1">
      <do>테스트 케이스 문서 읽기</do>
      <detail>
        QA Engineer가 작성한 테스트 케이스 문서를 읽고 다음 정보를 파악합니다:
        - 테스트 대상 함수/컴포넌트
        - 각 테스트 시나리오
        - 입력값과 기대 출력값
        - 경계값 및 예외 케이스

        테스트 케이스 문서는 일반적으로 다음과 같은 형식입니다:
        - 시나리오: [테스트 시나리오 설명]
        - 입력: [입력값]
        - 기대 결과: [기대 출력값]
      </detail>
    </action>

    <action n="2">
      <do>테스트 파일 구조 설계</do>
      <detail>
        Vitest의 describe/it 구조를 사용하여 테스트 파일 구조를 설계합니다:

        ```typescript
        import { describe, it, expect } from 'vitest';

        describe('기능 그룹명', () => {
          describe('하위 기능명', () => {
            it('구체적인 테스트 케이스', () => {
              // 테스트 로직
            });
          });
        });
        ```

        구조화 원칙:
        - 최상위 describe: 기능 전체 (예: '반복 일정 생성')
        - 중첩 describe: 하위 기능 (예: '매일 반복', '매월 반복')
        - it: 구체적인 테스트 케이스
      </detail>
    </action>

    <action n="3">
      <do>테스트 코드 작성</do>
      <detail>
        각 테스트 케이스를 Vitest 코드로 작성합니다:

        기본 패턴:
        ```typescript
        it('테스트 설명', () => {
          // Arrange: 테스트 준비
          const input = { /* 입력값 */ };

          // Act: 함수 실행
          const result = targetFunction(input);

          // Assert: 결과 검증
          expect(result).toBe(expectedValue);
        });
        ```

        여러 케이스를 테스트할 때는 test.each 사용:
        ```typescript
        it.each([
          { input: value1, expected: result1 },
          { input: value2, expected: result2 },
        ])('테스트 설명: $input', ({ input, expected }) => {
          expect(targetFunction(input)).toBe(expected);
        });
        ```
      </detail>
    </action>

    <action n="4">
      <do>검증 로직 작성</do>
      <detail>
        적절한 Vitest matcher를 사용하여 검증 로직을 작성합니다:

        자주 사용하는 matcher:
        - expect(value).toBe(expected): 원시 타입 비교
        - expect(value).toEqual(expected): 객체/배열 깊은 비교
        - expect(array).toHaveLength(n): 배열 길이 검증
        - expect(array).toContain(item): 배열 포함 여부
        - expect(fn).toThrow(): 에러 발생 검증
        - expect(value).toBeTruthy() / toBeFalsy(): boolean 검증

        경계값 테스트 예시:
        ```typescript
        it('매월 31일 반복 시 31일이 없는 달에는 생성되지 않는다', () => {
          const dates = generateRecurringDates({
            type: 'monthly',
            startDate: '2025-01-31',
            endDate: '2025-04-30',
            interval: 1
          });

          // 1월(31일), 3월(31일)만 생성, 2월은 제외
          expect(dates).toHaveLength(2);
          expect(dates).toContain('2025-01-31');
          expect(dates).toContain('2025-03-31');
          expect(dates).not.toContain('2025-02-31'); // 존재하지 않는 날짜
        });
        ```
      </detail>
    </action>

    <action n="5">
      <do>테스트 설명 작성</do>
      <detail>
        각 테스트의 의도를 명확히 하는 설명을 작성합니다:

        작성 원칙:
        - 한글로 작성하여 이해하기 쉽게
        - "~할 수 있다", "~해야 한다" 형식 사용
        - 구체적인 시나리오 명시

        좋은 예시:
        - "매일 반복 일정을 생성할 수 있다"
        - "매월 31일 반복 시 31일이 없는 달에는 생성되지 않는다"
        - "윤년 2월 29일 반복 일정이 평년에는 생성되지 않는다"

        나쁜 예시:
        - "테스트 1"
        - "동작 확인"
        - "정상 케이스"
      </detail>
    </action>
  </how-to>

  <constraints>
    <constraint>테스트 케이스 문서의 모든 시나리오를 테스트 코드로 변환할 것</constraint>
    <constraint>Vitest의 describe/it 구조를 사용할 것</constraint>
    <constraint>각 테스트는 독립적으로 실행 가능해야 할 것</constraint>
    <constraint>테스트 설명은 한글로 명확하게 작성할 것</constraint>
    <constraint>적절한 matcher를 사용하여 검증할 것</constraint>
    <constraint>경계값 및 예외 케이스를 빠뜨리지 말 것</constraint>
  </constraints>

  <success-criteria>
    <criterion>테스트 케이스 문서의 모든 시나리오가 테스트 코드로 변환됨</criterion>
    <criterion>테스트 구조가 논리적으로 그룹화되어 있음</criterion>
    <criterion>각 테스트의 의도가 명확함</criterion>
    <criterion>검증 로직이 정확함</criterion>
    <criterion>테스트 파일이 실행 가능함 (import 오류 없음)</criterion>
  </success-criteria>
</step>
````
