// Saves or updates an event via API
// API를 통해 이벤트를 저장하거나 업데이트합니다.

import { useSnackbar } from 'notistack';

import { EventProps } from '@/types/events/Event.types';
import { EventFormProps } from '@/types/events/EventForm.types';

export const saveEvent =
  (
    editing: boolean,
    fetchEvents: () => Promise<void>,
    onSave: (() => void) | undefined,
    enqueueSnackbar: ReturnType<typeof useSnackbar>['enqueueSnackbar']
  ) =>
  async (eventData: EventProps | EventFormProps) => {
    try {
      let response;
      if (editing) {
        response = await fetch(`/api/events/${(eventData as EventProps).id}`, {
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
      enqueueSnackbar(
        editing ? '일정이 수정되었습니다.' : '일정이 추가되었습니다.',
        {
          variant: 'success',
        }
      );
    } catch (error) {
      console.error('Error saving event:', error);
      enqueueSnackbar('일정 저장 실패', { variant: 'error' });
    }
  };
