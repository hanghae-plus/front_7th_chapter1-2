// Returns events that occur on the specified day of the month.
// 지정된 월의 특정 일에 발생하는 이벤트를 반환합니다.

import { EventProps } from '@/types/events/Event.types';

export function getEventsForDay(
  events: EventProps[],
  date: number
): EventProps[] {
  return events.filter((event) => new Date(event.date).getDate() === date);
}
