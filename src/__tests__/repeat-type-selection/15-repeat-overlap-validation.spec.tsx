import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within } from '@testing-library/react';
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

describe('반복 일정과 겹침 검증', () => {
  it('반복 일정 생성 시 기존 일정과 겹쳐도 겹침 경고가 표시되지 않고 저장됨 (daily)', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '기존 일정',
        date: '2025-10-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup();

    await user.type(screen.getByLabelText('제목'), '겹치는 반복 일정');
    await user.type(screen.getByLabelText('날짜'), '2025-10-15');
    await user.type(screen.getByLabelText('시작 시간'), '10:00');
    await user.type(screen.getByLabelText('종료 시간'), '11:00');

    await user.click(screen.getByRole('checkbox', { name: /반복 일정/i }));
    // 기본 값: 매일, 간격 1

    await user.click(screen.getByTestId('event-submit-button'));

    // 겹침 경고 다이얼로그가 표시되지 않아야 함
    expect(screen.queryByText('일정 겹침 경고')).toBeNull();

    // 리스트에 새 일정 저장됨 (리스트 범위를 한정)
    const list = await screen.findByTestId('event-list');
    const matches = within(list).getAllByText('겹치는 반복 일정');
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('repeat.type이 none이 아닐 때 겹침 검증(findOverlappingEvents)을 건너뛴다 (weekly)', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '기존 일정',
        date: '2025-10-16',
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

    await user.type(screen.getByLabelText('제목'), '주간 반복 겹침');
    await user.type(screen.getByLabelText('날짜'), '2025-10-16');
    await user.type(screen.getByLabelText('시작 시간'), '09:00');
    await user.type(screen.getByLabelText('종료 시간'), '10:00');

    await user.click(screen.getByRole('checkbox', { name: /반복 일정/i }));
    // 반복 유형을 매주로 변경
    const repeatTypeCombobox = screen.getByRole('combobox', { name: /반복 유형/i });
    await user.click(repeatTypeCombobox);
    await user.click(screen.getByRole('option', { name: '매주' }));

    await user.click(screen.getByTestId('event-submit-button'));

    expect(screen.queryByText('일정 겹침 경고')).toBeNull();

    const list = await screen.findByTestId('event-list');
    const matches = within(list).getAllByText('주간 반복 겹침');
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('일반 일정(repeat.type === none) 생성 시에는 겹침 검증을 수행하여 경고 표시', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '기존 일정',
        date: '2025-10-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup();

    await user.type(screen.getByLabelText('제목'), '겹치는 일반 일정');
    await user.type(screen.getByLabelText('날짜'), '2025-10-15');
    await user.type(screen.getByLabelText('시작 시간'), '10:00');
    await user.type(screen.getByLabelText('종료 시간'), '11:00');

    // 반복 체크 안 함 → 일반 일정
    await user.click(screen.getByTestId('event-submit-button'));

    // 겹침 경고 다이얼로그 표시
    expect(await screen.findByText('일정 겹침 경고')).toBeInTheDocument();
  });
});
