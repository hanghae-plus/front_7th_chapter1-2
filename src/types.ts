export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RepeatInfo {
  type: RepeatType;
  interval: number;
  endDate?: string;
  id?: string;
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

/**
 * 배치 API 요청 타입: 여러 일정을 한 번에 생성
 */
export interface BatchCreateEventsRequest {
  events: EventForm[];
}

/**
 * 배치 API 응답 타입: 생성된 일정 목록
 */
export interface BatchCreateEventsResponse {
  events: Event[];
}

/**
 * 반복 시리즈 수정 요청 타입
 */
export interface UpdateRecurringSeriesRequest {
  title?: string;
  description?: string;
  location?: string;
  category?: string;
  notificationTime?: number;
  repeat?: Partial<RepeatInfo>;
}
