import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';

import { Event, EventForm, UpdateRecurringSeriesRequest } from '../types';
import { generateRepeatDates } from '../utils/repeatUtils';

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

  const saveRecurringEvents = async (eventForm: EventForm): Promise<void> => {
    try {
      const repeatDates = generateRepeatDates(eventForm.date, eventForm.repeat);

      if (repeatDates.length === 0) {
        enqueueSnackbar('반복 일정을 생성할 수 없습니다.', { variant: 'error' });
        return;
      }

      const eventsToCreate: EventForm[] = repeatDates.map((date) => ({
        ...eventForm,
        date,
      }));

      const response = await fetch('/api/events-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: eventsToCreate }),
      });

      if (!response.ok) {
        throw new Error('Failed to create recurring events');
      }

      await fetchEvents();
      onSave?.();
      enqueueSnackbar(`반복 일정이 생성되었습니다. (${repeatDates.length}개)`, {
        variant: 'success',
      });
    } catch (error) {
      console.error('Error creating recurring events:', error);
      enqueueSnackbar('반복 일정 생성 실패', { variant: 'error' });
    }
  };

  const saveEvent = async (eventData: Event | EventForm) => {
    try {
      const isRecurring = eventData.repeat.type !== 'none';

      if (!editing && isRecurring) {
        await saveRecurringEvents(eventData as EventForm);
        return;
      }

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

  const updateRecurringSeries = async (
    repeatId: string,
    updateData: UpdateRecurringSeriesRequest
  ): Promise<void> => {
    try {
      const response = await fetch(`/api/recurring-events/${repeatId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Recurring series not found');
        }
        throw new Error('Failed to update recurring series');
      }

      await fetchEvents();
      enqueueSnackbar('반복 일정 시리즈가 수정되었습니다.', { variant: 'success' });
    } catch (error) {
      console.error('Error updating recurring series:', error);
      throw error;
    }
  };

  const deleteRecurringSeries = async (repeatId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/recurring-events/${repeatId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        if (response.status === 404) {
          enqueueSnackbar('반복 일정 시리즈를 찾을 수 없습니다.', { variant: 'error' });
          return;
        }
        throw new Error('Failed to delete recurring series');
      }

      await fetchEvents();
      enqueueSnackbar('반복 일정 시리즈가 삭제되었습니다.', { variant: 'info' });
    } catch (error) {
      console.error('Error deleting recurring series:', error);
      enqueueSnackbar('반복 일정 삭제 실패', { variant: 'error' });
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const response = await fetch(`/api/events/${id}`, { method: 'DELETE' });

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

  return {
    events,
    fetchEvents,
    saveEvent,
    deleteEvent,
    updateRecurringSeries,
    deleteRecurringSeries,
  };
};
