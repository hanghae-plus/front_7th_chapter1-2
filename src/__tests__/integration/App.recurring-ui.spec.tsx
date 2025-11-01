/**
 * TDD-CYCLE-2: Recurring Event UI Integration Tests
 *
 * Feature: 반복 일정 UI 기능
 * - Icon display for recurring events
 * - Edit confirmation modal
 * - Delete confirmation modal
 *
 * Status: GREEN (Tests should PASS with implementation)
 */

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';
import { describe, it, expect, beforeEach } from 'vitest';

import App from '../../App';
import { server } from '../../setupTests';

const theme = createTheme();

// Helper function to render App with required providers
const renderApp = () => {
  return render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider>
        <App />
      </SnackbarProvider>
    </ThemeProvider>
  );
};

// ============================================================================
// Test Suite
// ============================================================================

describe('TDD-CYCLE-2: Recurring Event UI', () => {
  beforeEach(() => {
    // Reset server handlers before each test
    server.resetHandlers();
  });

  // ==========================================================================
  // Category 1: Icon Display (3 tests)
  // ==========================================================================

  describe('Icon Display', () => {
    it('should show Repeat icon for recurring events', async () => {
      // Mock API response with a recurring event
      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({
            events: [
              {
                id: 'recurring-1',
                title: 'Team Meeting',
                date: '2025-10-04',
                startTime: '10:00',
                endTime: '11:00',
                description: 'Weekly team sync',
                location: 'Office',
                category: '업무',
                repeat: { type: 'weekly', interval: 1 },
                notificationTime: 10,
              },
            ],
          });
        })
      );

      renderApp();

      // Wait for the event to be rendered in the list first
      const eventItem = await screen.findByTestId('event-recurring-1', {}, { timeout: 5000 });
      expect(eventItem).toBeInTheDocument();

      // Check that Repeat icon exists (should be multiple - week view, month view, event list)
      const icons = await screen.findAllByTestId('repeat-icon-recurring-1', {}, { timeout: 3000 });
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should NOT show icon for non-recurring events', async () => {
      // Mock API response with a non-recurring event
      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({
            events: [
              {
                id: 'single-1',
                title: 'Lunch',
                date: '2025-10-05',
                startTime: '12:00',
                endTime: '13:00',
                description: 'Lunch with client',
                location: 'Restaurant',
                category: '개인',
                repeat: { type: 'none', interval: 0 },
                notificationTime: 10,
              },
            ],
          });
        })
      );

      renderApp();

      // Wait for event list to render
      await screen.findByTestId('event-list', {}, { timeout: 3000 });

      // Check that NO Repeat icon exists (check with the event ID pattern)
      const icons = screen.queryAllByTestId(/repeat-icon-.+/);
      expect(icons).toHaveLength(0);
    });

    it('should render icon in event list', async () => {
      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({
            events: [
              {
                id: 'recurring-1',
                title: 'Daily Standup',
                date: '2025-10-04',
                startTime: '09:00',
                endTime: '09:15',
                description: 'Morning standup',
                location: 'Office',
                category: '업무',
                repeat: { type: 'daily', interval: 1 },
                notificationTime: 10,
              },
            ],
          });
        })
      );

      renderApp();

      // Wait for the event to be rendered
      const eventItem = await screen.findByTestId('event-recurring-1', {}, { timeout: 5000 });
      expect(eventItem).toBeInTheDocument();

      // Find icons
      const icons = await screen.findAllByTestId('repeat-icon-recurring-1', {}, { timeout: 3000 });
      expect(icons.length).toBeGreaterThan(0);

      // Find event list
      const eventList = screen.getByTestId('event-list');
      expect(eventList).toBeInTheDocument();

      // At least one icon should be in event list
      const iconsInList = within(eventList).queryAllByTestId('repeat-icon-recurring-1');
      expect(iconsInList.length).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // Category 2: Edit Modal (5 tests)
  // ==========================================================================

  describe('Edit Modal', () => {
    it('should show modal when editing recurring event', async () => {
      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({
            events: [
              {
                id: 'recurring-1',
                title: 'Team Meeting',
                date: '2025-10-04',
                startTime: '10:00',
                endTime: '11:00',
                description: 'Weekly sync',
                location: 'Office',
                category: '업무',
                repeat: { type: 'weekly', interval: 1 },
                notificationTime: 10,
              },
            ],
          });
        })
      );

      renderApp();

      // Wait for the event to be rendered
      const eventItem = await screen.findByTestId('event-recurring-1', {}, { timeout: 5000 });
      expect(eventItem).toBeInTheDocument();

      // Find and click Edit button
      const editButton = await screen.findByLabelText('Edit event', {}, { timeout: 3000 });
      editButton.click();

      // Modal should appear
      const modal = await screen.findByText('해당 일정만 수정하시겠어요?', {}, { timeout: 3000 });
      expect(modal).toBeInTheDocument();

      // Check buttons exist
      expect(screen.getByRole('button', { name: '예' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '아니오' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
    });

    it('should NOT show modal for non-recurring event edit', async () => {
      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({
            events: [
              {
                id: 'single-1',
                title: 'Lunch',
                date: '2025-10-05',
                startTime: '12:00',
                endTime: '13:00',
                description: '',
                location: '',
                category: '개인',
                repeat: { type: 'none', interval: 0 },
                notificationTime: 10,
              },
            ],
          });
        })
      );

      renderApp();

      // Wait for the event to be rendered
      const eventItem = await screen.findByTestId('event-single-1', {}, { timeout: 5000 });
      expect(eventItem).toBeInTheDocument();

      // Find and click Edit button
      const editButton = await screen.findByLabelText('Edit event', {}, { timeout: 3000 });
      editButton.click();

      // Wait for any potential modal
      await waitFor(
        () => {
          expect(screen.queryByText('해당 일정만 수정하시겠어요?')).not.toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });

    it('should close modal when "취소" is clicked', async () => {
      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({
            events: [
              {
                id: 'recurring-1',
                title: 'Team Meeting',
                date: '2025-10-04',
                startTime: '10:00',
                endTime: '11:00',
                description: '',
                location: '',
                category: '업무',
                repeat: { type: 'weekly', interval: 1 },
                notificationTime: 10,
              },
            ],
          });
        })
      );

      renderApp();

      // Wait for the event to be rendered
      const eventItem = await screen.findByTestId('event-recurring-1', {}, { timeout: 5000 });
      expect(eventItem).toBeInTheDocument();

      // Open edit modal
      const editButton = await screen.findByLabelText('Edit event', {}, { timeout: 3000 });
      editButton.click();

      const modal = await screen.findByText('해당 일정만 수정하시겠어요?', {}, { timeout: 3000 });
      expect(modal).toBeInTheDocument();

      // Click cancel button
      const cancelButton = screen.getByRole('button', { name: '취소' });
      cancelButton.click();

      // Modal should close
      await waitFor(() => {
        expect(screen.queryByText('해당 일정만 수정하시겠어요?')).not.toBeInTheDocument();
      });
    });

    it('should handle "예" button click (single edit)', async () => {
      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({
            events: [
              {
                id: 'recurring-1',
                title: 'Team Meeting',
                date: '2025-10-04',
                startTime: '10:00',
                endTime: '11:00',
                description: '',
                location: '',
                category: '업무',
                repeat: { type: 'weekly', interval: 1 },
                notificationTime: 10,
              },
            ],
          });
        })
      );

      renderApp();

      // Wait for the event to be rendered
      const eventItem = await screen.findByTestId('event-recurring-1', {}, { timeout: 5000 });
      expect(eventItem).toBeInTheDocument();

      // Open edit modal
      const editButton = await screen.findByLabelText('Edit event', {}, { timeout: 3000 });
      editButton.click();

      await screen.findByText('해당 일정만 수정하시겠어요?', {}, { timeout: 3000 });

      // Click "예" button
      const yesButton = screen.getByRole('button', { name: '예' });
      yesButton.click();

      // Modal should close
      await waitFor(() => {
        expect(screen.queryByText('해당 일정만 수정하시겠어요?')).not.toBeInTheDocument();
      });
    });

    it('should handle "아니오" button click (series edit)', async () => {
      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({
            events: [
              {
                id: 'recurring-1',
                title: 'Team Meeting',
                date: '2025-10-04',
                startTime: '10:00',
                endTime: '11:00',
                description: '',
                location: '',
                category: '업무',
                repeat: { type: 'weekly', interval: 1 },
                notificationTime: 10,
              },
            ],
          });
        })
      );

      renderApp();

      // Wait for the event to be rendered
      const eventItem = await screen.findByTestId('event-recurring-1', {}, { timeout: 5000 });
      expect(eventItem).toBeInTheDocument();

      // Open edit modal
      const editButton = await screen.findByLabelText('Edit event', {}, { timeout: 3000 });
      editButton.click();

      await screen.findByText('해당 일정만 수정하시겠어요?', {}, { timeout: 3000 });

      // Click "아니오" button
      const noButton = screen.getByRole('button', { name: '아니오' });
      noButton.click();

      // Modal should close
      await waitFor(() => {
        expect(screen.queryByText('해당 일정만 수정하시겠어요?')).not.toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // Category 3: Delete Modal (4 tests)
  // ==========================================================================

  describe('Delete Modal', () => {
    it('should show modal when deleting recurring event', async () => {
      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({
            events: [
              {
                id: 'recurring-1',
                title: 'Team Meeting',
                date: '2025-10-04',
                startTime: '10:00',
                endTime: '11:00',
                description: '',
                location: '',
                category: '업무',
                repeat: { type: 'weekly', interval: 1 },
                notificationTime: 10,
              },
            ],
          });
        })
      );

      renderApp();

      // Wait for the event to be rendered
      const eventItem = await screen.findByTestId('event-recurring-1', {}, { timeout: 5000 });
      expect(eventItem).toBeInTheDocument();

      // Find and click Delete button
      const deleteButton = await screen.findByLabelText('Delete event', {}, { timeout: 3000 });
      deleteButton.click();

      // Modal should appear
      const modal = await screen.findByText('해당 일정만 삭제하시겠어요?', {}, { timeout: 3000 });
      expect(modal).toBeInTheDocument();

      // Check buttons exist
      expect(screen.getByRole('button', { name: '예' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '아니오' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
    });

    it('should NOT show modal for non-recurring event delete', async () => {
      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({
            events: [
              {
                id: 'single-1',
                title: 'Lunch',
                date: '2025-10-05',
                startTime: '12:00',
                endTime: '13:00',
                description: '',
                location: '',
                category: '개인',
                repeat: { type: 'none', interval: 0 },
                notificationTime: 10,
              },
            ],
          });
        }),
        http.delete('/api/events/single-1', () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      renderApp();

      // Wait for the event to be rendered
      const eventItem = await screen.findByTestId('event-single-1', {}, { timeout: 5000 });
      expect(eventItem).toBeInTheDocument();

      // Find and click Delete button
      const deleteButton = await screen.findByLabelText('Delete event', {}, { timeout: 3000 });
      deleteButton.click();

      // Wait and verify modal does NOT appear
      await waitFor(
        () => {
          expect(screen.queryByText('해당 일정만 삭제하시겠어요?')).not.toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });

    it('should close modal when "취소" is clicked', async () => {
      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({
            events: [
              {
                id: 'recurring-1',
                title: 'Team Meeting',
                date: '2025-10-04',
                startTime: '10:00',
                endTime: '11:00',
                description: '',
                location: '',
                category: '업무',
                repeat: { type: 'weekly', interval: 1 },
                notificationTime: 10,
              },
            ],
          });
        })
      );

      renderApp();

      // Wait for the event to be rendered
      const eventItem = await screen.findByTestId('event-recurring-1', {}, { timeout: 5000 });
      expect(eventItem).toBeInTheDocument();

      // Open delete modal
      const deleteButton = await screen.findByLabelText('Delete event', {}, { timeout: 3000 });
      deleteButton.click();

      const modal = await screen.findByText('해당 일정만 삭제하시겠어요?', {}, { timeout: 3000 });
      expect(modal).toBeInTheDocument();

      // Click cancel button
      const cancelButton = screen.getByRole('button', { name: '취소' });
      cancelButton.click();

      // Modal should close
      await waitFor(() => {
        expect(screen.queryByText('해당 일정만 삭제하시겠어요?')).not.toBeInTheDocument();
      });
    });

    it('should display correct delete modal message', async () => {
      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({
            events: [
              {
                id: 'recurring-1',
                title: 'Team Meeting',
                date: '2025-10-04',
                startTime: '10:00',
                endTime: '11:00',
                description: '',
                location: '',
                category: '업무',
                repeat: { type: 'weekly', interval: 1 },
                notificationTime: 10,
              },
            ],
          });
        })
      );

      renderApp();

      // Wait for the event to be rendered
      const eventItem = await screen.findByTestId('event-recurring-1', {}, { timeout: 5000 });
      expect(eventItem).toBeInTheDocument();

      // Open delete modal
      const deleteButton = await screen.findByLabelText('Delete event', {}, { timeout: 3000 });
      deleteButton.click();

      // Check correct message
      const message = await screen.findByText('해당 일정만 삭제하시겠어요?', {}, { timeout: 3000 });
      expect(message).toBeInTheDocument();
    });
  });
});
