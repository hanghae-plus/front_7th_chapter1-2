import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';

import { Event, EventForm } from '../types';
import { generateRecurringDates } from '../utils/repeatDateCalculator';

export const useEventOperations = (editing: boolean, onSave?: () => void) => {
  const [events, setEvents] = useState<Event[]>([]);
  const { enqueueSnackbar } = useSnackbar();

  const fetchEvents = async () => {
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

  const saveEvent = async (eventData: Event | EventForm) => {
    try {
      // Check if this is a recurring event
      const isRecurring = eventData.repeat.type !== 'none';

      if (isRecurring) {
        // Generate recurring dates
        const recurringDates = generateRecurringDates(
          eventData.date,
          eventData.repeat.type,
          eventData.repeat.interval,
          eventData.repeat.endDate
        );

        // Create event instances for each date
        const recurringEvents = recurringDates.map((date, index) => ({
          ...(eventData as Event),
          id: `${Date.now()}-${index}`,
          date,
        }));

        // Determine if updating or creating
        if (editing) {
          // For recurring events in edit mode, update all instances
          const response = await fetch('/api/recurring-events/series', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(recurringEvents),
          });

          if (!response.ok) {
            throw new Error('Failed to update recurring event');
          }
        } else {
          // Create new recurring series
          const response = await fetch('/api/events-list', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(recurringEvents),
          });

          if (!response.ok) {
            throw new Error('Failed to create recurring event');
          }
        }
      } else {
        // Non-recurring event (existing logic)
        let response;
        if (editing) {
          response = await fetch(`/api/events/${(eventData as Event).id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData),
          });
        } else {
          response = await fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData),
          });
        }

        if (!response.ok) {
          throw new Error('Failed to save event');
        }
      }

      await fetchEvents();
      onSave?.();
      enqueueSnackbar(editing ? '일정이 수정되었습니다.' : '일정이 추가되었습니다.', {
        variant: 'success',
      });
    } catch (error) {
      console.error('Error saving event:', error);
      enqueueSnackbar('일정 저장 실패', { variant: 'error' });
    }
  };

  const deleteEvent = async (eventOrId: string | Event) => {
    try {
      let response;

      // Check if input is an Event object or string id
      if (typeof eventOrId === 'string') {
        // Single event deletion
        response = await fetch(`/api/events/${eventOrId}`, { method: 'DELETE' });
      } else {
        // Event object - check if it's recurring
        const event = eventOrId as Event;
        if (event.repeat.type !== 'none') {
          // Delete all instances of recurring series
          response = await fetch('/api/recurring-events/series', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventId: event.id }),
          });
        } else {
          // Delete single event
          response = await fetch(`/api/events/${event.id}`, { method: 'DELETE' });
        }
      }

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      await fetchEvents();
      enqueueSnackbar('일정이 삭제되었습니다.', { variant: 'info' });
    } catch (error) {
      console.error('Error deleting event:', error);
      enqueueSnackbar('일정 삭제 실패', { variant: 'error' });
    }
  };

  async function init() {
    await fetchEvents();
    enqueueSnackbar('일정 로딩 완료!', { variant: 'info' });
  }

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { events, fetchEvents, saveEvent, deleteEvent };
};
