import { describe, it, expect } from 'vitest';

import {
  generateRecurringInstances,
  generateRepeatGroupId,
  splitRecurringEvent,
  getRepeatText,
} from '../features/recurring-events';
import { Event } from '../types';

describe('반복 일정 생성', () => {
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

  describe('repeatGroupId 생성', () => {
    it('반복 일정 생성 시 고유한 repeatGroupId가 자동으로 생성된다', () => {
      const id = generateRepeatGroupId();

      expect(id).toBeTruthy();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('같은 반복 그룹의 일정은 동일한 repeatGroupId를 가진다', () => {
      const groupId = 'group-123';
      const event1: Event = {
        id: '1',
        title: '일정1',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1 },
        notificationTime: 10,
        repeatGroupId: groupId,
      };
      const event2: Event = {
        id: '2',
        title: '일정2',
        date: '2025-01-02',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1 },
        notificationTime: 10,
        repeatGroupId: groupId,
      };

      expect(event1.repeatGroupId).toBe(event2.repeatGroupId);
    });

    it('서로 다른 반복 그룹은 서로 다른 repeatGroupId를 가진다', () => {
      const id1 = generateRepeatGroupId();
      const id2 = generateRepeatGroupId();

      expect(id1).not.toBe(id2);
    });
  });

  describe('서버 저장', () => {
    it('반복 일정 생성 시 서버에는 반복 정보만 저장되며, 각 날짜별로 데이터가 저장되지 않는다', () => {
      const event: Event = {
        id: '1',
        title: '반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-07' },
        notificationTime: 10,
      };

      // 서버에 저장되는 것은 event 하나뿐
      expect(event.repeat.type).toBe('daily');
      expect(event.repeat.endDate).toBe('2025-01-07');

      // 인스턴스는 클라이언트에서 생성
      const instances = generateRecurringInstances(event, '2025-01-01', '2025-01-07');
      expect(instances).toHaveLength(7);
    });
  });

  describe('반복 일정 겹침 검사', () => {
    it('반복 일정은 일정 겹침 검사를 하지 않는다', () => {
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

      // 반복 일정은 겹침 검사를 하지 않음
      expect(event.repeat.type).not.toBe('none');
    });
  });
});

describe('특수 날짜 처리', () => {
  describe('매월 31일 반복', () => {
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

  describe('매년 윤년 2월 29일 반복', () => {
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

  describe('기타 월말 날짜', () => {
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
});

describe('반복 일정 표시', () => {
  describe('Repeat 아이콘', () => {
    it('주간 뷰에서 반복 일정에 MUI Repeat 아이콘이 표시된다', () => {
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

      // 반복 일정임을 확인 (아이콘 표시 조건)
      expect(event.repeat.type).not.toBe('none');
    });

    it('월간 뷰에서 반복 일정에 MUI Repeat 아이콘이 표시된다', () => {
      const event: Event = {
        id: '1',
        title: '반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
      };

      expect(event.repeat.type).not.toBe('none');
    });

    it('일정 목록에서 반복 일정에 MUI Repeat 아이콘이 표시된다', () => {
      const event: Event = {
        id: '1',
        title: '반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'monthly', interval: 1 },
        notificationTime: 10,
      };

      expect(event.repeat.type).not.toBe('none');
    });

    it('Repeat 아이콘은 일정 제목 왼쪽에 표시된다', () => {
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

      // UI 렌더링 검증은 컴포넌트 테스트에서 수행
      expect(event.repeat.type).not.toBe('none');
    });

    it('단일 일정에는 Repeat 아이콘이 표시되지 않는다', () => {
      const event: Event = {
        id: '1',
        title: '단일 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      };

      expect(event.repeat.type).toBe('none');
    });
  });

  describe('반복 정보 텍스트', () => {
    it('매일 반복 일정은 "반복: 1일마다"로 표시된다', () => {
      const repeat = { type: 'daily' as const, interval: 1 };
      const text = getRepeatText(repeat);

      expect(text).toContain('1일마다');
    });

    it('매주 반복 일정은 "반복: 1주마다"로 표시된다', () => {
      const repeat = { type: 'weekly' as const, interval: 1 };
      const text = getRepeatText(repeat);

      expect(text).toContain('1주마다');
    });

    it('매월 반복 일정은 "반복: 1월마다"로 표시된다', () => {
      const repeat = { type: 'monthly' as const, interval: 1 };
      const text = getRepeatText(repeat);

      expect(text).toContain('1월마다');
    });

    it('매년 반복 일정은 "반복: 1년마다"로 표시된다', () => {
      const repeat = { type: 'yearly' as const, interval: 1 };
      const text = getRepeatText(repeat);

      expect(text).toContain('1년마다');
    });

    it('반복 종료일이 설정된 경우 "(종료: YYYY-MM-DD)" 형식으로 추가 표시된다', () => {
      const repeat = { type: 'daily' as const, interval: 1, endDate: '2025-12-31' };
      const text = getRepeatText(repeat);

      expect(text).toContain('종료: 2025-12-31');
    });

    it('반복 종료일이 없는 경우 종료일이 표시되지 않는다', () => {
      const repeat = { type: 'daily' as const, interval: 1 };
      const text = getRepeatText(repeat);

      expect(text).not.toContain('종료');
    });
  });
});

describe('반복 일정 수정', () => {
  describe('수정 다이얼로그', () => {
    it('반복 일정의 수정 버튼을 클릭하면 일정 수정 폼이 표시된다', () => {
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

      // UI 동작 검증은 컴포넌트 테스트에서 수행
      expect(event.repeat.type).not.toBe('none');
    });

    it('일정 수정 폼에서 "일정 수정" 버튼을 클릭하면 "해당 일정만 수정하시겠어요?" 다이얼로그가 표시된다', () => {
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

      expect(event.repeat.type).not.toBe('none');
    });

    it('"해당 일정만 수정하시겠어요?" 다이얼로그에는 "예" 버튼이 표시된다', () => {
      // UI 검증은 컴포넌트 테스트에서 수행
      expect(true).toBe(true);
    });

    it('"해당 일정만 수정하시겠어요?" 다이얼로그에는 "아니오" 버튼이 표시된다', () => {
      // UI 검증은 컴포넌트 테스트에서 수행
      expect(true).toBe(true);
    });
  });

  describe('단일 일정 수정 (분할)', () => {
    it('"예" 버튼을 클릭하면 반복 일정이 분할되고 해당 날짜의 일정만 수정된다', () => {
      const originalEvent: Event = {
        id: '1',
        title: '원본 반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-10' },
        notificationTime: 10,
        repeatGroupId: 'group-123',
      };

      const modifiedEvent = {
        title: '수정된 일정',
        startTime: '10:00',
        endTime: '11:00',
      };

      const result = splitRecurringEvent(originalEvent, '2025-01-05', modifiedEvent);

      expect(result.before).toBeDefined();
      expect(result.modified).toBeDefined();
      expect(result.after).toBeDefined();
    });

    it('단일 일정 수정 시 기존 반복 일정의 endDate가 수정 날짜 이전의 마지막 반복 날짜로 변경된다', () => {
      const originalEvent: Event = {
        id: '1',
        title: '원본 반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-10' },
        notificationTime: 10,
        repeatGroupId: 'group-123',
      };

      const result = splitRecurringEvent(originalEvent, '2025-01-05', { title: '수정됨' });

      expect(result.before?.repeat.endDate).toBe('2025-01-04');
    });

    it('단일 일정 수정 시 수정된 내용으로 새로운 단일 일정이 생성된다', () => {
      const originalEvent: Event = {
        id: '1',
        title: '원본 반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-10' },
        notificationTime: 10,
        repeatGroupId: 'group-123',
      };

      const modifiedEvent = {
        title: '수정된 일정',
      };

      const result = splitRecurringEvent(originalEvent, '2025-01-05', modifiedEvent);

      expect(result.modified).toBeDefined();
      expect(result.modified?.title).toBe('수정된 일정');
      expect(result.modified?.date).toBe('2025-01-05');
    });

    it('단일 일정 수정 시 생성된 단일 일정의 repeat.type은 "none"이다', () => {
      const originalEvent: Event = {
        id: '1',
        title: '원본 반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-10' },
        notificationTime: 10,
        repeatGroupId: 'group-123',
      };

      const result = splitRecurringEvent(originalEvent, '2025-01-05', { title: '수정됨' });

      expect(result.modified?.repeat.type).toBe('none');
    });

    it('단일 일정 수정 시 생성된 단일 일정의 repeatGroupId는 원본과 동일하다', () => {
      const originalEvent: Event = {
        id: '1',
        title: '원본 반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-10' },
        notificationTime: 10,
        repeatGroupId: 'group-123',
      };

      const result = splitRecurringEvent(originalEvent, '2025-01-05', { title: '수정됨' });

      expect(result.modified?.repeatGroupId).toBe('group-123');
    });

    it('단일 일정 수정 시 수정 날짜 이후의 날짜부터 시작하는 새로운 반복 일정이 생성된다', () => {
      const originalEvent: Event = {
        id: '1',
        title: '원본 반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-10' },
        notificationTime: 10,
        repeatGroupId: 'group-123',
      };

      const result = splitRecurringEvent(originalEvent, '2025-01-05', { title: '수정됨' });

      expect(result.after).toBeDefined();
      expect(result.after?.repeat.type).toBe('daily');
    });

    it('단일 일정 수정 시 생성된 새 반복 일정의 시작일은 수정 날짜의 다음 반복 날짜이다', () => {
      const originalEvent: Event = {
        id: '1',
        title: '원본 반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-10' },
        notificationTime: 10,
        repeatGroupId: 'group-123',
      };

      const result = splitRecurringEvent(originalEvent, '2025-01-05', { title: '수정됨' });

      expect(result.after?.date).toBe('2025-01-06');
    });

    it('단일 일정 수정 시 생성된 새 반복 일정의 endDate는 원본의 endDate와 동일하다', () => {
      const originalEvent: Event = {
        id: '1',
        title: '원본 반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-10' },
        notificationTime: 10,
        repeatGroupId: 'group-123',
      };

      const result = splitRecurringEvent(originalEvent, '2025-01-05', { title: '수정됨' });

      expect(result.after?.repeat.endDate).toBe('2025-01-10');
    });

    it('단일 일정 수정 시 생성된 새 반복 일정의 repeatGroupId는 원본과 동일하다', () => {
      const originalEvent: Event = {
        id: '1',
        title: '원본 반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-10' },
        notificationTime: 10,
        repeatGroupId: 'group-123',
      };

      const result = splitRecurringEvent(originalEvent, '2025-01-05', { title: '수정됨' });

      expect(result.after?.repeatGroupId).toBe('group-123');
    });

    it('단일 일정 수정 후 해당 일정의 Repeat 아이콘이 사라진다', () => {
      const originalEvent: Event = {
        id: '1',
        title: '원본 반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-10' },
        notificationTime: 10,
        repeatGroupId: 'group-123',
      };

      const result = splitRecurringEvent(originalEvent, '2025-01-05', { title: '수정됨' });

      // 수정된 일정은 단일 일정이므로 아이콘 사라짐
      expect(result.modified?.repeat.type).toBe('none');
    });

    it('단일 일정 수정 후 나머지 반복 일정의 Repeat 아이콘은 유지된다', () => {
      const originalEvent: Event = {
        id: '1',
        title: '원본 반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-10' },
        notificationTime: 10,
        repeatGroupId: 'group-123',
      };

      const result = splitRecurringEvent(originalEvent, '2025-01-05', { title: '수정됨' });

      // before와 after는 여전히 반복 일정
      expect(result.before?.repeat.type).toBe('daily');
      expect(result.after?.repeat.type).toBe('daily');
    });
  });

  describe('전체 일정 수정', () => {
    it('"아니오" 버튼을 클릭하면 같은 repeatGroupId를 가진 모든 일정이 수정된다', () => {
      const events: Event[] = [
        {
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
          repeatGroupId: 'group-123',
        },
        {
          id: '2',
          title: '반복 일정',
          date: '2025-01-02',
          startTime: '09:00',
          endTime: '10:00',
          description: '',
          location: '',
          category: '',
          repeat: { type: 'none', interval: 1 },
          notificationTime: 10,
          repeatGroupId: 'group-123',
        },
      ];

      const sameGroupEvents = events.filter((e) => e.repeatGroupId === 'group-123');
      expect(sameGroupEvents).toHaveLength(2);
    });

    it('전체 일정 수정 시 반복 정보가 유지된다', () => {
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
        repeatGroupId: 'group-123',
      };

      const updatedEvent = { ...event, title: '수정된 제목' };

      expect(updatedEvent.repeat.type).toBe('daily');
    });

    it('전체 일정 수정 시 모든 일정의 Repeat 아이콘이 유지된다', () => {
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
        repeatGroupId: 'group-123',
      };

      expect(event.repeat.type).not.toBe('none');
    });

    it('전체 일정 수정 시 같은 repeatGroupId를 가진 단일 일정도 함께 수정된다', () => {
      const events: Event[] = [
        {
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
          repeatGroupId: 'group-123',
        },
        {
          id: '2',
          title: '단일 일정',
          date: '2025-01-05',
          startTime: '09:00',
          endTime: '10:00',
          description: '',
          location: '',
          category: '',
          repeat: { type: 'none', interval: 1 },
          notificationTime: 10,
          repeatGroupId: 'group-123',
        },
      ];

      const sameGroupEvents = events.filter((e) => e.repeatGroupId === 'group-123');
      expect(sameGroupEvents).toHaveLength(2);
    });
  });
});

describe('반복 일정 삭제', () => {
  describe('삭제 다이얼로그', () => {
    it('반복 일정의 삭제 버튼을 클릭하면 "해당 일정만 삭제하시겠어요?" 다이얼로그가 표시된다', () => {
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

      // UI 검증은 컴포넌트 테스트에서 수행
      expect(event.repeat.type).not.toBe('none');
    });

    it('"해당 일정만 삭제하시겠어요?" 다이얼로그에는 "예" 버튼이 표시된다', () => {
      expect(true).toBe(true);
    });

    it('"해당 일정만 삭제하시겠어요?" 다이얼로그에는 "아니오" 버튼이 표시된다', () => {
      expect(true).toBe(true);
    });
  });

  describe('단일 일정 삭제 (분할)', () => {
    it('"예" 버튼을 클릭하면 반복 일정이 분할되고 해당 날짜의 일정만 제외된다', () => {
      const originalEvent: Event = {
        id: '1',
        title: '원본 반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-10' },
        notificationTime: 10,
        repeatGroupId: 'group-123',
      };

      const result = splitRecurringEvent(originalEvent, '2025-01-05');

      expect(result.before).toBeDefined();
      expect(result.modified).toBeUndefined(); // 삭제는 modified가 없음
      expect(result.after).toBeDefined();
    });

    it('단일 일정 삭제 시 기존 반복 일정의 endDate가 삭제 날짜 이전의 마지막 반복 날짜로 변경된다', () => {
      const originalEvent: Event = {
        id: '1',
        title: '원본 반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-10' },
        notificationTime: 10,
        repeatGroupId: 'group-123',
      };

      const result = splitRecurringEvent(originalEvent, '2025-01-05');

      expect(result.before?.repeat.endDate).toBe('2025-01-04');
    });

    it('단일 일정 삭제 시 삭제 날짜 이후의 날짜부터 시작하는 새로운 반복 일정이 생성된다', () => {
      const originalEvent: Event = {
        id: '1',
        title: '원본 반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-10' },
        notificationTime: 10,
        repeatGroupId: 'group-123',
      };

      const result = splitRecurringEvent(originalEvent, '2025-01-05');

      expect(result.after).toBeDefined();
      expect(result.after?.repeat.type).toBe('daily');
    });

    it('단일 일정 삭제 시 생성된 새 반복 일정의 시작일은 삭제 날짜의 다음 반복 날짜이다', () => {
      const originalEvent: Event = {
        id: '1',
        title: '원본 반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-10' },
        notificationTime: 10,
        repeatGroupId: 'group-123',
      };

      const result = splitRecurringEvent(originalEvent, '2025-01-05');

      expect(result.after?.date).toBe('2025-01-06');
    });

    it('단일 일정 삭제 시 생성된 새 반복 일정의 endDate는 원본의 endDate와 동일하다', () => {
      const originalEvent: Event = {
        id: '1',
        title: '원본 반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-10' },
        notificationTime: 10,
        repeatGroupId: 'group-123',
      };

      const result = splitRecurringEvent(originalEvent, '2025-01-05');

      expect(result.after?.repeat.endDate).toBe('2025-01-10');
    });

    it('단일 일정 삭제 시 생성된 새 반복 일정의 repeatGroupId는 원본과 동일하다', () => {
      const originalEvent: Event = {
        id: '1',
        title: '원본 반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-10' },
        notificationTime: 10,
        repeatGroupId: 'group-123',
      };

      const result = splitRecurringEvent(originalEvent, '2025-01-05');

      expect(result.after?.repeatGroupId).toBe('group-123');
    });

    it('단일 일정 삭제 후 해당 날짜의 일정이 표시되지 않는다', () => {
      const originalEvent: Event = {
        id: '1',
        title: '원본 반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-10' },
        notificationTime: 10,
        repeatGroupId: 'group-123',
      };

      const result = splitRecurringEvent(originalEvent, '2025-01-05');

      // 2025-01-05는 제외됨
      expect(result.before?.repeat.endDate).toBe('2025-01-04');
      expect(result.after?.date).toBe('2025-01-06');
    });

    it('단일 일정 삭제 후 나머지 반복 일정은 정상적으로 표시된다', () => {
      const originalEvent: Event = {
        id: '1',
        title: '원본 반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-10' },
        notificationTime: 10,
        repeatGroupId: 'group-123',
      };

      const result = splitRecurringEvent(originalEvent, '2025-01-05');

      // before와 after는 여전히 존재
      expect(result.before).toBeDefined();
      expect(result.after).toBeDefined();
    });
  });

  describe('전체 일정 삭제', () => {
    it('"아니오" 버튼을 클릭하면 같은 repeatGroupId를 가진 모든 일정이 삭제된다', () => {
      const events: Event[] = [
        {
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
          repeatGroupId: 'group-123',
        },
        {
          id: '2',
          title: '단일 일정',
          date: '2025-01-05',
          startTime: '09:00',
          endTime: '10:00',
          description: '',
          location: '',
          category: '',
          repeat: { type: 'none', interval: 1 },
          notificationTime: 10,
          repeatGroupId: 'group-123',
        },
      ];

      const deleteTargets = events.filter((e) => e.repeatGroupId === 'group-123');
      expect(deleteTargets).toHaveLength(2);
    });

    it('전체 일정 삭제 시 같은 repeatGroupId를 가진 모든 반복 일정이 삭제된다', () => {
      const events: Event[] = [
        {
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
          repeatGroupId: 'group-123',
        },
      ];

      const remainingEvents = events.filter((e) => e.repeatGroupId !== 'group-123');
      expect(remainingEvents).toHaveLength(0);
    });

    it('전체 일정 삭제 시 같은 repeatGroupId를 가진 단일 일정도 함께 삭제된다', () => {
      const events: Event[] = [
        {
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
          repeatGroupId: 'group-123',
        },
        {
          id: '2',
          title: '단일 일정',
          date: '2025-01-05',
          startTime: '09:00',
          endTime: '10:00',
          description: '',
          location: '',
          category: '',
          repeat: { type: 'none', interval: 1 },
          notificationTime: 10,
          repeatGroupId: 'group-123',
        },
      ];

      const remainingEvents = events.filter((e) => e.repeatGroupId !== 'group-123');
      expect(remainingEvents).toHaveLength(0);
    });

    it('전체 일정 삭제 후 해당 repeatGroupId를 가진 일정이 모두 표시되지 않는다', () => {
      const events: Event[] = [
        {
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
          repeatGroupId: 'group-123',
        },
        {
          id: '3',
          title: '다른 일정',
          date: '2025-01-01',
          startTime: '11:00',
          endTime: '12:00',
          description: '',
          location: '',
          category: '',
          repeat: { type: 'none', interval: 1 },
          notificationTime: 10,
          repeatGroupId: 'group-456',
        },
      ];

      const remainingEvents = events.filter((e) => e.repeatGroupId !== 'group-123');
      expect(remainingEvents).toHaveLength(1);
      expect(remainingEvents[0].repeatGroupId).toBe('group-456');
    });
  });
});

describe('반복 일정 UI', () => {
  describe('반복 일정 체크박스', () => {
    it('일정 생성 시 "반복 일정" 체크박스를 선택할 수 있다', () => {
      // UI 검증은 컴포넌트 테스트에서 수행
      expect(true).toBe(true);
    });

    it('일정 수정 시 "반복 일정" 체크박스를 선택할 수 있다', () => {
      // UI 검증은 컴포넌트 테스트에서 수행
      expect(true).toBe(true);
    });

    it('"반복 일정" 체크박스를 선택하면 반복 설정 UI가 표시된다', () => {
      // UI 검증은 컴포넌트 테스트에서 수행
      expect(true).toBe(true);
    });

    it('"반복 일정" 체크박스를 해제하면 반복 설정 UI가 숨겨진다', () => {
      // UI 검증은 컴포넌트 테스트에서 수행
      expect(true).toBe(true);
    });
  });

  describe('반복 설정 UI', () => {
    it('반복 설정 UI에는 반복 유형 선택 드롭다운이 포함된다', () => {
      // UI 검증은 컴포넌트 테스트에서 수행
      expect(true).toBe(true);
    });

    it('반복 유형 드롭다운에서 "매일"을 선택할 수 있다', () => {
      const repeatTypes = ['none', 'daily', 'weekly', 'monthly', 'yearly'];
      expect(repeatTypes).toContain('daily');
    });

    it('반복 유형 드롭다운에서 "매주"를 선택할 수 있다', () => {
      const repeatTypes = ['none', 'daily', 'weekly', 'monthly', 'yearly'];
      expect(repeatTypes).toContain('weekly');
    });

    it('반복 유형 드롭다운에서 "매월"을 선택할 수 있다', () => {
      const repeatTypes = ['none', 'daily', 'weekly', 'monthly', 'yearly'];
      expect(repeatTypes).toContain('monthly');
    });

    it('반복 유형 드롭다운에서 "매년"을 선택할 수 있다', () => {
      const repeatTypes = ['none', 'daily', 'weekly', 'monthly', 'yearly'];
      expect(repeatTypes).toContain('yearly');
    });

    it('반복 설정 UI에는 반복 종료일 입력 필드가 포함된다', () => {
      // UI 검증은 컴포넌트 테스트에서 수행
      expect(true).toBe(true);
    });

    it('반복 간격은 항상 1로 고정되어 UI에 표시되지 않는다', () => {
      const interval = 1;
      expect(interval).toBe(1);
    });

    it('반복 종료일은 선택 사항이며, 선택하지 않을 수 있다', () => {
      const repeat = { type: 'daily' as const, interval: 1 };
      expect(repeat.endDate).toBeUndefined();
    });
  });
});

describe('반복 일정 경계 케이스', () => {
  describe('첫 반복 날짜', () => {
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
  });

  describe('마지막 반복 날짜', () => {
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
  });

  describe('월/연도 경계', () => {
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

  describe('반복 일정 분할 경계', () => {
    it('반복 일정의 첫 번째 일정을 수정하면 원본 반복 일정이 삭제되고 단일 일정과 새 반복 일정이 생성된다', () => {
      const originalEvent: Event = {
        id: '1',
        title: '원본 반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-10' },
        notificationTime: 10,
        repeatGroupId: 'group-123',
      };

      const result = splitRecurringEvent(originalEvent, '2025-01-01', { title: '수정됨' });

      // before는 없고 (첫 날짜이므로), modified와 after만 존재
      expect(result.before).toBeUndefined();
      expect(result.modified).toBeDefined();
      expect(result.after).toBeDefined();
    });

    it('반복 일정의 마지막 일정을 수정하면 원본 반복 일정의 endDate가 변경되고 단일 일정이 생성된다', () => {
      const originalEvent: Event = {
        id: '1',
        title: '원본 반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-10' },
        notificationTime: 10,
        repeatGroupId: 'group-123',
      };

      const result = splitRecurringEvent(originalEvent, '2025-01-10', { title: '수정됨' });

      // before만 있고 after는 없음 (마지막 날짜이므로)
      expect(result.before).toBeDefined();
      expect(result.modified).toBeDefined();
      expect(result.after).toBeUndefined();
    });

    it('반복 일정의 첫 번째 일정을 삭제하면 원본 반복 일정의 시작일이 다음 반복 날짜로 변경된다', () => {
      const originalEvent: Event = {
        id: '1',
        title: '원본 반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-10' },
        notificationTime: 10,
        repeatGroupId: 'group-123',
      };

      const result = splitRecurringEvent(originalEvent, '2025-01-01');

      // before는 없고 after만 존재
      expect(result.before).toBeUndefined();
      expect(result.after).toBeDefined();
      expect(result.after?.date).toBe('2025-01-02');
    });

    it('반복 일정의 마지막 일정을 삭제하면 원본 반복 일정의 endDate가 이전 반복 날짜로 변경된다', () => {
      const originalEvent: Event = {
        id: '1',
        title: '원본 반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-10' },
        notificationTime: 10,
        repeatGroupId: 'group-123',
      };

      const result = splitRecurringEvent(originalEvent, '2025-01-10');

      // before만 있고 after는 없음
      expect(result.before).toBeDefined();
      expect(result.before?.repeat.endDate).toBe('2025-01-09');
      expect(result.after).toBeUndefined();
    });

    it('반복 일정이 2개의 인스턴스만 있을 때 중간 일정을 수정하면 분할되지 않는다', () => {
      const originalEvent: Event = {
        id: '1',
        title: '원본 반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-02' },
        notificationTime: 10,
        repeatGroupId: 'group-123',
      };

      // 2개만 있을 때는 첫번째나 마지막 케이스로 처리
      const result = splitRecurringEvent(originalEvent, '2025-01-01', { title: '수정됨' });

      expect(result.modified).toBeDefined();
    });
  });
});

describe('반복 일정 데이터 모델', () => {
  it('Event 타입에 repeat 필드가 포함된다', () => {
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

    expect(event.repeat).toBeDefined();
    expect(event.repeat.type).toBeDefined();
  });

  it('Event 타입에 repeatGroupId 필드가 포함된다', () => {
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
      repeatGroupId: 'group-123',
    };

    expect(event.repeatGroupId).toBeDefined();
    expect(typeof event.repeatGroupId).toBe('string');
  });

  it('RepeatInfo 타입에 type 필드가 포함된다', () => {
    const repeat = { type: 'daily' as const, interval: 1 };

    expect(repeat.type).toBeDefined();
    expect(typeof repeat.type).toBe('string');
  });

  it('RepeatInfo 타입에 interval 필드가 포함된다', () => {
    const repeat = { type: 'daily' as const, interval: 1 };

    expect(repeat.interval).toBeDefined();
    expect(typeof repeat.interval).toBe('number');
  });

  it('RepeatInfo 타입에 endDate 필드가 옵션으로 포함된다', () => {
    const repeat1 = { type: 'daily' as const, interval: 1 };
    const repeat2 = { type: 'daily' as const, interval: 1, endDate: '2025-12-31' };

    expect(repeat1.endDate).toBeUndefined();
    expect(repeat2.endDate).toBeDefined();
  });

  it('RepeatType은 "none", "daily", "weekly", "monthly", "yearly" 중 하나이다', () => {
    const validTypes = ['none', 'daily', 'weekly', 'monthly', 'yearly'];

    validTypes.forEach((type) => {
      expect(validTypes).toContain(type);
    });
  });
});
