// Recurring date validation utility
// 반복 날짜 검증 유틸리티

import { checkDateIntegrity } from './checkDateIntegrity';
import { isValidDateForType } from './isValidDateForType';
import { validateRepeatType } from './validateRepeatType';

import { RepeatType } from '@/types/recurring/RepeatType.types';

// 특정 날짜가 반복 타입에 유효한지 검증
export function isValidRecurringDate(date: Date, type: RepeatType): boolean {
  if (!date || !validateRepeatType(type)) return false;

  // 유효하지 않은 날짜인지 먼저 확인 (자동 조정된 날짜 감지)
  if (!checkDateIntegrity(date)) return false;

  return isValidDateForType(date, type);
}
