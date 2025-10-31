// Combines various hooks to manage the overall application state
// To simplify the App.tsx code and improve maintainability through modular state management.
// 다양한 훅을 결합하여 전체 애플리케이션 상태를 관리합니다.
// App.tsx 코드 간소화를 위해 사용합니다. 또한, 모듈화된 상태 관리를 통해 유지보수성을 향상시킵니다.

import { useState } from 'react';

import { useCalendarView } from './useCalendarView';
import { useEventForm } from './useEventForm';
import { useEventOperations } from './useEventOperations';
import { useEventSubmission } from './useEventSubmission';
import { useNotifications } from './useNotifications';
import { useSearch } from './useSearch';

import { EventProps } from '@/types/events/Event.types';
import { UseAppStateReturn } from '@/types/hooks/UseAppState.types';

export const useAppState = (): UseAppStateReturn => {
  const eventFormState = useEventForm();
  const { events, saveEvent, deleteEvent } = useEventOperations(
    Boolean(eventFormState.editingEvent),
    () => eventFormState.setEditingEvent(null)
  );

  const { notifications, notifiedEvents, setNotifications } =
    useNotifications(events);
  const calendarState = useCalendarView();
  const searchState = useSearch(
    events,
    calendarState.currentDate,
    calendarState.view
  );

  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<EventProps[]>([]);

  const submissionState = useEventSubmission({
    ...eventFormState,
    events,
    saveEvent,
    setOverlappingEvents,
    setIsOverlapDialogOpen,
  });

  return {
    eventFormState,
    calendarState,
    searchState,
    submissionState,
    events,
    deleteEvent,
    notifications,
    notifiedEvents,
    setNotifications,
    isOverlapDialogOpen,
    setIsOverlapDialogOpen,
    overlappingEvents,
  };
};
