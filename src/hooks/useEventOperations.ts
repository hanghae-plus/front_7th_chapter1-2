import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';

import { Event, EventForm } from '../types';
import { generateRecurringEvents } from '../utils/recurringEventUtils';

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

  const saveEvent = async (eventData: Event | EventForm, editType?: 'single' | 'all') => {
    try {
      // If it's a recurring event, generate all instances
      if (eventData.repeat.type !== 'none' && eventData.repeat.endDate && !editing) {
        const startDate = new Date(eventData.date);
        const endDate = new Date(eventData.repeat.endDate);

        const recurringEvents = generateRecurringEvents(
          startDate,
          endDate,
          eventData.repeat.type,
          {
            title: eventData.title,
            startTime: eventData.startTime,
            endTime: eventData.endTime,
            description: eventData.description,
            location: eventData.location,
            category: eventData.category,
            notificationTime: eventData.notificationTime,
          },
          eventData.repeat.interval
        );

        // Save all recurring event instances
        for (const event of recurringEvents) {
          const response = await fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event),
          });

          if (!response.ok) {
            throw new Error('Failed to save recurring event instance');
          }
        }
      } else if (editing && editType === 'all') {
        // Update all events with the same recurrenceId
        const currentEvent = eventData as Event;
        const recurrenceId = currentEvent.repeat.recurrenceId;

        if (recurrenceId) {
          const relatedEvents = events.filter((e) => e.repeat.recurrenceId === recurrenceId);

          for (const event of relatedEvents) {
            const updatedEvent = {
              ...event,
              title: eventData.title,
              startTime: eventData.startTime,
              endTime: eventData.endTime,
              description: eventData.description,
              location: eventData.location,
              category: eventData.category,
              notificationTime: eventData.notificationTime,
              // Keep the original repeat and date
            };

            const response = await fetch(`/api/events/${event.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updatedEvent),
            });

            if (!response.ok) {
              throw new Error('Failed to update recurring event');
            }
          }
        }
      } else if (editing && editType === 'single') {
        // Update single event and remove from recurrence group
        const updatedEvent = {
          ...eventData,
          repeat: {
            type: 'none' as const,
            interval: 1,
          },
        };

        const response = await fetch(`/api/events/${(eventData as Event).id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedEvent),
        });

        if (!response.ok) {
          throw new Error('Failed to save event');
        }
      } else {
        // Single event (non-recurring or no special edit type)
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

  const deleteEvent = async (id: string, deleteType?: 'single' | 'all') => {
    try {
      if (deleteType === 'all') {
        // Find the event to get its recurrenceId
        const event = events.find((e) => e.id === id);
        const recurrenceId = event?.repeat.recurrenceId;

        if (recurrenceId) {
          // Delete all events with the same recurrenceId
          const relatedEvents = events.filter((e) => e.repeat.recurrenceId === recurrenceId);

          for (const relatedEvent of relatedEvents) {
            const response = await fetch(`/api/events/${relatedEvent.id}`, {
              method: 'DELETE',
            });

            if (!response.ok) {
              throw new Error('Failed to delete recurring event');
            }
          }
        }
      } else {
        // Delete single event
        const response = await fetch(`/api/events/${id}`, { method: 'DELETE' });

        if (!response.ok) {
          throw new Error('Failed to delete event');
        }
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
