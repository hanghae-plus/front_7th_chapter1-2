// Schedule item component props definition
// 일정 아이템 컴포넌트 props 정의

import { EventProps } from '@/types/events/Event.types';

export interface ScheduleItemProps {
  event: EventProps;
  notifiedEvents: string[];
}

export interface ScheduleItemHandlerProps {
  editEvent: (event: EventProps) => void;
  deleteEvent: (id: string) => void;
}
