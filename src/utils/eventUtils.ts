import { Event, EventForm } from '../types';
import { getWeekDates, isDateInRange, getDaysInMonth, formatDate, isLeapYear } from './dateUtils';

function filterEventsByDateRange(events: Event[], start: Date, end: Date): Event[] {
  return events.filter((event) => {
    const eventDate = new Date(event.date);
    return isDateInRange(eventDate, start, end);
  });
}

function containsTerm(target: string, term: string) {
  return target.toLowerCase().includes(term.toLowerCase());
}

function searchEvents(events: Event[], term: string) {
  return events.filter(
    ({ title, description, location }) =>
      containsTerm(title, term) || containsTerm(description, term) || containsTerm(location, term)
  );
}

function filterEventsByDateRangeAtWeek(events: Event[], currentDate: Date) {
  const weekDates = getWeekDates(currentDate);
  return filterEventsByDateRange(events, weekDates[0], weekDates[6]);
}

function filterEventsByDateRangeAtMonth(events: Event[], currentDate: Date) {
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
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

export function getFilteredEvents(
  events: Event[],
  searchTerm: string,
  currentDate: Date,
  view: 'week' | 'month'
): Event[] {
  const searchedEvents = searchEvents(events, searchTerm);

  if (view === 'week') {
    return filterEventsByDateRangeAtWeek(searchedEvents, currentDate);
  }

  if (view === 'month') {
    return filterEventsByDateRangeAtMonth(searchedEvents, currentDate);
  }

  return searchedEvents;
}

/**
 * 반복 이벤트 설정에 따라 여러 이벤트 인스턴스를 생성합니다.
 */
export function generateRecurringEvents(eventForm: EventForm): Event[] {
  const events: Event[] = [];
  const repeatId = crypto.randomUUID();

  const startDate = new Date(eventForm.date);
  const endDate = eventForm.repeat.endDate ? new Date(eventForm.repeat.endDate) : startDate;

  const targetDay = startDate.getDate();
  const targetMonth = startDate.getMonth();

  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    let shouldCreateEvent = true;

    // Monthly repetition: check if the day exists in the target month
    if (eventForm.repeat.type === 'monthly') {
      const daysInCurrentMonth = getDaysInMonth(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1
      );

      if (targetDay > daysInCurrentMonth) {
        shouldCreateEvent = false;
      } else {
        // Set the correct day for monthly repetition
        currentDate.setDate(targetDay);
      }
    }

    // Yearly repetition on Feb 29: only create in leap years
    if (eventForm.repeat.type === 'yearly') {
      if (targetMonth === 1 && targetDay === 29) {
        if (!isLeapYear(currentDate.getFullYear())) {
          shouldCreateEvent = false;
        }
      }
    }

    if (shouldCreateEvent) {
      const event: Event = {
        ...eventForm,
        id: crypto.randomUUID(),
        date: formatDate(currentDate),
        repeat: {
          ...eventForm.repeat,
          id: repeatId,
        },
      };
      events.push(event);
    }

    // Increment date based on repeat type
    if (eventForm.repeat.type === 'daily') {
      currentDate.setDate(currentDate.getDate() + eventForm.repeat.interval);
    } else if (eventForm.repeat.type === 'weekly') {
      currentDate.setDate(currentDate.getDate() + 7 * eventForm.repeat.interval);
    } else if (eventForm.repeat.type === 'monthly') {
      // For monthly repetition, move to next month first
      currentDate.setMonth(currentDate.getMonth() + eventForm.repeat.interval);
      // Reset to target day (will be validated in next iteration)
      currentDate.setDate(1);
    } else if (eventForm.repeat.type === 'yearly') {
      currentDate.setFullYear(currentDate.getFullYear() + eventForm.repeat.interval);
      // Reset to target month and day (important for Feb 29 edge case)
      currentDate.setMonth(targetMonth);
      currentDate.setDate(targetDay);
    }
  }

  return events;
}
