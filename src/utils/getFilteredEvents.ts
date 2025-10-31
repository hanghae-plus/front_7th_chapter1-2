// Returns filtered events based on search term and current view (week or month)
// 검색어와 현재 뷰(주간 또는 월간)를 기반으로 필터링된 일정을 반환합니다.

import { EventProps } from '@/types/events/Event.types';
import { filterByDateRangeAtMonth as filterEventsByDateRangeAtMonth } from '@/utils/events/eventUtils/filters/filterByDateRangeAtMonth';
import { filterByDateRangeAtWeek as filterEventsByDateRangeAtWeek } from '@/utils/events/eventUtils/filters/filterByDateRangeAtWeek';
import { searchEvents } from '@/utils/events/eventUtils/searches/searchEvents';

export function getFilteredEvents(
  events: EventProps[],
  searchTerm: string,
  currentDate: Date,
  view: 'week' | 'month'
): EventProps[] {
  const searchedEvents = searchEvents(events, searchTerm);

  if (view === 'week') {
    return filterEventsByDateRangeAtWeek(searchedEvents, currentDate);
  }

  if (view === 'month') {
    return filterEventsByDateRangeAtMonth(searchedEvents, currentDate);
  }

  return searchedEvents;
}
