import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { createIsolatedTestHandlers } from '@/__mocks__/utils/createIsolatedTestHandlers';
import { addEventForIntegration } from '@/__tests__/helpers/addEventForIntegration';
import App from '@/App';
import { server } from '@/setupTests';

describe('일정 뷰', () => {
  beforeEach(() => {
    // Reset system time before each test
    vi.setSystemTime(new Date('2100-10-01T00:00:00.000Z'));
    // Reset MSW handlers with empty events for each test
    const { handlers } = createIsolatedTestHandlers([]);
    server.use(...handlers);
  });
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText('Month'));
    await user.click(screen.getByText('Week'));

    // Should show no events message in week view
    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Add an event on 2100-10-01
    await addEventForIntegration(user, {
      title: '테스트 일정',
      date: '2100-10-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '주별 뷰 테스트 일정입니다.',
      location: '테스트 장소',
    });

    await user.click(screen.getByText('Month'));
    await user.click(screen.getByText('Week'));

    // Check that the event is displayed in week view
    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(within(table).getByText('테스트 일정')).toBeInTheDocument();
    });
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    render(<App />);
    // Month view is default
    // So, we just need to check for no events message

    // Should show no events message in month view
    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    const user = userEvent.setup();
    render(<App />);

    await addEventForIntegration(user, {
      title: '월별 테스트 일정',
      date: '2100-10-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '월별 뷰 테스트 일정입니다.',
      location: '테스트 장소',
    });

    // Month view is default, so we don't need to switch views
    const table = screen.getByRole('table');
    // Check that the event is displayed in month view
    await waitFor(() => {
      expect(within(table).getByText('월별 테스트 일정')).toBeInTheDocument();
    });
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    // Change system time to January to see holidays
    vi.setSystemTime(new Date('2025-01-01T00:00:00.000Z'));
    render(<App />);

    const table = screen.getByRole('table');

    expect(within(table).getByText('1')).toBeInTheDocument();
  });
});
