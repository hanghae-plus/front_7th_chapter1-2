import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';

import { Event, EventForm } from '../types';
import { formatDate } from '../utils/dateUtils';

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

  const saveEvent = async (eventData: Event | EventForm, options?: { silent?: boolean }) => {
    try {
      let response;
      const isUpdate = 'id' in eventData && eventData.id !== undefined;

      if (isUpdate) {
        response = await fetch(`/api/events/${(eventData as Event).id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        });

        if (response.ok) {
          if (eventData.repeatGroupId != null) {
            const groupedEvents = events.filter(
              (event) =>
                event.repeatGroupId === eventData.repeatGroupId && event.id !== eventData.id
            );

            if (groupedEvents.length > 0) {
              await Promise.all(
                groupedEvents
                  .map((event) => {
                    const dayOfEvent = new Date(event.date).getDay();
                    const dayOfTarget = new Date(eventData.date).getDay();

                    const dayDiff = dayOfTarget - dayOfEvent;

                    const calibratedDate = new Date(event.date);

                    calibratedDate.setDate(calibratedDate.getDate() + dayDiff);

                    const calibratedEndDate = event.repeat.endDate
                      ? new Date(event.repeat.endDate)
                      : undefined;

                    if (calibratedEndDate) {
                      calibratedEndDate.setDate(calibratedEndDate.getDate() + dayDiff);
                    }

                    return {
                      ...eventData,
                      id: event.id,
                      date: formatDate(calibratedDate),
                      repeat: {
                        ...eventData.repeat,
                        endDate: calibratedEndDate ? formatDate(calibratedEndDate) : undefined,
                      },
                    };
                  })
                  .map((event) =>
                    fetch(`/api/events/${event.id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(event),
                    })
                  )
              );
            }
          }
        }
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

      if (options?.silent) {
        return;
      }

      enqueueSnackbar(isUpdate ? '일정이 수정되었습니다.' : '일정이 추가되었습니다.', {
        variant: 'success',
      });
    } catch (error) {
      console.error('Error saving event:', error);

      if (options?.silent) {
        return;
      }

      enqueueSnackbar('일정 저장 실패', { variant: 'error' });
    }
  };

  const deleteEvent = async (id: string, options?: { silent?: boolean }) => {
    try {
      const response = await fetch(`/api/events/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      await fetchEvents();
      if (options?.silent) {
        return;
      }
      enqueueSnackbar('일정이 삭제되었습니다.', { variant: 'info' });
    } catch (error) {
      console.error('Error deleting event:', error);
      if (options?.silent) {
        return;
      }
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
