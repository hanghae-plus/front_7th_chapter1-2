import { Event } from '../../types';
import {
  generateRecurringEvents,
  getNextOccurrence,
  shouldSkipDate,
  isWithinRecurrenceRange,
  isLeapYear,
} from '../../utils/recurringEventUtils';

describe('generateRecurringEvents - Daily', () => {
  it('일별 반복 일정이 7일간 정확히 생성된다', () => {
    const event: Event = {
      id: '1',
      title: 'Daily Event',
      date: '2025-01-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'daily', interval: 1 },
      notificationTime: 0,
      isSeriesDefinition: true,
      seriesId: '1',
    };

    const instances = generateRecurringEvents(event, '2025-01-01', '2025-01-07');

    expect(instances).toHaveLength(7);
    expect(instances[0].date).toBe('2025-01-01');
    expect(instances[6].date).toBe('2025-01-07');
  });

  it('종료일이 설정된 일별 반복은 종료일 이후 생성되지 않는다', () => {
    const event: Event = {
      id: '1',
      title: 'Daily Event',
      date: '2025-01-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'daily', interval: 1, endDate: '2025-01-05' },
      notificationTime: 0,
      isSeriesDefinition: true,
      seriesId: '1',
    };

    const instances = generateRecurringEvents(event, '2025-01-01', '2025-01-10');

    expect(instances).toHaveLength(5);
    expect(instances[4].date).toBe('2025-01-05');
  });

  it('excludedDates에 포함된 날짜는 생성되지 않는다', () => {
    const event: Event = {
      id: '1',
      title: 'Daily Event',
      date: '2025-01-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'daily', interval: 1 },
      notificationTime: 0,
      isSeriesDefinition: true,
      seriesId: '1',
      excludedDates: ['2025-01-03', '2025-01-05'],
    };

    const instances = generateRecurringEvents(event, '2025-01-01', '2025-01-07');

    expect(instances).toHaveLength(5); // 7 days - 2 excluded
    expect(instances.map((e) => e.date)).not.toContain('2025-01-03');
    expect(instances.map((e) => e.date)).not.toContain('2025-01-05');
  });
});

describe('generateRecurringEvents - Weekly', () => {
  it('주별 반복 일정이 매주 수요일에 생성된다', () => {
    const event: Event = {
      id: '1',
      title: 'Weekly Event',
      date: '2025-01-08', // Wednesday
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'weekly', interval: 1 },
      notificationTime: 0,
      isSeriesDefinition: true,
      seriesId: '1',
    };

    const instances = generateRecurringEvents(event, '2025-01-01', '2025-01-31');

    expect(instances).toHaveLength(4); // Jan 8, 15, 22, 29
    expect(instances[0].date).toBe('2025-01-08');
    expect(instances[1].date).toBe('2025-01-15');
    expect(instances[2].date).toBe('2025-01-22');
    expect(instances[3].date).toBe('2025-01-29');
  });

  it('주별 반복은 시작일 이전에 생성되지 않는다', () => {
    const event: Event = {
      id: '1',
      title: 'Weekly Event',
      date: '2025-01-15', // Wednesday
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'weekly', interval: 1 },
      notificationTime: 0,
      isSeriesDefinition: true,
      seriesId: '1',
    };

    const instances = generateRecurringEvents(event, '2025-01-01', '2025-01-31');

    expect(instances).toHaveLength(3); // Jan 15, 22, 29 (not Jan 8)
    expect(instances[0].date).toBe('2025-01-15');
  });
});

describe('generateRecurringEvents - Monthly', () => {
  it('월별 반복 일정이 매월 15일에 생성된다', () => {
    const event: Event = {
      id: '1',
      title: 'Monthly Event',
      date: '2025-01-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'monthly', interval: 1 },
      notificationTime: 0,
      isSeriesDefinition: true,
      seriesId: '1',
    };

    const instances = generateRecurringEvents(event, '2025-01-01', '2025-06-30');

    expect(instances).toHaveLength(6); // Jan 15, Feb 15, Mar 15, Apr 15, May 15, Jun 15
    expect(instances[0].date).toBe('2025-01-15');
    expect(instances[5].date).toBe('2025-06-15');
  });

  it('31일 월별 반복은 31일이 있는 월에만 생성된다', () => {
    const event: Event = {
      id: '1',
      title: 'Monthly 31st Event',
      date: '2025-01-31',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'monthly', interval: 1 },
      notificationTime: 0,
      isSeriesDefinition: true,
      seriesId: '1',
    };

    const instances = generateRecurringEvents(event, '2025-01-01', '2025-12-31');

    // Jan, Mar, May, Jul, Aug, Oct, Dec = 7 months with 31 days
    expect(instances).toHaveLength(7);
    expect(instances.map((e) => e.date)).toEqual([
      '2025-01-31',
      '2025-03-31',
      '2025-05-31',
      '2025-07-31',
      '2025-08-31',
      '2025-10-31',
      '2025-12-31',
    ]);
  });

  it('30일 월별 반복은 2월을 제외한 모든 월에 생성된다', () => {
    const event: Event = {
      id: '1',
      title: 'Monthly 30th Event',
      date: '2025-01-30',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'monthly', interval: 1 },
      notificationTime: 0,
      isSeriesDefinition: true,
      seriesId: '1',
    };

    const instances = generateRecurringEvents(event, '2025-01-01', '2025-12-31');

    // All months except February (11 months)
    expect(instances).toHaveLength(11);
    expect(instances.map((e) => e.date)).not.toContain('2025-02-30');
  });
});

describe('generateRecurringEvents - Yearly', () => {
  it('연별 반복 일정이 매년 3월 10일에 생성된다', () => {
    const event: Event = {
      id: '1',
      title: 'Yearly Event',
      date: '2024-03-10',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'yearly', interval: 1 },
      notificationTime: 0,
      isSeriesDefinition: true,
      seriesId: '1',
    };

    const instances = generateRecurringEvents(event, '2024-01-01', '2026-12-31');

    expect(instances).toHaveLength(3); // 2024, 2025, 2026
    expect(instances[0].date).toBe('2024-03-10');
    expect(instances[1].date).toBe('2025-03-10');
    expect(instances[2].date).toBe('2026-03-10');
  });

  it('윤년 2월 29일 연별 반복은 윤년에만 생성된다', () => {
    const event: Event = {
      id: '1',
      title: 'Leap Day Birthday',
      date: '2024-02-29',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'yearly', interval: 1 },
      notificationTime: 0,
      isSeriesDefinition: true,
      seriesId: '1',
    };

    const instances = generateRecurringEvents(event, '2024-01-01', '2028-12-31');

    // 2024 (leap), 2028 (leap) = 2 instances
    // Skip 2025, 2026, 2027 (non-leap years)
    expect(instances).toHaveLength(2);
    expect(instances[0].date).toBe('2024-02-29');
    expect(instances[1].date).toBe('2028-02-29');
  });

  it('평년 2월 28일 연별 반복은 매년 생성된다', () => {
    const event: Event = {
      id: '1',
      title: 'Feb 28 Anniversary',
      date: '2024-02-28',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'yearly', interval: 1 },
      notificationTime: 0,
      isSeriesDefinition: true,
      seriesId: '1',
    };

    const instances = generateRecurringEvents(event, '2024-01-01', '2028-12-31');

    // All 5 years: 2024, 2025, 2026, 2027, 2028
    expect(instances).toHaveLength(5);
    expect(instances.map((e) => e.date)).toEqual([
      '2024-02-28',
      '2025-02-28',
      '2026-02-28',
      '2027-02-28',
      '2028-02-28',
    ]);
  });
});

describe('shouldSkipDate - Monthly Edge Cases', () => {
  it('2월 31일은 스킵된다 (존재하지 않는 날짜)', () => {
    expect(shouldSkipDate('2025-02-31', 'monthly', 31)).toBe(true);
  });

  it('4월 31일은 스킵된다 (30일까지만 존재)', () => {
    expect(shouldSkipDate('2025-04-31', 'monthly', 31)).toBe(true);
  });

  it('3월 31일은 스킵되지 않는다 (31일 존재)', () => {
    expect(shouldSkipDate('2025-03-31', 'monthly', 31)).toBe(false);
  });

  it('2월 30일은 스킵된다', () => {
    expect(shouldSkipDate('2025-02-30', 'monthly', 30)).toBe(true);
  });

  it('4월 30일은 스킵되지 않는다', () => {
    expect(shouldSkipDate('2025-04-30', 'monthly', 30)).toBe(false);
  });
});

describe('shouldSkipDate - Yearly Edge Cases', () => {
  it('평년의 2월 29일은 스킵된다', () => {
    expect(shouldSkipDate('2025-02-29', 'yearly')).toBe(true);
  });

  it('윤년의 2월 29일은 스킵되지 않는다', () => {
    expect(shouldSkipDate('2024-02-29', 'yearly')).toBe(false);
  });
});

describe('isLeapYear', () => {
  it('2024년은 윤년이다', () => {
    expect(isLeapYear(2024)).toBe(true);
  });

  it('2025년은 평년이다', () => {
    expect(isLeapYear(2025)).toBe(false);
  });

  it('2000년은 윤년이다 (400의 배수)', () => {
    expect(isLeapYear(2000)).toBe(true);
  });

  it('1900년은 평년이다 (100의 배수지만 400의 배수 아님)', () => {
    expect(isLeapYear(1900)).toBe(false);
  });
});

describe('isWithinRecurrenceRange', () => {
  it('종료일 이후 날짜는 범위 밖이다', () => {
    const event: Event = {
      id: '1',
      title: 'Event',
      date: '2025-01-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'daily', interval: 1, endDate: '2025-01-31' },
      notificationTime: 0,
    };

    expect(isWithinRecurrenceRange('2025-02-01', event)).toBe(false);
  });

  it('종료일 당일은 범위 내다', () => {
    const event: Event = {
      id: '1',
      title: 'Event',
      date: '2025-01-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'daily', interval: 1, endDate: '2025-01-31' },
      notificationTime: 0,
    };

    expect(isWithinRecurrenceRange('2025-01-31', event)).toBe(true);
  });

  it('시작일 이전 날짜는 범위 밖이다', () => {
    const event: Event = {
      id: '1',
      title: 'Event',
      date: '2025-01-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'daily', interval: 1 },
      notificationTime: 0,
    };

    expect(isWithinRecurrenceRange('2025-01-10', event)).toBe(false);
  });

  it('excludedDates에 포함된 날짜는 범위 밖이다', () => {
    const event: Event = {
      id: '1',
      title: 'Event',
      date: '2025-01-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'daily', interval: 1 },
      notificationTime: 0,
      excludedDates: ['2025-01-15'],
    };

    expect(isWithinRecurrenceRange('2025-01-15', event)).toBe(false);
  });
});

describe('getNextOccurrence', () => {
  it('일별 반복의 다음 발생일을 계산한다', () => {
    expect(getNextOccurrence('2025-01-15', 'daily', 1)).toBe('2025-01-16');
  });

  it('주별 반복의 다음 발생일을 계산한다', () => {
    expect(getNextOccurrence('2025-01-15', 'weekly', 1)).toBe('2025-01-22');
  });

  it('월별 반복의 다음 발생일을 계산한다', () => {
    expect(getNextOccurrence('2025-01-15', 'monthly', 1)).toBe('2025-02-15');
  });

  it('연별 반복의 다음 발생일을 계산한다', () => {
    expect(getNextOccurrence('2025-01-15', 'yearly', 1)).toBe('2026-01-15');
  });
});
