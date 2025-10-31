// Event submission related type definitions for form validation and overlap handling
// 폼 검증 및 겹침 처리를 위한 이벤트 제출 관련 타입 정의

import { EventProps } from '@/types/events/Event.types';
import { RepeatType } from '@/types/events/RepeatInfo.types';

// Props for useEventSubmission hook combining form state and operation handlers
export interface EventSubmissionProps {
  // 기본 이벤트 정보 - Basic event information
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  location: string;
  category: string;

  // 반복 설정 - Repeat configuration
  isRepeating: boolean;
  repeatType: RepeatType;
  repeatInterval: number;
  repeatEndDate: string;
  notificationTime: number;

  // 유효성 검사 에러 - Validation errors
  startTimeError: string | null;
  endTimeError: string | null;

  // 편집 상태 - Edit state
  editingEvent: EventProps | null;

  // 외부 의존성 - External dependencies
  events: EventProps[];
  saveEvent: (eventData: EventProps | Omit<EventProps, 'id'>) => Promise<void>;
  resetForm: () => void;

  // 겹침 다이얼로그 상태 관리 - Overlap dialog state management
  setOverlappingEvents: (events: EventProps[]) => void;
  setIsOverlapDialogOpen: (isOpen: boolean) => void;
}

// Return type for useEventSubmission hook
export interface EventSubmissionReturn {
  addOrUpdateEvent: () => Promise<void>;
  handleOverlapContinue: () => void;
}
