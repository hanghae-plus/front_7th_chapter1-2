import { Event, RepeatType } from '../../types';

/**
 * 반복 일정 인스턴스 (날짜별로 확장된 일정)
 */
export interface RecurringInstance {
  date: string; // YYYY-MM-DD
  event: Event;
}

/**
 * 반복 일정 분할 결과
 */
export interface SplitRecurringResult {
  before?: Event; // 수정/삭제 날짜 이전의 반복 일정
  modified?: Event; // 수정된 단일 일정 (수정 시에만)
  after?: Event; // 수정/삭제 날짜 이후의 반복 일정
}

/**
 * 반복 일정 생성 옵션
 */
export interface RecurringOptions {
  startDate: string;
  endDate?: string;
  repeatType: RepeatType;
  interval: number;
}

