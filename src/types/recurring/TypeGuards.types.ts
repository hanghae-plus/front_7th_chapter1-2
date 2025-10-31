// 타입 가드 함수들
import { ValidInterval, ValidDate } from './BrandedTypes.types';
import { RepeatType } from './RepeatType.types';

export function isValidInterval(value: number): value is ValidInterval {
  return Number.isInteger(value) && value >= 1;
}

export function isValidDate(date: Date): date is ValidDate {
  return date instanceof Date && !isNaN(date.getTime());
}

export function isRepeatType(value: string): value is RepeatType {
  return Object.values(RepeatType).includes(value as RepeatType);
}

export function createValidInterval(value: number): ValidInterval | null {
  return isValidInterval(value) ? (value as ValidInterval) : null;
}

export function createValidDate(date: Date): ValidDate | null {
  return isValidDate(date) ? (date as ValidDate) : null;
}
