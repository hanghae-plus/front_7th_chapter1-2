export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RepeatInfo {
  type: RepeatType;
  interval: number;
  endDate?: string;
  // New fields for specific repeat types
  daysOfWeek?: number[]; // For 'weekly' repeat (0: Sunday, 1: Monday, ...)
  dayOfMonth?: number; // For 'monthly' and 'yearly' repeat (1-31)
  monthOfYear?: number; // For 'yearly' repeat (0-indexed: 0: Jan, 1: Feb, ...)
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
  seriesId: string | null; // 반복 일정 그룹 ID (단일 일정일 경우 null)
}
