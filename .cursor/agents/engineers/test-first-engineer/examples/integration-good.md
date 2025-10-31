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
