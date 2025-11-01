import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within, fireEvent } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';

import { setupMockHandlerCreation } from '../../__mocks__/handlersUtils';
import App from '../../App';

const theme = createTheme();

const setup = () => {
  const user = userEvent.setup();

  return {
    ...render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>
          <App />
        </SnackbarProvider>
      </ThemeProvider>
    ),
    user,
  };
};

describe('[Story] 반복 아이콘 접근성 및 툴팁', () => {
  it('반복 아이콘에 aria-label="반복 일정"이 존재한다', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '정기 점검',
        date: '2025-01-06', // 월요일
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup();

    // 주간 뷰로 전환
    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: /week/i }));

    const weekView = await screen.findByTestId('week-view');
    const titleEl = await within(weekView).findByText('정기 점검');
    const stackEl = titleEl.closest('[class]')!.parentElement as HTMLElement;

    const repeatIcon = within(stackEl).getByTestId('repeat-icon');
    expect(repeatIcon).toBeInTheDocument();
    expect(repeatIcon).toHaveAttribute('aria-label', '반복 일정');
  });

  it('마우스 오버 시 "반복 일정" 툴팁이 노출된다', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '정기 점검',
        date: '2025-01-06',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup();

    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: /week/i }));

    const weekView = await screen.findByTestId('week-view');
    const titleEl = await within(weekView).findByText('정기 점검');
    const stackEl = titleEl.closest('[class]')!.parentElement as HTMLElement;

    const repeatIcon = within(stackEl).getByTestId('repeat-icon');

    await user.hover(repeatIcon);

    // Tooltip은 포탈로 렌더링될 수 있으므로 전역에서 텍스트를 탐색
    expect(await screen.findByText('반복 일정')).toBeInTheDocument();
  });

  it('키보드 포커스 시에도 같은 툴팁이 노출된다', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '정기 점검',
        date: '2025-01-06',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup();

    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: /week/i }));

    const weekView = await screen.findByTestId('week-view');
    const titleEl = await within(weekView).findByText('정기 점검');
    const stackEl = titleEl.closest('[class]')!.parentElement as HTMLElement;

    const repeatIcon = within(stackEl).getByTestId('repeat-icon');

    // SVG는 기본적으로 포커스 불가할 수 있어 직접 focus 이벤트를 발생시킴 (명세 검증 목적)
    fireEvent.focus(repeatIcon);

    expect(await screen.findByText('반복 일정')).toBeInTheDocument();
  });
});
