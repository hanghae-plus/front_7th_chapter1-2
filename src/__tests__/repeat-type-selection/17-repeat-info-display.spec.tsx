import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';

import { setupMockHandlerCreation } from '../../__mocks__/handlersUtils';
import App from '../../App';

const theme = createTheme();

const setup = () => {
  return render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider>
        <App />
      </SnackbarProvider>
    </ThemeProvider>
  );
};

describe('일정 목록에서 반복 정보 표시', () => {
  it('daily 반복 일정은 "반복: N일마다" 형식으로 표시됨', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: 'daily-1',
        date: '2025-10-10',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'daily', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: 'daily-3',
        date: '2025-10-11',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'daily', interval: 3 },
        notificationTime: 10,
      },
    ]);

    setup();

    const list = await screen.findByTestId('event-list');
    expect(within(list).getByText('반복: 1일마다')).toBeInTheDocument();
    expect(within(list).getByText('반복: 3일마다')).toBeInTheDocument();
  });

  it('weekly 반복 일정은 "반복: N주마다" 형식으로 표시되고 종료일이 있으면 함께 표시됨', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: 'weekly-1',
        date: '2025-10-10',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: 'weekly-2-end',
        date: '2025-10-11',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'weekly', interval: 2, endDate: '2024-12-31' },
        notificationTime: 10,
      },
    ]);

    setup();

    const list = await screen.findByTestId('event-list');
    expect(within(list).getByText('반복: 1주마다')).toBeInTheDocument();
    expect(within(list).getByText('반복: 2주마다 (종료: 2024-12-31)')).toBeInTheDocument();
  });

  it('monthly/yearly 반복 일정은 올바른 단위로 표시되며 종료일 포함 시 함께 표시됨', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: 'monthly-1',
        date: '2025-10-10',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'monthly', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: 'yearly-3-end',
        date: '2025-10-11',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'yearly', interval: 3, endDate: '2030-12-31' },
        notificationTime: 10,
      },
    ]);

    setup();

    const list = await screen.findByTestId('event-list');
    expect(within(list).getByText('반복: 1월마다')).toBeInTheDocument();
    expect(within(list).getByText('반복: 3년마다 (종료: 2030-12-31)')).toBeInTheDocument();
  });

  it("repeat.type === 'none'이면 반복 정보를 표시하지 않음", async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: 'none-repeat',
        date: '2025-10-10',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    setup();

    const list = await screen.findByTestId('event-list');
    expect(within(list).queryByText(/^반복:/)).toBeNull();
  });
});
