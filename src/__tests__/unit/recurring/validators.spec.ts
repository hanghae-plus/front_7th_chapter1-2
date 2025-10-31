import { describe, it, expect } from 'vitest';

import { RepeatType } from '@/types/recurring/RepeatType.types';
import {
  validateRepeatType,
  validateRepeatInfo,
  isValidRecurringDate,
} from '@/utils/recurring/validators';

describe('validateRepeatType', () => {
  it('유효한 반복 타입들이 true를 반환해야 함', () => {
    expect(validateRepeatType(RepeatType.DAILY)).toBe(true);
    expect(validateRepeatType(RepeatType.WEEKLY)).toBe(true);
    expect(validateRepeatType(RepeatType.MONTHLY)).toBe(true);
    expect(validateRepeatType(RepeatType.YEARLY)).toBe(true);
  });

  it('잘못된 반복 타입이 false를 반환해야 함', () => {
    expect(validateRepeatType('invalid' as RepeatType)).toBe(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(validateRepeatType(null as any)).toBe(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(validateRepeatType(undefined as any)).toBe(false);
  });
});

describe('validateRepeatInfo', () => {
  it('유효한 RepeatInfo가 true를 반환해야 함', () => {
    const validInfo = {
      type: RepeatType.DAILY,
      interval: 1,
      endDate: new Date('2025-12-31'),
    };
    expect(validateRepeatInfo(validInfo)).toBe(true);
  });

  it('interval이 0 이하일 때 false를 반환해야 함', () => {
    const invalidInfo = {
      type: RepeatType.DAILY,
      interval: 0,
      endDate: new Date('2025-12-31'),
    };
    expect(validateRepeatInfo(invalidInfo)).toBe(false);
  });

  it('endDate가 과거일 때 false를 반환해야 함', () => {
    const invalidInfo = {
      type: RepeatType.DAILY,
      interval: 1,
      endDate: new Date('2020-01-01'),
    };
    expect(validateRepeatInfo(invalidInfo)).toBe(false);
  });

  it('endDate가 2025-12-31을 초과할 때 false를 반환해야 함', () => {
    const invalidInfo = {
      type: RepeatType.DAILY,
      interval: 1,
      endDate: new Date('2026-01-01'),
    };
    expect(validateRepeatInfo(invalidInfo)).toBe(false);
  });
});

describe('isValidRecurringDate', () => {
  it('31일 매월 반복 - 31일이 있는 달에서 true를 반환해야 함', () => {
    const date31Jan = new Date('2024-01-31');
    const date31Mar = new Date('2024-03-31');

    expect(isValidRecurringDate(date31Jan, RepeatType.MONTHLY)).toBe(true);
    expect(isValidRecurringDate(date31Mar, RepeatType.MONTHLY)).toBe(true);
  });

  it('31일 매월 반복 - 31일이 없는 달에서 false를 반환해야 함', () => {
    // 2월에는 31일이 없음
    const dateInFeb = new Date('2024-02-31'); // 실제로는 유효하지 않은 날짜

    expect(isValidRecurringDate(dateInFeb, RepeatType.MONTHLY)).toBe(false);
  });

  it('윤년 2월 29일 매년 반복 - 윤년에서만 true를 반환해야 함', () => {
    const leapYearDate = new Date('2024-02-29'); // 2024는 윤년
    const nonLeapYearDate = new Date('2023-02-29'); // 2023은 평년 (실제로는 유효하지 않은 날짜)

    expect(isValidRecurringDate(leapYearDate, RepeatType.YEARLY)).toBe(true);
    expect(isValidRecurringDate(nonLeapYearDate, RepeatType.YEARLY)).toBe(
      false
    );
  });

  it('일반 날짜는 모든 반복 타입에서 true를 반환해야 함', () => {
    const normalDate = new Date('2024-06-15');

    expect(isValidRecurringDate(normalDate, RepeatType.DAILY)).toBe(true);
    expect(isValidRecurringDate(normalDate, RepeatType.WEEKLY)).toBe(true);
    expect(isValidRecurringDate(normalDate, RepeatType.MONTHLY)).toBe(true);
    expect(isValidRecurringDate(normalDate, RepeatType.YEARLY)).toBe(true);
  });
});
