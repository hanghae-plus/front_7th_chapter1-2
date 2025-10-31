import { Event, RepeatInfo } from '../types';

const MAX_END_DATE = '2025-12-31';

export function generateRecurringEvents(baseEvent: Event, repeatInfo: RepeatInfo): Event[] {
  if (repeatInfo.type === 'none' || !repeatInfo.type || repeatInfo.type === 'invalid') {
    return [baseEvent];
  }

  const startDate = new Date(baseEvent.date);
  let endDate = repeatInfo.endDate ? new Date(repeatInfo.endDate) : new Date(MAX_END_DATE);

  if (endDate > new Date(MAX_END_DATE)) {
    endDate = new Date(MAX_END_DATE);
  }

  const events: Event[] = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const eventId = generateRecurringEventId(baseEvent.id, dateStr);

    events.push({
      ...baseEvent,
      id: eventId,
      date: dateStr,
    });

    currentDate = getNextDate(currentDate, repeatInfo.type, startDate, repeatInfo.interval || 1);

    if (currentDate > endDate) {
      break;
    }
  }

  return events;
}

function getNextDate(
  currentDate: Date,
  repeatType: string,
  startDate: Date,
  interval: number = 1
): Date {
  const nextDate = new Date(currentDate);

  switch (repeatType) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + interval);
      break;

    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7 * interval);
      break;

    case 'monthly': {
      const targetDay = startDate.getDate();
      nextDate.setMonth(nextDate.getMonth() + interval);
      nextDate.setDate(1);

      const daysInMonth = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();

      if (targetDay <= daysInMonth) {
        nextDate.setDate(targetDay);
      } else {
        nextDate.setMonth(nextDate.getMonth() + 1);
        nextDate.setDate(1);
        return getNextDate(nextDate, repeatType, startDate, interval);
      }
      break;
    }

    case 'yearly': {
      const targetMonth = startDate.getMonth();
      const targetDay = startDate.getDate();

      let yearToCheck = nextDate.getFullYear() + interval;
      const maxYear = 2025;

      while (yearToCheck <= maxYear) {
        const testDate = new Date(yearToCheck, targetMonth + 1, 0);
        const daysInMonth = testDate.getDate();

        if (targetDay <= daysInMonth) {
          nextDate.setFullYear(yearToCheck);
          nextDate.setMonth(targetMonth);
          nextDate.setDate(targetDay);
          return nextDate;
        }

        yearToCheck += interval;
      }

      nextDate.setFullYear(maxYear + 1);
      break;
    }

    default:
      nextDate.setDate(nextDate.getDate() + interval);
  }

  return nextDate;
}

export function generateRecurringEventId(originalId: string, date: string): string {
  return `${originalId}_${date}`;
}

export function isLeapYear(year: number): boolean {
  if (year % 400 === 0) {
    return true;
  }
  if (year % 100 === 0) {
    return false;
  }
  if (year % 4 === 0) {
    return true;
  }
  return false;
}

export function hasDay31InMonth(month: number): boolean {
  const monthsWith31Days = [1, 3, 5, 7, 8, 10, 12];
  return monthsWith31Days.includes(month);
}
