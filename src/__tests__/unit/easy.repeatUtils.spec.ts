import { describe, it, expect } from 'vitest';

import { Event, EventForm, RepeatType } from '../../types';
import {
  generateRepeatInstances,
  generateRecurringInstances,
  formatDate,
  getDayOfWeek,
  isLeapYear,
  shouldSkipDate,
  getNextOccurrence,
} from '../../utils/repeatUtils';

describe('generateRepeatInstances', () => {
  it('매일 반복 일정의 모든 인스턴스를 생성한다 (10일간)', () => {
    // Arrange
    const event: Event = {
      id: '1',
      title: '매일 회의',
      date: '2025-01-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '매일 반복되는 회의',
      location: '회의실',
      category: '업무',
      repeat: {
        type: 'daily',
        interval: 1,
        endDate: '2025-01-10',
      },
      notificationTime: 10,
    };

    // Act
    const instances = generateRepeatInstances(event);

    // Assert
    expect(instances).toHaveLength(10);
    expect(instances[0].date).toBe('2025-01-01');
    expect(instances[9].date).toBe('2025-01-10');
  });
});

describe('formatDate', () => {
  it('Date 객체를 YYYY-MM-DD 형식 문자열로 변환한다', () => {
    // Arrange
    const date = new Date('2025-01-01');

    // Act
    const formatted = formatDate(date);

    // Assert
    expect(formatted).toBe('2025-01-01');
  });

  it('월과 일이 한 자리수일 때 0 패딩을 추가한다', () => {
    // Arrange
    const date = new Date('2025-01-05');

    // Act
    const formatted = formatDate(date);

    // Assert
    expect(formatted).toBe('2025-01-05');
  });

  it('연말 날짜를 올바르게 변환한다', () => {
    // Arrange
    const date = new Date('2025-12-31');

    // Act
    const formatted = formatDate(date);

    // Assert
    expect(formatted).toBe('2025-12-31');
  });
});

describe('getDayOfWeek', () => {
  it('2025-01-06(월요일)의 요일을 1로 반환한다', () => {
    // Arrange
    const date = new Date('2025-01-06');

    // Act
    const dayOfWeek = getDayOfWeek(date);

    // Assert
    expect(dayOfWeek).toBe(1);
  });

  it('2025-01-05(일요일)의 요일을 0으로 반환한다', () => {
    // Arrange
    const date = new Date('2025-01-05');

    // Act
    const dayOfWeek = getDayOfWeek(date);

    // Assert
    expect(dayOfWeek).toBe(0);
  });

  it('2025-01-11(토요일)의 요일을 6으로 반환한다', () => {
    // Arrange
    const date = new Date('2025-01-11');

    // Act
    const dayOfWeek = getDayOfWeek(date);

    // Assert
    expect(dayOfWeek).toBe(6);
  });
});

describe('isLeapYear', () => {
  it('2024년은 윤년이므로 true를 반환한다', () => {
    // Act
    const result = isLeapYear(2024);

    // Assert
    expect(result).toBe(true);
  });

  it('2025년은 평년이므로 false를 반환한다', () => {
    // Act
    const result = isLeapYear(2025);

    // Assert
    expect(result).toBe(false);
  });

  it('2000년은 400으로 나누어떨어지므로 윤년(true)이다', () => {
    // Act
    const result = isLeapYear(2000);

    // Assert
    expect(result).toBe(true);
  });

  it('1900년은 100으로 나누어떨어지지만 400으로는 안되므로 평년(false)이다', () => {
    // Act
    const result = isLeapYear(1900);

    // Assert
    expect(result).toBe(false);
  });
});

describe('shouldSkipDate', () => {
  it('2월 28일은 건너뜀 (매월 31일 반복)', () => {
    // Arrange
    const date = new Date('2025-02-28');
    const repeatType: RepeatType = 'monthly';
    const baseDay = 31;

    // Act
    const result = shouldSkipDate(date, repeatType, baseDay);

    // Assert
    expect(result).toBe(true);
  });

  it('3월 31일은 생성 (매월 31일 반복)', () => {
    // Arrange
    const date = new Date('2025-03-31');
    const repeatType: RepeatType = 'monthly';
    const baseDay = 31;

    // Act
    const result = shouldSkipDate(date, repeatType, baseDay);

    // Assert
    expect(result).toBe(false);
  });

  it('평년 2/28은 건너뜀 (매년 2/29 반복)', () => {
    // Arrange
    const date = new Date('2025-02-28');
    const repeatType: RepeatType = 'yearly';
    const baseDay = 29;
    const baseMonth = 1; // 2월 (0-based)

    // Act
    const result = shouldSkipDate(date, repeatType, baseDay, baseMonth);

    // Assert
    expect(result).toBe(true);
  });

  it('윤년 2/29는 생성 (매년 2/29 반복)', () => {
    // Arrange
    const date = new Date('2024-02-29');
    const repeatType: RepeatType = 'yearly';
    const baseDay = 29;
    const baseMonth = 1; // 2월 (0-based)

    // Act
    const result = shouldSkipDate(date, repeatType, baseDay, baseMonth);

    // Assert
    expect(result).toBe(false);
  });

  it('일반 날짜는 건너뛰지 않음', () => {
    // Arrange
    const date = new Date('2025-01-15');
    const repeatType: RepeatType = 'daily';
    const baseDay = 15;

    // Act
    const result = shouldSkipDate(date, repeatType, baseDay);

    // Assert
    expect(result).toBe(false);
  });
});

describe('getNextOccurrence', () => {
  it('매일 반복 간격 1: 2025-01-01 → 2025-01-02', () => {
    // Arrange
    const currentDate = new Date('2025-01-01');
    const baseDate = new Date('2025-01-01');
    const repeatType: RepeatType = 'daily';
    const interval = 1;

    // Act
    const nextDate = getNextOccurrence(currentDate, repeatType, interval, baseDate);

    // Assert
    expect(nextDate).not.toBeNull();
    expect(formatDate(nextDate!)).toBe('2025-01-02');
  });

  it('매일 반복 간격 2: 2025-01-01 → 2025-01-03', () => {
    // Arrange
    const currentDate = new Date('2025-01-01');
    const baseDate = new Date('2025-01-01');
    const repeatType: RepeatType = 'daily';
    const interval = 2;

    // Act
    const nextDate = getNextOccurrence(currentDate, repeatType, interval, baseDate);

    // Assert
    expect(nextDate).not.toBeNull();
    expect(formatDate(nextDate!)).toBe('2025-01-03');
  });

  it('매일 반복 간격 7: 2025-01-01 → 2025-01-08', () => {
    // Arrange
    const currentDate = new Date('2025-01-01');
    const baseDate = new Date('2025-01-01');
    const repeatType: RepeatType = 'daily';
    const interval = 7;

    // Act
    const nextDate = getNextOccurrence(currentDate, repeatType, interval, baseDate);

    // Assert
    expect(nextDate).not.toBeNull();
    expect(formatDate(nextDate!)).toBe('2025-01-08');
  });

  it('매주 반복 간격 1: 2025-01-06(월) → 2025-01-13(월)', () => {
    // Arrange
    const currentDate = new Date('2025-01-06');
    const baseDate = new Date('2025-01-06');
    const repeatType: RepeatType = 'weekly';
    const interval = 1;

    // Act
    const nextDate = getNextOccurrence(currentDate, repeatType, interval, baseDate);

    // Assert
    expect(nextDate).not.toBeNull();
    expect(formatDate(nextDate!)).toBe('2025-01-13');
    expect(getDayOfWeek(nextDate!)).toBe(1); // 월요일
  });

  it('매주 반복 간격 2: 2025-01-06(월) → 2025-01-20(월)', () => {
    // Arrange
    const currentDate = new Date('2025-01-06');
    const baseDate = new Date('2025-01-06');
    const repeatType: RepeatType = 'weekly';
    const interval = 2;

    // Act
    const nextDate = getNextOccurrence(currentDate, repeatType, interval, baseDate);

    // Assert
    expect(nextDate).not.toBeNull();
    expect(formatDate(nextDate!)).toBe('2025-01-20');
    expect(getDayOfWeek(nextDate!)).toBe(1); // 월요일
  });

  it('매월 반복 간격 1: 2025-01-15 → 2025-02-15', () => {
    // Arrange
    const currentDate = new Date('2025-01-15');
    const baseDate = new Date('2025-01-15');
    const repeatType: RepeatType = 'monthly';
    const interval = 1;

    // Act
    const nextDate = getNextOccurrence(currentDate, repeatType, interval, baseDate);

    // Assert
    expect(nextDate).not.toBeNull();
    expect(formatDate(nextDate!)).toBe('2025-02-15');
  });

  it('매월 반복 간격 2: 2025-01-15 → 2025-03-15', () => {
    // Arrange
    const currentDate = new Date('2025-01-15');
    const baseDate = new Date('2025-01-15');
    const repeatType: RepeatType = 'monthly';
    const interval = 2;

    // Act
    const nextDate = getNextOccurrence(currentDate, repeatType, interval, baseDate);

    // Assert
    expect(nextDate).not.toBeNull();
    expect(formatDate(nextDate!)).toBe('2025-03-15');
  });

  it('매월 31일 반복: 2025-01-31 → 다음 월 (자동 조정, shouldSkipDate에서 필터링 필요)', () => {
    // Arrange
    const currentDate = new Date('2025-01-31');
    const baseDate = new Date('2025-01-31');
    const repeatType: RepeatType = 'monthly';
    const interval = 1;

    // Act
    const nextDate = getNextOccurrence(currentDate, repeatType, interval, baseDate);

    // Assert
    expect(nextDate).not.toBeNull();
    // 2월에는 31일이 없으므로 setDate(31)로 자동 조정됨
    // getNextOccurrence는 Date를 반환하고, shouldSkipDate에서 필터링됨
    expect(nextDate!.getMonth()).toBe(2); // 3월 (0-based)
  });

  it('매년 반복 간격 1: 2025-01-15 → 2026-01-15', () => {
    // Arrange
    const currentDate = new Date('2025-01-15');
    const baseDate = new Date('2025-01-15');
    const repeatType: RepeatType = 'yearly';
    const interval = 1;

    // Act
    const nextDate = getNextOccurrence(currentDate, repeatType, interval, baseDate);

    // Assert
    expect(nextDate).not.toBeNull();
    expect(formatDate(nextDate!)).toBe('2026-01-15');
  });

  it('매년 반복 간격 2: 2025-01-15 → 2027-01-15', () => {
    // Arrange
    const currentDate = new Date('2025-01-15');
    const baseDate = new Date('2025-01-15');
    const repeatType: RepeatType = 'yearly';
    const interval = 2;

    // Act
    const nextDate = getNextOccurrence(currentDate, repeatType, interval, baseDate);

    // Assert
    expect(nextDate).not.toBeNull();
    expect(formatDate(nextDate!)).toBe('2027-01-15');
  });

  it('none 유형: null 반환', () => {
    // Arrange
    const currentDate = new Date('2025-01-01');
    const baseDate = new Date('2025-01-01');
    const repeatType: RepeatType = 'none';
    const interval = 1;

    // Act
    const nextDate = getNextOccurrence(currentDate, repeatType, interval, baseDate);

    // Assert
    expect(nextDate).toBeNull();
  });
});

describe('generateRecurringInstances', () => {
  it('매일 반복 (3일)', () => {
    // Arrange
    const eventForm: EventForm = {
      title: '매일 회의',
      date: '2025-01-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '매일 반복',
      location: '회의실',
      category: '업무',
      repeat: {
        type: 'daily',
        interval: 1,
        endDate: '2025-01-03',
      },
      notificationTime: 10,
    };

    // Act
    const instances = generateRecurringInstances(eventForm, '2025-01-03');

    // Assert
    expect(instances).toHaveLength(3);
    expect(instances[0].date).toBe('2025-01-01');
    expect(instances[1].date).toBe('2025-01-02');
    expect(instances[2].date).toBe('2025-01-03');
  });

  it('매일 반복 (10일)', () => {
    // Arrange
    const eventForm: EventForm = {
      title: '매일 회의',
      date: '2025-01-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '매일 반복',
      location: '회의실',
      category: '업무',
      repeat: {
        type: 'daily',
        interval: 1,
        endDate: '2025-01-10',
      },
      notificationTime: 10,
    };

    // Act
    const instances = generateRecurringInstances(eventForm, '2025-01-10');

    // Assert
    expect(instances).toHaveLength(10);
    expect(instances[0].date).toBe('2025-01-01');
    expect(instances[9].date).toBe('2025-01-10');
  });

  it('매주 반복 (월요일)', () => {
    // Arrange
    const eventForm: EventForm = {
      title: '주간 회의',
      date: '2025-01-06', // 월요일
      startTime: '10:00',
      endTime: '11:00',
      description: '매주 반복',
      location: '회의실',
      category: '업무',
      repeat: {
        type: 'weekly',
        interval: 1,
        endDate: '2025-01-31',
      },
      notificationTime: 10,
    };

    // Act
    const instances = generateRecurringInstances(eventForm, '2025-01-31');

    // Assert
    expect(instances).toHaveLength(4);
    expect(instances[0].date).toBe('2025-01-06');
    expect(instances[1].date).toBe('2025-01-13');
    expect(instances[2].date).toBe('2025-01-20');
    expect(instances[3].date).toBe('2025-01-27');
  });

  it('매월 반복 (15일)', () => {
    // Arrange
    const eventForm: EventForm = {
      title: '월간 회의',
      date: '2025-01-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '매월 반복',
      location: '회의실',
      category: '업무',
      repeat: {
        type: 'monthly',
        interval: 1,
        endDate: '2025-05-31',
      },
      notificationTime: 10,
    };

    // Act
    const instances = generateRecurringInstances(eventForm, '2025-05-31');

    // Assert
    expect(instances).toHaveLength(5);
    expect(instances[0].date).toBe('2025-01-15');
    expect(instances[1].date).toBe('2025-02-15');
    expect(instances[2].date).toBe('2025-03-15');
    expect(instances[3].date).toBe('2025-04-15');
    expect(instances[4].date).toBe('2025-05-15');
  });

  it('매월 31일 반복 (건너뛰기)', () => {
    // Arrange
    const eventForm: EventForm = {
      title: '31일 회의',
      date: '2025-01-31',
      startTime: '10:00',
      endTime: '11:00',
      description: '매월 31일 반복',
      location: '회의실',
      category: '업무',
      repeat: {
        type: 'monthly',
        interval: 1,
        endDate: '2025-05-31',
      },
      notificationTime: 10,
    };

    // Act
    const instances = generateRecurringInstances(eventForm, '2025-05-31');

    // Assert
    expect(instances).toHaveLength(3); // 1/31, 3/31, 5/31 (2월/4월 건너뜀)
    expect(instances[0].date).toBe('2025-01-31');
    expect(instances[1].date).toBe('2025-03-31');
    expect(instances[2].date).toBe('2025-05-31');
  });

  it('매년 반복 (같은 해)', () => {
    // Arrange
    const eventForm: EventForm = {
      title: '연간 회의',
      date: '2025-01-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '매년 반복',
      location: '회의실',
      category: '업무',
      repeat: {
        type: 'yearly',
        interval: 1,
        endDate: '2025-12-31',
      },
      notificationTime: 10,
    };

    // Act
    const instances = generateRecurringInstances(eventForm, '2025-12-31');

    // Assert
    expect(instances).toHaveLength(1); // 같은 해라서 1개만
    expect(instances[0].date).toBe('2025-01-15');
  });

  it('반복 간격 2 (매일)', () => {
    // Arrange
    const eventForm: EventForm = {
      title: '격일 회의',
      date: '2025-01-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '2일마다 반복',
      location: '회의실',
      category: '업무',
      repeat: {
        type: 'daily',
        interval: 2,
        endDate: '2025-01-10',
      },
      notificationTime: 10,
    };

    // Act
    const instances = generateRecurringInstances(eventForm, '2025-01-10');

    // Assert
    expect(instances).toHaveLength(5);
    expect(instances[0].date).toBe('2025-01-01');
    expect(instances[1].date).toBe('2025-01-03');
    expect(instances[2].date).toBe('2025-01-05');
    expect(instances[3].date).toBe('2025-01-07');
    expect(instances[4].date).toBe('2025-01-09');
  });

  it('반복 간격 2 (매주)', () => {
    // Arrange
    const eventForm: EventForm = {
      title: '격주 회의',
      date: '2025-01-06', // 월요일
      startTime: '10:00',
      endTime: '11:00',
      description: '2주마다 반복',
      location: '회의실',
      category: '업무',
      repeat: {
        type: 'weekly',
        interval: 2,
        endDate: '2025-03-31',
      },
      notificationTime: 10,
    };

    // Act
    const instances = generateRecurringInstances(eventForm, '2025-03-31');

    // Assert
    expect(instances).toHaveLength(7);
    expect(instances[0].date).toBe('2025-01-06');
    expect(instances[1].date).toBe('2025-01-20');
    expect(instances[2].date).toBe('2025-02-03');
    expect(instances[3].date).toBe('2025-02-17');
    expect(instances[4].date).toBe('2025-03-03');
    expect(instances[5].date).toBe('2025-03-17');
    expect(instances[6].date).toBe('2025-03-31');
  });

  it('첫 이벤트만 (종료일 = 시작일)', () => {
    // Arrange
    const eventForm: EventForm = {
      title: '단일 회의',
      date: '2025-12-31',
      startTime: '10:00',
      endTime: '11:00',
      description: '하루만',
      location: '회의실',
      category: '업무',
      repeat: {
        type: 'daily',
        interval: 1,
        endDate: '2025-12-31',
      },
      notificationTime: 10,
    };

    // Act
    const instances = generateRecurringInstances(eventForm, '2025-12-31');

    // Assert
    expect(instances).toHaveLength(1);
    expect(instances[0].date).toBe('2025-12-31');
  });

  it('반복 유형 none', () => {
    // Arrange
    const eventForm: EventForm = {
      title: '단일 회의',
      date: '2025-01-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '반복 없음',
      location: '회의실',
      category: '업무',
      repeat: {
        type: 'none',
        interval: 1,
      },
      notificationTime: 10,
    };

    // Act
    const instances = generateRecurringInstances(eventForm, '2025-12-31');

    // Assert
    expect(instances).toHaveLength(1);
    expect(instances[0].date).toBe('2025-01-01');
  });
});
