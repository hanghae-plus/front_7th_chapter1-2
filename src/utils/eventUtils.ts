import { Event, EventForm } from '../types';
import { getWeekDates, isDateInRange } from './dateUtils';

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

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function isValidDate(year: number, month: number, day: number): boolean {
  const date = new Date(year, month, day);
  return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day;
}

export function generateRecurringDates(
  startDate: string,
  repeatType: 'daily' | 'weekly' | 'monthly' | 'yearly',
  interval: number,
  endDate?: string
): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date('2025-12-31');

  let current = new Date(start);

  while (current <= end) {
    const dateString = current.toISOString().split('T')[0];
    dates.push(dateString);

    switch (repeatType) {
      case 'daily':
        current.setDate(current.getDate() + interval);
        break;
      case 'weekly':
        current.setDate(current.getDate() + interval * 7);
        break;
      case 'monthly': {
        const startDay = start.getDate();
        let nextMonth = current.getMonth() + interval;
        let nextYear = current.getFullYear();

        while (nextMonth > 11) {
          nextMonth -= 12;
          nextYear += 1;
        }

        if (isValidDate(nextYear, nextMonth, startDay)) {
          current = new Date(nextYear, nextMonth, startDay);
        } else {
          current = new Date(nextYear, nextMonth + interval, startDay);
        }
        break;
      }
      case 'yearly': {
        const startDay = start.getDate();
        const startMonth = start.getMonth();
        let nextYear = current.getFullYear() + interval;

        if (startMonth === 1 && startDay === 29) {
          while (nextYear <= end.getFullYear() && !isLeapYear(nextYear)) {
            nextYear += interval;
          }
          if (nextYear > end.getFullYear()) {
            return dates;
          }
        }

        current = new Date(nextYear, startMonth, startDay);
        break;
      }
    }
  }

  return dates;
}

export function generateRecurringEvents(eventData: Event | EventForm): EventForm[] {
  if (eventData.repeat.type === 'none') {
    return [eventData as EventForm];
  }

  const dates = generateRecurringDates(
    eventData.date,
    eventData.repeat.type,
    eventData.repeat.interval,
    eventData.repeat.endDate
  );

  return dates.map((date) => ({
    ...eventData,
    id: undefined,
    date,
  }));
}
