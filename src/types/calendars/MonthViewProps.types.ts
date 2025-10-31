import { EventProps } from '@/types/events/Event.types';

export interface MonthViewProps {
  currentDate: Date;
  filteredEvents: EventProps[];
  notifiedEvents: string[];
  holidays: Record<string, string>;
}
