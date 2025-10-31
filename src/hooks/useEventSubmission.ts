// Handles event submission logic, including validation and overlap detection
// 일정 제출 로직을 처리하며, 검증 및 겹침 감지를 포함합니다.

import { useSnackbar } from 'notistack';

import {
  EventSubmissionProps,
  EventSubmissionReturn,
} from '@/types/events/EventSubmission.types';
import { findOverlappingEvents } from '@/utils/eventOverlap';

export const useEventSubmission = ({
  title,
  date,
  startTime,
  endTime,
  description,
  location,
  category,
  isRepeating,
  repeatType,
  repeatInterval,
  repeatEndDate,
  notificationTime,
  startTimeError,
  endTimeError,
  editingEvent,
  events,
  saveEvent,
  resetForm,
  setOverlappingEvents,
  setIsOverlapDialogOpen,
}: EventSubmissionProps): EventSubmissionReturn => {
  const { enqueueSnackbar } = useSnackbar();

  const createEventData = () => ({
    // Conditionally include id only in edit mode to satisfy Event | EventForm union type
    ...(editingEvent?.id && { id: editingEvent.id }),
    title,
    date,
    startTime,
    endTime,
    description,
    location,
    category,
    repeat: {
      type: isRepeating ? repeatType : 'none',
      interval: repeatInterval,
      endDate: repeatEndDate || undefined,
    },
    notificationTime,
    startTimeError,
    endTimeError,
  });

  // Handles adding or updating an event with overlap detection
  const addOrUpdateEvent = async () => {
    if (!title || !date || !startTime || !endTime) {
      enqueueSnackbar('필수 정보를 모두 입력해주세요.', { variant: 'error' });
      return;
    }

    if (startTimeError || endTimeError) {
      enqueueSnackbar('시간 설정을 확인해주세요.', { variant: 'error' });
      return;
    }

    const eventData = createEventData();

    // Check for overlapping events
    const overlapping = findOverlappingEvents(eventData, events);
    if (overlapping.length > 0) {
      setOverlappingEvents(overlapping);
      setIsOverlapDialogOpen(true);
    } else {
      await saveEvent(eventData);
      resetForm();
    }
  };

  const handleOverlapContinue = () => {
    setIsOverlapDialogOpen(false);
    saveEvent(createEventData());
  };

  return { addOrUpdateEvent, handleOverlapContinue };
};
