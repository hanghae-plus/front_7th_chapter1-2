import { describe, it, expect } from 'vitest';

import { generateRecurringInstances } from '../../features/recurring-events';
import { Event } from '../../types';

describe('generateRecurringInstances', () => {
  describe('반복 유형 선택', () => {
    it('매일 반복 일정을 생성할 수 있다', () => {
      const event: Event = {
        id: '1',
        title: '매일 회의',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1 },
        notificationTime: 10,
      };

      const instances = generateRecurringInstances(event, '2025-01-01', '2025-01-07');

      expect(instances).toHaveLength(7);
      expect(instances[0].date).toBe('2025-01-01');
      expect(instances[6].date).toBe('2025-01-07');
    });

    it('매주 반복 일정을 생성할 수 있다', () => {
      const event: Event = {
        id: '1',
        title: '주간 회의',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
      };

      const instances = generateRecurringInstances(event, '2025-01-01', '2025-01-31');

      expect(instances.length).toBeGreaterThan(0);
      // 1월 1일, 8일, 15일, 22일, 29일 (5주)
      expect(instances).toHaveLength(5);
    });

    it('매월 반복 일정을 생성할 수 있다', () => {
      const event: Event = {
        id: '1',
        title: '월간 회의',
        date: '2025-01-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'monthly', interval: 1 },
        notificationTime: 10,
      };

      const instances = generateRecurringInstances(event, '2025-01-01', '2025-06-30');

      expect(instances).toHaveLength(6);
      expect(instances[0].date).toBe('2025-01-15');
      expect(instances[5].date).toBe('2025-06-15');
    });

    it('매년 반복 일정을 생성할 수 있다', () => {
      const event: Event = {
        id: '1',
        title: '연간 이벤트',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'yearly', interval: 1 },
        notificationTime: 10,
      };

      const instances = generateRecurringInstances(event, '2025-01-01', '2027-12-31');

      expect(instances).toHaveLength(3);
      expect(instances[0].date).toBe('2025-01-01');
      expect(instances[1].date).toBe('2026-01-01');
      expect(instances[2].date).toBe('2027-01-01');
    });

    it('반복 간격은 항상 1로 고정된다', () => {
      const event: Event = {
        id: '1',
        title: '일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1 },
        notificationTime: 10,
      };

      expect(event.repeat.interval).toBe(1);
    });
  });

  describe('반복 종료일 설정', () => {
    it('반복 종료일을 설정하지 않으면 무한 반복된다', () => {
      const event: Event = {
        id: '1',
        title: '무한 반복',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1 },
        notificationTime: 10,
      };

      expect(event.repeat.endDate).toBeUndefined();

      // 뷰 범위가 있으므로 뷰 범위 내에서는 생성됨
      const instances = generateRecurringInstances(event, '2025-01-01', '2025-01-10');
      expect(instances).toHaveLength(10);
    });

    it('반복 종료일을 설정하면 해당 날짜까지만 반복된다', () => {
      const event: Event = {
        id: '1',
        title: '기간 제한 반복',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-05' },
        notificationTime: 10,
      };

      const instances = generateRecurringInstances(event, '2025-01-01', '2025-01-10');

      expect(instances).toHaveLength(5);
      expect(instances[4].date).toBe('2025-01-05');
    });

    it('반복 종료일은 일정 시작일 이후여야 한다', () => {
      const event: Event = {
        id: '1',
        title: '일정',
        date: '2025-01-10',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-20' },
        notificationTime: 10,
      };

      expect(event.repeat.endDate! >= event.date).toBe(true);
    });

    it('반복 종료일이 시작일보다 이전이면 생성이 실패한다', () => {
      const event: Event = {
        id: '1',
        title: '일정',
        date: '2025-01-10',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-05' },
        notificationTime: 10,
      };

      const instances = generateRecurringInstances(event, '2025-01-01', '2025-01-31');

      expect(instances).toHaveLength(0);
    });
  });

  describe('특수 날짜 처리 - 매월 31일', () => {
    it('31일에 매월 반복을 선택하면 31일이 있는 달에만 일정이 생성된다', () => {
      const event: Event = {
        id: '1',
        title: '월말 회의',
        date: '2025-01-31',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'monthly', interval: 1, endDate: '2025-12-31' },
        notificationTime: 10,
      };

      const instances = generateRecurringInstances(event, '2025-01-01', '2025-12-31');

      // 31일이 있는 달: 1, 3, 5, 7, 8, 10, 12월 (7개)
      expect(instances).toHaveLength(7);
      const dates = instances.map((i) => i.date);
      expect(dates).toContain('2025-01-31');
      expect(dates).toContain('2025-03-31');
      expect(dates).toContain('2025-05-31');
      expect(dates).toContain('2025-07-31');
      expect(dates).toContain('2025-08-31');
      expect(dates).toContain('2025-10-31');
      expect(dates).toContain('2025-12-31');
    });

    it('매월 31일 반복 시 1월(31일)에 일정이 생성된다', () => {
      const event: Event = {
        id: '1',
        title: '월말 회의',
        date: '2025-01-31',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'monthly', interval: 1 },
        notificationTime: 10,
      };

      const instances = generateRecurringInstances(event, '2025-01-01', '2025-01-31');

      expect(instances).toHaveLength(1);
      expect(instances[0].date).toBe('2025-01-31');
    });

    it('매월 31일 반복 시 2월(28/29일)에 일정이 생성되지 않는다', () => {
      const event: Event = {
        id: '1',
        title: '월말 회의',
        date: '2025-01-31',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'monthly', interval: 1 },
        notificationTime: 10,
      };

      const instances = generateRecurringInstances(event, '2025-02-01', '2025-02-28');

      expect(instances).toHaveLength(0);
    });

    it('매월 31일 반복 시 3월(31일)에 일정이 생성된다', () => {
      const event: Event = {
        id: '1',
        title: '월말 회의',
        date: '2025-01-31',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'monthly', interval: 1 },
        notificationTime: 10,
      };

      const instances = generateRecurringInstances(event, '2025-03-01', '2025-03-31');

      expect(instances).toHaveLength(1);
      expect(instances[0].date).toBe('2025-03-31');
    });

    it('매월 31일 반복 시 4월(30일)에 일정이 생성되지 않는다', () => {
      const event: Event = {
        id: '1',
        title: '월말 회의',
        date: '2025-01-31',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'monthly', interval: 1 },
        notificationTime: 10,
      };

      const instances = generateRecurringInstances(event, '2025-04-01', '2025-04-30');

      expect(instances).toHaveLength(0);
    });

    it('매월 31일 반복 시 5월(31일)에 일정이 생성된다', () => {
      const event: Event = {
        id: '1',
        title: '월말 회의',
        date: '2025-01-31',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'monthly', interval: 1 },
        notificationTime: 10,
      };

      const instances = generateRecurringInstances(event, '2025-05-01', '2025-05-31');

      expect(instances).toHaveLength(1);
      expect(instances[0].date).toBe('2025-05-31');
    });

    it('매월 31일 반복 시 6월(30일)에 일정이 생성되지 않는다', () => {
      const event: Event = {
        id: '1',
        title: '월말 회의',
        date: '2025-01-31',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'monthly', interval: 1 },
        notificationTime: 10,
      };

      const instances = generateRecurringInstances(event, '2025-06-01', '2025-06-30');

      expect(instances).toHaveLength(0);
    });

    it('매월 31일 반복 시 7월(31일)에 일정이 생성된다', () => {
      const event: Event = {
        id: '1',
        title: '월말 회의',
        date: '2025-01-31',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'monthly', interval: 1 },
        notificationTime: 10,
      };

      const instances = generateRecurringInstances(event, '2025-07-01', '2025-07-31');

      expect(instances).toHaveLength(1);
      expect(instances[0].date).toBe('2025-07-31');
    });

    it('매월 31일 반복 시 8월(31일)에 일정이 생성된다', () => {
      const event: Event = {
        id: '1',
        title: '월말 회의',
        date: '2025-01-31',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'monthly', interval: 1 },
        notificationTime: 10,
      };

      const instances = generateRecurringInstances(event, '2025-08-01', '2025-08-31');

      expect(instances).toHaveLength(1);
      expect(instances[0].date).toBe('2025-08-31');
    });

    it('매월 31일 반복 시 9월(30일)에 일정이 생성되지 않는다', () => {
      const event: Event = {
        id: '1',
        title: '월말 회의',
        date: '2025-01-31',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'monthly', interval: 1 },
        notificationTime: 10,
      };

      const instances = generateRecurringInstances(event, '2025-09-01', '2025-09-30');

      expect(instances).toHaveLength(0);
    });

    it('매월 31일 반복 시 10월(31일)에 일정이 생성된다', () => {
      const event: Event = {
        id: '1',
        title: '월말 회의',
        date: '2025-01-31',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'monthly', interval: 1 },
        notificationTime: 10,
      };

      const instances = generateRecurringInstances(event, '2025-10-01', '2025-10-31');

      expect(instances).toHaveLength(1);
      expect(instances[0].date).toBe('2025-10-31');
    });

    it('매월 31일 반복 시 11월(30일)에 일정이 생성되지 않는다', () => {
      const event: Event = {
        id: '1',
        title: '월말 회의',
        date: '2025-01-31',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'monthly', interval: 1 },
        notificationTime: 10,
      };

      const instances = generateRecurringInstances(event, '2025-11-01', '2025-11-30');

      expect(instances).toHaveLength(0);
    });

    it('매월 31일 반복 시 12월(31일)에 일정이 생성된다', () => {
      const event: Event = {
        id: '1',
        title: '월말 회의',
        date: '2025-01-31',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'monthly', interval: 1 },
        notificationTime: 10,
      };

      const instances = generateRecurringInstances(event, '2025-12-01', '2025-12-31');

      expect(instances).toHaveLength(1);
      expect(instances[0].date).toBe('2025-12-31');
    });
  });

  describe('특수 날짜 처리 - 매년 윤년 2월 29일', () => {
    it('윤년 2월 29일에 매년 반복을 선택하면 윤년에만 일정이 생성된다', () => {
      const event: Event = {
        id: '1',
        title: '윤년 이벤트',
        date: '2024-02-29',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'yearly', interval: 1, endDate: '2028-12-31' },
        notificationTime: 10,
      };

      const instances = generateRecurringInstances(event, '2024-01-01', '2028-12-31');

      // 2024, 2028만 윤년
      expect(instances).toHaveLength(2);
      expect(instances[0].date).toBe('2024-02-29');
      expect(instances[1].date).toBe('2028-02-29');
    });

    it('매년 2월 29일 반복 시 2024년(윤년)에 일정이 생성된다', () => {
      const event: Event = {
        id: '1',
        title: '윤년 이벤트',
        date: '2024-02-29',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'yearly', interval: 1 },
        notificationTime: 10,
      };

      const instances = generateRecurringInstances(event, '2024-01-01', '2024-12-31');

      expect(instances).toHaveLength(1);
      expect(instances[0].date).toBe('2024-02-29');
    });

    it('매년 2월 29일 반복 시 2025년(평년)에 일정이 생성되지 않는다', () => {
      const event: Event = {
        id: '1',
        title: '윤년 이벤트',
        date: '2024-02-29',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'yearly', interval: 1 },
        notificationTime: 10,
      };

      const instances = generateRecurringInstances(event, '2025-01-01', '2025-12-31');

      expect(instances).toHaveLength(0);
    });

    it('매년 2월 29일 반복 시 2026년(평년)에 일정이 생성되지 않는다', () => {
      const event: Event = {
        id: '1',
        title: '윤년 이벤트',
        date: '2024-02-29',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'yearly', interval: 1 },
        notificationTime: 10,
      };

      const instances = generateRecurringInstances(event, '2026-01-01', '2026-12-31');

      expect(instances).toHaveLength(0);
    });

    it('매년 2월 29일 반복 시 2027년(평년)에 일정이 생성되지 않는다', () => {
      const event: Event = {
        id: '1',
        title: '윤년 이벤트',
        date: '2024-02-29',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'yearly', interval: 1 },
        notificationTime: 10,
      };

      const instances = generateRecurringInstances(event, '2027-01-01', '2027-12-31');

      expect(instances).toHaveLength(0);
    });

    it('매년 2월 29일 반복 시 2028년(윤년)에 일정이 생성된다', () => {
      const event: Event = {
        id: '1',
        title: '윤년 이벤트',
        date: '2024-02-29',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'yearly', interval: 1 },
        notificationTime: 10,
      };

      const instances = generateRecurringInstances(event, '2028-01-01', '2028-12-31');

      expect(instances).toHaveLength(1);
      expect(instances[0].date).toBe('2028-02-29');
    });

    it('평년 2월 29일에 매년 반복을 선택하면 일정이 생성되지 않는다', () => {
      // 평년에는 2/29가 존재하지 않으므로 이 케이스는 사실상 발생 불가
      // 하지만 테스트를 위해 강제로 체크
      const event: Event = {
        id: '1',
        title: '불가능한 이벤트',
        date: '2025-02-29', // 존재하지 않는 날짜
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'yearly', interval: 1 },
        notificationTime: 10,
      };

      const instances = generateRecurringInstances(event, '2025-01-01', '2025-12-31');

      expect(instances).toHaveLength(0);
    });
  });

  describe('특수 날짜 처리 - 기타 월말', () => {
    it('매월 30일 반복 시 2월에 일정이 생성되지 않는다', () => {
      const event: Event = {
        id: '1',
        title: '30일 이벤트',
        date: '2025-01-30',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'monthly', interval: 1 },
        notificationTime: 10,
      };

      const instances = generateRecurringInstances(event, '2025-02-01', '2025-02-28');

      expect(instances).toHaveLength(0);
    });

    it('매월 29일 반복 시 평년 2월에 일정이 생성되지 않는다', () => {
      const event: Event = {
        id: '1',
        title: '29일 이벤트',
        date: '2025-01-29',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'monthly', interval: 1 },
        notificationTime: 10,
      };

      const instances = generateRecurringInstances(event, '2025-02-01', '2025-02-28');

      expect(instances).toHaveLength(0);
    });

    it('매월 29일 반복 시 윤년 2월에 일정이 생성된다', () => {
      const event: Event = {
        id: '1',
        title: '29일 이벤트',
        date: '2024-01-29',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'monthly', interval: 1 },
        notificationTime: 10,
      };

      const instances = generateRecurringInstances(event, '2024-02-01', '2024-02-29');

      expect(instances).toHaveLength(1);
      expect(instances[0].date).toBe('2024-02-29');
    });
  });

  describe('경계 케이스', () => {
    it('시작일이 반복 일정의 첫 번째 날짜가 된다', () => {
      const event: Event = {
        id: '1',
        title: '반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1 },
        notificationTime: 10,
      };

      const instances = generateRecurringInstances(event, '2025-01-01', '2025-01-05');

      expect(instances[0].date).toBe('2025-01-01');
    });

    it('반복 종료일이 시작일과 같으면 한 번만 반복된다', () => {
      const event: Event = {
        id: '1',
        title: '반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-01' },
        notificationTime: 10,
      };

      const instances = generateRecurringInstances(event, '2025-01-01', '2025-01-05');

      expect(instances).toHaveLength(1);
      expect(instances[0].date).toBe('2025-01-01');
    });

    it('반복 종료일이 정확히 반복 날짜와 일치하면 해당 날짜에 일정이 생성된다', () => {
      const event: Event = {
        id: '1',
        title: '반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-05' },
        notificationTime: 10,
      };

      const instances = generateRecurringInstances(event, '2025-01-01', '2025-01-10');

      expect(instances).toHaveLength(5);
      expect(instances[4].date).toBe('2025-01-05');
    });

    it('반복 종료일이 반복 날짜 사이에 있으면 직전 반복 날짜까지만 일정이 생성된다', () => {
      const event: Event = {
        id: '1',
        title: '주간 반복',
        date: '2025-01-01', // 수요일
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'weekly', interval: 1, endDate: '2025-01-10' }, // 금요일
        notificationTime: 10,
      };

      const instances = generateRecurringInstances(event, '2025-01-01', '2025-01-31');

      // 1/1, 1/8까지만 생성 (1/15는 endDate 이후)
      expect(instances).toHaveLength(2);
    });

    it('매주 반복이 월 경계를 넘어서도 정상적으로 동작한다', () => {
      const event: Event = {
        id: '1',
        title: '주간 반복',
        date: '2025-01-29', // 수요일
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
      };

      const instances = generateRecurringInstances(event, '2025-01-29', '2025-02-12');

      // 1/29, 2/5, 2/12
      expect(instances).toHaveLength(3);
      expect(instances[0].date).toBe('2025-01-29');
      expect(instances[1].date).toBe('2025-02-05');
      expect(instances[2].date).toBe('2025-02-12');
    });

    it('매월 반복이 연도 경계를 넘어서도 정상적으로 동작한다', () => {
      const event: Event = {
        id: '1',
        title: '월간 반복',
        date: '2024-12-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'monthly', interval: 1 },
        notificationTime: 10,
      };

      const instances = generateRecurringInstances(event, '2024-12-01', '2025-02-28');

      // 12/15, 1/15, 2/15
      expect(instances).toHaveLength(3);
      expect(instances[0].date).toBe('2024-12-15');
      expect(instances[1].date).toBe('2025-01-15');
      expect(instances[2].date).toBe('2025-02-15');
    });
  });
});

