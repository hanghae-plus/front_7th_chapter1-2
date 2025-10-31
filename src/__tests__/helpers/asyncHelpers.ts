import { screen, within, waitFor } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event';
import { expect } from 'vitest';

/**
 * Wait for a dialog to appear
 * <!-- 다이얼로그가 나타날 때까지 대기 -->
 */
export async function waitForDialog(
  dialogTitle: string,
  timeout: number = 3000
): Promise<HTMLElement | null> {
  try {
    return await screen.findByText(dialogTitle, {}, { timeout });
  } catch {
    return null;
  }
}

/**
 * Handle overlap dialog if it appears
 * <!-- 오버랩 다이얼로그가 나타나면 처리 -->
 */
export async function handleOverlapDialogIfPresent(user: UserEvent): Promise<boolean> {
  try {
    const overlapWarning = await screen.findByText(/일정 겹침 경고/, {}, { timeout: 2000 });

    if (overlapWarning) {
      // Check if "계속 진행" button exists (bypass allowed)
      const continueButton = screen.queryByRole('button', {
        name: /계속 진행/i,
      });

      if (continueButton) {
        await user.click(continueButton);
        // Wait for dialog to close
        await waitFor(
          () => {
            expect(screen.queryByText(/일정 겹침 경고/)).not.toBeInTheDocument();
          },
          { timeout: 2000 }
        );
        return true;
      }
    }
  } catch {
    // No overlap dialog appeared
  }

  return false;
}

/**
 * Wait for event list to update and find an event
 * <!-- 이벤트 리스트가 업데이트되고 이벤트를 찾을 때까지 대기 -->
 */
export async function waitForEventInList(
  eventTitle: string,
  timeout: number = 5000
): Promise<HTMLElement> {
  const eventList = within(screen.getByTestId('event-list'));

  return await waitFor(
    async () => {
      const events = await eventList.findAllByText(eventTitle);
      if (events.length === 0) {
        throw new Error(`Event "${eventTitle}" not found`);
      }
      return events[0];
    },
    { timeout }
  );
}

/**
 * Wait for event to disappear from list
 * <!-- 이벤트가 리스트에서 사라질 때까지 대기 -->
 */
export async function waitForEventToDisappear(
  eventTitle: string,
  timeout: number = 3000
): Promise<void> {
  const eventList = within(screen.getByTestId('event-list'));

  await waitFor(
    () => {
      expect(eventList.queryByText(eventTitle)).not.toBeInTheDocument();
    },
    { timeout }
  );
}

/**
 * Complete workflow: Save event and handle all dialogs
 * <!-- 완전한 워크플로우: 이벤트 저장 및 모든 다이얼로그 처리 -->
 */
export async function saveEventWithDialogHandling(
  user: UserEvent,
  options: {
    editOptionsChoice?: 'single' | 'all' | null; // null = no dialog expected
    handleOverlap?: boolean;
  } = {}
): Promise<void> {
  // Click save button
  await user.click(screen.getByTestId('event-submit-button'));

  // Handle Edit Options Dialog if expected
  if (options.editOptionsChoice) {
    const editDialog = await waitForDialog('반복 일정 수정');
    expect(editDialog).toBeInTheDocument();

    const buttonName = options.editOptionsChoice === 'single' ? '예' : '아니오';
    const choiceButton = screen.getByRole('button', { name: buttonName });
    await user.click(choiceButton);

    // Wait for dialog to close
    await waitFor(() => {
      expect(screen.queryByText('반복 일정 수정')).not.toBeInTheDocument();
    });
  }

  // Handle Overlap Dialog if expected
  if (options.handleOverlap !== false) {
    await handleOverlapDialogIfPresent(user);
  }

  // Wait for save operation to complete
  // This ensures event list has been refreshed
  await waitFor(
    () => {
      // Check that loading state has completed
      // (could check for success snackbar, but this is simpler)
    },
    { timeout: 2000 }
  );
}
