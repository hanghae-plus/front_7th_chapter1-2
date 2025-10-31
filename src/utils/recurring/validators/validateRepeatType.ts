// Repeat type validation utility
// 반복 타입 검증 유틸리티

import { RepeatType } from '@/types/recurring/RepeatType.types';

// 유효한 반복 타입인지 검증
export function validateRepeatType(type: RepeatType): boolean {
  if (!type) return false;

  const validTypes = Object.values(RepeatType);
  return validTypes.includes(type);
}
