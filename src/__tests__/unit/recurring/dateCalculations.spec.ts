import { describe, it, expect } from 'vitest';

import { RepeatType } from '@/types/recurring/RepeatType.types';
import {
  shouldCreateOnDate,
  handleMonthEndCase,
  handleLeapYearCase,
  isLeapYear,
  getDaysInMonth,
  calculateNextOccurrence,
} from '@/utils/recurring/dateCalculations';

describe('monthEnd 처리 로직', () => {
  describe('shouldCreateOnDate - 매월 반복', () => {
    it('31일 매월 반복 - 31일이 있는 달에서 true를 반환해야 함', () => {
      const baseDate = new Date('2024-01-31'); // 1월 31일
      const targetDateJan = new Date('2024-01-31'); // 1월 31일
      const targetDateMar = new Date('2024-03-31'); // 3월 31일
      const targetDateMay = new Date('2024-05-31'); // 5월 31일

      expect(
        shouldCreateOnDate(baseDate, targetDateJan, RepeatType.MONTHLY)
      ).toBe(true);
      expect(
        shouldCreateOnDate(baseDate, targetDateMar, RepeatType.MONTHLY)
      ).toBe(true);
      expect(
        shouldCreateOnDate(baseDate, targetDateMay, RepeatType.MONTHLY)
      ).toBe(true);
    });

    it('31일 매월 반복 - 31일이 없는 달에서 false를 반환해야 함', () => {
      const baseDate = new Date('2024-01-31'); // 1월 31일

      // 31일이 없는 달들: 2월, 4월, 6월, 9월, 11월
      const targetDateFeb = new Date('2024-02-29'); // 2월 (윤년이라 29일까지)
      const targetDateApr = new Date('2024-04-30'); // 4월 (30일까지)
      const targetDateJun = new Date('2024-06-30'); // 6월 (30일까지)

      expect(
        shouldCreateOnDate(baseDate, targetDateFeb, RepeatType.MONTHLY)
      ).toBe(false);
      expect(
        shouldCreateOnDate(baseDate, targetDateApr, RepeatType.MONTHLY)
      ).toBe(false);
      expect(
        shouldCreateOnDate(baseDate, targetDateJun, RepeatType.MONTHLY)
      ).toBe(false);
    });

    it('30일 매월 반복 - 30일이 있는 달에서 true를 반환해야 함', () => {
      const baseDate = new Date('2024-04-30'); // 4월 30일

      const targetDateApr = new Date('2024-04-30'); // 4월 30일
      const targetDateJun = new Date('2024-06-30'); // 6월 30일
      const targetDateSep = new Date('2024-09-30'); // 9월 30일

      expect(
        shouldCreateOnDate(baseDate, targetDateApr, RepeatType.MONTHLY)
      ).toBe(true);
      expect(
        shouldCreateOnDate(baseDate, targetDateJun, RepeatType.MONTHLY)
      ).toBe(true);
      expect(
        shouldCreateOnDate(baseDate, targetDateSep, RepeatType.MONTHLY)
      ).toBe(true);
    });

    it('30일 매월 반복 - 2월에서 false를 반환해야 함', () => {
      const baseDate = new Date('2024-04-30'); // 4월 30일
      const targetDateFeb = new Date('2024-02-29'); // 2월 (30일이 없음)

      expect(
        shouldCreateOnDate(baseDate, targetDateFeb, RepeatType.MONTHLY)
      ).toBe(false);
    });

    it('29일 매월 반복 - 평년 2월에서 false를 반환해야 함', () => {
      const baseDate = new Date('2024-01-29'); // 1월 29일
      const targetDateFeb2023 = new Date('2023-02-28'); // 평년 2월 (29일이 없음)

      expect(
        shouldCreateOnDate(baseDate, targetDateFeb2023, RepeatType.MONTHLY)
      ).toBe(false);
    });

    it('29일 매월 반복 - 윤년 2월에서 true를 반환해야 함', () => {
      const baseDate = new Date('2024-01-29'); // 1월 29일
      const targetDateFeb2024 = new Date('2024-02-29'); // 윤년 2월 29일

      expect(
        shouldCreateOnDate(baseDate, targetDateFeb2024, RepeatType.MONTHLY)
      ).toBe(true);
    });
  });

  describe('handleMonthEndCase', () => {
    it('31일인 날짜에서 true를 반환해야 함', () => {
      const date31 = new Date('2024-01-31');
      expect(handleMonthEndCase(date31)).toBe(true);
    });

    it('30일인 날짜에서 해당 월의 마지막 날이면 true를 반환해야 함', () => {
      const date30Apr = new Date('2024-04-30'); // 4월은 30일까지
      expect(handleMonthEndCase(date30Apr)).toBe(true);
    });

    it('29일 이하의 날짜에서 false를 반환해야 함', () => {
      const date15 = new Date('2024-01-15');
      const date28 = new Date('2024-01-28');

      expect(handleMonthEndCase(date15)).toBe(false);
      expect(handleMonthEndCase(date28)).toBe(false);
    });
  });
});

describe('윤년 처리 로직', () => {
  describe('shouldCreateOnDate - 매년 반복', () => {
    it('2월 29일 매년 반복 - 윤년에서만 true를 반환해야 함', () => {
      const baseDate = new Date('2024-02-29'); // 윤년 2월 29일

      const targetLeapYear = new Date('2028-02-29'); // 2028년 윤년
      const targetNonLeapYear = new Date('2025-02-28'); // 2025년 평년

      expect(
        shouldCreateOnDate(baseDate, targetLeapYear, RepeatType.YEARLY)
      ).toBe(true);
      expect(
        shouldCreateOnDate(baseDate, targetNonLeapYear, RepeatType.YEARLY)
      ).toBe(false);
    });

    it('일반 날짜 매년 반복 - 모든 년도에서 true를 반환해야 함', () => {
      const baseDate = new Date('2024-06-15'); // 일반 날짜

      const target2025 = new Date('2025-06-15');
      const target2026 = new Date('2026-06-15');

      expect(shouldCreateOnDate(baseDate, target2025, RepeatType.YEARLY)).toBe(
        true
      );
      expect(shouldCreateOnDate(baseDate, target2026, RepeatType.YEARLY)).toBe(
        true
      );
    });
  });

  describe('handleLeapYearCase', () => {
    it('2월 29일 날짜에서 true를 반환해야 함', () => {
      const leapDate = new Date('2024-02-29');
      expect(handleLeapYearCase(leapDate)).toBe(true);
    });

    it('2월 29일이 아닌 날짜에서 false를 반환해야 함', () => {
      const normalDate = new Date('2024-02-28');
      const otherDate = new Date('2024-06-15');

      expect(handleLeapYearCase(normalDate)).toBe(false);
      expect(handleLeapYearCase(otherDate)).toBe(false);
    });
  });

  describe('isLeapYear', () => {
    it('윤년들이 올바르게 식별되어야 함', () => {
      expect(isLeapYear(2024)).toBe(true); // 4로 나누어떨어짐
      expect(isLeapYear(2000)).toBe(true); // 400으로 나누어떨어짐
      expect(isLeapYear(1600)).toBe(true); // 400으로 나누어떨어짐
    });

    it('평년들이 올바르게 식별되어야 함', () => {
      expect(isLeapYear(2023)).toBe(false); // 4로 나누어떨어지지 않음
      expect(isLeapYear(1900)).toBe(false); // 100으로 나누어떨어지지만 400으로는 안됨
      expect(isLeapYear(2100)).toBe(false); // 100으로 나누어떨어지지만 400으로는 안됨
    });
  });

  describe('getDaysInMonth', () => {
    it('각 월의 일수가 올바르게 반환되어야 함', () => {
      expect(getDaysInMonth(2024, 1)).toBe(31); // 1월
      expect(getDaysInMonth(2024, 2)).toBe(29); // 2월 (윤년)
      expect(getDaysInMonth(2023, 2)).toBe(28); // 2월 (평년)
      expect(getDaysInMonth(2024, 4)).toBe(30); // 4월
      expect(getDaysInMonth(2024, 12)).toBe(31); // 12월
    });
  });
});

describe('calculateNextOccurrence', () => {
  it('매일 반복 - 다음 날을 반환해야 함', () => {
    const startDate = new Date('2024-06-15');
    const nextDate = calculateNextOccurrence(startDate, RepeatType.DAILY, 1);

    expect(nextDate.getFullYear()).toBe(2024);
    expect(nextDate.getMonth()).toBe(5); // 6월 (0-based)
    expect(nextDate.getDate()).toBe(16);
  });

  it('매주 반복 - 다음 주 같은 요일을 반환해야 함', () => {
    const startDate = new Date('2024-06-15'); // 토요일
    const nextDate = calculateNextOccurrence(startDate, RepeatType.WEEKLY, 1);

    expect(nextDate.getFullYear()).toBe(2024);
    expect(nextDate.getMonth()).toBe(5); // 6월 (0-based)
    expect(nextDate.getDate()).toBe(22); // 다음 주 토요일
  });

  it('매월 반복 - 다음 달 같은 날을 반환해야 함', () => {
    const startDate = new Date('2024-06-15');
    const nextDate = calculateNextOccurrence(startDate, RepeatType.MONTHLY, 1);

    expect(nextDate.getFullYear()).toBe(2024);
    expect(nextDate.getMonth()).toBe(6); // 7월 (0-based)
    expect(nextDate.getDate()).toBe(15);
  });

  it('매년 반복 - 다음 해 같은 월/일을 반환해야 함', () => {
    const startDate = new Date('2024-06-15');
    const nextDate = calculateNextOccurrence(startDate, RepeatType.YEARLY, 1);

    expect(nextDate.getFullYear()).toBe(2025);
    expect(nextDate.getMonth()).toBe(5); // 6월 (0-based)
    expect(nextDate.getDate()).toBe(15);
  });
});
