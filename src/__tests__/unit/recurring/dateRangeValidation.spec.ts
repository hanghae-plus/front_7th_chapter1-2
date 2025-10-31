// 날짜 범위 유효성 검증 테스트
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';

import { RepeatEndCondition } from '@/types/events/RepeatInfo.types';
import {
  validateDateRange,
  isValidEndDate,
  calculateMaxOccurrences,
  getDateRangeInfo,
  validateRecurringRange,
} from '@/utils/recurring/dateRangeValidators';

describe('날짜 범위 유효성 검증', () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15'));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  describe('validateDateRange', () => {
    it('유효한 날짜 범위에서 true를 반환해야 함', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      expect(validateDateRange(startDate, endDate)).toBe(true);
    });

    it('종료 날짜가 시작 날짜보다 이전일 때 false를 반환해야 함', () => {
      const startDate = new Date('2024-12-31');
      const endDate = new Date('2024-01-01');

      expect(validateDateRange(startDate, endDate)).toBe(false);
    });

    it('같은 날짜일 때 true를 반환해야 함', () => {
      const date = new Date('2024-06-15');

      expect(validateDateRange(date, date)).toBe(true);
    });

    it('무효한 날짜 객체에서 false를 반환해야 함', () => {
      const validDate = new Date('2024-06-15');
      const invalidDate = new Date('invalid-date');

      expect(validateDateRange(validDate, invalidDate)).toBe(false);
      expect(validateDateRange(invalidDate, validDate)).toBe(false);
      expect(validateDateRange(invalidDate, invalidDate)).toBe(false);
    });

    it('null 또는 undefined 날짜에서 false를 반환해야 함', () => {
      const validDate = new Date('2024-06-15');

      expect(validateDateRange(validDate, null as unknown as Date)).toBe(false);
      expect(validateDateRange(null as unknown as Date, validDate)).toBe(false);
      expect(validateDateRange(undefined as unknown as Date, validDate)).toBe(
        false
      );
      expect(validateDateRange(validDate, undefined as unknown as Date)).toBe(
        false
      );
    });
  });

  describe('isValidEndDate', () => {
    it('최대 허용 날짜(2025-12-31) 이내에서 true를 반환해야 함', () => {
      const validDates = [
        new Date('2024-06-16'), // tomorrow, not today
        new Date('2025-01-01'),
        new Date('2025-12-31'),
      ];

      validDates.forEach((date) => {
        expect(isValidEndDate(date)).toBe(true);
      });
    });

    it('최대 허용 날짜를 초과할 때 false를 반환해야 함', () => {
      const invalidDates = [
        new Date('2026-01-01'),
        new Date('2026-06-15'),
        new Date('2030-12-31'),
      ];

      invalidDates.forEach((date) => {
        expect(isValidEndDate(date)).toBe(false);
      });
    });

    it('과거 날짜에서 false를 반환해야 함', () => {
      const pastDates = [
        new Date('2024-01-01'),
        new Date('2023-12-31'),
        new Date('2020-06-15'),
      ];

      pastDates.forEach((date) => {
        expect(isValidEndDate(date)).toBe(false);
      });
    });

    it('오늘 날짜에서 false를 반환해야 함', () => {
      const today = new Date('2024-06-15');
      expect(isValidEndDate(today)).toBe(false);
    });

    it('내일 날짜부터 true를 반환해야 함', () => {
      const tomorrow = new Date('2024-06-16');
      expect(isValidEndDate(tomorrow)).toBe(true);
    });
  });

  describe('calculateMaxOccurrences', () => {
    it('일일 반복에서 정확한 발생 횟수를 계산해야 함', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-10');

      expect(calculateMaxOccurrences(startDate, endDate, 'daily', 1)).toBe(10);
      expect(calculateMaxOccurrences(startDate, endDate, 'daily', 2)).toBe(5);
      expect(calculateMaxOccurrences(startDate, endDate, 'daily', 3)).toBe(4);
    });

    it('주간 반복에서 정확한 발생 횟수를 계산해야 함', () => {
      const startDate = new Date('2024-01-01'); // 월요일
      const endDate = new Date('2024-01-29'); // 4주 후 월요일

      expect(calculateMaxOccurrences(startDate, endDate, 'weekly', 1)).toBe(5);
      expect(calculateMaxOccurrences(startDate, endDate, 'weekly', 2)).toBe(3);
    });

    it('월간 반복에서 정확한 발생 횟수를 계산해야 함', () => {
      const startDate = new Date('2024-01-15');
      const endDate = new Date('2024-06-15');

      expect(calculateMaxOccurrences(startDate, endDate, 'monthly', 1)).toBe(6);
      expect(calculateMaxOccurrences(startDate, endDate, 'monthly', 2)).toBe(3);
    });

    it('연간 반복에서 정확한 발생 횟수를 계산해야 함', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2026-01-01');

      expect(calculateMaxOccurrences(startDate, endDate, 'yearly', 1)).toBe(3);
      expect(calculateMaxOccurrences(startDate, endDate, 'yearly', 2)).toBe(2);
    });

    it('종료 날짜가 시작 날짜보다 이전일 때 0을 반환해야 함', () => {
      const startDate = new Date('2024-06-15');
      const endDate = new Date('2024-06-10');

      expect(calculateMaxOccurrences(startDate, endDate, 'daily', 1)).toBe(0);
    });

    it('같은 날짜일 때 1을 반환해야 함', () => {
      const date = new Date('2024-06-15');

      expect(calculateMaxOccurrences(date, date, 'daily', 1)).toBe(1);
      expect(calculateMaxOccurrences(date, date, 'weekly', 1)).toBe(1);
      expect(calculateMaxOccurrences(date, date, 'monthly', 1)).toBe(1);
      expect(calculateMaxOccurrences(date, date, 'yearly', 1)).toBe(1);
    });
  });

  describe('getDateRangeInfo', () => {
    it('날짜 범위 정보를 정확히 반환해야 함', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      const info = getDateRangeInfo(startDate, endDate);

      expect(info.totalDays).toBe(366); // 2024년은 윤년
      expect(info.totalWeeks).toBe(52);
      expect(info.totalMonths).toBe(12);
      expect(info.totalYears).toBe(1);
      expect(info.isValid).toBe(true);
      expect(info.isWithinMaxRange).toBe(true);
    });

    it('단기간 범위 정보를 정확히 반환해야 함', () => {
      const startDate = new Date('2024-06-01');
      const endDate = new Date('2024-06-07');

      const info = getDateRangeInfo(startDate, endDate);

      expect(info.totalDays).toBe(7);
      expect(info.totalWeeks).toBe(1);
      expect(info.totalMonths).toBe(1);
      expect(info.totalYears).toBe(0);
      expect(info.isValid).toBe(true);
    });

    it('장기간 범위 정보를 정확히 반환해야 함', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2025-12-31');

      const info = getDateRangeInfo(startDate, endDate);

      expect(info.totalDays).toBe(731); // 2024(366) + 2025(365)
      expect(info.totalWeeks).toBe(104);
      expect(info.totalMonths).toBe(24);
      expect(info.totalYears).toBe(2);
      expect(info.isValid).toBe(true);
      expect(info.isWithinMaxRange).toBe(true);
    });

    it('최대 범위를 초과하는 경우 정보를 반환해야 함', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2026-12-31');

      const info = getDateRangeInfo(startDate, endDate);

      expect(info.isValid).toBe(true);
      expect(info.isWithinMaxRange).toBe(false);
      expect(info.totalYears).toBe(3);
    });

    it('유효하지 않은 범위에서 올바른 정보를 반환해야 함', () => {
      const startDate = new Date('2024-12-31');
      const endDate = new Date('2024-01-01');

      const info = getDateRangeInfo(startDate, endDate);

      expect(info.isValid).toBe(false);
      expect(info.totalDays).toBe(0);
      expect(info.totalWeeks).toBe(0);
      expect(info.totalMonths).toBe(0);
      expect(info.totalYears).toBe(0);
    });
  });

  describe('validateRecurringRange', () => {
    it('유효한 반복 설정에서 검증 결과를 반환해야 함', () => {
      const startDate = new Date('2024-01-01');
      const endCondition: RepeatEndCondition = {
        type: 'date',
        endDate: new Date('2024-12-31'),
      };

      const result = validateRecurringRange(
        startDate,
        'daily',
        1,
        endCondition
      );

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
      expect(result.maxOccurrences).toBe(366);
    });

    it('종료 날짜가 시작 날짜보다 이전일 때 오류를 반환해야 함', () => {
      const startDate = new Date('2024-12-31');
      const endCondition: RepeatEndCondition = {
        type: 'date',
        endDate: new Date('2024-01-01'),
      };

      const result = validateRecurringRange(
        startDate,
        'daily',
        1,
        endCondition
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('종료 날짜가 시작 날짜보다 이전입니다.');
    });

    it('종료 날짜가 최대 범위를 초과할 때 오류를 반환해야 함', () => {
      const startDate = new Date('2024-01-01');
      const endCondition: RepeatEndCondition = {
        type: 'date',
        endDate: new Date('2026-12-31'),
      };

      const result = validateRecurringRange(
        startDate,
        'daily',
        1,
        endCondition
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        '종료 날짜가 최대 허용 범위(2025-12-31)를 초과합니다.'
      );
    });

    it('대량 발생 시 경고를 반환해야 함', () => {
      const startDate = new Date('2024-01-01');
      const endCondition: RepeatEndCondition = {
        type: 'date',
        endDate: new Date('2025-12-31'),
      };

      const result = validateRecurringRange(
        startDate,
        'daily',
        1,
        endCondition
      );

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain(
        '대량의 반복 일정이 생성됩니다. (731개)'
      );
      expect(result.maxOccurrences).toBe(731);
    });

    it('never 타입 종료 조건에서 최대 범위로 제한해야 함', () => {
      const startDate = new Date('2024-01-01');
      const endCondition: RepeatEndCondition = {
        type: 'never',
      };

      const result = validateRecurringRange(
        startDate,
        'monthly',
        1,
        endCondition
      );

      expect(result.isValid).toBe(true);
      expect(result.maxOccurrences).toBe(24); // 2024-01부터 2025-12까지
    });

    it('count 타입 종료 조건 검증', () => {
      const startDate = new Date('2024-01-01');
      const endCondition: RepeatEndCondition = {
        type: 'count',
        count: 100,
      };

      const result = validateRecurringRange(
        startDate,
        'daily',
        1,
        endCondition
      );

      expect(result.isValid).toBe(true);
      expect(result.maxOccurrences).toBe(100);
    });

    it('잘못된 count 값에서 오류를 반환해야 함', () => {
      const startDate = new Date('2024-01-01');
      const endCondition: RepeatEndCondition = {
        type: 'count',
        count: 0,
      };

      const result = validateRecurringRange(
        startDate,
        'daily',
        1,
        endCondition
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('count는 1 이상이어야 합니다.');
    });

    it('과도한 count 값에서 경고를 반환해야 함', () => {
      const startDate = new Date('2024-01-01');
      const endCondition: RepeatEndCondition = {
        type: 'count',
        count: 1000,
      };

      const result = validateRecurringRange(
        startDate,
        'daily',
        1,
        endCondition
      );

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain(
        '대량의 반복 일정이 생성됩니다. (1000개)'
      );
    });
  });

  describe('윤년 및 특수 날짜 처리', () => {
    it('윤년 2월 29일에서 유효성 검증', () => {
      const startDate = new Date('2024-02-29');
      const endDate = new Date('2024-03-31');

      expect(validateDateRange(startDate, endDate)).toBe(true);

      const info = getDateRangeInfo(startDate, endDate);
      expect(info.totalDays).toBe(32); // 2/29 + 3월 31일
    });

    it('월말 날짜에서 월간 반복 계산', () => {
      const startDate = new Date('2024-01-31');
      const endDate = new Date('2024-04-30');

      const occurrences = calculateMaxOccurrences(
        startDate,
        endDate,
        'monthly',
        1
      );
      // 1월 31일, 2월 29일, 3월 31일, 4월 30일 = 4개
      expect(occurrences).toBe(4);
    });

    it('윤년에서 연간 반복 계산', () => {
      const startDate = new Date('2024-02-29');
      const endDate = new Date('2028-02-29');

      const occurrences = calculateMaxOccurrences(
        startDate,
        endDate,
        'yearly',
        1
      );
      // 2024, 2025(2/28), 2026(2/28), 2027(2/28), 2028 = 5개
      expect(occurrences).toBe(5);
    });
  });

  describe('성능 테스트', () => {
    it('대량 날짜 범위 계산이 효율적이어야 함', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2025-12-31');

      const startTime = performance.now();
      const info = getDateRangeInfo(startDate, endDate);
      const endTime = performance.now();

      expect(info.isValid).toBe(true);
      expect(endTime - startTime).toBeLessThan(10); // 10ms 이내
    });

    it('최대 발생 횟수 계산이 효율적이어야 함', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2025-12-31');

      const startTime = performance.now();
      const occurrences = calculateMaxOccurrences(
        startDate,
        endDate,
        'daily',
        1
      );
      const endTime = performance.now();

      expect(occurrences).toBe(731);
      expect(endTime - startTime).toBeLessThan(5); // 5ms 이내
    });
  });
});
