// Props for Week View Component
// Week View 컴포넌트의 props

import { EventProps } from '@/types/events/Event.types';

export interface WeekViewProps {
  currentDate: Date;
  filteredEvents: EventProps[];
  notifiedEvents: string[];
}
