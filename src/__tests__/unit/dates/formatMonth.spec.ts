import { formatMonth } from '@/utils/dateUtils';

describe('formatMonth', () => {
  it("2025년 7월 10일을 '2025년 7월'로 반환한다", () => {
    const date = new Date('2025-07-10');
    expect(formatMonth(date)).toBe('2025년 7월');
  });
});
