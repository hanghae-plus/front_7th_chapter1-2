// Recurring events generation utility
import { calculateNextOccurrenceFromStart } from './calculateNextOccurrenceFromStart';
import { getMaxEndDate } from './getMaxEndDate';
import { shouldSkipRecurringDate } from './shouldSkipRecurringDate';

import { RepeatInfo } from '@/types/recurring/RepeatInfo.types';

const MAX_EVENTS = 1000; // 무한 루프 방지

export function generateRecurringEvents(
  startDate: Date,
  repeatInfo: RepeatInfo
): Date[] {
  if (!startDate || !repeatInfo) return [];

  const endDate = repeatInfo.endDate || getMaxEndDate();
  if (startDate > endDate) return [];

  const events: Date[] = [new Date(startDate)];
  const originalDay = startDate.getDate();
  const originalMonth = startDate.getMonth();

  let count = 0;
  let multiplier = 1;

  while (count < MAX_EVENTS) {
    try {
      const nextDate = calculateNextOccurrenceFromStart(
        startDate,
        repeatInfo.type,
        repeatInfo.interval * multiplier
      );

      if (nextDate > endDate) break;

      if (
        shouldSkipRecurringDate(
          originalDay,
          originalMonth,
          nextDate,
          repeatInfo.type
        )
      ) {
        multiplier++;
        count++;
        continue;
      }

      events.push(new Date(nextDate));
      multiplier++;
      count++;
    } catch {
      break;
    }
  }

  return events;
}
