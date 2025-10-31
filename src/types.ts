export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RepeatInfo {
  id?: string; // 시리즈 식별용 (시리즈 수정에 필수)
  type: RepeatType;
  interval: number; // 1-12, 기본값 1
  count?: number; // 1-1000, until과 상호 배타적
  endDate?: string; // ISO 8601 (YYYY-MM-DD), count와 상호 배타적
  startDate?: string; // ISO 8601 (YYYY-MM-DD), 검증 로직에 필요
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
