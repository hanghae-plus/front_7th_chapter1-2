import { describe, it, expect } from 'vitest';
import { EventForm, Event } from '../../types';
import {
  generateRecurringEvents,
  validateRecurringEvent,
  isRecurringEvent,
  getRecurringEventGroup,
} from '../../utils/recurringEventUtils';

describe('반복 일정 생성 로직', () => {
  describe('매일 반복 일정 생성', () => {
    it('시작일부터 종료일까지 매일 반복 일정을 생성한다', () => {
      // 1. Arrange: 시작일 2025-11-01, 종료일 2025-11-05, 반복 유형 daily
      const eventForm: EventForm = {
        title: '매일 회의',
        date: '2025-11-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '매일 스탠드업',
        location: '회의실',
        category: '업무',
        repeat: {
          type: 'daily',
          interval: 1,
          endDate: '2025-11-05',
        },
        notificationTime: 10,
      };

      // 2. Act: generateRecurringEvents 함수 호출
      const events = generateRecurringEvents(eventForm);

      // 3. Assert
      expect(events).toHaveLength(5);
      expect(events[0].date).toBe('2025-11-01');
      expect(events[1].date).toBe('2025-11-02');
      expect(events[2].date).toBe('2025-11-03');
      expect(events[3].date).toBe('2025-11-04');
      expect(events[4].date).toBe('2025-11-05');
      events.forEach((event) => {
        expect(event.repeat.type).toBe('daily');
      });
    });

    it('매일 반복 일정의 종료일이 2025-12-31을 초과하지 않는다', () => {
      // 1. Arrange: 시작일 2025-12-29, 종료일 2026-01-05, 반복 유형 daily
      const eventForm: EventForm = {
        title: '매일 회의',
        date: '2025-12-29',
        startTime: '10:00',
        endTime: '11:00',
        description: '설명',
        location: '장소',
        category: '업무',
        repeat: {
          type: 'daily',
          interval: 1,
          endDate: '2026-01-05',
        },
        notificationTime: 10,
      };

      // 2. Act: validateRecurringEvent 함수 호출
      const error = validateRecurringEvent(eventForm);

      // 3. Assert
      expect(error).toBe('반복 종료 날짜는 2025-12-31까지만 설정 가능합니다.');
    });
  });

  describe('매주 반복 일정 생성', () => {
    it('시작일과 동일한 요일에 매주 반복 일정을 생성한다', () => {
      // 1. Arrange
      const eventForm: EventForm = {
        title: '주간 회의',
        date: '2025-11-03', // 월요일
        startTime: '14:00',
        endTime: '15:00',
        description: '주간 리뷰',
        location: '회의실',
        category: '업무',
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2025-11-24',
        },
        notificationTime: 10,
      };

      // 2. Act
      const events = generateRecurringEvents(eventForm);

      // 3. Assert
      expect(events).toHaveLength(4);
      expect(events[0].date).toBe('2025-11-03');
      expect(events[1].date).toBe('2025-11-10');
      expect(events[2].date).toBe('2025-11-17');
      expect(events[3].date).toBe('2025-11-24');
      events.forEach((event) => {
        expect(event.repeat.type).toBe('weekly');
        const date = new Date(event.date);
        expect(date.getDay()).toBe(1); // 1 = 월요일
      });
    });

    it('주간 간격이 7일인지 검증한다', () => {
      // 1. Arrange
      const eventForm: EventForm = {
        title: '주간 체크인',
        date: '2025-11-05', // 수요일
        startTime: '10:00',
        endTime: '11:00',
        description: '설명',
        location: '장소',
        category: '업무',
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2025-12-03',
        },
        notificationTime: 10,
      };

      // 2. Act
      const events = generateRecurringEvents(eventForm);

      // 3. Assert
      expect(events.length).toBeGreaterThan(0);
      for (let i = 1; i < events.length; i++) {
        const prevDate = new Date(events[i - 1].date);
        const currDate = new Date(events[i].date);
        const diffDays = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
        expect(diffDays).toBe(7);
        expect(currDate.getDay()).toBe(3); // 3 = 수요일
      }
    });
  });

  describe('매월 반복 일정 생성', () => {
    it('시작일과 동일한 일(日)에 매월 반복 일정을 생성한다', () => {
      // 1. Arrange
      const eventForm: EventForm = {
        title: '월간 보고',
        date: '2025-11-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '월간 리뷰',
        location: '회의실',
        category: '업무',
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2025-12-31',
        },
        notificationTime: 10,
      };

      // 2. Act
      const events = generateRecurringEvents(eventForm);

      // 3. Assert
      expect(events).toHaveLength(2);
      expect(events[0].date).toBe('2025-11-15');
      expect(events[1].date).toBe('2025-12-15');
      events.forEach((event) => {
        expect(event.repeat.type).toBe('monthly');
        const date = new Date(event.date);
        expect(date.getDate()).toBe(15);
      });
    });

    it('31일 매월 반복 시 31일이 없는 달은 건너뛴다', () => {
      // 1. Arrange
      const eventForm: EventForm = {
        title: '월말 회의',
        date: '2025-10-31',
        startTime: '17:00',
        endTime: '18:00',
        description: '월말 정산',
        location: '회의실',
        category: '업무',
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2025-12-31',
        },
        notificationTime: 10,
      };

      // 2. Act
      const events = generateRecurringEvents(eventForm);

      // 3. Assert
      expect(events).toHaveLength(2);
      expect(events[0].date).toBe('2025-10-31');
      expect(events[1].date).toBe('2025-12-31');
      // 11월(30일까지)은 건너뛰어짐
    });

    it('30일 매월 반복 시 모든 달에 일정이 생성된다', () => {
      // 1. Arrange
      const eventForm: EventForm = {
        title: '30일 회의',
        date: '2025-10-30',
        startTime: '16:00',
        endTime: '17:00',
        description: '설명',
        location: '장소',
        category: '업무',
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2025-12-31',
        },
        notificationTime: 10,
      };

      // 2. Act
      const events = generateRecurringEvents(eventForm);

      // 3. Assert
      expect(events).toHaveLength(3);
      expect(events[0].date).toBe('2025-10-30');
      expect(events[1].date).toBe('2025-11-30');
      expect(events[2].date).toBe('2025-12-30');
    });

    it('2월의 경우 29일, 30일, 31일 반복은 건너뛴다', () => {
      // 1. Arrange
      const eventForm: EventForm = {
        title: '31일 회의',
        date: '2025-01-31',
        startTime: '14:00',
        endTime: '15:00',
        description: '설명',
        location: '장소',
        category: '업무',
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2025-03-31',
        },
        notificationTime: 10,
      };

      // 2. Act
      const events = generateRecurringEvents(eventForm);

      // 3. Assert
      expect(events).toHaveLength(2);
      expect(events[0].date).toBe('2025-01-31');
      expect(events[1].date).toBe('2025-03-31');
      // 2월은 건너뛰어짐
    });
  });

  describe('매년 반복 일정 생성', () => {
    it('시작일과 동일한 월/일에 매년 반복 일정을 생성한다', () => {
      // 1. Arrange
      const eventForm: EventForm = {
        title: '연례 행사',
        date: '2024-11-01',
        startTime: '10:00',
        endTime: '12:00',
        description: '연례 회의',
        location: '대강당',
        category: '행사',
        repeat: {
          type: 'yearly',
          interval: 1,
          endDate: '2025-12-31',
        },
        notificationTime: 10,
      };

      // 2. Act
      const events = generateRecurringEvents(eventForm);

      // 3. Assert
      expect(events).toHaveLength(2);
      expect(events[0].date).toBe('2024-11-01');
      expect(events[1].date).toBe('2025-11-01');
      events.forEach((event) => {
        expect(event.repeat.type).toBe('yearly');
        const date = new Date(event.date);
        expect(date.getMonth()).toBe(10); // 11월 = 10
        expect(date.getDate()).toBe(1);
      });
    });

    it('윤년 2월 29일 매년 반복 시 윤년에만 일정이 생성된다', () => {
      // 1. Arrange
      const eventForm: EventForm = {
        title: '윤년 기념일',
        date: '2024-02-29', // 윤년
        startTime: '10:00',
        endTime: '11:00',
        description: '4년마다',
        location: '장소',
        category: '기타',
        repeat: {
          type: 'yearly',
          interval: 1,
          endDate: '2028-02-29',
        },
        notificationTime: 10,
      };

      // 2. Act
      const events = generateRecurringEvents(eventForm);

      // 3. Assert
      expect(events).toHaveLength(2);
      expect(events[0].date).toBe('2024-02-29');
      expect(events[1].date).toBe('2028-02-29');
      // 2025, 2026, 2027년은 건너뛰어짐
    });

    it('평년에는 2월 29일 일정이 생성되지 않는다', () => {
      // 1. Arrange
      const eventForm: EventForm = {
        title: '윤년 기념일',
        date: '2024-02-29',
        startTime: '10:00',
        endTime: '11:00',
        description: '설명',
        location: '장소',
        category: '기타',
        repeat: {
          type: 'yearly',
          interval: 1,
          endDate: '2026-02-28',
        },
        notificationTime: 10,
      };

      // 2. Act
      const events = generateRecurringEvents(eventForm);

      // 3. Assert
      expect(events).toHaveLength(1);
      expect(events[0].date).toBe('2024-02-29');
      // 2025년과 2026년에는 생성되지 않음
    });
  });

  describe('반복 일정 검증', () => {
    it('반복 종료 날짜가 없으면 검증 에러를 반환한다', () => {
      // 1. Arrange
      const eventForm: EventForm = {
        title: '테스트',
        date: '2025-11-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '설명',
        location: '장소',
        category: '업무',
        repeat: {
          type: 'daily',
          interval: 1,
          endDate: undefined,
        },
        notificationTime: 10,
      };

      // 2. Act
      const error = validateRecurringEvent(eventForm);

      // 3. Assert
      expect(error).toBe('반복 종료 날짜를 입력해주세요.');
    });

    it('반복 종료 날짜가 시작 날짜보다 이전이면 검증 에러를 반환한다', () => {
      // 1. Arrange
      const eventForm: EventForm = {
        title: '테스트',
        date: '2025-11-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '설명',
        location: '장소',
        category: '업무',
        repeat: {
          type: 'daily',
          interval: 1,
          endDate: '2025-11-10',
        },
        notificationTime: 10,
      };

      // 2. Act
      const error = validateRecurringEvent(eventForm);

      // 3. Assert
      expect(error).toBe('반복 종료 날짜는 시작 날짜 이후여야 합니다.');
    });

    it('반복 종료 날짜가 2025-12-31을 초과하면 검증 에러를 반환한다', () => {
      // 1. Arrange
      const eventForm: EventForm = {
        title: '테스트',
        date: '2025-12-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '설명',
        location: '장소',
        category: '업무',
        repeat: {
          type: 'daily',
          interval: 1,
          endDate: '2026-01-15',
        },
        notificationTime: 10,
      };

      // 2. Act
      const error = validateRecurringEvent(eventForm);

      // 3. Assert
      expect(error).toBe('반복 종료 날짜는 2025-12-31까지만 설정 가능합니다.');
    });

    it('반복 유형이 선택되지 않으면 검증 에러를 반환한다', () => {
      // 1. Arrange
      const eventForm: EventForm = {
        title: '테스트',
        date: '2025-11-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '설명',
        location: '장소',
        category: '업무',
        repeat: {
          type: 'none',
          interval: 1,
          endDate: '2025-11-05',
        },
        notificationTime: 10,
      };

      // 2. Act
      const error = validateRecurringEvent(eventForm);

      // 3. Assert
      expect(error).toBe('반복 유형을 선택해주세요.');
    });

    it('반복 종료 날짜가 2025-12-31이면 검증 통과한다', () => {
      // 1. Arrange
      const eventForm: EventForm = {
        title: '테스트',
        date: '2025-12-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '설명',
        location: '장소',
        category: '업무',
        repeat: {
          type: 'daily',
          interval: 1,
          endDate: '2025-12-31',
        },
        notificationTime: 10,
      };

      // 2. Act
      const error = validateRecurringEvent(eventForm);

      // 3. Assert
      expect(error).toBeNull();
    });
  });

  describe('반복 일정 그룹 관리', () => {
    it('생성된 반복 일정들은 동일한 repeatId를 가진다', () => {
      // 1. Arrange
      const eventForm: EventForm = {
        title: '주간 회의',
        date: '2025-11-03',
        startTime: '14:00',
        endTime: '15:00',
        description: '설명',
        location: '장소',
        category: '업무',
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2025-11-24',
        },
        notificationTime: 10,
      };

      // 2. Act
      const events = generateRecurringEvents(eventForm);

      // 3. Assert
      expect(events.length).toBeGreaterThan(0);
      const firstRepeatId = events[0].repeatId;
      expect(firstRepeatId).toBeDefined();
      events.forEach((event) => {
        expect(event.repeatId).toBe(firstRepeatId);
      });
    });

    it('생성된 각 반복 일정은 고유한 id를 가진다', () => {
      // 1. Arrange
      const eventForm: EventForm = {
        title: '매일 회의',
        date: '2025-11-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '설명',
        location: '장소',
        category: '업무',
        repeat: {
          type: 'daily',
          interval: 1,
          endDate: '2025-11-05',
        },
        notificationTime: 10,
      };

      // 2. Act
      const events = generateRecurringEvents(eventForm);

      // 3. Assert
      const ids = events.map((e) => e.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(events.length);
    });

    it('단일 일정은 repeatId가 없다', () => {
      // 1. Arrange
      const eventForm: EventForm = {
        title: '단일 회의',
        date: '2025-11-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '설명',
        location: '장소',
        category: '업무',
        repeat: {
          type: 'none',
          interval: 1,
        },
        notificationTime: 10,
      };

      // 2. Act
      const events = generateRecurringEvents(eventForm);

      // 3. Assert
      if (events.length > 0) {
        expect(events[0].repeatId).toBeUndefined();
      }
    });
  });

  describe('반복 일정 판별', () => {
    it('repeat.type이 none이 아니면 반복 일정으로 판별한다', () => {
      // 1. Arrange
      const event: Event = {
        id: '1',
        title: '테스트',
        date: '2025-11-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '설명',
        location: '장소',
        category: '업무',
        repeat: {
          type: 'daily',
          interval: 1,
        },
        notificationTime: 10,
      };

      // 2. Act
      const result = isRecurringEvent(event);

      // 3. Assert
      expect(result).toBe(true);
    });

    it('repeat.type이 none이면 단일 일정으로 판별한다', () => {
      // 1. Arrange
      const event: Event = {
        id: '1',
        title: '테스트',
        date: '2025-11-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '설명',
        location: '장소',
        category: '업무',
        repeat: {
          type: 'none',
          interval: 1,
        },
        notificationTime: 10,
      };

      // 2. Act
      const result = isRecurringEvent(event);

      // 3. Assert
      expect(result).toBe(false);
    });

    it('repeat.type이 daily, weekly, monthly, yearly 모두 반복 일정으로 판별한다', () => {
      // 1. Arrange
      const types: Array<'daily' | 'weekly' | 'monthly' | 'yearly'> = [
        'daily',
        'weekly',
        'monthly',
        'yearly',
      ];

      // 2. Act & Assert
      types.forEach((type) => {
        const event: Event = {
          id: '1',
          title: '테스트',
          date: '2025-11-01',
          startTime: '10:00',
          endTime: '11:00',
          description: '설명',
          location: '장소',
          category: '업무',
          repeat: {
            type,
            interval: 1,
          },
          notificationTime: 10,
        };
        expect(isRecurringEvent(event)).toBe(true);
      });
    });
  });

  describe('반복 그룹 조회', () => {
    it('같은 repeat.id를 가진 모든 일정을 반환한다', () => {
      // 1. Arrange
      const events: Event[] = [
        {
          id: '1',
          repeatId: 'repeat-1',
          title: '회의',
          date: '2025-11-01',
          startTime: '10:00',
          endTime: '11:00',
          description: '',
          location: '',
          category: '업무',
          repeat: { type: 'daily', interval: 1 },
          notificationTime: 10,
        },
        {
          id: '2',
          repeatId: 'repeat-1',
          title: '회의',
          date: '2025-11-02',
          startTime: '10:00',
          endTime: '11:00',
          description: '',
          location: '',
          category: '업무',
          repeat: { type: 'daily', interval: 1 },
          notificationTime: 10,
        },
        {
          id: '3',
          repeatId: 'repeat-2',
          title: '다른 회의',
          date: '2025-11-03',
          startTime: '14:00',
          endTime: '15:00',
          description: '',
          location: '',
          category: '업무',
          repeat: { type: 'weekly', interval: 1 },
          notificationTime: 10,
        },
      ];

      // 2. Act
      const group = getRecurringEventGroup(events, 'repeat-1');

      // 3. Assert
      expect(group).toHaveLength(2);
      expect(group[0].id).toBe('1');
      expect(group[1].id).toBe('2');
    });

    it('해당하는 repeat.id가 없으면 빈 배열을 반환한다', () => {
      // 1. Arrange
      const events: Event[] = [
        {
          id: '1',
          repeatId: 'repeat-1',
          title: '회의',
          date: '2025-11-01',
          startTime: '10:00',
          endTime: '11:00',
          description: '',
          location: '',
          category: '업무',
          repeat: { type: 'daily', interval: 1 },
          notificationTime: 10,
        },
      ];

      // 2. Act
      const group = getRecurringEventGroup(events, 'non-existent');

      // 3. Assert
      expect(group).toHaveLength(0);
    });
  });
});
