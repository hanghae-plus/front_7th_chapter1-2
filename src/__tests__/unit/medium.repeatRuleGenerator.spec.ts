import { describe, it, expect } from 'vitest';

import { toISO8601Date } from '../../utils/dateUtils';
import { generateOccurrences } from '../../utils/repeatRuleGenerator';

/**
 * 반복 규칙 생성 로직 테스트
 * User Story: us001-recurring-event-selection.md
 */
describe('repeatRuleGenerator', () => {
  describe('generateDailyOccurrences', () => {
    it('interval=1, count 기반: 매일 5회 인스턴스', () => {
      const params = { type: 'daily', interval: 1, count: 5, startDate: '2025-11-01' };
      const result = generateOccurrences(params);
      expect(result.map(toISO8601Date)).toEqual([
        '2025-11-01',
        '2025-11-02',
        '2025-11-03',
        '2025-11-04',
        '2025-11-05',
      ]);
    });
    it('interval=2, count 기반: 격일 3회 인스턴스', () => {
      const params = { type: 'daily', interval: 2, count: 3, startDate: '2025-11-01' };
      const result = generateOccurrences(params);
      expect(result.map(toISO8601Date)).toEqual(['2025-11-01', '2025-11-03', '2025-11-05']);
    });
    it('until 기반: 시작~종료일 포함 모든 인스턴스', () => {
      const params = { type: 'daily', interval: 1, endDate: '2025-11-05', startDate: '2025-11-01' };
      const result = generateOccurrences(params);
      expect(result.map(toISO8601Date)).toEqual([
        '2025-11-01',
        '2025-11-02',
        '2025-11-03',
        '2025-11-04',
        '2025-11-05',
      ]);
    });
    it('startDate 포함 정확히 count개 생성', () => {
      const params = { type: 'daily', interval: 1, count: 5, startDate: '2025-11-01' };
      const result = generateOccurrences(params);
      expect(result).toHaveLength(5);
    });
  });

  describe('generateWeeklyOccurrences', () => {
    it('매주 같은 요일 인스턴스', () => {
      const params = { type: 'weekly', interval: 1, count: 3, startDate: '2025-10-29' };
      const res = generateOccurrences(params);
      expect(res.map(toISO8601Date)).toEqual(['2025-10-29', '2025-11-05', '2025-11-12']);
    });
    it('interval=2: 격주 생성', () => {
      const params = { type: 'weekly', interval: 2, count: 3, startDate: '2025-10-29' };
      const res = generateOccurrences(params);
      expect(res.map(toISO8601Date)).toEqual(['2025-10-29', '2025-11-12', '2025-11-26']);
    });
    it('until 기반: 해당 요일까지 인스턴스 생성', () => {
      const params = {
        type: 'weekly',
        interval: 1,
        endDate: '2025-11-26',
        startDate: '2025-11-05',
      };
      const res = generateOccurrences(params);
      expect(res.map(toISO8601Date)).toEqual([
        '2025-11-05',
        '2025-11-12',
        '2025-11-19',
        '2025-11-26',
      ]);
    });
  });

  describe('generateMonthlyOccurrences', () => {
    it('31일 시작: 31일 있는 달만 생성', () => {
      const params = { type: 'monthly', interval: 1, count: 5, startDate: '2025-01-31' };
      const res = generateOccurrences(params);
      expect(res.map(toISO8601Date)).toEqual([
        '2025-01-31',
        '2025-03-31',
        '2025-05-31',
        '2025-07-31',
        '2025-08-31',
      ]);
    });
    it('30일 시작: 2월 스킵, 나머지 달 생성', () => {
      const params = { type: 'monthly', interval: 1, count: 3, startDate: '2025-01-30' };
      const res = generateOccurrences(params);
      // 2월 포함 확인 X
      expect(res.map((d) => d.getMonth() + 1)).not.toContain(2);
    });
    it('29일 시작: 평년2월 포함 12개월', () => {
      const params = { type: 'monthly', interval: 1, count: 12, startDate: '2025-01-29' };
      const res = generateOccurrences(params);
      expect(res).toHaveLength(12);
    });
    it('interval > 1: 2개월마다 생성', () => {
      const params = { type: 'monthly', interval: 2, count: 3, startDate: '2025-01-15' };
      const res = generateOccurrences(params);
      expect(res.map(toISO8601Date)).toEqual(['2025-01-15', '2025-03-15', '2025-05-15']);
    });
  });

  describe('generateYearlyOccurrences', () => {
    it('2월 29일: 윤년만 생성(대체 없음)', () => {
      const params = {
        type: 'yearly',
        interval: 1,
        endDate: '2030-02-28',
        startDate: '2024-02-29',
      };
      const res = generateOccurrences(params);
      expect(res.map(toISO8601Date)).toEqual(['2024-02-29', '2028-02-29']);
    });
    it('일반 날짜: 연속 count회 생성', () => {
      const params = { type: 'yearly', interval: 1, count: 5, startDate: '2025-03-15' };
      const res = generateOccurrences(params);
      expect(res.map((r) => r.getFullYear())).toEqual([2025, 2026, 2027, 2028, 2029]);
    });
    it('interval > 1: 2년 간격만 생성', () => {
      const params = { type: 'yearly', interval: 2, count: 3, startDate: '2025-03-15' };
      const res = generateOccurrences(params);
      expect(res.map((r) => r.getFullYear())).toEqual([2025, 2027, 2029]);
    });
  });

  describe('엣지 케이스', () => {
    it('월말 31일 + monthly: 2월(31일) 스킵', () => {
      const params = { type: 'monthly', interval: 1, count: 3, startDate: '2025-01-31' };
      const res = generateOccurrences(params);
      expect(res.map((d) => d.getMonth() + 1)).not.toContain(2);
    });
    it('2월29일 + yearly: 평년은 모두 스킵', () => {
      const params = { type: 'yearly', interval: 1, count: 5, startDate: '2024-02-29' };
      const res = generateOccurrences(params);
      expect(res.map((r) => r.getFullYear())).toEqual([2024, 2028]);
    });
    it('count 기준 정확성', () => {
      const params = { type: 'daily', interval: 1, count: 5, startDate: '2025-11-01' };
      const res = generateOccurrences(params);
      expect(res).toHaveLength(5);
    });
    it('until 기준: until날짜 포함 생성', () => {
      const params = { type: 'daily', interval: 1, endDate: '2025-11-05', startDate: '2025-11-01' };
      const res = generateOccurrences(params);
      expect(res.map(toISO8601Date).pop()).toBe('2025-11-05');
    });
    it('interval=2로 올바른 간격 생성', () => {
      const params = { type: 'weekly', interval: 2, count: 2, startDate: '2025-11-01' };
      const res = generateOccurrences(params);
      expect(toISO8601Date(res[1])).toBe('2025-11-15');
    });
  });

  describe('생성 상한', () => {
    it('10,000회 이하는 생성 성공', () => {
      const params = { type: 'daily', interval: 1, count: 10000, startDate: '2025-01-01' };
      expect(() => generateOccurrences(params)).not.toThrow();
    });
  });
});
