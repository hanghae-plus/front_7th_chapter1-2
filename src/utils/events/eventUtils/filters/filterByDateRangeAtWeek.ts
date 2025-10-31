// Returns events within the week of the given date
// 주어진 날짜의 주간 범위 내의 이벤트를 반환합니다.

import { EventProps } from '@/types/events/Event.types';
import { getWeekDates } from '@/utils/dateUtils';
import { filterByDateRange as filterEventsByDateRange } from '@/utils/events/eventUtils/filters/filterByDateRange';

// 슬프게도 5단어 이상 조합을 유지해야 하는 상황입니다,, 더 나은 이름 제안 환영합니다🥹
export function filterByDateRangeAtWeek(
  events: EventProps[],
  currentDate: Date
) {
  const weekDates = getWeekDates(currentDate);
  return filterEventsByDateRange(events, weekDates[0], weekDates[6]);
}
