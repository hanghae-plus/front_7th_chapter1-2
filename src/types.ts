export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RepeatInfo {
  type: RepeatType;
  interval: number;
  endDate?: string;
  exceptions?: string[]; // Array of dates (YYYY-MM-DD) to exclude from recurring series
  // <!-- 반복 시리즈에서 제외할 날짜 배열 (YYYY-MM-DD) -->
  id?: string;
  originalEventId?: string; // ID of the original event (for editing/deleting recurring series)
  // <!-- 원본 이벤트의 ID (반복 시리즈 수정/삭제용) -->
  originalDate?: string; // Start date of the original event (for editing recurring series)
  // <!-- 원본 이벤트의 시작 날짜 (반복 시리즈 수정용) -->
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
}
