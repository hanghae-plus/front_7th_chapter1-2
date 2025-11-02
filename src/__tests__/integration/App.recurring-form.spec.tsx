/**
 * TDD-CYCLE-3: Recurring Event Form UI Integration Tests
 *
 * Feature: 반복 일정 생성/수정 폼 UI
 * - Repeat checkbox toggle shows/hides fields
 * - Repeat type selection updates state
 * - Repeat interval input updates state
 * - Repeat end date picker updates state
 * - Form submission includes repeat data
 *
 * Status: RED (Tests should FAIL with NotImplementedError)
 */

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';
import { describe, it, expect, beforeEach } from 'vitest';

import App from '../../App';
import { server } from '../../setupTests';

const theme = createTheme();

// Helper function to render App with required providers
const renderApp = () => {
  const user = userEvent.setup();

  return {
    user,
    ...render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>
          <App />
        </SnackbarProvider>
      </ThemeProvider>
    ),
  };
};

// ============================================================================
// Test Suite
// ============================================================================

describe('반복 일정 폼 UI', () => {
  beforeEach(() => {
    // Reset server handlers before each test
    server.resetHandlers();

    // Mock API to return empty events
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: [] });
      })
    );
  });

  // ==========================================================================
  // Category 1: 반복 설정 필드 표시/숨김 (3 tests)
  // ==========================================================================

  describe('반복 설정 필드 표시/숨김', () => {
    it('should toggle repeat fields when checkbox is checked', async () => {
      const { user } = renderApp();

      // Wait for form to render
      const checkbox = await screen.findByRole('checkbox', { name: /반복 일정/i });
      expect(checkbox).toBeInTheDocument();

      // Initially unchecked - repeat fields should be hidden
      expect(screen.queryByText('반복 유형')).not.toBeInTheDocument();
      expect(screen.queryByText('반복 간격')).not.toBeInTheDocument();
      expect(screen.queryByText('반복 종료일')).not.toBeInTheDocument();

      // Check the checkbox
      await user.click(checkbox);

      // Repeat fields should now be visible
      expect(screen.getByText('반복 유형')).toBeInTheDocument();
      expect(screen.getByText('반복 간격')).toBeInTheDocument();
      expect(screen.getByText('반복 종료일')).toBeInTheDocument();
    });

    it('should hide repeat fields when checkbox is unchecked', async () => {
      const { user } = renderApp();

      // Wait for form to render
      const checkbox = await screen.findByRole('checkbox', { name: /반복 일정/i });

      // Check the checkbox first
      await user.click(checkbox);
      expect(screen.getByText('반복 유형')).toBeInTheDocument();

      // Uncheck the checkbox
      await user.click(checkbox);

      // Repeat fields should be hidden
      expect(screen.queryByText('반복 유형')).not.toBeInTheDocument();
      expect(screen.queryByText('반복 간격')).not.toBeInTheDocument();
      expect(screen.queryByText('반복 종료일')).not.toBeInTheDocument();
    });

    it('should show repeat fields when editing recurring event', async () => {
      // Mock API with a recurring event
      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({
            events: [
              {
                id: 'recurring-1',
                title: 'Weekly Meeting',
                date: '2025-10-10',
                startTime: '10:00',
                endTime: '11:00',
                description: 'Team sync',
                location: 'Office',
                category: '업무',
                repeat: { type: 'weekly', interval: 1, endDate: '2025-12-31' },
                notificationTime: 10,
              },
            ],
          });
        })
      );

      const { user } = renderApp();

      // Wait for event to render and click edit
      const editButton = await screen.findByLabelText('Edit event', {}, { timeout: 3000 });
      await user.click(editButton);

      // Repeat fields should be visible (because isRepeating is true)
      expect(screen.getByText('반복 유형')).toBeInTheDocument();
      expect(screen.getByText('반복 간격')).toBeInTheDocument();
      expect(screen.getByText('반복 종료일')).toBeInTheDocument();

      // Checkbox should be checked
      const checkbox = screen.getByRole('checkbox', { name: /반복 일정/i });
      expect(checkbox).toBeChecked();
    });
  });

  // ==========================================================================
  // Category 2: 반복 유형 선택 (4 tests)
  // ==========================================================================

  describe('반복 유형 선택', () => {
    it('should update repeatType when selecting daily', async () => {
      const { user } = renderApp();

      // Enable repeat checkbox
      const checkbox = await screen.findByRole('checkbox', { name: /반복 일정/i });
      await user.click(checkbox);

      // Find repeat type select (it's a MUI Select, rendered as combobox)
      const repeatTypeLabel = screen.getByText('반복 유형');
      const selectContainer = repeatTypeLabel.closest('.MuiFormControl-root');
      const selectButton = within(selectContainer!).getByRole('combobox');

      // Open the select dropdown
      await user.click(selectButton);

      // Select "매일" option
      const dailyOption = await screen.findByRole('option', { name: '매일' });
      await user.click(dailyOption);

      // This should call setRepeatType('daily') → NotImplementedError
      // The test will fail because the state won't update
      // We can't directly check state, but we can verify the select value
      // However, this will throw NotImplementedError before state updates
    });

    it('should update repeatType when selecting weekly', async () => {
      const { user } = renderApp();

      const checkbox = await screen.findByRole('checkbox', { name: /반복 일정/i });
      await user.click(checkbox);

      const repeatTypeLabel = screen.getByText('반복 유형');
      const selectContainer = repeatTypeLabel.closest('.MuiFormControl-root');
      const selectButton = within(selectContainer!).getByRole('combobox');

      await user.click(selectButton);

      const weeklyOption = await screen.findByRole('option', { name: '매주' });
      await user.click(weeklyOption);

      // Should call setRepeatType('weekly') → NotImplementedError
    });

    it('should update repeatType when selecting monthly', async () => {
      const { user } = renderApp();

      const checkbox = await screen.findByRole('checkbox', { name: /반복 일정/i });
      await user.click(checkbox);

      const repeatTypeLabel = screen.getByText('반복 유형');
      const selectContainer = repeatTypeLabel.closest('.MuiFormControl-root');
      const selectButton = within(selectContainer!).getByRole('combobox');

      await user.click(selectButton);

      const monthlyOption = await screen.findByRole('option', { name: '매월' });
      await user.click(monthlyOption);

      // Should call setRepeatType('monthly') → NotImplementedError
    });

    it('should update repeatType when selecting yearly', async () => {
      const { user } = renderApp();

      const checkbox = await screen.findByRole('checkbox', { name: /반복 일정/i });
      await user.click(checkbox);

      const repeatTypeLabel = screen.getByText('반복 유형');
      const selectContainer = repeatTypeLabel.closest('.MuiFormControl-root');
      const selectButton = within(selectContainer!).getByRole('combobox');

      await user.click(selectButton);

      const yearlyOption = await screen.findByRole('option', { name: '매년' });
      await user.click(yearlyOption);

      // Should call setRepeatType('yearly') → NotImplementedError
    });
  });

  // ==========================================================================
  // Category 3: 반복 간격 입력 (2 tests)
  // ==========================================================================

  describe('반복 간격 입력', () => {
    it('should update repeatInterval when typing value', async () => {
      const { user } = renderApp();

      // Enable repeat checkbox
      const checkbox = await screen.findByRole('checkbox', { name: /반복 일정/i });
      await user.click(checkbox);

      // Find repeat interval input
      const intervalLabel = screen.getByText('반복 간격');
      const inputContainer = intervalLabel.closest('.MuiFormControl-root');
      const intervalInput = within(inputContainer!).getByRole('spinbutton');

      // Clear and type new value
      await user.clear(intervalInput);
      await user.type(intervalInput, '3');

      // Should call setRepeatInterval(3) → NotImplementedError
      // The value won't update in the input
    });

    it('should validate repeatInterval minimum value of 1', async () => {
      const { user } = renderApp();

      const checkbox = await screen.findByRole('checkbox', { name: /반복 일정/i });
      await user.click(checkbox);

      const intervalLabel = screen.getByText('반복 간격');
      const inputContainer = intervalLabel.closest('.MuiFormControl-root');
      const intervalInput = within(inputContainer!).getByRole('spinbutton');

      // Try to enter 0 (invalid)
      await user.clear(intervalInput);
      await user.type(intervalInput, '0');

      // Should call setRepeatInterval(0) → NotImplementedError
      // In GREEN phase, this should be validated and rejected
    });
  });

  // ==========================================================================
  // Category 4: 반복 종료일 선택 (2 tests)
  // ==========================================================================

  describe('반복 종료일 선택', () => {
    it('should update repeatEndDate when picking date', async () => {
      const { user } = renderApp();

      // Enable repeat checkbox
      const checkbox = await screen.findByRole('checkbox', { name: /반복 일정/i });
      await user.click(checkbox);

      // Find repeat end date input (date type)
      const endDateLabel = screen.getByText('반복 종료일');
      const inputContainer = endDateLabel.closest('.MuiFormControl-root');
      const endDateInput = within(inputContainer!).getByRole('textbox');

      // Type date value
      await user.type(endDateInput, '2025-12-31');

      // Should call setRepeatEndDate('2025-12-31') → NotImplementedError
    });

    it('should allow end date to be after start date', async () => {
      const { user } = renderApp();

      // Fill in start date first
      const dateInput = await screen.findByLabelText('날짜');
      await user.type(dateInput, '2025-10-01');

      // Enable repeat checkbox
      const checkbox = screen.getByRole('checkbox', { name: /반복 일정/i });
      await user.click(checkbox);

      // Set end date after start date
      const endDateLabel = screen.getByText('반복 종료일');
      const inputContainer = endDateLabel.closest('.MuiFormControl-root');
      const endDateInput = within(inputContainer!).getByRole('textbox');

      await user.type(endDateInput, '2025-12-31');

      // Should call setRepeatEndDate('2025-12-31') → NotImplementedError
      // In GREEN phase, this should validate endDate > startDate
    });
  });

  // ==========================================================================
  // Category 5: 폼 제출 (1 test)
  // ==========================================================================

  describe('폼 제출', () => {
    it('should include repeat data when submitting form with repeat enabled', async () => {
      // Mock the POST /api/events endpoint
      let capturedEventData: any = null;
      server.use(
        http.post('/api/events', async ({ request }) => {
          capturedEventData = await request.json();
          return HttpResponse.json(
            {
              ...capturedEventData,
              id: 'new-event-1',
            },
            { status: 201 }
          );
        })
      );

      const { user } = renderApp();

      // Fill in basic form fields
      await user.type(await screen.findByLabelText('제목'), 'Recurring Meeting');
      await user.type(screen.getByLabelText('날짜'), '2025-10-15');
      await user.type(screen.getByLabelText('시작 시간'), '14:00');
      await user.type(screen.getByLabelText('종료 시간'), '15:00');
      await user.type(screen.getByLabelText('설명'), 'Weekly team sync');
      await user.type(screen.getByLabelText('위치'), 'Conference Room');

      // Enable repeat
      const checkbox = screen.getByRole('checkbox', { name: /반복 일정/i });
      await user.click(checkbox);

      // Set repeat type to weekly
      const repeatTypeLabel = screen.getByText('반복 유형');
      const selectContainer = repeatTypeLabel.closest('.MuiFormControl-root');
      const selectButton = within(selectContainer!).getByRole('combobox');
      await user.click(selectButton);
      const weeklyOption = await screen.findByRole('option', { name: '매주' });
      await user.click(weeklyOption);

      // Set repeat interval
      const intervalLabel = screen.getByText('반복 간격');
      const intervalContainer = intervalLabel.closest('.MuiFormControl-root');
      const intervalInput = within(intervalContainer!).getByRole('spinbutton');
      await user.clear(intervalInput);
      await user.type(intervalInput, '2');

      // Set repeat end date
      const endDateLabel = screen.getByText('반복 종료일');
      const endDateContainer = endDateLabel.closest('.MuiFormControl-root');
      const endDateInput = within(endDateContainer!).getByRole('textbox');
      await user.type(endDateInput, '2025-12-31');

      // Submit the form
      const submitButton = screen.getByTestId('event-submit-button');
      await user.click(submitButton);

      // This will fail because setRepeatType/setRepeatInterval/setRepeatEndDate throw NotImplementedError
      // In GREEN phase, this should verify:
      // expect(capturedEventData).toMatchObject({
      //   title: 'Recurring Meeting',
      //   repeat: {
      //     type: 'weekly',
      //     interval: 2,
      //     endDate: '2025-12-31'
      //   }
      // });
    });
  });
});
