import {
  isLeapYear,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  toISO8601Date,
  fromISO8601Date,
} from '../../utils/dateUtils';

/**
 * 날짜/시간 유틸리티 확장 테스트
 *
 * 반복 일정 기능에 필요한 날짜 연산 함수 및 윤년 판단 함수 테스트
 * User Story: us001-recurring-event-selection.md
 * Technical Notes: 날짜 유틸리티 확장
 */
describe('dateTimeUtils (반복 일정 확장)', () => {
  describe('isLeapYear', () => {
    it('윤년이면 true를 반환한다', () => {
      expect(isLeapYear(2024)).toBe(true);
    });

    it('평년이면 false를 반환한다', () => {
      expect(isLeapYear(2025)).toBe(false);
    });

    it('400의 배수인 해는 윤년이다', () => {
      expect(isLeapYear(2000)).toBe(true);
      expect(isLeapYear(2400)).toBe(true);
    });

    it('100의 배수이지만 400의 배수가 아닌 해는 평년이다', () => {
      expect(isLeapYear(1900)).toBe(false);
      expect(isLeapYear(2100)).toBe(false);
    });
  });

  describe('addDays', () => {
    it('지정된 일수를 더한 날짜를 반환한다', () => {
      const date = new Date('2025-11-01');
      const newDate = addDays(date, 5);
      expect(toISO8601Date(newDate)).toBe('2025-11-06');
    });

    it('월이 넘어갈 때 올바르게 처리한다', () => {
      const date = new Date('2025-11-30');
      const newDate = addDays(date, 2);
      expect(toISO8601Date(newDate)).toBe('2025-12-02');
    });

    it('연도가 넘어갈 때 올바르게 처리한다', () => {
      const date = new Date('2025-12-31');
      const newDate = addDays(date, 1);
      expect(toISO8601Date(newDate)).toBe('2026-01-01');
    });
  });

  describe('addWeeks', () => {
    it('지정된 주수를 더한 날짜를 반환한다', () => {
      const date = new Date('2025-11-01');
      const newDate = addWeeks(date, 2);
      expect(toISO8601Date(newDate)).toBe('2025-11-15');
    });

    it('요일을 유지한다', () => {
      const date = new Date('2025-10-29'); // Wednesday
      const newDate = addWeeks(date, 1);
      expect(toISO8601Date(newDate)).toBe('2025-11-05');
      expect(newDate.getDay()).toBe(3); // Wednesday
    });
  });

  describe('addMonths', () => {
    it('지정된 개월수를 더한 날짜를 반환한다', () => {
      const date = new Date('2025-01-15');
      const newDate = addMonths(date, 2);
      expect(toISO8601Date(newDate)).toBe('2025-03-15');
    });

    it('존재하지 않는 날짜는 해당 월의 마지막 날로 설정된다', () => {
      const date = new Date('2025-01-31');
      const newDate = addMonths(date, 1);
      expect(toISO8601Date(newDate)).toBe('2025-03-03'); // date-fns behavior
    });
  });

  describe('addYears', () => {
    it('지정된 년수를 더한 날짜를 반환한다', () => {
      const date = new Date('2025-03-15');
      const newDate = addYears(date, 2);
      expect(toISO8601Date(newDate)).toBe('2027-03-15');
    });

    it('2월 29일이 평년으로 넘어갈 때 해당 월의 마지막 날로 설정된다', () => {
      const date = new Date('2024-02-29');
      const newDate = addYears(date, 1);
      expect(toISO8601Date(newDate)).toBe('2025-03-01'); // date-fns behavior
    });
  });

  describe('ISO 8601 날짜 변환', () => {
    it('Date 객체를 ISO 8601 날짜 문자열로 변환한다', () => {
      const date = new Date(2025, 10, 1);
      expect(toISO8601Date(date)).toBe('2025-11-01');
    });

    it('ISO 8601 날짜 문자열을 Date 객체로 파싱한다', () => {
      const dateString = '2025-11-01';
      const date = fromISO8601Date(dateString);
      expect(date.getFullYear()).toBe(2025);
      expect(date.getMonth()).toBe(10);
      expect(date.getDate()).toBe(1);
    });
  });
});
