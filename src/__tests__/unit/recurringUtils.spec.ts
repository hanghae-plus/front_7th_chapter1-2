import { describe, expect, it } from 'vitest';

import { RepeatInfo } from '../../types';
import {
  expandRecurringEvents,
  generateRecurringDates,
  getRepeatText,
  isLeapYear,
  splitRecurringEvent,
  validateRecurringConfig,
} from '../../utils/recurringUtils';

describe('generateRecurringDates', () => {
  describe('매일 반복', () => {
    it('매일 반복 일정을 생성할 수 있다', () => {
      const repeat: RepeatInfo = {
        type: 'daily',
        interval: 1,
        endDate: '2025-01-07',
      };

      const dates = generateRecurringDates('2025-01-01', repeat);

      expect(dates).toHaveLength(7);
      expect(dates[0]).toBe('2025-01-01');
      expect(dates[6]).toBe('2025-01-07');
    });

    it('매일 반복 일정이 종료일을 포함한다', () => {
      const repeat: RepeatInfo = {
        type: 'daily',
        interval: 1,
        endDate: '2025-01-03',
      };

      const dates = generateRecurringDates('2025-01-01', repeat);

      expect(dates).toHaveLength(3);
      expect(dates).toContain('2025-01-01');
      expect(dates).toContain('2025-01-02');
      expect(dates).toContain('2025-01-03');
    });
  });

  describe('매주 반복', () => {
    it('매주 같은 요일에 반복 일정을 생성할 수 있다', () => {
      const repeat: RepeatInfo = {
        type: 'weekly',
        interval: 1,
        endDate: '2025-01-29',
      };

      // 2025-01-01은 수요일
      const dates = generateRecurringDates('2025-01-01', repeat);

      expect(dates).toHaveLength(5);
      expect(dates).toEqual(['2025-01-01', '2025-01-08', '2025-01-15', '2025-01-22', '2025-01-29']);
    });

    it('매주 반복이 월을 넘어갈 수 있다', () => {
      const repeat: RepeatInfo = {
        type: 'weekly',
        interval: 1,
        endDate: '2025-02-05',
      };

      const dates = generateRecurringDates('2025-01-29', repeat);

      expect(dates).toHaveLength(2);
      expect(dates).toContain('2025-01-29');
      expect(dates).toContain('2025-02-05');
    });
  });

  describe('매월 반복', () => {
    it('매월 같은 날짜에 반복 일정을 생성할 수 있다', () => {
      const repeat: RepeatInfo = {
        type: 'monthly',
        interval: 1,
        endDate: '2025-04-15',
      };

      const dates = generateRecurringDates('2025-01-15', repeat);

      expect(dates).toHaveLength(4);
      expect(dates).toEqual(['2025-01-15', '2025-02-15', '2025-03-15', '2025-04-15']);
    });

    it('매월 31일 반복 시 31일이 없는 달에는 생성되지 않는다', () => {
      const repeat: RepeatInfo = {
        type: 'monthly',
        interval: 1,
        endDate: '2025-06-30',
      };

      const dates = generateRecurringDates('2025-01-31', repeat);

      // 1월(31일), 3월(31일), 5월(31일)만 생성, 2월, 4월, 6월은 제외
      expect(dates).toHaveLength(3);
      expect(dates).toEqual(['2025-01-31', '2025-03-31', '2025-05-31']);
    });

    it('매월 29일 반복 시 평년 2월은 건너뛴다', () => {
      const repeat: RepeatInfo = {
        type: 'monthly',
        interval: 1,
        endDate: '2025-04-29',
      };

      const dates = generateRecurringDates('2025-01-29', repeat);

      // 1월(29일), 3월(29일), 4월(29일), 2월은 제외(평년 28일)
      expect(dates).toHaveLength(3);
      expect(dates).toEqual(['2025-01-29', '2025-03-29', '2025-04-29']);
    });

    it('매월 30일 반복 시 2월은 건너뛴다', () => {
      const repeat: RepeatInfo = {
        type: 'monthly',
        interval: 1,
        endDate: '2025-04-30',
      };

      const dates = generateRecurringDates('2025-01-30', repeat);

      // 1월(30일), 3월(30일), 4월(30일), 2월은 제외
      expect(dates).toHaveLength(3);
      expect(dates).toEqual(['2025-01-30', '2025-03-30', '2025-04-30']);
    });

    it('매월 1일 반복은 모든 달에 생성된다', () => {
      const repeat: RepeatInfo = {
        type: 'monthly',
        interval: 1,
        endDate: '2025-03-01',
      };

      const dates = generateRecurringDates('2025-01-01', repeat);

      expect(dates).toHaveLength(3);
      expect(dates).toEqual(['2025-01-01', '2025-02-01', '2025-03-01']);
    });
  });

  describe('매년 반복', () => {
    it('매년 같은 월/일에 반복 일정을 생성할 수 있다', () => {
      const repeat: RepeatInfo = {
        type: 'yearly',
        interval: 1,
        endDate: '2027-01-01',
      };

      const dates = generateRecurringDates('2025-01-01', repeat);

      expect(dates).toHaveLength(3);
      expect(dates).toEqual(['2025-01-01', '2026-01-01', '2027-01-01']);
    });

    it('윤년 2월 29일 매년 반복 시 윤년에만 생성된다', () => {
      const repeat: RepeatInfo = {
        type: 'yearly',
        interval: 1,
        endDate: '2028-02-29',
      };

      const dates = generateRecurringDates('2024-02-29', repeat);

      // 2024, 2028은 윤년, 2025-2027은 평년
      expect(dates).toHaveLength(2);
      expect(dates).toEqual(['2024-02-29', '2028-02-29']);
    });

    it('평년 2월 28일 매년 반복은 매년 생성된다', () => {
      const repeat: RepeatInfo = {
        type: 'yearly',
        interval: 1,
        endDate: '2027-02-28',
      };

      const dates = generateRecurringDates('2025-02-28', repeat);

      expect(dates).toHaveLength(3);
      expect(dates).toEqual(['2025-02-28', '2026-02-28', '2027-02-28']);
    });
  });

  describe('반복 종료일 없음', () => {
    it('종료일이 없으면 빈 배열을 반환한다', () => {
      const repeat: RepeatInfo = {
        type: 'daily',
        interval: 1,
      };

      const dates = generateRecurringDates('2025-01-01', repeat);

      // 종료일이 없으면 무한 반복이므로 expandRecurringEvents에서 처리
      expect(dates).toEqual([]);
    });
  });

  describe('시작일 = 종료일', () => {
    it('시작일과 종료일이 같으면 1개 일정만 생성된다', () => {
      const repeat: RepeatInfo = {
        type: 'daily',
        interval: 1,
        endDate: '2025-01-01',
      };

      const dates = generateRecurringDates('2025-01-01', repeat);

      expect(dates).toHaveLength(1);
      expect(dates[0]).toBe('2025-01-01');
    });
  });
});

describe('validateRecurringConfig', () => {
  it('유효한 반복 설정을 검증할 수 있다', () => {
    const repeat: RepeatInfo = {
      type: 'daily',
      interval: 1,
      endDate: '2025-01-07',
    };

    const result = validateRecurringConfig('2025-01-01', repeat);

    expect(result.isValid).toBe(true);
    expect(result.errorMessage).toBeUndefined();
  });

  it('반복 종료일이 시작일보다 이전이면 에러를 반환한다', () => {
    const repeat: RepeatInfo = {
      type: 'daily',
      interval: 1,
      endDate: '2025-01-05',
    };

    const result = validateRecurringConfig('2025-01-10', repeat);

    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toBe('반복 종료일은 시작일 이후여야 합니다.');
  });

  it('반복 종료일이 시작일과 같으면 유효하다', () => {
    const repeat: RepeatInfo = {
      type: 'daily',
      interval: 1,
      endDate: '2025-01-01',
    };

    const result = validateRecurringConfig('2025-01-01', repeat);

    expect(result.isValid).toBe(true);
  });

  it('반복 종료일이 없으면 유효하다', () => {
    const repeat: RepeatInfo = {
      type: 'daily',
      interval: 1,
    };

    const result = validateRecurringConfig('2025-01-01', repeat);

    expect(result.isValid).toBe(true);
  });

  it('반복 타입이 none이면 유효하다', () => {
    const repeat: RepeatInfo = {
      type: 'none',
      interval: 0,
    };

    const result = validateRecurringConfig('2025-01-01', repeat);

    expect(result.isValid).toBe(true);
  });

  it('interval이 0이면 에러를 반환한다', () => {
    const repeat: RepeatInfo = {
      type: 'daily',
      interval: 0,
      endDate: '2025-01-07',
    };

    const result = validateRecurringConfig('2025-01-01', repeat);

    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toBe('반복 간격은 1 이상이어야 합니다.');
  });

  it('interval이 음수면 에러를 반환한다', () => {
    const repeat: RepeatInfo = {
      type: 'daily',
      interval: -1,
      endDate: '2025-01-07',
    };

    const result = validateRecurringConfig('2025-01-01', repeat);

    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toBe('반복 간격은 1 이상이어야 합니다.');
  });
});

describe('splitRecurringEvent', () => {
  it('반복 일정의 중간 날짜를 분할할 수 있다', () => {
    const event = {
      id: '1',
      title: '매일 회의',
      date: '2025-01-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'daily' as const, interval: 1, endDate: '2025-01-07' },
      repeatGroupId: 'group-1',
      notificationTime: 10,
    };

    const result = splitRecurringEvent(event, '2025-01-03');

    // 이전 일정: 2025-01-01 ~ 2025-01-02
    expect(result.before).toBeDefined();
    expect(result.before?.date).toBe('2025-01-01');
    expect(result.before?.repeat.endDate).toBe('2025-01-02');
    expect(result.before?.repeatGroupId).toBe('group-1');

    // 이후 일정: 2025-01-04 ~ 2025-01-07
    expect(result.after).toBeDefined();
    expect(result.after?.date).toBe('2025-01-04');
    expect(result.after?.repeat.endDate).toBe('2025-01-07');
    expect(result.after?.repeatGroupId).toBe('group-1');
  });

  it('반복 일정의 시작 날짜를 분할하면 이전 일정이 없다', () => {
    const event = {
      id: '1',
      title: '매일 회의',
      date: '2025-01-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'daily' as const, interval: 1, endDate: '2025-01-07' },
      repeatGroupId: 'group-1',
      notificationTime: 10,
    };

    const result = splitRecurringEvent(event, '2025-01-01');

    expect(result.before).toBeUndefined();
    expect(result.after).toBeDefined();
    expect(result.after?.date).toBe('2025-01-02');
    expect(result.after?.repeat.endDate).toBe('2025-01-07');
  });

  it('반복 일정의 종료 날짜를 분할하면 이후 일정이 없다', () => {
    const event = {
      id: '1',
      title: '매일 회의',
      date: '2025-01-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'daily' as const, interval: 1, endDate: '2025-01-07' },
      repeatGroupId: 'group-1',
      notificationTime: 10,
    };

    const result = splitRecurringEvent(event, '2025-01-07');

    expect(result.before).toBeDefined();
    expect(result.before?.date).toBe('2025-01-01');
    expect(result.before?.repeat.endDate).toBe('2025-01-06');
    expect(result.after).toBeUndefined();
  });
});

describe('getRepeatText', () => {
  it('매일 반복 텍스트를 생성할 수 있다', () => {
    const repeat: RepeatInfo = {
      type: 'daily',
      interval: 1,
      endDate: '2025-01-07',
    };

    const text = getRepeatText(repeat);

    expect(text).toBe('반복: 1일마다 (종료: 2025-01-07)');
  });

  it('매주 반복 텍스트를 생성할 수 있다', () => {
    const repeat: RepeatInfo = {
      type: 'weekly',
      interval: 1,
      endDate: '2025-01-29',
    };

    const text = getRepeatText(repeat);

    expect(text).toBe('반복: 1주마다 (종료: 2025-01-29)');
  });

  it('매월 반복 텍스트를 생성할 수 있다', () => {
    const repeat: RepeatInfo = {
      type: 'monthly',
      interval: 1,
      endDate: '2025-04-15',
    };

    const text = getRepeatText(repeat);

    expect(text).toBe('반복: 1월마다 (종료: 2025-04-15)');
  });

  it('매년 반복 텍스트를 생성할 수 있다', () => {
    const repeat: RepeatInfo = {
      type: 'yearly',
      interval: 1,
      endDate: '2027-01-01',
    };

    const text = getRepeatText(repeat);

    expect(text).toBe('반복: 1년마다 (종료: 2027-01-01)');
  });

  it('종료일이 없으면 종료일 정보를 표시하지 않는다', () => {
    const repeat: RepeatInfo = {
      type: 'daily',
      interval: 1,
    };

    const text = getRepeatText(repeat);

    expect(text).toBe('반복: 1일마다');
  });

  it('반복 없음(none)은 빈 문자열을 반환한다', () => {
    const repeat: RepeatInfo = {
      type: 'none',
      interval: 0,
    };

    const text = getRepeatText(repeat);

    expect(text).toBe('');
  });
});

describe('expandRecurringEvents', () => {
  it('반복 일정을 날짜별 인스턴스로 전개할 수 있다', () => {
    const events = [
      {
        id: '1',
        title: '매일 회의',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'daily' as const, interval: 1, endDate: '2025-01-07' },
        repeatGroupId: 'group-1',
        notificationTime: 10,
      },
    ];

    const rangeStart = new Date('2025-01-01');
    const rangeEnd = new Date('2025-01-31');

    const expanded = expandRecurringEvents(events, rangeStart, rangeEnd);

    expect(expanded).toHaveLength(7);
    expect(expanded[0].date).toBe('2025-01-01');
    expect(expanded[6].date).toBe('2025-01-07');
  });

  it('반복 없는 일정은 전개하지 않는다', () => {
    const events = [
      {
        id: '1',
        title: '단일 회의',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none' as const, interval: 0 },
        notificationTime: 10,
      },
    ];

    const rangeStart = new Date('2025-01-01');
    const rangeEnd = new Date('2025-01-31');

    const expanded = expandRecurringEvents(events, rangeStart, rangeEnd);

    expect(expanded).toHaveLength(1);
    expect(expanded[0].date).toBe('2025-01-01');
  });

  it('뷰 범위를 벗어난 일정은 전개하지 않는다', () => {
    const events = [
      {
        id: '1',
        title: '매일 회의',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'daily' as const, interval: 1, endDate: '2025-01-31' },
        repeatGroupId: 'group-1',
        notificationTime: 10,
      },
    ];

    const rangeStart = new Date('2025-01-10');
    const rangeEnd = new Date('2025-01-15');

    const expanded = expandRecurringEvents(events, rangeStart, rangeEnd);

    // 2025-01-10 ~ 2025-01-15 (6일)
    expect(expanded).toHaveLength(6);
    expect(expanded[0].date).toBe('2025-01-10');
    expect(expanded[5].date).toBe('2025-01-15');
  });

  it('반복 종료일이 없으면 뷰 범위 내에서만 전개한다', () => {
    const events = [
      {
        id: '1',
        title: '매일 회의',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'daily' as const, interval: 1 },
        repeatGroupId: 'group-1',
        notificationTime: 10,
      },
    ];

    const rangeStart = new Date('2025-01-01');
    const rangeEnd = new Date('2025-01-07');

    const expanded = expandRecurringEvents(events, rangeStart, rangeEnd);

    expect(expanded).toHaveLength(7);
    expect(expanded[0].date).toBe('2025-01-01');
    expect(expanded[6].date).toBe('2025-01-07');
  });
});

describe('isLeapYear', () => {
  it('윤년을 판별할 수 있다', () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2028)).toBe(true);
    expect(isLeapYear(2000)).toBe(true);
  });

  it('평년을 판별할 수 있다', () => {
    expect(isLeapYear(2025)).toBe(false);
    expect(isLeapYear(2026)).toBe(false);
    expect(isLeapYear(2027)).toBe(false);
    expect(isLeapYear(1900)).toBe(false);
  });
});
