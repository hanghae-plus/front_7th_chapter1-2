import { screen, within } from '@testing-library/react';

/**
 * Find event box by title
 * <!-- 제목으로 이벤트 박스 찾기 -->
 */
export function findEventBoxByTitle(eventTitle: string): HTMLElement {
  const eventList = within(screen.getByTestId('event-list'));
  const titleElements = eventList.getAllByText(eventTitle);

  if (titleElements.length === 0) {
    throw new Error(`Event "${eventTitle}" not found`);
  }

  // Find the closest Box container
  const eventBox = titleElements[0].closest('.MuiBox-root');

  if (!eventBox) {
    throw new Error(`Event box for "${eventTitle}" not found`);
  }

  return eventBox as HTMLElement;
}

/**
 * Check if event has repeat icon
 * <!-- 이벤트에 반복 아이콘이 있는지 확인 -->
 */
export function hasRepeatIcon(eventTitle: string): boolean {
  try {
    const eventBox = findEventBoxByTitle(eventTitle);
    const icon = within(eventBox).queryByTestId('RepeatIcon');
    return icon !== null;
  } catch {
    return false;
  }
}

/**
 * Get edit button for specific event by index
 * <!-- 인덱스로 특정 이벤트의 수정 버튼 가져오기 -->
 */
export async function getEditButtonForEvent(eventIndex: number): Promise<HTMLElement> {
  const editButtons = await screen.findAllByLabelText('Edit event');

  if (eventIndex >= editButtons.length) {
    throw new Error(`Edit button at index ${eventIndex} not found`);
  }

  return editButtons[eventIndex];
}
