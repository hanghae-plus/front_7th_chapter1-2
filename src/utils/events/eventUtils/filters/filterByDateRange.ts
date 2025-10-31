// Returns events that fall within the specified date range
// 지정된 날짜 범위 내에 속하는 일정을 반환합니다.

import { EventProps } from '@/types/events/Event.types';
import { isDateInRange } from '@/utils/dateUtils';

// 더 나은 이름 제안 환영합니다🥹
export function filterByDateRange(
  events: EventProps[],
  start: Date,
  end: Date
): EventProps[] {
  return events.filter((event) => {
    const eventDate = new Date(event.date);
    return isDateInRange(eventDate, start, end);
  });
}
