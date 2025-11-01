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

describe('[Story] 성능 및 전개 범위', () => {
  it('전개 인스턴스에도 반복 아이콘 표시 조건이 일관 적용된다', async () => {
    // 월간 전개에서 동일 타이틀의 다수 인스턴스 중 하나를 집어 검증
    setupMockHandlerCreation([
      {
        id: '1',
        title: '데일리 브리핑',
        date: '2025-10-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'daily', interval: 1 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup();

    // 월간 뷰로 전환
    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: /month/i }));

    const monthView = await screen.findByTestId('month-view');
    const titles = await within(monthView).findAllByText('데일리 브리핑');
    expect(titles.length).toBeGreaterThanOrEqual(3);

    // 임의의 한 인스턴스에서 반복 아이콘 조건(존재/aria-label)을 확인
    const anyTitle = titles[0];
    const stackEl = anyTitle.closest('[class]')!.parentElement as HTMLElement;
    const repeatIcon = within(stackEl).getByTestId('repeat-icon');
    expect(repeatIcon).toBeInTheDocument();
    expect(repeatIcon).toHaveAttribute('aria-label', '반복 일정');
  });

  it('월간 뷰에서 대량 인스턴스(100+) 렌더링 시에도 UI 렌더가 완료된다', async () => {
    // 한 달에 4개의 daily 반복 이벤트를 두어 총 100+ 전개를 유도
    setupMockHandlerCreation([
      {
        id: '1',
        title: '데일리 브리핑 A',
        date: '2025-10-01',
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
        title: '데일리 브리핑 B',
        date: '2025-10-02',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'daily', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '데일리 브리핑 C',
        date: '2025-10-03',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'daily', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '4',
        title: '데일리 브리핑 D',
        date: '2025-10-04',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'daily', interval: 1 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup();

    // 월간 뷰로 전환
    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: /month/i }));

    const monthView = await screen.findByTestId('month-view');

    // 각 타이틀의 전개 건수를 합산하여 100+ 이상임을 확인 (렌더 완료 간접 검증)
    const a = await within(monthView).findAllByText('데일리 브리핑 A');
    const b = await within(monthView).findAllByText('데일리 브리핑 B');
    const c = await within(monthView).findAllByText('데일리 브리핑 C');
    const d = await within(monthView).findAllByText('데일리 브리핑 D');
    const total = a.length + b.length + c.length + d.length;
    expect(total).toBeGreaterThanOrEqual(100);
  });
});
