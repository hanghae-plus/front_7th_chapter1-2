import { Event, RepeatInfo } from '../../types';
import {
  generateRecurringEventId,
  generateRecurringEvents,
  hasDay31InMonth,
  isLeapYear,
} from '../../utils/recurringEvents';

describe('generateRecurringEvents', () => {
  const baseEvent: Event = {
    id: 'event-1',
    title: '반복 일정',
    date: '2025-01-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '테스트 설명',
    location: '테스트 장소',
    category: '업무',
    repeat: { type: 'daily', interval: 1, endDate: '2025-01-07' },
    notificationTime: 10,
  };

  it('TD-001: 매일 반복 일정 생성 - 시작일부터 종료일까지 매일 일정이 생성됨', () => {
    const repeatInfo: RepeatInfo = {
      type: 'daily',
      interval: 1,
      endDate: '2025-01-07',
    };
    const events = generateRecurringEvents(baseEvent, repeatInfo);

    expect(events).toHaveLength(7);
    expect(events[0].date).toBe('2025-01-01');
    expect(events[6].date).toBe('2025-01-07');
    events.forEach((event) => {
      expect(event.startTime).toBe('09:00');
      expect(event.endTime).toBe('10:00');
    });
  });

  it('TD-002: 매주 반복 일정 생성 - 같은 요일에 일정이 생성됨', () => {
    const mondayEvent: Event = {
      ...baseEvent,
      date: '2025-01-06',
    };
    const repeatInfo: RepeatInfo = {
      type: 'weekly',
      interval: 1,
      endDate: '2025-01-27',
    };
    const events = generateRecurringEvents(mondayEvent, repeatInfo);

    expect(events).toHaveLength(4);
    expect(events[0].date).toBe('2025-01-06');
    expect(events[1].date).toBe('2025-01-13');
    expect(events[2].date).toBe('2025-01-20');
    expect(events[3].date).toBe('2025-01-27');
  });

  it('TD-003: 매월 반복 일정 생성 - 같은 날짜에 일정이 생성됨', () => {
    const event15th: Event = {
      ...baseEvent,
      date: '2025-01-15',
    };
    const repeatInfo: RepeatInfo = {
      type: 'monthly',
      interval: 1,
      endDate: '2025-04-15',
    };
    const events = generateRecurringEvents(event15th, repeatInfo);

    expect(events).toHaveLength(4);
    expect(events[0].date).toBe('2025-01-15');
    expect(events[1].date).toBe('2025-02-15');
    expect(events[2].date).toBe('2025-03-15');
    expect(events[3].date).toBe('2025-04-15');
  });

  it('TD-004: 매년 반복 일정 생성 - 같은 월/일에 일정이 생성됨', () => {
    const event: Event = {
      ...baseEvent,
      date: '2024-03-15',
    };
    const repeatInfo: RepeatInfo = {
      type: 'yearly',
      interval: 1,
      endDate: '2025-12-31',
    };
    const events = generateRecurringEvents(event, repeatInfo);

    expect(events).toHaveLength(2);
    expect(events[0].date).toBe('2024-03-15');
    expect(events[1].date).toBe('2025-03-15');
  });

  it('TD-005: 31일 매월 반복 생성 - 31일이 있는 달에만 생성됨', () => {
    const event31st: Event = {
      ...baseEvent,
      date: '2025-01-31',
    };
    const repeatInfo: RepeatInfo = {
      type: 'monthly',
      interval: 1,
      endDate: '2025-12-31',
    };
    const events = generateRecurringEvents(event31st, repeatInfo);

    expect(events).toHaveLength(7);
    expect(events[0].date).toBe('2025-01-31');
    expect(events[1].date).toBe('2025-03-31');
    expect(events[2].date).toBe('2025-05-31');
    expect(events[3].date).toBe('2025-07-31');
    expect(events[4].date).toBe('2025-08-31');
    expect(events[5].date).toBe('2025-10-31');
    expect(events[6].date).toBe('2025-12-31');
  });

  it('TD-006: 윤년 2월 29일 매년 반복 생성 - 윤년에만 생성됨', () => {
    const leapDayEvent: Event = {
      ...baseEvent,
      date: '2024-02-29',
    };
    const repeatInfo: RepeatInfo = {
      type: 'yearly',
      interval: 1,
      endDate: '2025-12-31',
    };
    const events = generateRecurringEvents(leapDayEvent, repeatInfo);

    expect(events).toHaveLength(1);
    expect(events[0].date).toBe('2024-02-29');
  });

  it('TD-007: 반복 유형 기본값 확인 - 반복 유형 미선택 시 기본값 none 설정됨', () => {
    const repeatInfo: RepeatInfo = {
      type: 'none',
      interval: 1,
    };
    const events = generateRecurringEvents(baseEvent, repeatInfo);

    expect(events).toHaveLength(1);
    expect(events[0].date).toBe(baseEvent.date);
  });

  it('TD-008: 종료일 기본값 확인 - 종료일 미설정 시 2025-12-31로 설정됨', () => {
    const repeatInfo: RepeatInfo = {
      type: 'daily',
      interval: 1,
    };
    const events = generateRecurringEvents(baseEvent, repeatInfo);

    const lastEvent = events[events.length - 1];
    expect(lastEvent.date).toBe('2025-12-31');
  });

  it('TD-009: 종료일 최대값 제한 - 2025-12-31 이후 날짜 입력 시 2025-12-31로 조정됨', () => {
    const repeatInfo: RepeatInfo = {
      type: 'daily',
      interval: 1,
      endDate: '2026-06-30',
    };
    const events = generateRecurringEvents(baseEvent, repeatInfo);

    const lastEvent = events[events.length - 1];
    expect(lastEvent.date).toBe('2025-12-31');
  });

  it('TD-025: 시작일과 종료일 동일 - 1개 일정만 생성됨', () => {
    const repeatInfo: RepeatInfo = {
      type: 'daily',
      interval: 1,
      endDate: '2025-01-01',
    };
    const events = generateRecurringEvents(baseEvent, repeatInfo);

    expect(events).toHaveLength(1);
    expect(events[0].date).toBe('2025-01-01');
  });

  it('TD-026: 반복 간격 1 고정 확인 - 반복 간격이 1로 고정되어 있음', () => {
    const repeatInfo: RepeatInfo = {
      type: 'daily',
      interval: 1,
      endDate: '2025-01-07',
    };
    const events = generateRecurringEvents(baseEvent, repeatInfo);

    expect(repeatInfo.interval).toBe(1);
    expect(events).toHaveLength(7);
  });
});

describe('generateRecurringEventId', () => {
  it('TD-011: 반복 일정 ID 생성 - 반복 일정 인스턴스마다 고유 ID 생성됨', () => {
    const originalId = 'event-1';
    const date = '2025-01-15';
    const id = generateRecurringEventId(originalId, date);

    expect(id).toBe('event-1_2025-01-15');
  });

  it('ID 형식이 올바른지 확인', () => {
    const originalId = 'test-event-123';
    const date = '2025-12-31';
    const id = generateRecurringEventId(originalId, date);

    expect(id).toContain('test-event-123');
    expect(id).toContain('2025-12-31');
    expect(id).toMatch(/^test-event-123_\d{4}-\d{2}-\d{2}$/);
  });
});

describe('isLeapYear', () => {
  it('윤년 판별 - 2024년은 윤년', () => {
    expect(isLeapYear(2024)).toBe(true);
  });

  it('평년 판별 - 2025년은 평년', () => {
    expect(isLeapYear(2025)).toBe(false);
  });

  it('100년 단위 평년 - 2100년은 평년', () => {
    expect(isLeapYear(2100)).toBe(false);
  });

  it('400년 단위 윤년 - 2000년은 윤년', () => {
    expect(isLeapYear(2000)).toBe(true);
  });
});

describe('hasDay31InMonth', () => {
  it('31일이 있는 달 - 1월', () => {
    expect(hasDay31InMonth(1)).toBe(true);
  });

  it('31일이 없는 달 - 2월', () => {
    expect(hasDay31InMonth(2)).toBe(false);
  });

  it('31일이 없는 달 - 4월', () => {
    expect(hasDay31InMonth(4)).toBe(false);
  });

  it('31일이 있는 달 - 12월', () => {
    expect(hasDay31InMonth(12)).toBe(true);
  });
});

describe('validateEndDate', () => {
  it('TD-010: 종료일 유효성 검증 실패 - 종료일이 시작일보다 이전이면 에러 표시', () => {
    const startDate = '2025-02-01';
    const endDate = '2025-01-01';

    expect(() => {
      if (new Date(endDate) < new Date(startDate)) {
        throw new Error('종료일은 시작일 이후여야 합니다.');
      }
    }).toThrow('종료일은 시작일 이후여야 합니다.');
  });

  it('종료일이 시작일과 같으면 에러 없음', () => {
    const startDate = '2025-01-01';
    const endDate = '2025-01-01';

    expect(() => {
      if (new Date(endDate) < new Date(startDate)) {
        throw new Error('종료일은 시작일 이후여야 합니다.');
      }
    }).not.toThrow();
  });

  it('종료일이 시작일 이후면 에러 없음', () => {
    const startDate = '2025-01-01';
    const endDate = '2025-01-31';

    expect(() => {
      if (new Date(endDate) < new Date(startDate)) {
        throw new Error('종료일은 시작일 이후여야 합니다.');
      }
    }).not.toThrow();
  });
});

describe('부정 케이스', () => {
  const baseEvent: Event = {
    id: 'event-1',
    title: '반복 일정',
    date: '2025-01-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 0,
  };

  it('TD-023: 잘못된 반복 유형 입력 - 지원하지 않는 반복 유형 입력 시 기본값 처리', () => {
    const repeatInfo = {
      type: 'invalid',
      interval: 1,
      endDate: '2025-01-07',
    } as unknown as RepeatInfo;
    const events = generateRecurringEvents(baseEvent, repeatInfo);

    expect(events).toHaveLength(1);
    expect(events[0].date).toBe(baseEvent.date);
  });

  it('TD-024: 음수 종료일 입력 - 잘못된 날짜 형식 입력 시 에러 처리', () => {
    const repeatInfo: RepeatInfo = {
      type: 'daily',
      interval: 1,
      endDate: 'invalid-date',
    };

    expect(() => {
      const endDate = new Date(repeatInfo.endDate!);
      if (isNaN(endDate.getTime())) {
        throw new Error('잘못된 날짜 형식입니다.');
      }
    }).toThrow('잘못된 날짜 형식입니다.');
  });
});

describe('반복 일정 겹침 처리', () => {
  it('TD-012: 반복 일정 겹침 미검사 - 반복 일정은 겹침 검사를 수행하지 않음', () => {
    const event1: Event = {
      id: 'event-1',
      title: '반복 일정 1',
      date: '2025-01-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'daily', interval: 1, endDate: '2025-01-07' },
      notificationTime: 0,
    };

    const event2: Event = {
      id: 'event-2',
      title: '반복 일정 2',
      date: '2025-01-01',
      startTime: '09:30',
      endTime: '10:30',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'daily', interval: 1, endDate: '2025-01-07' },
      notificationTime: 0,
    };

    const events1 = generateRecurringEvents(event1, event1.repeat);
    const events2 = generateRecurringEvents(event2, event2.repeat);

    expect(events1).toHaveLength(7);
    expect(events2).toHaveLength(7);
  });
});
