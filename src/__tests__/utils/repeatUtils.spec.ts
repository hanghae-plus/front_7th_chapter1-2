// src/__tests__/utils/repeatUtils.spec.ts
import {
  calculateDailyDates,
  calculateWeeklyDates,
  calculateMonthlyDates,
  calculateYearlyDates,
  expandRecurringEvents,
} from '../../utils/repeatUtils';

describe('calculateDailyDates', () => {
  it('간격이 1일 때 종료일까지 매일 반복되는 날짜를 올바르게 생성해야 한다', () => {
    const startDate = '2025-11-01';
    const endDate = '2025-11-03';
    const interval = 1;
    const expectedDates = ['2025-11-01', '2025-11-02', '2025-11-03'];
    // 이 테스트는 calculateDailyDates 함수가 아직 없으므로 실패해야 합니다.
    expect(calculateDailyDates(startDate, interval, endDate)).toEqual(expectedDates);
  });

  it('간격이 2일 때 종료일까지 격일로 반복되는 날짜를 올바르게 생성해야 한다', () => {
    const startDate = '2025-11-01';
    const endDate = '2025-11-05';
    const interval = 2;
    const expectedDates = ['2025-11-01', '2025-11-03', '2025-11-05'];
    expect(calculateDailyDates(startDate, interval, endDate)).toEqual(expectedDates);
  });

  it('간격이 0 이하일 경우 빈 배열을 반환해야 한다', () => {
    const startDate = '2025-11-01';
    const endDate = '2025-11-05';
    const interval = 0;
    const expectedDates: string[] = [];
    expect(calculateDailyDates(startDate, interval, endDate)).toEqual(expectedDates);
  });

  it('시작일과 종료일이 같을 때를 처리해야 한다', () => {
    const startDate = '2025-11-01';
    const endDate = '2025-11-01';
    const interval = 1;
    const expectedDates = ['2025-11-01'];
    expect(calculateDailyDates(startDate, interval, endDate)).toEqual(expectedDates);
  });

  it('종료일을 초과하는 날짜를 생성하지 않아야 한다', () => {
    const startDate = '2025-11-01';
    const endDate = '2025-11-02';
    const interval = 2;
    const expectedDates = ['2025-11-01'];
    expect(calculateDailyDates(startDate, interval, endDate)).toEqual(expectedDates);
  });
}); // calculateDailyDates describe 블록 종료

describe('calculateWeeklyDates', () => {
  it('간격이 1이고 특정 요일이 선택되었을 때 매주 반복되는 날짜를 올바르게 생성해야 한다', () => {
    const startDate = '2025-11-03'; // 월요일
    const endDate = '2025-11-10';
    const interval = 1;
    const daysOfWeek = [1]; // 월요일
    const expectedDates = ['2025-11-03', '2025-11-10'];
    expect(calculateWeeklyDates(startDate, interval, daysOfWeek, endDate)).toEqual(expectedDates);
  });

  it('간격이 2이고 특정 요일이 선택되었을 때 격주로 반복되는 날짜를 올바르게 생성해야 한다', () => {
    const startDate = '2025-11-03'; // 월요일
    const endDate = '2025-11-17';
    const interval = 2;
    const daysOfWeek = [1]; // 월요일
    const expectedDates = ['2025-11-03', '2025-11-17']; // 2주 간격 월요일
    expect(calculateWeeklyDates(startDate, interval, daysOfWeek, endDate)).toEqual(expectedDates);
  });

  it('간격이 0 이하일 경우 빈 배열을 반환해야 한다', () => {
    const startDate = '2025-11-03';
    const endDate = '2025-11-10';
    const interval = 0; // Invalid interval
    const daysOfWeek = [1]; // 월요일
    const expectedDates: string[] = [];
    expect(calculateWeeklyDates(startDate, interval, daysOfWeek, endDate)).toEqual(expectedDates);
  });

  it('시작일과 종료일이 같을 때를 처리해야 한다', () => {
    const startDate = '2025-11-03'; // 월요일
    const endDate = '2025-11-03';
    const interval = 1;
    const daysOfWeek = [1]; // 월요일
    const expectedDates = ['2025-11-03'];
    expect(calculateWeeklyDates(startDate, interval, daysOfWeek, endDate)).toEqual(expectedDates);
  });

  it('종료일을 초과하는 날짜를 생성하지 않아야 한다', () => {
    const startDate = '2025-11-03'; // 월요일
    const endDate = '2025-11-04'; // 화요일
    const interval = 1;
    const daysOfWeek = [1]; // 월요일
    const expectedDates = ['2025-11-03'];
    expect(calculateWeeklyDates(startDate, interval, daysOfWeek, endDate)).toEqual(expectedDates);
  });

  it('선택된 요일이 시작일 이전에 있을 경우 시작일부터 일정을 생성해야 한다', () => {
    const startDate = '2025-11-05'; // 수요일
    const endDate = '2025-11-12';
    const interval = 1;
    const daysOfWeek = [1]; // 월요일 (시작일 이전)
    const expectedDates = ['2025-11-10']; // 다음 월요일부터 시작
    expect(calculateWeeklyDates(startDate, interval, daysOfWeek, endDate)).toEqual(expectedDates);
  });
});

describe('calculateMonthlyDates', () => {
  it('간격이 1이고 특정 일자가 선택되었을 때 매월 반복되는 날짜를 올바르게 생성해야 한다', () => {
    const startDate = '2025-01-15';
    const endDate = '2025-03-15';
    const interval = 1;
    const dayOfMonth = 15;
    const expectedDates = ['2025-01-15', '2025-02-15', '2025-03-15'];
    expect(calculateMonthlyDates(startDate, interval, dayOfMonth, endDate)).toEqual(expectedDates);
  });
});

describe('calculateYearlyDates', () => {
  it('간격이 1이고 특정 월/일이 선택되었을 때 매년 반복되는 날짜를 올바르게 생성해야 한다', () => {
    const startDate = '2025-01-15';
    const endDate = '2027-01-15';
    const interval = 1;
    const month = 0; // January (0-indexed)
    const dayOfMonth = 15;
    const expectedDates = ['2025-01-15', '2026-01-15', '2027-01-15'];
    expect(calculateYearlyDates(startDate, interval, month, dayOfMonth, endDate)).toEqual(
      expectedDates
    );
  });
});

// RED 단계: Hotfix-Story-006.1 - expandRecurringEvents 단위 테스트
describe('expandRecurringEvents', () => {
  it('매일 반복되는 이벤트를 주어진 기간에 맞게 올바르게 확장해야 한다', () => {
    const dailyEvent = {
      id: '1',
      title: '매일 회의',
      date: '2025-10-15',
      startTime: '10:00',
      endTime: '11:00',
      repeat: { type: 'daily', interval: 1, endDate: '2025-10-17' },
    };
    const events = [dailyEvent];
    const rangeStart = new Date('2025-10-15');
    const rangeEnd = new Date('2025-10-17');

    const expected = [
      { ...dailyEvent, date: '2025-10-15' },
      { ...dailyEvent, date: '2025-10-16' },
      { ...dailyEvent, date: '2025-10-17' },
    ];

    const result = expandRecurringEvents(events, rangeStart, rangeEnd);
    expect(result).toEqual(expect.arrayContaining(expected));
    expect(result.length).toBe(expected.length);
  });

  it('매주 반복되는 이벤트를 주어진 기간에 맞게 올바르게 확장해야 한다', () => {
    const weeklyEvent = {
      id: '2',
      title: '주간 회의',
      date: '2025-10-13', // 월요일
      startTime: '09:00',
      endTime: '10:00',
      repeat: { type: 'weekly', interval: 1, daysOfWeek: [1], endDate: '2025-10-27' },
    };
    const events = [weeklyEvent];
    const rangeStart = new Date('2025-10-13');
    const rangeEnd = new Date('2025-10-27');

    const expected = [
      { ...weeklyEvent, date: '2025-10-13' },
      { ...weeklyEvent, date: '2025-10-20' },
      { ...weeklyEvent, date: '2025-10-27' },
    ];

    const result = expandRecurringEvents(events, rangeStart, rangeEnd);
    expect(result).toEqual(expect.arrayContaining(expected));
    expect(result.length).toBe(expected.length);
  });

  it('매월 반복되는 이벤트를 주어진 기간에 맞게 올바르게 확장해야 한다', () => {
    const monthlyEvent = {
      id: '3',
      title: '월간 보고',
      date: '2025-01-15',
      startTime: '14:00',
      endTime: '15:00',
      repeat: { type: 'monthly', interval: 1, dayOfMonth: 15, endDate: '2025-03-15' },
    };
    const events = [monthlyEvent];
    const rangeStart = new Date('2025-01-01');
    const rangeEnd = new Date('2025-03-31');

    const expected = [
      { ...monthlyEvent, date: '2025-01-15' },
      { ...monthlyEvent, date: '2025-02-15' },
      { ...monthlyEvent, date: '2025-03-15' },
    ];

    const result = expandRecurringEvents(events, rangeStart, rangeEnd);
    expect(result).toEqual(expect.arrayContaining(expected));
    expect(result.length).toBe(expected.length);
  });

  it('매년 반복되는 이벤트를 주어진 기간에 맞게 올바르게 확장해야 한다', () => {
    const yearlyEvent = {
      id: '4',
      title: '연간 행사',
      date: '2024-02-29', // 윤년
      startTime: '09:00',
      endTime: '18:00',
      repeat: {
        type: 'yearly',
        interval: 1,
        monthOfYear: 1,
        dayOfMonth: 29,
        endDate: '2028-02-29',
      },
    };
    const events = [yearlyEvent];
    const rangeStart = new Date('2024-01-01');
    const rangeEnd = new Date('2028-12-31');

    const expected = [
      { ...yearlyEvent, date: '2024-02-29' },
      { ...yearlyEvent, date: '2028-02-29' },
    ];

    const result = expandRecurringEvents(events, rangeStart, rangeEnd);
    expect(result).toEqual(expect.arrayContaining(expected));
    expect(result.length).toBe(expected.length);
  });

  it('매년 반복되는 윤년 2월 29일 이벤트는 윤년에만 올바르게 확장되어야 한다', () => {
    const leapYearEvent = {
      id: '5',
      title: '윤년 행사',
      date: '2024-02-29', // 윤년 시작일
      startTime: '10:00',
      endTime: '11:00',
      repeat: {
        type: 'yearly',
        interval: 1,
        monthOfYear: 1,
        dayOfMonth: 29,
        endDate: '2028-02-29',
      },
    };
    const events = [leapYearEvent];
    const rangeStart = new Date('2024-01-01');
    const rangeEnd = new Date('2028-12-31');

    const expected = [
      { ...leapYearEvent, date: '2024-02-29' },
      { ...leapYearEvent, date: '2028-02-29' },
    ];

    const result = expandRecurringEvents(events, rangeStart, rangeEnd);
    expect(result).toEqual(expect.arrayContaining(expected));
    expect(result.length).toBe(expected.length);
  });
});
