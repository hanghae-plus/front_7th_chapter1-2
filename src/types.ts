export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RepeatInfo {
  type: RepeatType;
  interval: number;
  endDate?: string;
}

export interface EventForm {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  location: string;
  category: string;
  repeat: RepeatInfo;
  notificationTime: number; // 분 단위로 저장
}

export interface Event extends EventForm {
  id: string;
  seriesId?: string;           // Links instances to parent series (same as id for definitions)
  isSeriesDefinition?: boolean; // True if this is the master event, false for instances
  excludedDates?: string[];     // ISO dates to skip when generating instances
  originalDate?: string;        // For standalone instances edited from series
}
