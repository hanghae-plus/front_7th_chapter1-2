import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { addEventForIntegration } from '@/__tests__/helpers/addEventForIntegration';
import App from '@/App';

describe('검색 기능', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2025-10-01T00:00:00.000Z'));
  });

  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Search for a "존재하지 않는 일정" event
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');

    await user.type(searchInput, '존재하지 않는 일정');

    // Should show no results message
    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    const user = userEvent.setup();
    render(<App />);

    // First, add a "팀 회의" event
    await addEventForIntegration(user, {
      title: '팀 회의',
      date: '2025-10-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '주간 팀 회의입니다.',
      location: '회의실 A',
    });

    // Also add another event to ensure search filters correctly
    await addEventForIntegration(user, {
      title: '개인 작업',
      date: '2025-10-01',
      startTime: '14:00',
      endTime: '15:00',
      description: '개인 프로젝트 작업',
      location: '사무실',
    });

    // Search for "팀 회의"
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '팀 회의');

    // Should show the "팀 회의" event
    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(within(table).getByText('팀 회의')).toBeInTheDocument();
    });

    // Should not show the "개인 작업" event
    expect(screen.queryByText('개인 작업')).not.toBeInTheDocument();
  }, 10000);

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    const user = userEvent.setup();
    render(<App />);

    await addEventForIntegration(user, {
      title: '팀 회의',
      date: '2025-10-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '주간 팀 회의입니다.',
      location: '회의실 A',
    });

    await addEventForIntegration(user, {
      title: '개인 작업',
      date: '2025-10-02',
      startTime: '14:00',
      endTime: '15:00',
      description: '개인 프로젝트 작업',
      location: '사무실',
    });

    // Search for "팀"
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '팀');

    // Should only show "팀 회의"
    await waitFor(() => {
      expect(screen.getAllByText('팀 회의').length).toBeGreaterThan(0);
    });
    expect(screen.queryByText('개인 작업')).not.toBeInTheDocument();

    await user.clear(searchInput);

    // Should show both events again
    await waitFor(() => {
      expect(screen.getAllByText('팀 회의').length).toBeGreaterThan(0);
      expect(screen.getAllByText('개인 작업').length).toBeGreaterThan(0);
    });
  }, 10000);
});
