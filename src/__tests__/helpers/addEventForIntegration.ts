import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

export interface EventData {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  location: string;
}

export const addEventForIntegration = async (
  user: ReturnType<typeof userEvent.setup>,
  eventData: EventData
) => {
  // Clear all inputs first to prevent concatenation
  const titleInput = screen.getByLabelText('제목');
  const dateInput = screen.getByLabelText('날짜');
  const startTimeInput = screen.getByLabelText('시작 시간');
  const endTimeInput = screen.getByLabelText('종료 시간');
  const descriptionInput = screen.getByLabelText('설명');
  const locationInput = screen.getByLabelText('위치');

  await user.clear(titleInput);
  await user.clear(dateInput);
  await user.clear(startTimeInput);
  await user.clear(endTimeInput);
  await user.clear(descriptionInput);
  await user.clear(locationInput);

  // Type new values
  await user.type(titleInput, eventData.title);
  await user.type(dateInput, eventData.date);
  await user.type(startTimeInput, eventData.startTime);
  await user.type(endTimeInput, eventData.endTime);
  await user.type(descriptionInput, eventData.description);
  await user.type(locationInput, eventData.location);

  await user.click(screen.getByRole('button', { name: '일정 추가' }));

  // Handle potential overlap warning dialog
  try {
    const { waitFor } = await import('@testing-library/react');
    await waitFor(
      () => {
        expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
      },
      { timeout: 1000 }
    );

    // If overlap dialog appears, click "계속 진행" to proceed
    await user.click(screen.getByRole('button', { name: '계속 진행' }));
  } catch {
    // No overlap dialog, continue normally
  }
};
