import { CalendarHeaderProps } from './CalendarHeaderProps.types';
import { MonthViewProps } from './MonthViewProps.types';
import { WeekViewProps } from './WeekViewProps.types';

export interface CalendarProps
  extends CalendarHeaderProps,
    WeekViewProps,
    MonthViewProps {}
