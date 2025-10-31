// Repeat info validation utility
// 반복 정보 검증 유틸리티

import { validateRepeatType } from './validateRepeatType';

import { RepeatInfo } from '@/types/recurring/RepeatInfo.types';

// RepeatInfo 객체의 유효성 검증
export function validateRepeatInfo(info: RepeatInfo): boolean {
  if (!info || !validateRepeatType(info.type)) return false;

  // interval은 1 이상이어야 함
  if (info.interval <= 0) return false;

  // endDate가 있다면 과거가 아니어야 하고 2025-12-31을 초과하면 안됨
  if (info.endDate) {
    const now = new Date();
    const maxDate = new Date('2025-12-31');

    if (info.endDate < now) return false;
    if (info.endDate > maxDate) return false;
  }

  return true;
}
