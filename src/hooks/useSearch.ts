import { useMemo, useState } from 'react';

import { Event } from '../types';
import { getWeekDates } from '../utils/dateUtils';
import { getFilteredEvents } from '../utils/eventUtils';
import { expandRecurringEvents } from '../utils/repeatUtils';

export const useSearch = (events: Event[], currentDate: Date, view: 'week' | 'month') => {
  const [searchTerm, setSearchTerm] = useState('');

  // For the right-hand side list: filter by search term AND date range
  const listEvents = useMemo(() => {
    return getFilteredEvents(events, searchTerm, currentDate, view);
  }, [events, searchTerm, currentDate, view]);

  // For the calendar views: expand the list events
  const calendarEvents = useMemo(() => {
    let rangeStart: Date;
    let rangeEnd: Date;

    if (view === 'week') {
      const weekDates = getWeekDates(currentDate);
      rangeStart = weekDates[0];
      rangeEnd = weekDates[6];
    } else {
      // month view
      rangeStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      rangeEnd = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );
    }

    return expandRecurringEvents(listEvents, rangeStart, rangeEnd);
  }, [listEvents, currentDate, view]);

  return {
    searchTerm,
    setSearchTerm,
    listEvents,
    calendarEvents,
  };
};
