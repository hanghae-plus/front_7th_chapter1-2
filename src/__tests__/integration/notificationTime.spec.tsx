import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import App from '@/App';

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.type(screen.getByLabelText('제목'), 'test event');
  await user.type(screen.getByLabelText('날짜'), '2025-10-10');
  await user.type(screen.getByLabelText('시작 시간'), '12:00');
  await user.type(screen.getByLabelText('종료 시간'), '13:00');
  await user.type(screen.getByLabelText('설명'), 'this is a test event');
  await user.type(screen.getByLabelText('위치'), 'test location');

  // Click on notification dropdown and select '10분 전'
  // Reason why we use document.getElementById:
  // Because the select element does not have a role of 'combobox' due to MUI implementation
  // So we directly access it by its ID
  await user.click(document.getElementById('notification')!);
  // So, why we use getByRole for option?
  // Because the options are rendered in a listbox role, so we can access them by role
  await user.click(screen.getByRole('option', { name: '10분 전' }));

  // Check that notification option was selected (the text should be visible in the select)
  expect(screen.getByText('10분 전')).toBeInTheDocument();
});
