// 브랜디드 타입 정의
export type ValidInterval = number & { __brand: 'ValidInterval' };
export type ValidDate = Date & { __brand: 'ValidDate' };

import { RepeatType } from './RepeatType.types';

// 엄격한 RepeatInfo 타입
export interface StrictRepeatInfo {
  type: RepeatType;
  interval: ValidInterval;
  endDate?: ValidDate;
}
