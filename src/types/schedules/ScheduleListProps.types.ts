// Schedule list component props definition
// 일정 목록 컴포넌트 props 정의

import { EventProps } from '@/types/events/Event.types';

export interface ScheduleListProps {
  searchTerm: string;
  filteredEvents: EventProps[];
  notifiedEvents: string[];
}

export interface ScheduleListHandlerProps {
  setSearchTerm: (term: string) => void;
  editEvent: (event: EventProps) => void;
  deleteEvent: (id: string) => void;
}
