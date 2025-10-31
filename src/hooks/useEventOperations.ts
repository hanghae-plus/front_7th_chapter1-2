// Manages event operations (CRUD) with API integration
// API 통합으로 이벤트 작업(CRUD)을 관리합니다.

import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useState } from 'react';

import { deleteEvent as deleteEventUtil } from '@/hooks/events/operations/deleteEvent';
import { fetchEvents } from '@/hooks/events/operations/fetchEvents';
import { initEvents } from '@/hooks/events/operations/initEvents';
import { saveEvent as saveEventUtil } from '@/hooks/events/operations/saveEvent';
import { EventProps } from '@/types/events/Event.types';
import { EventFormProps } from '@/types/events/EventForm.types';

export const useEventOperations = (editing: boolean, onSave?: () => void) => {
  const [events, setEvents] = useState<EventProps[]>([]);
  const { enqueueSnackbar } = useSnackbar();

  const handleFetchEvents = useCallback(() => {
    return fetchEvents(setEvents, enqueueSnackbar)();
  }, [enqueueSnackbar]);

  const saveEvent = useCallback(
    (eventData: EventProps | EventFormProps) => {
      return saveEventUtil(
        editing,
        handleFetchEvents,
        onSave,
        enqueueSnackbar
      )(eventData);
    },
    [editing, handleFetchEvents, onSave, enqueueSnackbar]
  );

  const deleteEvent = useCallback(
    (id: string) => {
      return deleteEventUtil(handleFetchEvents, enqueueSnackbar)(id);
    },
    [handleFetchEvents, enqueueSnackbar]
  );

  const init = useCallback(() => {
    return initEvents(handleFetchEvents, enqueueSnackbar)();
  }, [handleFetchEvents, enqueueSnackbar]);

  useEffect(() => {
    init();
  }, [init]);

  return { events, fetchEvents: handleFetchEvents, saveEvent, deleteEvent };
};
