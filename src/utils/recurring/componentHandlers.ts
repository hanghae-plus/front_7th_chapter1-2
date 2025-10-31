// RecurringSelector 컴포넌트 핸들러 유틸리티
import { RepeatInfo } from '@/types/recurring/RepeatInfo.types';
import { RepeatType } from '@/types/recurring/RepeatType.types';

export const createRepeatInfo = (
  type: RepeatType,
  interval: number,
  endDate: string
): RepeatInfo => ({
  type,
  interval,
  endDate: endDate ? new Date(endDate) : undefined,
});

export const createRepeatTypeChangeHandler =
  (
    setRepeatType: (type: RepeatType | 'none') => void,
    onChange: (repeatInfo: RepeatInfo | null) => void,
    interval: number,
    endDate: string
  ) =>
  (type: RepeatType | 'none') => {
    setRepeatType(type);
    onChange(
      type === 'none'
        ? null
        : createRepeatInfo(type as RepeatType, interval, endDate)
    );
  };

export const createIntervalChangeHandler =
  (
    setInterval: (interval: number) => void,
    onChange: (repeatInfo: RepeatInfo | null) => void,
    repeatType: RepeatType | 'none',
    endDate: string,
    intervalMin: number,
    intervalMax: number
  ) =>
  (newInterval: number) => {
    if (newInterval < intervalMin || newInterval > intervalMax) return;
    setInterval(newInterval);
    if (repeatType !== 'none') {
      onChange(
        createRepeatInfo(repeatType as RepeatType, newInterval, endDate)
      );
    }
  };

export const createEndDateChangeHandler =
  (
    setEndDate: (endDate: string) => void,
    onChange: (repeatInfo: RepeatInfo | null) => void,
    repeatType: RepeatType | 'none',
    interval: number
  ) =>
  (dateString: string) => {
    setEndDate(dateString);
    if (repeatType !== 'none') {
      onChange(
        createRepeatInfo(repeatType as RepeatType, interval, dateString)
      );
    }
  };
