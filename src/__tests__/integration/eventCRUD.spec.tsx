import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { addEventForIntegration } from '@/__tests__/helpers/addEventForIntegration';
import App from '@/App';

describe('일정 CRUD 및 기본 기능', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2025-10-01T00:00:00.000Z'));
  });
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
    const user = userEvent.setup();
    render(<App />);

    await addEventForIntegration(user, {
      title: '첫 번째 일정',
      date: '2025-10-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '첫 번째 일정 설명',
      location: '첫 번째 장소',
    });

    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(within(table).getByText('첫 번째 일정')).toBeInTheDocument();
    });

    // Force close any open dialogs by pressing ESC
    // If we don't do this, subsequent tests may fail due to open dialog
    await user.keyboard('{Escape}');
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    const user = userEvent.setup();
    render(<App />);

    // First, add an event to edit
    await addEventForIntegration(user, {
      title: '수정 전 일정',
      date: '2025-10-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '수정 전 설명',
      location: '수정 전 장소',
    });

    // Verify event was added
    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(within(table).getByText('수정 전 일정')).toBeInTheDocument();
    });

    // Find and click edit button for the event we just added
    const editButtons = screen.getAllByLabelText('Edit event');
    await user.click(editButtons[editButtons.length - 1]); // Click the last (most recent) edit button

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: '일정 수정' })
      ).toBeInTheDocument();
    });

    // Get input fields
    const titleInput = screen.getByLabelText('제목') as HTMLInputElement;
    const descInput = screen.getByLabelText('설명') as HTMLInputElement;
    const locationInput = screen.getByLabelText('위치') as HTMLInputElement;

    // Clear and update event details
    await user.clear(titleInput);
    await user.type(titleInput, '수정된 일정');
    await user.clear(descInput);
    await user.type(descInput, '수정된 설명');
    await user.clear(locationInput);
    await user.type(locationInput, '수정된 장소');

    await user.click(screen.getByRole('button', { name: '일정 수정' }));

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: '일정 추가' })
      ).toBeInTheDocument();
    });

    // Verify changes are reflected - use getAllByText since content appears in multiple places
    expect(screen.getAllByText('수정된 일정').length).toBeGreaterThan(0);
    expect(screen.getByText('수정된 설명')).toBeInTheDocument();
    expect(screen.getByText('수정된 장소')).toBeInTheDocument();

    // Verify old values are no longer present
    expect(screen.queryByText('수정 전 일정')).not.toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    const user = userEvent.setup();
    render(<App />);

    // First, add an event to delete
    await addEventForIntegration(user, {
      title: '삭제할 일정',
      date: '2025-10-01',
      startTime: '14:00',
      endTime: '15:00',
      description: '삭제 테스트용 일정',
      location: '삭제 테스트 장소',
    });

    // Verify event was added
    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(within(table).getByText('삭제할 일정')).toBeInTheDocument();
    });

    // Find and click delete button for the event we just added
    const deleteButtons = screen.getAllByLabelText('Delete event');
    await user.click(deleteButtons[deleteButtons.length - 1]); // Click the last (most recent) delete button

    // Verify event is removed
    await waitFor(() => {
      expect(screen.queryByText('삭제할 일정')).not.toBeInTheDocument();
    });
  });
});
