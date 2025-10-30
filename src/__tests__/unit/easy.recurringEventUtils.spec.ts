import { Event, RepeatType } from '../../types';
import { generateRecurringEvents } from '../../utils/recurringEventUtils';

// [FR-2.4] interval은 항상 1로 고정
describe('generateRecurringEvents - interval 고정 검증', () => {
  it('[FR-2.4] 생성된 모든 반복 일정의 interval이 1로 고정되어야 한다', () => {
    const startDate = '2025-01-15';
    const repeatType: RepeatType = 'daily';
    const endDate = '2025-01-20';

    const events = generateRecurringEvents(
      {
        title: '테스트 일정',
        date: startDate,
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: repeatType, interval: 1, endDate },
        notificationTime: 10,
      },
      repeatType,
      endDate
    );

    events.forEach((event) => {
      expect(event.repeat.interval).toBe(1);
    });
  });
});

// [FR-2.1, FR-2.2] 반복 일정 생성 기본 기능
describe('generateRecurringEvents - 기본 생성 로직', () => {
  it('[FR-2.1] 매일(daily) 반복 일정을 종료일까지 생성해야 한다', () => {
    const startDate = '2025-01-15';
    const endDate = '2025-01-17';

    const events = generateRecurringEvents(
      {
        title: '매일 회의',
        date: startDate,
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate },
        notificationTime: 10,
      },
      'daily',
      endDate
    );

    expect(events).toHaveLength(3); // 15, 16, 17일
    expect(events[0].date).toBe('2025-01-15');
    expect(events[1].date).toBe('2025-01-16');
    expect(events[2].date).toBe('2025-01-17');
  });

  it('[FR-2.1] 매주(weekly) 반복 일정을 종료일까지 생성해야 한다', () => {
    const startDate = '2025-01-15'; // 수요일
    const endDate = '2025-02-05';

    const events = generateRecurringEvents(
      {
        title: '주간 회의',
        date: startDate,
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate },
        notificationTime: 10,
      },
      'weekly',
      endDate
    );

    expect(events.length).toBeGreaterThan(0);
    expect(events[0].date).toBe('2025-01-15');
    // 7일마다 생성
    if (events.length > 1) {
      const firstDate = new Date(events[0].date);
      const secondDate = new Date(events[1].date);
      const daysDiff = Math.floor((secondDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
      expect(daysDiff).toBe(7);
    }
  });

  it('[FR-2.1] 매월(monthly) 반복 일정을 종료일까지 생성해야 한다', () => {
    const startDate = '2025-01-15';
    const endDate = '2025-03-15';

    const events = generateRecurringEvents(
      {
        title: '월간 회의',
        date: startDate,
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'monthly', interval: 1, endDate },
        notificationTime: 10,
      },
      'monthly',
      endDate
    );

    expect(events.length).toBeGreaterThanOrEqual(3); // 최소 1월, 2월, 3월
    expect(events[0].date).toBe('2025-01-15');
    expect(events[1].date).toBe('2025-02-15');
    expect(events[2].date).toBe('2025-03-15');
  });

  it('[FR-2.1] 매년(yearly) 반복 일정을 종료일까지 생성해야 한다', () => {
    const startDate = '2025-01-15';
    const endDate = '2027-01-15';

    const events = generateRecurringEvents(
      {
        title: '연간 회의',
        date: startDate,
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'yearly', interval: 1, endDate },
        notificationTime: 10,
      },
      'yearly',
      endDate
    );

    expect(events.length).toBeGreaterThanOrEqual(3); // 최소 2025, 2026, 2027
    expect(events[0].date).toBe('2025-01-15');
    if (events.length > 1) {
      expect(events[1].date).toBe('2026-01-15');
    }
    if (events.length > 2) {
      expect(events[2].date).toBe('2027-01-15');
    }
  });

  it('[FR-2.2] 반복 종료일이 2025-12-31을 초과하면 생성된 일정이 2025-12-31까지여야 한다', () => {
    const startDate = '2025-12-30';
    const endDate = '2026-01-05'; // 2025-12-31 초과

    const events = generateRecurringEvents(
      {
        title: '테스트 일정',
        date: startDate,
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate },
        notificationTime: 10,
      },
      'daily',
      endDate
    );

    // 2025-12-31까지만 생성되어야 함
    const lastEventDate = events[events.length - 1].date;
    expect(lastEventDate).toBe('2025-12-31');
    expect(new Date(lastEventDate)).toBeLessThanOrEqual(new Date('2025-12-31'));
  });
});

// [FR-1.3] 31일 매월 반복 특수 케이스
describe('generateRecurringEvents - 31일 매월 반복', () => {
  it('[FR-1.3] 31일에 매월 선택 시, 31일이 없는 월은 건너뛰어야 한다', () => {
    const startDate = '2025-01-31';
    const endDate = '2025-04-30';

    const events = generateRecurringEvents(
      {
        title: '월말 회의',
        date: startDate,
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'monthly', interval: 1, endDate },
        notificationTime: 10,
      },
      'monthly',
      endDate
    );

    // 1월(31일), 3월(31일)만 생성되어야 하고, 2월(31일 없음)은 건너뛰어야 함
    const dates = events.map((e) => e.date);
    expect(dates).toContain('2025-01-31');
    expect(dates).not.toContain('2025-02-31'); // 존재하지 않는 날짜
    expect(dates).toContain('2025-03-31');
  });

  it('[FR-1.3] 31일에 매월 선택 시, 30일까지만 있는 월(4월, 6월 등)은 건너뛰어야 한다', () => {
    const startDate = '2025-01-31';
    const endDate = '2025-06-30';

    const events = generateRecurringEvents(
      {
        title: '월말 회의',
        date: startDate,
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'monthly', interval: 1, endDate },
        notificationTime: 10,
      },
      'monthly',
      endDate
    );

    const dates = events.map((e) => e.date);
    // 1월(31일), 3월(31일), 5월(31일)만 생성, 2월, 4월, 6월은 건너뛰어야 함
    expect(dates).toContain('2025-01-31');
    expect(dates).toContain('2025-03-31');
    expect(dates).toContain('2025-05-31');
    expect(dates).not.toContain('2025-02-31');
    expect(dates).not.toContain('2025-04-31');
    expect(dates).not.toContain('2025-06-31');
  });
});

// [FR-1.4] 윤년 2월 29일 매년 반복 특수 케이스
describe('generateRecurringEvents - 윤년 2월 29일 매년 반복', () => {
  it('[FR-1.4] 윤년 2월 29일에 매년 선택 시, 윤년이 아닌 해는 건너뛰어야 한다', () => {
    const startDate = '2024-02-29'; // 2024는 윤년
    const endDate = '2029-02-28';

    const events = generateRecurringEvents(
      {
        title: '윤년 회의',
        date: startDate,
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'yearly', interval: 1, endDate },
        notificationTime: 10,
      },
      'yearly',
      endDate
    );

    const dates = events.map((e) => e.date);
    // 2024(윤년), 2028(윤년)만 생성, 2025, 2026, 2027, 2029(평년)는 건너뛰어야 함
    expect(dates).toContain('2024-02-29');
    expect(dates).not.toContain('2025-02-29'); // 2025는 평년
    expect(dates).not.toContain('2026-02-29'); // 2026는 평년
    expect(dates).not.toContain('2027-02-29'); // 2027는 평년
    expect(dates).toContain('2028-02-29'); // 2028는 윤년
    expect(dates).not.toContain('2029-02-29'); // 2029는 평년
  });
});

// [FR-2.3] 반복 일정 겹침 검사 미적용 (검증 불가능하므로 스킵, 실제 구현에서 확인 필요)
// [FR-4] 반복 종료일 검증
describe('generateRecurringEvents - 반복 종료일 검증', () => {
  it('[FR-4.1] 반복 종료일이 시작일보다 이전이면 빈 배열을 반환해야 한다', () => {
    const startDate = '2025-01-15';
    const endDate = '2025-01-10'; // 시작일보다 이전

    const events = generateRecurringEvents(
      {
        title: '테스트 일정',
        date: startDate,
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate },
        notificationTime: 10,
      },
      'daily',
      endDate
    );

    expect(events).toHaveLength(0);
  });

  it('[FR-4.2] 반복 종료일이 2025-12-31을 초과하면 최대 2025-12-31까지만 생성해야 한다', () => {
    const startDate = '2025-12-29';
    const endDate = '2026-01-05'; // 2025-12-31 초과

    const events = generateRecurringEvents(
      {
        title: '테스트 일정',
        date: startDate,
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate },
        notificationTime: 10,
      },
      'daily',
      endDate
    );

    // 2025-12-29, 2025-12-30, 2025-12-31만 생성되어야 함
    expect(events.length).toBe(3);
    expect(events[events.length - 1].date).toBe('2025-12-31');
  });
});

// 생성된 일정의 기본 속성 검증
describe('generateRecurringEvents - 생성된 일정 속성', () => {
  it('생성된 모든 일정이 동일한 제목, 시간, 설명, 위치, 카테고리, 알림 시간을 가져야 한다', () => {
    const baseEvent = {
      title: '반복 회의',
      date: '2025-01-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '설명',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'daily' as RepeatType, interval: 1, endDate: '2025-01-17' },
      notificationTime: 10,
    };

    const events = generateRecurringEvents(baseEvent, 'daily', '2025-01-17');

    events.forEach((event) => {
      expect(event.title).toBe(baseEvent.title);
      expect(event.startTime).toBe(baseEvent.startTime);
      expect(event.endTime).toBe(baseEvent.endTime);
      expect(event.description).toBe(baseEvent.description);
      expect(event.location).toBe(baseEvent.location);
      expect(event.category).toBe(baseEvent.category);
      expect(event.notificationTime).toBe(baseEvent.notificationTime);
      expect(event.repeat.type).toBe('daily');
      expect(event.repeat.interval).toBe(1);
    });
  });
});

