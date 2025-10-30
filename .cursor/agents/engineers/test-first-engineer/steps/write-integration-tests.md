# Step: 통합 테스트 코드 작성

````xml
<step>
  <purpose>
    QA Engineer가 작성한 테스트 케이스 문서의 통합 테스트 시나리오를 실제 Vitest 코드로 작성합니다.
  </purpose>

  <how-to>
    <action n="1">
      <do>테스트 케이스 문서에서 통합 테스트 시나리오 추출</do>
      <detail>
        테스트 케이스 문서에서 통합 테스트 시나리오를 읽고 분석합니다:

        문서 구조:
        ```markdown
        ## 통합 테스트 시나리오

        ### 시나리오 1: 사용자가 반복 일정을 생성할 수 있다
        **목적**: ...
        **전제 조건**: ...
        **테스트 단계**:
        1. '일정 추가' 버튼 클릭
        2. 제목 입력: '매일 회의'
        ...
        **기대 결과**: ...
        ```

        추출할 정보:
        - 시나리오 제목 → it() 테스트 이름
        - 전제 조건 → 테스트 setup
        - 테스트 단계 → userEvent 동작들
        - 기대 결과 → expect() 검증
      </detail>
    </action>

    <action n="2">
      <do>medium.integration.spec.tsx 패턴 참고</do>
      <detail>
        기존 통합 테스트 파일의 패턴을 참고합니다:

        ```bash
        cat src/__tests__/medium.integration.spec.tsx
        ```

        참고할 패턴:
        1. **Import 구조**
           ```typescript
           import CssBaseline from '@mui/material/CssBaseline';
           import { ThemeProvider, createTheme } from '@mui/material/styles';
           import { render, screen, within } from '@testing-library/react';
           import { UserEvent, userEvent } from '@testing-library/user-event';
           import { SnackbarProvider } from 'notistack';
           import App from '../App';
           ```

        2. **Setup 함수**
           ```typescript
           const theme = createTheme();

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
           ```

        3. **테스트 구조**
           ```typescript
           describe('기능명 통합 테스트', () => {
             it('사용자가 ~할 수 있다', async () => {
               const { user } = setup(<App />);

               // 사용자 동작
               await user.click(screen.getByText('버튼'));

               // 검증
               expect(screen.getByText('결과')).toBeInTheDocument();
             });
           });
           ```
      </detail>
    </action>

    <action n="3">
      <do>통합 테스트 파일 생성</do>
      <detail>
        통합 테스트 파일을 생성합니다:

        파일 위치: `src/__tests__/{{기능명}}.integration.spec.tsx`

        예시:
        ```typescript
        // src/__tests__/recurring-events.integration.spec.tsx
        import CssBaseline from '@mui/material/CssBaseline';
        import { ThemeProvider, createTheme } from '@mui/material/styles';
        import { render, screen } from '@testing-library/react';
        import { userEvent } from '@testing-library/user-event';
        import { describe, it, expect } from 'vitest';
        import { SnackbarProvider } from 'notistack';
        import { ReactElement } from 'react';
        import App from '../App';

        const theme = createTheme();

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

        describe('반복 일정 통합 테스트', () => {
          it('사용자가 반복 일정을 생성할 수 있다', async () => {
            const { user } = setup(<App />);

            // 테스트 단계를 코드로 변환
            await user.click(screen.getByText('일정 추가'));
            await user.type(screen.getByLabelText('제목'), '매일 회의');
            await user.click(screen.getByLabelText('반복'));
            await user.selectOptions(screen.getByLabelText('반복 유형'), 'daily');
            await user.click(screen.getByText('저장'));

            // 기대 결과 검증
            expect(screen.getByText('매일 회의')).toBeInTheDocument();
          });
        });
        ```
      </detail>
    </action>

    <action n="4">
      <do>테스트 케이스를 코드로 변환</do>
      <detail>
        각 테스트 단계를 userEvent 코드로 변환합니다:

        변환 규칙:

        | 테스트 단계 | userEvent 코드 |
        |------------|---------------|
        | 버튼 클릭 | `await user.click(screen.getByText('버튼'))` |
        | 텍스트 입력 | `await user.type(screen.getByLabelText('필드'), '값')` |
        | 체크박스 선택 | `await user.click(screen.getByLabelText('체크박스'))` |
        | 드롭다운 선택 | `await user.selectOptions(screen.getByLabelText('필드'), '값')` |
        | 날짜 선택 | `await user.type(screen.getByLabelText('날짜'), '2025-01-01')` |

        검증 규칙:

        | 기대 결과 | expect 코드 |
        |----------|------------|
        | 텍스트 표시됨 | `expect(screen.getByText('텍스트')).toBeInTheDocument()` |
        | 요소가 보임 | `expect(screen.getByRole('button')).toBeVisible()` |
        | 요소가 안 보임 | `expect(screen.queryByText('텍스트')).not.toBeInTheDocument()` |
        | 값이 일치 | `expect(screen.getByLabelText('필드')).toHaveValue('값')` |

        예시:
        ```typescript
        // 테스트 단계: '일정 추가' 버튼 클릭
        await user.click(screen.getByText('일정 추가'));

        // 테스트 단계: 제목 입력: '매일 회의'
        await user.type(screen.getByLabelText('제목'), '매일 회의');

        // 테스트 단계: '반복' 체크박스 선택
        await user.click(screen.getByLabelText('반복'));

        // 테스트 단계: 반복 유형 선택: 'daily'
        await user.selectOptions(screen.getByLabelText('반복 유형'), 'daily');

        // 기대 결과: 캘린더에 '매일 회의' 일정이 표시됨
        expect(screen.getByText('매일 회의')).toBeInTheDocument();
        ```
      </detail>
    </action>

    <action n="5">
      <do>모든 시나리오를 테스트로 작성</do>
      <detail>
        테스트 케이스 문서의 모든 통합 테스트 시나리오를 it() 블록으로 작성합니다:

        ```typescript
        describe('반복 일정 통합 테스트', () => {
          it('사용자가 반복 일정을 생성할 수 있다', async () => {
            // 시나리오 1 구현
          });

          it('매월 31일 반복 시 31일이 없는 달은 건너뜀', async () => {
            // 시나리오 2 구현
          });

          it('윤년 2월 29일 반복을 생성할 수 있다', async () => {
            // 경계값 케이스 구현
          });
        });
        ```

        주의사항:
        - 각 시나리오는 독립적인 it() 블록으로 작성
        - 테스트 이름은 시나리오 제목을 그대로 사용
        - 전제 조건이 다르면 별도의 setup 필요
        - 비동기 동작은 반드시 await 사용
      </detail>
    </action>

    <action n="6">
      <do>통합 테스트 검증</do>
      <detail>
        작성한 통합 테스트가 올바른지 확인합니다:

        체크리스트:
        1. **파일 위치**: src/__tests__/{{기능명}}.integration.spec.tsx
        2. **Import**: medium.integration.spec.tsx와 동일한 패턴
        3. **Setup 함수**: theme, SnackbarProvider 포함
        4. **테스트 구조**: describe > it 구조
        5. **비동기 처리**: 모든 user 동작에 await
        6. **검증**: 기대 결과에 대한 expect 포함

        나쁜 예시:
        ```typescript
        // ❌ await 누락
        user.click(screen.getByText('버튼'));

        // ❌ 검증 누락
        it('사용자가 일정을 생성할 수 있다', async () => {
          await user.click(screen.getByText('일정 추가'));
          // expect 없음
        });
        ```

        좋은 예시:
        ```typescript
        // ✅ await 포함, 검증 포함
        it('사용자가 일정을 생성할 수 있다', async () => {
          const { user } = setup(<App />);

          await user.click(screen.getByText('일정 추가'));
          await user.type(screen.getByLabelText('제목'), '회의');
          await user.click(screen.getByText('저장'));

          expect(screen.getByText('회의')).toBeInTheDocument();
        });
        ```
      </detail>
    </action>
  </how-to>

  <constraints>
    <constraint>medium.integration.spec.tsx 패턴을 따를 것</constraint>
    <constraint>파일명은 {{기능명}}.integration.spec.tsx 형식일 것</constraint>
    <constraint>모든 시나리오를 테스트로 작성할 것</constraint>
    <constraint>비동기 동작은 반드시 await 사용할 것</constraint>
    <constraint>각 테스트는 독립적으로 실행 가능해야 함</constraint>
  </constraints>

  <success-criteria>
    <criterion>통합 테스트 파일이 생성됨</criterion>
    <criterion>모든 시나리오가 테스트로 작성됨</criterion>
    <criterion>medium.integration.spec.tsx 패턴을 따름</criterion>
    <criterion>비동기 처리가 올바르게 됨</criterion>
    <criterion>검증 로직이 포함됨</criterion>
  </success-criteria>
</step>
````
