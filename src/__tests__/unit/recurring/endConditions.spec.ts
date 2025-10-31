import { describe, it, expect } from 'vitest';

import { RepeatType } from '@/types/recurring/RepeatType.types';
import {
  validateEndDate,
  isWithinMaxRange,
  generateRecurringEvents,
  getMaxEndDate,
} from '@/utils/recurring/endConditions';

describe('반복 종료 조건 검증', () => {
  describe('validateEndDate', () => {
    it('종료 날짜가 시작 날짜보다 이후일 때 true를 반환해야 함', () => {
      const startDate = new Date('2024-06-15');
      const endDate = new Date('2024-12-31');

      expect(validateEndDate(startDate, endDate)).toBe(true);
    });

    it('종료 날짜가 시작 날짜와 같을 때 false를 반환해야 함', () => {
      const startDate = new Date('2024-06-15');
      const endDate = new Date('2024-06-15');

      expect(validateEndDate(startDate, endDate)).toBe(false);
    });

    it('종료 날짜가 시작 날짜보다 이전일 때 false를 반환해야 함', () => {
      const startDate = new Date('2024-06-15');
      const endDate = new Date('2024-06-14');

      expect(validateEndDate(startDate, endDate)).toBe(false);
    });

    it('시작 날짜가 오늘보다 이전이고 종료 날짜가 미래일 때 true를 반환해야 함', () => {
      const pastStartDate = new Date('2024-01-01');
      const futureEndDate = new Date('2025-12-31');

      expect(validateEndDate(pastStartDate, futureEndDate)).toBe(true);
    });
  });

  describe('isWithinMaxRange', () => {
    it('2025-12-31 이전 날짜에서 true를 반환해야 함', () => {
      const validDate1 = new Date('2024-06-15');
      const validDate2 = new Date('2025-12-30');
      const maxDate = new Date('2025-12-31');

      expect(isWithinMaxRange(validDate1)).toBe(true);
      expect(isWithinMaxRange(validDate2)).toBe(true);
      expect(isWithinMaxRange(maxDate)).toBe(true);
    });

    it('2025-12-31을 초과하는 날짜에서 false를 반환해야 함', () => {
      const invalidDate1 = new Date('2026-01-01');
      const invalidDate2 = new Date('2026-06-15');

      expect(isWithinMaxRange(invalidDate1)).toBe(false);
      expect(isWithinMaxRange(invalidDate2)).toBe(false);
    });

    it('과거 날짜에서도 true를 반환해야 함', () => {
      const pastDate = new Date('2023-06-15');
      expect(isWithinMaxRange(pastDate)).toBe(true);
    });
  });

  describe('getMaxEndDate', () => {
    it('2025-12-31을 반환해야 함', () => {
      const maxDate = getMaxEndDate();

      expect(maxDate.getFullYear()).toBe(2025);
      expect(maxDate.getMonth()).toBe(11); // 12월 (0-based)
      expect(maxDate.getDate()).toBe(31);
    });
  });
});

describe('반복 일정 생성', () => {
  describe('generateRecurringEvents', () => {
    it('종료 날짜가 없으면 최대 기간까지 반복 일정을 생성해야 함', () => {
      const startDate = new Date('2024-01-01');
      const repeatInfo = {
        type: RepeatType.MONTHLY,
        interval: 1,
      };

      const events = generateRecurringEvents(startDate, repeatInfo);

      // 2024년 1월부터 2025년 12월까지 24개월
      expect(events).toHaveLength(24);
      expect(events[0]).toEqual(startDate);
      expect(events[events.length - 1].getFullYear()).toBe(2025);
      expect(events[events.length - 1].getMonth()).toBe(11); // 12월
    });

    it('종료 날짜가 있으면 해당 날짜까지만 반복 일정을 생성해야 함', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-06-01');
      const repeatInfo = {
        type: RepeatType.MONTHLY,
        interval: 1,
        endDate,
      };

      const events = generateRecurringEvents(startDate, repeatInfo);

      // 2024년 1월부터 6월까지 6개월
      expect(events).toHaveLength(6);
      expect(events[0]).toEqual(startDate);
      expect(events[events.length - 1].getMonth()).toBe(5); // 6월 (0-based)
    });

    it('매일 반복 - 정확한 일수만큼 생성해야 함', () => {
      const startDate = new Date('2024-12-25');
      const endDate = new Date('2024-12-31');
      const repeatInfo = {
        type: RepeatType.DAILY,
        interval: 1,
        endDate,
      };

      const events = generateRecurringEvents(startDate, repeatInfo);

      // 12/25부터 12/31까지 7일
      expect(events).toHaveLength(7);
      expect(events[0]).toEqual(startDate);
      expect(events[events.length - 1]).toEqual(endDate);
    });

    it('매주 반복 - 정확한 주수만큼 생성해야 함', () => {
      const startDate = new Date('2024-06-03'); // 월요일
      const endDate = new Date('2024-06-24'); // 3주 후 월요일
      const repeatInfo = {
        type: RepeatType.WEEKLY,
        interval: 1,
        endDate,
      };

      const events = generateRecurringEvents(startDate, repeatInfo);

      // 3주 + 시작일 = 4개
      expect(events).toHaveLength(4);
      expect(events[0]).toEqual(startDate);
      expect(events[1].getDate()).toBe(10); // 다음 주 월요일
      expect(events[2].getDate()).toBe(17); // 그 다음 주 월요일
      expect(events[3].getDate()).toBe(24); // 마지막 주 월요일
    });

    it('매년 반복 - 정확한 년수만큼 생성해야 함', () => {
      const startDate = new Date('2024-06-15');
      const endDate = new Date('2025-06-15');
      const repeatInfo = {
        type: RepeatType.YEARLY,
        interval: 1,
        endDate,
      };

      const events = generateRecurringEvents(startDate, repeatInfo);

      // 2024년, 2025년 = 2개
      expect(events).toHaveLength(2);
      expect(events[0]).toEqual(startDate);
      expect(events[1].getFullYear()).toBe(2025);
    });

    it('빈 배열을 반환하는 경우 - 시작 날짜가 종료 날짜보다 늦을 때', () => {
      const startDate = new Date('2024-06-15');
      const endDate = new Date('2024-06-14');
      const repeatInfo = {
        type: RepeatType.DAILY,
        interval: 1,
        endDate,
      };

      const events = generateRecurringEvents(startDate, repeatInfo);
      expect(events).toHaveLength(0);
    });

    it('31일 매월 반복 - 31일이 없는 달은 건너뛰어야 함', () => {
      const startDate = new Date('2024-01-31');
      const endDate = new Date('2024-05-31');
      const repeatInfo = {
        type: RepeatType.MONTHLY,
        interval: 1,
        endDate,
      };

      const events = generateRecurringEvents(startDate, repeatInfo);

      // 1월 31일, 3월 31일, 5월 31일 (2월, 4월 건너뛰기)
      expect(events).toHaveLength(3);
      expect(events[0].getMonth()).toBe(0); // 1월
      expect(events[1].getMonth()).toBe(2); // 3월
      expect(events[2].getMonth()).toBe(4); // 5월
    });

    it('윤년 2월 29일 매년 반복 - 평년은 건너뛰어야 함', () => {
      const startDate = new Date('2024-02-29'); // 윤년
      const endDate = new Date('2028-02-29');
      const repeatInfo = {
        type: RepeatType.YEARLY,
        interval: 1,
        endDate,
      };

      const events = generateRecurringEvents(startDate, repeatInfo);

      // 2024년, 2028년만 (2025, 2026, 2027년은 평년이므로 건너뛰기)
      expect(events).toHaveLength(2);
      expect(events[0].getFullYear()).toBe(2024);
      expect(events[1].getFullYear()).toBe(2028);
    });

    it('최대 생성 개수를 초과하지 않아야 함', () => {
      const startDate = new Date('2024-01-01');
      const repeatInfo = {
        type: RepeatType.DAILY,
        interval: 1,
        // endDate 없음 - 최대 기간까지
      };

      const events = generateRecurringEvents(startDate, repeatInfo);

      // 대량 생성 시에도 합리적인 개수여야 함 (2년간 최대 730개 정도)
      expect(events.length).toBeLessThan(1000);
      expect(events.length).toBeGreaterThan(0);
    });
  });
});
