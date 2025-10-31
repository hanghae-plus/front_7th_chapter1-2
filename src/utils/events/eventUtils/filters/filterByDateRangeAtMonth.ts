// Returns events that fall within the specified date range
// 지정된 날짜의 월간 범위 내에 속하는 일정을 반환합니다.
import { EventProps } from '@/types/events/Event.types';
import { filterByDateRange as filterEventsByDateRange } from '@/utils/events/eventUtils/filters/filterByDateRange';

// 슬프게도 5단어 이상 조합을 유지해야 하는 상황입니다,, 더 나은 이름 제안 환영합니다🥹
export function filterByDateRangeAtMonth(
  events: EventProps[],
  currentDate: Date
) {
  const monthStart = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const monthEnd = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );
  return filterEventsByDateRange(events, monthStart, monthEnd);
}
