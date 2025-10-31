// Deletes an event via API
// API를 통해 이벤트를 삭제합니다.

import { useSnackbar } from 'notistack';

export const deleteEvent =
  (
    fetchEvents: () => Promise<void>,
    enqueueSnackbar: ReturnType<typeof useSnackbar>['enqueueSnackbar']
  ) =>
  async (id: string) => {
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
