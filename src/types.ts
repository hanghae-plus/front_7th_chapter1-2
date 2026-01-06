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

// Ai Edit
export interface Event extends EventForm {
  id: string;
  repeatGroupId?: string; // 반복 일정 그룹 식별자
  isRepeatInstance?: boolean; // 반복 인스턴스 여부
  originalEventId?: string; // 원본 이벤트 ID (단일 수정 시)
}
