// Finds events that overlap with a given event
// 주어진 일정과 겹치는 일정을 찾습니다.

import { EventProps } from '@/types/events/Event.types';
import { EventFormProps } from '@/types/events/EventForm.types';
import { convertEventToDateRange } from '@/utils/events/eventUtils/converts/convertToDateRange';

export function isOverlapping(
  event1: EventProps | EventFormProps,
  event2: EventProps | EventFormProps
) {
  const { start: start1, end: end1 } = convertEventToDateRange(event1);
  const { start: start2, end: end2 } = convertEventToDateRange(event2);

  return start1 < end2 && start2 < end1;
}

export function findOverlappingEvents(
  newEvent: EventProps | EventFormProps,
  events: EventProps[]
) {
  return events.filter(
    (event) =>
      event.id !== (newEvent as EventProps).id && isOverlapping(event, newEvent)
  );
}
