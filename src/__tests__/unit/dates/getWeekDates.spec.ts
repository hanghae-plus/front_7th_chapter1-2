import { getWeekDates } from '@/utils/dateUtils';

describe('getWeekDates', () => {
  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const date = new Date('2025-07-09'); // 수요일
    const weekDates = getWeekDates(date);
    expect(weekDates).toHaveLength(7);
    expect(weekDates[0].toISOString().split('T')[0]).toBe('2025-07-06'); // 일요일
    expect(weekDates[6].toISOString().split('T')[0]).toBe('2025-07-12'); // 토요일
  });

  it('주의 시작(월요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const date = new Date('2025-07-07'); // 월요일
    const weekDates = getWeekDates(date);
    expect(weekDates).toHaveLength(7);
    expect(weekDates[0].toISOString().split('T')[0]).toBe('2025-07-06'); // 일요일
    expect(weekDates[6].toISOString().split('T')[0]).toBe('2025-07-12'); // 토요일
  });

  it('주의 끝(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const date = new Date('2025-07-12'); // 토요일
    const weekDates = getWeekDates(date);
    expect(weekDates).toHaveLength(7);
    expect(weekDates[0].toISOString().split('T')[0]).toBe('2025-07-06'); // 일요일
    expect(weekDates[6].toISOString().split('T')[0]).toBe('2025-07-12'); // 일요일
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    const date = new Date('2024-12-30'); // 월요일
    const weekDates = getWeekDates(date);
    expect(weekDates[0].toISOString().split('T')[0]).toBe('2024-12-29'); // 일요일
    expect(weekDates[6].toISOString().split('T')[0]).toBe('2025-01-04'); // 토요일
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    const date = new Date('2025-01-01'); // 수요일
    const weekDates = getWeekDates(date);
    expect(weekDates[0].toISOString().split('T')[0]).toBe('2024-12-29'); // 일요일
    expect(weekDates[6].toISOString().split('T')[0]).toBe('2025-01-04'); // 토요일
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    const date = new Date('2024-02-29'); // 목요일 (윤년)
    const weekDates = getWeekDates(date);
    expect(weekDates[0].toISOString().split('T')[0]).toBe('2024-02-25'); // 일요일
    expect(weekDates[6].toISOString().split('T')[0]).toBe('2024-03-02'); // 토요일
  });

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    const date = new Date('2025-04-30'); // 수요일
    const weekDates = getWeekDates(date);
    expect(weekDates[0].toISOString().split('T')[0]).toBe('2025-04-27'); // 일요일
    expect(weekDates[6].toISOString().split('T')[0]).toBe('2025-05-03'); // 토요일
  });
});
