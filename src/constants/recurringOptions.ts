// 반복 유형 선택 옵션 상수
import { RepeatType } from '@/types/recurring/RepeatType.types';

export const RECURRING_OPTIONS = [
  { value: 'none', label: '반복 안함' },
  { value: RepeatType.DAILY, label: '매일' },
  { value: RepeatType.WEEKLY, label: '매주' },
  { value: RepeatType.MONTHLY, label: '매월' },
  { value: RepeatType.YEARLY, label: '매년' },
] as const;
