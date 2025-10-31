import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { addEventForIntegration } from '@/__tests__/helpers/addEventForIntegration';
import App from '@/App';

describe('일정 충돌', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2025-10-01T00:00:00.000Z'));
  });
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Add initial event from 10:00 to 11:00
    await addEventForIntegration(user, {
      title: '첫 번째 일정',
      date: '2025-10-10',
      startTime: '10:00',
      endTime: '11:00',
      description: '첫 번째 일정 설명',
      location: '첫 번째 장소',
    });

    // Add overlapping event from 10:30 to 11:30
    await addEventForIntegration(user, {
      title: '겹치는 일정',
      date: '2025-10-10',
      startTime: '10:30',
      endTime: '11:30',
      description: '겹치는 일정 설명',
      location: '겹치는 장소',
    });

    await waitFor(() => {
      expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    });
    expect(
      screen.getByRole('button', { name: '계속 진행' })
    ).toBeInTheDocument();

    // Dismiss the dialog by clicking "취소" to complete the test
    await user.click(screen.getByRole('button', { name: '취소' }));
  }, 10000);

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    vi.setSystemTime(new Date('2026-10-01T00:00:00.000Z'));
    const user = userEvent.setup();
    render(<App />);

    // Add first event from 10:00 to 11:00
    await addEventForIntegration(user, {
      title: '첫 번째 일정',
      date: '2026-10-10',
      startTime: '10:00',
      endTime: '11:00',
      description: '첫 번째 일정 설명',
      location: '첫 번째 장소',
    });

    // Add second event from 12:00 to 13:00 (no overlap initially)
    await addEventForIntegration(user, {
      title: '두 번째 일정',
      date: '2026-10-10',
      startTime: '12:00',
      endTime: '13:00',
      description: '두 번째 일정 설명',
      location: '두 번째 장소',
    });

    // Find the second event in the calendar and click its edit button
    const editButtons = screen.getAllByLabelText('Edit event');
    await user.click(editButtons[1]); // Click edit button for second event

    // Change time to overlap with first event (10:30 to 11:30)
    const startTimeInput = screen.getByLabelText(
      '시작 시간'
    ) as HTMLInputElement;
    const endTimeInput = screen.getByLabelText('종료 시간') as HTMLInputElement;

    // Clear existing times and enter new overlapping times
    // Reasons: Typing directly appends to existing value
    await user.clear(startTimeInput);
    await user.type(startTimeInput, '10:30');
    await user.clear(endTimeInput);
    await user.type(endTimeInput, '11:30');

    await user.click(screen.getByRole('button', { name: '일정 수정' }));

    // Check for overlap warning dialog
    await waitFor(() => {
      expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    });
    expect(
      screen.getByRole('button', { name: '계속 진행' })
    ).toBeInTheDocument();

    // Dismiss the dialog by clicking "취소" to complete the test
    await user.click(screen.getByRole('button', { name: '취소' }));
  }, 10000);
});
