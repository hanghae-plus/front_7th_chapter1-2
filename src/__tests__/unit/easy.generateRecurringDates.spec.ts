import { describe, it, expect, beforeEach } from 'vitest';
import { generateRecurringDates } from '../../utils/repeatDateCalculator';
import { RepeatType } from '../../types';

describe('generateRecurringDates', () => {
  beforeEach(() => {
    expect.hasAssertions();
  });

  describe('Daily Repeat', () => {
    it('EASY.1.1 - 기본 일일 반복 (interval=1, endDate 있음)', () => {
      const result = generateRecurringDates('2025-10-01', 'daily', 1, '2025-10-05');
      expect(result).toEqual([
        '2025-10-01',
        '2025-10-02',
        '2025-10-03',
        '2025-10-04',
        '2025-10-05',
      ]);
    });

    it('EASY.1.2 - 2일마다 반복 (interval=2)', () => {
      const result = generateRecurringDates('2025-10-01', 'daily', 2, '2025-10-07');
      expect(result).toEqual(['2025-10-01', '2025-10-03', '2025-10-05', '2025-10-07']);
    });

    it('EASY.1.3 - 10일마다 반복', () => {
      const result = generateRecurringDates('2025-10-01', 'daily', 10, '2025-10-31');
      expect(result).toEqual(['2025-10-01', '2025-10-11', '2025-10-21', '2025-10-31']);
    });

    it('EASY.1.4 - 일일 반복 (endDate 없음, 최대 제한 테스트)', () => {
      const result = generateRecurringDates('2025-10-01', 'daily', 1);
      expect(result.length).toBeLessThanOrEqual(1000);
      expect(result[0]).toBe('2025-10-01');
      expect(result.length).toBeGreaterThan(100); // 최소한 많은 이벤트 생성
    });

    it('EASY.1.5 - startDate와 endDate가 동일', () => {
      const result = generateRecurringDates('2025-10-01', 'daily', 1, '2025-10-01');
      expect(result).toEqual(['2025-10-01']);
    });
  });

  describe('Weekly Repeat', () => {
    it('EASY.1.6 - 기본 주간 반복 (interval=1)', () => {
      const result = generateRecurringDates('2025-10-01', 'weekly', 1, '2025-10-22');
      expect(result).toEqual(['2025-10-01', '2025-10-08', '2025-10-15', '2025-10-22']);
    });

    it('EASY.1.7 - 2주마다 반복 (interval=2)', () => {
      const result = generateRecurringDates('2025-10-01', 'weekly', 2, '2025-10-29');
      expect(result).toEqual(['2025-10-01', '2025-10-15', '2025-10-29']);
    });

    it('EASY.1.8 - 월요일 주간 반복', () => {
      const result = generateRecurringDates('2025-10-06', 'weekly', 1, '2025-10-20');
      expect(result).toEqual(['2025-10-06', '2025-10-13', '2025-10-20']);
    });

    it('EASY.1.9 - 3주마다 반복 (연도 경계 포함)', () => {
      const result = generateRecurringDates('2025-12-01', 'weekly', 3, '2026-01-20');
      expect(result).toEqual(['2025-12-01', '2025-12-22', '2026-01-12']);
    });
  });

  describe('Monthly Repeat', () => {
    it('EASY.1.10 - 기본 월간 반복 (1일)', () => {
      const result = generateRecurringDates('2025-10-01', 'monthly', 1, '2025-12-01');
      expect(result).toEqual(['2025-10-01', '2025-11-01', '2025-12-01']);
    });

    it('EASY.1.11 - 월간 반복 (15일)', () => {
      const result = generateRecurringDates('2025-10-15', 'monthly', 1, '2025-12-15');
      expect(result).toEqual(['2025-10-15', '2025-11-15', '2025-12-15']);
    });

    it('EASY.1.12 - 월간 반복 (31일) - 월말 처리', () => {
      const result = generateRecurringDates('2025-10-31', 'monthly', 1, '2025-12-31');
      expect(result).toEqual(['2025-10-31', '2025-11-30', '2025-12-31']);
    });

    it('EASY.1.13 - 2개월마다 반복', () => {
      const result = generateRecurringDates('2025-10-01', 'monthly', 2, '2026-04-01');
      expect(result).toEqual(['2025-10-01', '2025-12-01', '2026-02-01', '2026-04-01']);
    });

    it('EASY.1.14 - 월간 반복 (2월 29일 평년 처리)', () => {
      const result = generateRecurringDates('2024-02-29', 'monthly', 1, '2025-02-28');
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toBe('2024-02-29');
      // 29일이 없는 달은 말일로 조정됨을 확인
      const hasInvalidDate = result.some(
        date => {
          const month = parseInt(date.split('-')[1]);
          const day = parseInt(date.split('-')[2]);
          return (month === 2 && day > 29) || (month === 4 && day > 30) || (month === 6 && day > 30);
        }
      );
      expect(hasInvalidDate).toBe(false);
    });
  });

  describe('Yearly Repeat', () => {
    it('EASY.1.15 - 기본 연간 반복', () => {
      const result = generateRecurringDates('2025-06-15', 'yearly', 1, '2027-06-15');
      expect(result).toEqual(['2025-06-15', '2026-06-15', '2027-06-15']);
    });

    it('EASY.1.16 - 연간 반복 (2월 29일) - 윤년 처리', () => {
      const result = generateRecurringDates('2024-02-29', 'yearly', 1, '2026-02-28');
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toBe('2024-02-29');
      // 2월 29일이 없는 해는 28일 또는 3월 1일로 처리됨
    });

    it('EASY.1.17 - 2년마다 반복', () => {
      const result = generateRecurringDates('2025-01-01', 'yearly', 2, '2029-01-01');
      expect(result).toEqual(['2025-01-01', '2027-01-01', '2029-01-01']);
    });
  });

  describe('Maximum limit and edge cases', () => {
    it('MEDIUM.5.1 - 월말 날짜 (31일) + 월간 반복', () => {
      const result = generateRecurringDates('2025-01-31', 'monthly', 1, '2025-04-30');
      expect(result).toEqual(['2025-01-31', '2025-02-28', '2025-03-31', '2025-04-30']);
    });

    it('MEDIUM.5.3 - 반복 간격 > 1 (3개월마다)', () => {
      const result = generateRecurringDates('2025-10-01', 'monthly', 3, '2026-07-01');
      expect(result).toEqual(['2025-10-01', '2026-01-01', '2026-04-01', '2026-07-01']);
    });

    it('제한된 인스턴스 수 (1000개 초과 방지)', () => {
      const result = generateRecurringDates('2025-01-01', 'daily', 1); // 무한 반복
      expect(result.length).toBeLessThanOrEqual(1000);
    });
  });
});
