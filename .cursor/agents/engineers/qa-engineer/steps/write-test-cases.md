# Step: 테스트 케이스 작성

````xml
<step>
  <purpose>
    정의한 시나리오를 바탕으로 통합 테스트를 작성합니다.
  </purpose>

  <how-to>
    <action n="1">
      <do>통합 테스트 작성</do>
      <detail>
        사용자 시나리오 기반의 통합 테스트를 작성합니다:

        파일 위치: `src/__tests__/<기능명>.integration.spec.tsx`
        참고 파일: `src/__tests__/medium.integration.spec.tsx`

        작성 패턴:
        ```typescript
        import CssBaseline from '@mui/material/CssBaseline';
        import { ThemeProvider, createTheme } from '@mui/material/styles';
        import { render, screen, within, act } from '@testing-library/react';
        import { UserEvent, userEvent } from '@testing-library/user-event';
        import { http, HttpResponse } from 'msw';
        import { SnackbarProvider } from 'notistack';
        import { ReactElement } from 'react';

        import {
          setupMockHandlerCreation,
          setupMockHandlerDeletion,
          setupMockHandlerUpdating,
        } from '../__mocks__/handlersUtils';
        import App from '../App';
        import { server } from '../setupTests';
        import { Event } from '../types';

        const theme = createTheme();

        // ! Hard 여기 제공 안함
        const setup = (element: ReactElement) => {
          const user = userEvent.setup();

          return {
            ...render(
              <ThemeProvider theme={theme}>
                <CssBaseline />
                <SnackbarProvider>{element}</SnackbarProvider>
              </ThemeProvider>
            ),
            user,
          };
        };

        describe('기능명 통합 테스트', () => {
          it('사용자가 [동작]을 할 수 있다', async () => {
            setupMockHandlerCreation();

            const { user } = setup(<App />);

            // 사용자 동작 시뮬레이션
            await user.click(screen.getByText('버튼'));
            await user.type(screen.getByLabelText('입력'), '값');

            // 검증
            expect(screen.getByText('결과')).toBeInTheDocument();
          });
        });
        ```

        주의사항:
        - medium.integration.spec.tsx의 setup 패턴을 참고
        - userEvent를 사용하여 사용자 동작 시뮬레이션
        - 실제 사용자 플로우를 따라 테스트 작성
        - 비동기 동작은 async/await 사용
      </detail>
    </action>

    <action n="2">
      <do>테스트 구조 설계</do>
      <detail>
        Vitest의 describe/it 구조를 사용하여 테스트를 그룹화합니다:

        ```typescript
        describe('최상위 기능', () => {
          describe('하위 기능 1', () => {
            it('테스트 케이스 1', () => { /* ... */ });
            it('테스트 케이스 2', () => { /* ... */ });
          });

          describe('하위 기능 2', () => {
            it('테스트 케이스 3', () => { /* ... */ });
          });
        });
        ```

        그룹화 원칙:
        - 최상위 describe: 함수/기능 전체
        - 중첩 describe: 기능별 그룹 (매일 반복, 매월 반복 등)
        - it: 구체적인 테스트 케이스
      </detail>
    </action>

    <action n="3">
      <do>명확한 테스트 이름 작성</do>
      <detail>
        테스트 이름은 다음 원칙을 따릅니다:

        통합 테스트:
        - "사용자가 ~할 수 있다" 형식
        - 예: "사용자가 반복 일정을 생성할 수 있다"

        유닛 테스트:
        - "~할 수 있다" 또는 "~해야 한다" 형식
        - 구체적인 동작과 기대 결과 명시
        - 예: "매월 31일 반복 시 31일이 없는 달에는 생성되지 않는다"

        나쁜 예시:
        - "테스트 1", "동작 확인", "정상 케이스"
      </detail>
    </action>

    <action n="4">
      <do>테이블 테스트 활용</do>
      <detail>
        반복적인 케이스는 test.each를 사용하여 테이블 테스트로 작성합니다:

        ```typescript
        it.each([
          { input: '2025-01-31', expected: 2 },
          { input: '2025-02-28', expected: 3 },
          { input: '2025-03-31', expected: 2 },
        ])('$input 시작 시 $expected개 생성', ({ input, expected }) => {
          const result = generateDates(input);
          expect(result).toHaveLength(expected);
        });
        ```

        활용 시나리오:
        - 여러 입력값에 대해 동일한 검증 로직
        - 경계값 테스트
        - 다양한 케이스 검증
      </detail>
    </action>

    <action n="5">
      <do>경계값 및 예외 케이스 포함</do>
      <detail>
        PRD에 명시된 경계값과 예외 케이스를 빠짐없이 테스트합니다:

        경계값 예시:
        - 매월 31일 (31일이 없는 달)
        - 윤년 2월 29일 (평년에는 없는 날)
        - 시작일 = 종료일
        - interval = 0 또는 음수

        예외 케이스 예시:
        - 잘못된 날짜 형식
        - 시작일 > 종료일
        - 필수 필드 누락
      </detail>
    </action>
  </how-to>

  <constraints>
    <constraint>통합 테스트는 `src/__tests__/<기능명>.integration.spec.tsx` 형식으로 작성할 것</constraint>
    <constraint>통합 테스트는 medium.integration.spec.tsx를 참고할 것</constraint>
    <constraint>모든 수용 기준이 테스트로 작성되어야 함</constraint>
    <constraint>경계값 케이스가 포함되어야 함</constraint>
    <constraint>예외 케이스가 포함되어야 함</constraint>
    <constraint>테스트 이름이 명확해야 함</constraint>
  </constraints>

  <success-criteria>
    <criterion>통합 테스트가 적절한 위치에 작성됨</criterion>
    <criterion>모든 수용 기준이 테스트로 작성됨</criterion>
    <criterion>경계값 케이스가 포함됨</criterion>
    <criterion>예외 케이스가 포함됨</criterion>
    <criterion>테스트 이름이 명확함</criterion>
    <criterion>통합 테스트가 medium.integration.spec.tsx 패턴을 따름</criterion>
  </success-criteria>
</step>
````
