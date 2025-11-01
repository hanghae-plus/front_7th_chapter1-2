import { Event, EventForm } from '../types';

export function parseDateTime(date: string, time: string) {
  return new Date(`${date}T${time}`);
}

export function convertEventToDateRange({ date, startTime, endTime }: Event | EventForm) {
  return {
    start: parseDateTime(date, startTime),
    end: parseDateTime(date, endTime),
  };
}

export function isOverlapping(event1: Event | EventForm, event2: Event | EventForm) {
  const { start: start1, end: end1 } = convertEventToDateRange(event1);
  const { start: start2, end: end2 } = convertEventToDateRange(event2);

  return start1 < end2 && start2 < end1;
}

export function findOverlappingEvents(newEvent: Event | EventForm, events: Event[]) {
  if (newEvent.repeat.type !== 'none') {
    return [];
  }

  const newEventId = (newEvent as Event).id;

  return events.filter(
    (event) =>
      event.repeat.type === 'none' && event.id !== newEventId && isOverlapping(event, newEvent)
  );
}
