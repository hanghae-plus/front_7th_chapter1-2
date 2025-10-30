import { Event } from '../types';
import { getWeekDates, isDateInRange, toISO8601Date } from './dateUtils';
import { generateOccurrences } from './repeatRuleGenerator';

// Removed obsolete range filter helpers; using a unified range computation instead

function containsTerm(target: string, term: string) {
  return target.toLowerCase().includes(term.toLowerCase());
}

function searchEvents(events: Event[], term: string) {
  return events.filter(
    ({ title, description, location }) =>
      containsTerm(title, term) || containsTerm(description, term) || containsTerm(location, term)
  );
}

// removed view-specific helpers; range is computed inline in getFilteredEvents

export function getFilteredEvents(
  events: Event[],
  searchTerm: string,
  currentDate: Date,
  view: 'week' | 'month'
): Event[] {
  const searchedEvents = searchEvents(events, searchTerm);

  // Determine visible range
  const [rangeStart, rangeEnd] = (() => {
    if (view === 'week') {
      const week = getWeekDates(currentDate);
      return [week[0], week[6]] as const;
    }
    if (view === 'month') {
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
      return [monthStart, monthEnd] as const;
    }
    return [new Date('1970-01-01'), new Date('2999-12-31')] as const;
  })();

  // Expand recurring events into occurrences within range
  const expanded: Event[] = [];
  for (const event of searchedEvents) {
    const isRecurring = event.repeat.type !== 'none';
    if (!isRecurring) {
      // Single event: include only if in range
      const eventDate = new Date(event.date);
      if (isDateInRange(eventDate, rangeStart, rangeEnd)) {
        expanded.push(event);
      }
      continue;
    }

    // Generate occurrences within a broad horizon, then filter to visible range
    const occurrences = generateOccurrences({
      ...event.repeat,
      startDate: event.date,
    });

    for (const occ of occurrences) {
      if (!isDateInRange(occ, rangeStart, rangeEnd)) continue;
      const occDate = toISO8601Date(occ);
      expanded.push({ ...event, date: occDate });
    }
  }

  return expanded;
}
