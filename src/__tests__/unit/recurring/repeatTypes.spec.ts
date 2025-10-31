import { describe, it, expect } from 'vitest';

import { RepeatInfo } from '@/types/recurring/RepeatInfo.types';
import { RepeatType } from '@/types/recurring/RepeatType.types';

describe('RepeatType enum', () => {
  it('매일 반복 타입이 올바르게 정의되어야 함', () => {
    expect(RepeatType.DAILY).toBe('daily');
  });

  it('매주 반복 타입이 올바르게 정의되어야 함', () => {
    expect(RepeatType.WEEKLY).toBe('weekly');
  });

  it('매월 반복 타입이 올바르게 정의되어야 함', () => {
    expect(RepeatType.MONTHLY).toBe('monthly');
  });

  it('매년 반복 타입이 올바르게 정의되어야 함', () => {
    expect(RepeatType.YEARLY).toBe('yearly');
  });
});

describe('RepeatInfo interface', () => {
  it('유효한 RepeatInfo 객체가 올바른 타입을 가져야 함', () => {
    const repeatInfo: RepeatInfo = {
      type: RepeatType.DAILY,
      interval: 1,
      endDate: new Date('2025-12-31'),
    };

    expect(repeatInfo.type).toBe(RepeatType.DAILY);
    expect(repeatInfo.interval).toBe(1);
    expect(repeatInfo.endDate).toBeInstanceOf(Date);
  });

  it('interval 기본값이 1이어야 함', () => {
    const repeatInfo: RepeatInfo = {
      type: RepeatType.WEEKLY,
      interval: 1,
    };

    expect(repeatInfo.interval).toBe(1);
  });

  it('endDate는 선택적 속성이어야 함', () => {
    const repeatInfo: RepeatInfo = {
      type: RepeatType.MONTHLY,
      interval: 2,
    };

    expect(repeatInfo.endDate).toBeUndefined();
  });
});
