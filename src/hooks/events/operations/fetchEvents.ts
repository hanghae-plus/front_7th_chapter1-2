// Fetches events from the API
// API에서 이벤트를 가져옵니다.

import { useSnackbar } from 'notistack';
import { Dispatch, SetStateAction } from 'react';

import { EventProps } from '@/types/events/Event.types';

export const fetchEvents =
  (
    setEvents: Dispatch<SetStateAction<EventProps[]>>,
    enqueueSnackbar: ReturnType<typeof useSnackbar>['enqueueSnackbar']
  ) =>
  async () => {
    try {
      const response = await fetch('/api/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const { events } = await response.json();
      setEvents(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      enqueueSnackbar('이벤트 로딩 실패', { variant: 'error' });
    }
  };
