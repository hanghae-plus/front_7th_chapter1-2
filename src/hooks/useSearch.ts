import { useMemo, useState } from 'react';

import { EventProps } from '@/types/events/Event.types';
import { getFilteredEvents } from '@/utils/getFilteredEvents';

export const useSearch = (
  events: EventProps[],
  currentDate: Date,
  view: 'week' | 'month'
) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEvents = useMemo(() => {
    return getFilteredEvents(events, searchTerm, currentDate, view);
  }, [events, searchTerm, currentDate, view]);

  return {
    searchTerm,
    setSearchTerm,
    filteredEvents,
  };
};
