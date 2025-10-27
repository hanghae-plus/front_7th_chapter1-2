import { describe, it, expect, beforeEach } from 'vitest';
import { validateRepeatInfo } from '../../utils/repeatDateCalculator';
import { RepeatInfo } from '../../types';

describe('validateRepeatInfo', () => {
  beforeEach(() => {
    expect.hasAssertions();
  });

  describe('Valid inputs', () => {
    it('EASY.2.1 - 유효한 daily 반복', () => {
      const repeatInfo: RepeatInfo = {
        type: 'daily',
        interval: 1,
        endDate: '2025-10-31',
      };
      const result = validateRepeatInfo('2025-10-01', repeatInfo);
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('EASY.2.2 - 유효한 weekly 반복', () => {
      const repeatInfo: RepeatInfo = {
        type: 'weekly',
        interval: 2,
        endDate: '2025-11-01',
      };
      const result = validateRepeatInfo('2025-10-01', repeatInfo);
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('EASY.2.3 - 유효한 monthly 반복 (endDate 없음)', () => {
      const repeatInfo: RepeatInfo = {
        type: 'monthly',
        interval: 1,
      };
      const result = validateRepeatInfo('2025-10-01', repeatInfo);
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('EASY.2.4 - 유효한 yearly 반복', () => {
      const repeatInfo: RepeatInfo = {
        type: 'yearly',
        interval: 3,
        endDate: '2035-06-15',
      };
      const result = validateRepeatInfo('2025-06-15', repeatInfo);
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });
  });

  describe('Invalid inputs - interval validation', () => {
    it('EASY.2.5 - interval이 0인 경우', () => {
      const repeatInfo: RepeatInfo = {
        type: 'daily',
        interval: 0,
        endDate: '2025-10-05',
      };
      const result = validateRepeatInfo('2025-10-01', repeatInfo);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('반복 간격');
    });

    it('EASY.2.6 - interval이 음수인 경우', () => {
      const repeatInfo: RepeatInfo = {
        type: 'daily',
        interval: -1,
        endDate: '2025-10-05',
      };
      const result = validateRepeatInfo('2025-10-01', repeatInfo);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('반복 간격');
    });

    it('EASY.2.9 - interval이 1000을 초과', () => {
      const repeatInfo: RepeatInfo = {
        type: 'daily',
        interval: 1001,
      };
      const result = validateRepeatInfo('2025-10-01', repeatInfo);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('반복 간격');
    });
  });

  describe('Invalid inputs - date validation', () => {
    it('EASY.2.7 - endDate가 startDate보다 이전', () => {
      const repeatInfo: RepeatInfo = {
        type: 'daily',
        interval: 1,
        endDate: '2025-09-30',
      };
      const result = validateRepeatInfo('2025-10-01', repeatInfo);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('반복 종료일');
    });

    it('EASY.2.8 - endDate 형식이 잘못된 경우', () => {
      const repeatInfo: RepeatInfo = {
        type: 'daily',
        interval: 1,
        endDate: '10/01/2025',
      };
      const result = validateRepeatInfo('2025-10-01', repeatInfo);
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe('Edge cases', () => {
    it('startDate와 endDate가 동일', () => {
      const repeatInfo: RepeatInfo = {
        type: 'daily',
        interval: 1,
        endDate: '2025-10-01',
      };
      const result = validateRepeatInfo('2025-10-01', repeatInfo);
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('interval이 1인 경우 (최소값)', () => {
      const repeatInfo: RepeatInfo = {
        type: 'daily',
        interval: 1,
      };
      const result = validateRepeatInfo('2025-10-01', repeatInfo);
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('interval이 1000인 경우 (최대값)', () => {
      const repeatInfo: RepeatInfo = {
        type: 'daily',
        interval: 1000,
      };
      const result = validateRepeatInfo('2025-10-01', repeatInfo);
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });
  });
});
