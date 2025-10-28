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
}

// Unknown Feature 관련 타입
export interface UnknownfeatureData {
  id: string;
  // 추가 필드들
}

// RecurringEventEdit 관련 타입
export interface RecurringeventeditData {
  id: string;
  // 추가 필드들
}

// 이벤트 알림 관리 관련 타입
export interface 이벤트알림관리Data {
  id: string;
  // 추가 필드들
}
