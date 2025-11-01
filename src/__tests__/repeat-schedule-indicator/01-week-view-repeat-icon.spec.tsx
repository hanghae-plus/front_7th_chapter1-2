import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { vi } from 'vitest';

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

describe('[Story] 주간 뷰 반복 아이콘 표시', () => {
  it('반복 일정이면 반복 아이콘이 타이틀 좌측에 표시된다', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '주간 회의',
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
    const titleEl = await within(weekView).findByText('주간 회의');

    // 타이틀이 포함된 Stack 컨테이너에서 반복 아이콘 존재 확인
    const stackEl = titleEl.closest('[class]')!.parentElement as HTMLElement; // Typography의 부모(Stack 내부)
    expect(within(stackEl).getByTestId('repeat-icon')).toBeInTheDocument();
    expect(within(stackEl).getByTestId('repeat-icon')).toHaveAttribute('aria-label', '반복 일정');
  });

  it('단일 일정이면 반복 아이콘이 표시되지 않는다', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '1회 미팅',
        date: '2025-01-07',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup();

    // 주간 뷰로 전환
    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: /week/i }));

    const weekView = await screen.findByTestId('week-view');
    const titleEl = await within(weekView).findByText('1회 미팅');
    const stackEl = titleEl.closest('[class]')!.parentElement as HTMLElement;
    expect(within(stackEl).queryByTestId('repeat-icon')).toBeNull();
  });

  it('알림과 반복이 함께 있을 때 아이콘 순서가 [알림][반복][타이틀]이다', async () => {
    // now 기준 5분 뒤 시작, notificationTime 10분 → 알림 아이콘 표시 대상
    const now = new Date();
    const start = new Date(now.getTime() + 5 * 60 * 1000);
    const yyyy = start.getFullYear();
    const mm = String(start.getMonth() + 1).padStart(2, '0');
    const dd = String(start.getDate()).padStart(2, '0');
    const hh = String(start.getHours()).padStart(2, '0');
    const mi = String(start.getMinutes()).padStart(2, '0');

    setupMockHandlerCreation([
      {
        id: '1',
        title: '알림 회의',
        date: `${yyyy}-${mm}-${dd}`,
        startTime: `${hh}:${mi}`,
        endTime: '23:59',
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

    // 알림 훅의 setInterval(1초)을 진행시키기 위해 타이머 전진
    vi.useFakeTimers();
    vi.advanceTimersByTime(1200);
    vi.useRealTimers();

    const weekView = await screen.findByTestId('week-view');
    const titleEl = await within(weekView).findByText('알림 회의');
    const stackEl = titleEl.closest('[class]')!.parentElement as HTMLElement;

    const inline = within(stackEl);
    const repeatIcon = inline.getByTestId('repeat-icon');
    const notificationIcon = stackEl.querySelector(
      'svg:not([data-testid="repeat-icon"])'
    ) as SVGElement | null;
    const titleNode = inline.getByText('알림 회의');

    expect(notificationIcon).not.toBeNull();
    expect(repeatIcon).toBeInTheDocument();

    // 알림 아이콘이 반복 아이콘보다 먼저
    expect(
      (notificationIcon as Element).compareDocumentPosition(repeatIcon) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    // 반복 아이콘이 타이틀보다 먼저
    expect(
      repeatIcon.compareDocumentPosition(titleNode) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });
});
