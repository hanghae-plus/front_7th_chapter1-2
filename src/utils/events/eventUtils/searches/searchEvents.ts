// Returns events that match the search term in title, description, or location
// 제목, 설명 또는 위치에서 검색어와 일치하는 일정을 반환합니다.

import { EventProps } from '@/types/events/Event.types';
import { containsTerm } from '@/utils/events/eventUtils/searches/containsTerm';

export function searchEvents(events: EventProps[], term: string) {
  return events.filter(
    ({ title, description, location }) =>
      containsTerm(title, term) ||
      containsTerm(description, term) ||
      containsTerm(location, term)
  );
}
