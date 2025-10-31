// src/**tests**/unit/generateRecurringDates.spec.ts
import { describe, it, expect } from 'vitest';
import { generateRecurringDates } from '@/utils/generateRecurringDates';

describe('generateRecurringDates', () => {
describe('매일 반복', () => {
it('매일 반복 일정을 생성할 수 있다', () => {
const dates = generateRecurringDates({
type: 'daily',
startDate: '2025-01-01',
endDate: '2025-01-07',
interval: 1
});

      expect(dates).toHaveLength(7);
      expect(dates[0]).toBe('2025-01-01');
      expect(dates[6]).toBe('2025-01-07');
    });

});

describe('매월 반복', () => {
it('매월 31일 반복 시 31일이 없는 달에는 생성되지 않는다', () => {
const dates = generateRecurringDates({
type: 'monthly',
startDate: '2025-01-31',
endDate: '2025-04-30',
interval: 1
});

      // 1월(31일), 3월(31일)만 생성, 2월은 제외
      expect(dates).toHaveLength(2);
      expect(dates).toContain('2025-01-31');
      expect(dates).toContain('2025-03-31');
    });

});
});
