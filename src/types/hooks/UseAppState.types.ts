// Type definitions for useAppState hook return value
// useAppState 훅 반환값을 위한 타입 정의

import { EventProps } from '@/types/events/Event.types';
import { EventSubmissionReturn } from '@/types/events/EventSubmission.types';

// Notification structure for app-wide notifications
export interface NotificationInfo {
  id: string;
  message: string;
}

// Main useAppState return type combining all state hooks
export interface UseAppStateReturn {
  eventFormState: ReturnType<
    typeof import('@/hooks/useEventForm').useEventForm
  >;
  calendarState: ReturnType<
    typeof import('@/hooks/useCalendarView').useCalendarView
  >;
  searchState: ReturnType<typeof import('@/hooks/useSearch').useSearch>;
  submissionState: EventSubmissionReturn;
  events: EventProps[];
  deleteEvent: (id: string) => void;
  notifications: NotificationInfo[];
  notifiedEvents: string[];
  setNotifications: (
    value:
      | NotificationInfo[]
      | ((prev: NotificationInfo[]) => NotificationInfo[])
  ) => void;
  isOverlapDialogOpen: boolean;
  setIsOverlapDialogOpen: (isOpen: boolean) => void;
  overlappingEvents: EventProps[];
}
