import { describe, it, expect } from 'vitest';

import { EventForm } from '../../types';
import {
  generateDailyInstances,
  generateWeeklyInstances,
  generateMonthlyInstances,
  generateYearlyInstances,
} from '../../utils/repeatSchedule';

describe('Story S01: 매일 반복 일정 생성', () => {
  const baseEvent: EventForm = {
    title: '매일 미팅',
    date: '2025-10-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '일일 스탠드업 미팅',
    location: '회의실',
    category: '업무',
    repeat: {
      type: 'daily',
      interval: 1,
    },
    notificationTime: 10,
  };

  describe('AC1: 매일 선택 시 시작일부터 종료일까지 날짜별 인스턴스가 모두 생성된다', () => {
    it('시작일 2025-10-01, 종료일 2025-10-05인 경우 총 5개 인스턴스가 생성되어야 한다', () => {
      // Given: 10월 1일부터 10월 5일까지 매일 반복되는 일정
      const event: EventForm = {
        ...baseEvent,
        repeat: {
          type: 'daily',
          interval: 1,
          endDate: '2025-10-05',
        },
      };

      // When: 매일 인스턴스 생성
      const instances = generateDailyInstances(event);

      // Then: 5개의 인스턴스가 생성됨
      expect(instances).toHaveLength(5);
      expect(instances[0].date).toBe('2025-10-01');
      expect(instances[1].date).toBe('2025-10-02');
      expect(instances[2].date).toBe('2025-10-03');
      expect(instances[3].date).toBe('2025-10-04');
      expect(instances[4].date).toBe('2025-10-05');
    });

    it('각 인스턴스는 원본 이벤트의 속성을 유지해야 한다', () => {
      // Given: 종료일이 지정된 매일 반복 일정
      const event: EventForm = {
        ...baseEvent,
        repeat: {
          type: 'daily',
          interval: 1,
          endDate: '2025-10-03',
        },
      };

      // When: 매일 인스턴스 생성
      const instances = generateDailyInstances(event);

      // Then: 모든 인스턴스가 원본 속성 유지
      instances.forEach((instance) => {
        expect(instance.title).toBe(baseEvent.title);
        expect(instance.startTime).toBe(baseEvent.startTime);
        expect(instance.endTime).toBe(baseEvent.endTime);
        expect(instance.description).toBe(baseEvent.description);
        expect(instance.location).toBe(baseEvent.location);
        expect(instance.category).toBe(baseEvent.category);
        expect(instance.notificationTime).toBe(baseEvent.notificationTime);
      });
    });

    it('종료일이 시작일보다 이전인 경우 빈 배열을 반환해야 한다', () => {
      // Given: 종료일이 시작일보다 이전인 잘못된 일정
      const event: EventForm = {
        ...baseEvent,
        date: '2025-10-10',
        repeat: {
          type: 'daily',
          interval: 1,
          endDate: '2025-10-05',
        },
      };

      // When: 매일 인스턴스 생성 시도
      const instances = generateDailyInstances(event);

      // Then: 빈 배열 반환
      expect(instances).toHaveLength(0);
    });
  });

  describe('AC2: 종료일이 미지정인 경우 시스템 최대 기간까지 생성된다', () => {
    it('종료일이 없으면 시작일로부터 365일간 인스턴스가 생성되어야 한다', () => {
      // Given: 종료일이 지정되지 않은 매일 반복 일정
      const event: EventForm = {
        ...baseEvent,
        date: '2025-01-01',
        repeat: {
          type: 'daily',
          interval: 1,
          // endDate 없음
        },
      };

      // When: 매일 인스턴스 생성
      const instances = generateDailyInstances(event);

      // Then: 366개의 인스턴스가 생성됨 (2025는 평년, 2026-01-01까지)
      expect(instances).toHaveLength(366);
      expect(instances[0].date).toBe('2025-01-01');
      expect(instances[instances.length - 1].date).toBe('2026-01-01');
    });

    it('종료일이 undefined인 경우도 365일간 생성되어야 한다', () => {
      // Given: 종료일이 명시적으로 undefined인 일정
      const event: EventForm = {
        ...baseEvent,
        date: '2025-06-01',
        repeat: {
          type: 'daily',
          interval: 1,
          endDate: undefined,
        },
      };

      // When: 매일 인스턴스 생성
      const instances = generateDailyInstances(event);

      // Then: 366개의 인스턴스가 생성됨
      expect(instances).toHaveLength(366);
      expect(instances[0].date).toBe('2025-06-01');
    });
  });

  describe('AC3: 다른 반복 규칙과 혼동되지 않는다', () => {
    it('interval이 1이 아니어도 매일 1일씩 증가해야 한다', () => {
      // Given: interval이 다른 값으로 설정된 매일 반복 일정
      const event: EventForm = {
        ...baseEvent,
        repeat: {
          type: 'daily',
          interval: 7, // interval 무시되어야 함
          endDate: '2025-10-05',
        },
      };

      // When: 매일 인스턴스 생성
      const instances = generateDailyInstances(event);

      // Then: 여전히 매일 생성됨 (interval 무시)
      expect(instances).toHaveLength(5);
      expect(instances[0].date).toBe('2025-10-01');
      expect(instances[1].date).toBe('2025-10-02');
    });
  });

  describe('Edge Cases: 경계 조건 테스트', () => {
    it('시작일과 종료일이 같은 경우 1개의 인스턴스만 생성되어야 한다', () => {
      // Given: 시작일과 종료일이 동일한 일정
      const event: EventForm = {
        ...baseEvent,
        date: '2025-10-01',
        repeat: {
          type: 'daily',
          interval: 1,
          endDate: '2025-10-01',
        },
      };

      // When: 매일 인스턴스 생성
      const instances = generateDailyInstances(event);

      // Then: 1개의 인스턴스만 생성
      expect(instances).toHaveLength(1);
      expect(instances[0].date).toBe('2025-10-01');
    });

    it('월을 넘어가는 경우에도 정확히 생성되어야 한다', () => {
      // Given: 10월 말부터 11월 초까지 반복되는 일정
      const event: EventForm = {
        ...baseEvent,
        date: '2025-10-30',
        repeat: {
          type: 'daily',
          interval: 1,
          endDate: '2025-11-03',
        },
      };

      // When: 매일 인스턴스 생성
      const instances = generateDailyInstances(event);

      // Then: 월 경계를 넘어서도 정확히 생성됨
      expect(instances).toHaveLength(5);
      expect(instances[0].date).toBe('2025-10-30');
      expect(instances[1].date).toBe('2025-10-31');
      expect(instances[2].date).toBe('2025-11-01');
      expect(instances[3].date).toBe('2025-11-02');
      expect(instances[4].date).toBe('2025-11-03');
    });

    it('연을 넘어가는 경우에도 정확히 생성되어야 한다', () => {
      // Given: 12월 말부터 1월 초까지 반복되는 일정
      const event: EventForm = {
        ...baseEvent,
        date: '2025-12-30',
        repeat: {
          type: 'daily',
          interval: 1,
          endDate: '2026-01-02',
        },
      };

      // When: 매일 인스턴스 생성
      const instances = generateDailyInstances(event);

      // Then: 연 경계를 넘어서도 정확히 생성됨
      expect(instances).toHaveLength(4);
      expect(instances[0].date).toBe('2025-12-30');
      expect(instances[1].date).toBe('2025-12-31');
      expect(instances[2].date).toBe('2026-01-01');
      expect(instances[3].date).toBe('2026-01-02');
    });
  });
});

describe('Story S02: 매주 반복 일정 생성', () => {
  const baseEvent: EventForm = {
    title: '주간 회의',
    date: '2025-10-01', // 수요일
    startTime: '14:00',
    endTime: '15:00',
    description: '주간 스프린트 리뷰',
    location: '회의실 A',
    category: '업무',
    repeat: {
      type: 'weekly',
      interval: 1,
    },
    notificationTime: 30,
  };

  describe('AC1: 매주 선택 시 시작일부터 종료일까지 주 단위로 인스턴스가 생성된다', () => {
    it('시작일 2025-10-01(수), 종료일 2025-10-29(수)인 경우 총 5개 인스턴스가 생성되어야 한다', () => {
      // Given: 10월 1일(수)부터 10월 29일(수)까지 매주 반복되는 일정
      const event: EventForm = {
        ...baseEvent,
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2025-10-29',
        },
      };

      // When: 매주 인스턴스 생성
      const instances = generateWeeklyInstances(event);

      // Then: 5개의 인스턴스가 생성됨 (매주 수요일)
      expect(instances).toHaveLength(5);
      expect(instances[0].date).toBe('2025-10-01');
      expect(instances[1].date).toBe('2025-10-08');
      expect(instances[2].date).toBe('2025-10-15');
      expect(instances[3].date).toBe('2025-10-22');
      expect(instances[4].date).toBe('2025-10-29');
    });

    it('각 인스턴스는 원본 이벤트의 속성을 유지해야 한다', () => {
      // Given: 종료일이 지정된 매주 반복 일정
      const event: EventForm = {
        ...baseEvent,
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2025-10-15',
        },
      };

      // When: 매주 인스턴스 생성
      const instances = generateWeeklyInstances(event);

      // Then: 모든 인스턴스가 원본 속성 유지
      instances.forEach((instance) => {
        expect(instance.title).toBe(baseEvent.title);
        expect(instance.startTime).toBe(baseEvent.startTime);
        expect(instance.endTime).toBe(baseEvent.endTime);
        expect(instance.description).toBe(baseEvent.description);
        expect(instance.location).toBe(baseEvent.location);
        expect(instance.category).toBe(baseEvent.category);
        expect(instance.notificationTime).toBe(baseEvent.notificationTime);
      });
    });

    it('종료일이 시작일보다 이전인 경우 빈 배열을 반환해야 한다', () => {
      // Given: 종료일이 시작일보다 이전인 잘못된 일정
      const event: EventForm = {
        ...baseEvent,
        date: '2025-10-15',
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2025-10-01',
        },
      };

      // When: 매주 인스턴스 생성 시도
      const instances = generateWeeklyInstances(event);

      // Then: 빈 배열 반환
      expect(instances).toHaveLength(0);
    });
  });

  describe('AC2: 동일한 요일에만 인스턴스가 생성된다', () => {
    it('월요일에 시작한 일정은 매주 월요일에만 생성되어야 한다', () => {
      // Given: 2025-10-06(월)부터 시작하는 매주 반복 일정
      const event: EventForm = {
        ...baseEvent,
        date: '2025-10-06', // 월요일
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2025-11-03', // 월요일
        },
      };

      // When: 매주 인스턴스 생성
      const instances = generateWeeklyInstances(event);

      // Then: 모두 월요일이어야 함
      expect(instances).toHaveLength(5);
      instances.forEach((instance) => {
        const date = new Date(instance.date);
        expect(date.getDay()).toBe(1); // 월요일 = 1
      });
    });

    it('금요일에 시작한 일정은 매주 금요일에만 생성되어야 한다', () => {
      // Given: 2025-10-03(금)부터 시작하는 매주 반복 일정
      const event: EventForm = {
        ...baseEvent,
        date: '2025-10-03', // 금요일
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2025-10-31', // 금요일
        },
      };

      // When: 매주 인스턴스 생성
      const instances = generateWeeklyInstances(event);

      // Then: 모두 금요일이어야 함
      expect(instances).toHaveLength(5);
      instances.forEach((instance) => {
        const date = new Date(instance.date);
        expect(date.getDay()).toBe(5); // 금요일 = 5
      });
    });
  });

  describe('AC3: 종료일이 미지정인 경우 시스템 최대 기간까지 생성된다', () => {
    it('종료일이 없으면 시작일로부터 52주간 인스턴스가 생성되어야 한다', () => {
      // Given: 종료일이 지정되지 않은 매주 반복 일정
      const event: EventForm = {
        ...baseEvent,
        date: '2025-01-01', // 수요일
        repeat: {
          type: 'weekly',
          interval: 1,
          // endDate 없음
        },
      };

      // When: 매주 인스턴스 생성
      const instances = generateWeeklyInstances(event);

      // Then: 약 52~53개의 인스턴스가 생성됨 (365일 / 7 ≈ 52.14)
      expect(instances.length).toBeGreaterThanOrEqual(52);
      expect(instances.length).toBeLessThanOrEqual(53);
      expect(instances[0].date).toBe('2025-01-01');
    });
  });

  describe('Edge Cases: 경계 조건 테스트', () => {
    it('시작일과 종료일이 같은 경우 1개의 인스턴스만 생성되어야 한다', () => {
      // Given: 시작일과 종료일이 동일한 일정
      const event: EventForm = {
        ...baseEvent,
        date: '2025-10-01',
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2025-10-01',
        },
      };

      // When: 매주 인스턴스 생성
      const instances = generateWeeklyInstances(event);

      // Then: 1개의 인스턴스만 생성
      expect(instances).toHaveLength(1);
      expect(instances[0].date).toBe('2025-10-01');
    });

    it('월을 넘어가는 경우에도 정확히 생성되어야 한다', () => {
      // Given: 10월 말부터 11월 중순까지 반복되는 일정
      const event: EventForm = {
        ...baseEvent,
        date: '2025-10-29', // 수요일
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2025-11-19', // 수요일
        },
      };

      // When: 매주 인스턴스 생성
      const instances = generateWeeklyInstances(event);

      // Then: 월 경계를 넘어서도 정확히 생성됨
      expect(instances).toHaveLength(4);
      expect(instances[0].date).toBe('2025-10-29');
      expect(instances[1].date).toBe('2025-11-05');
      expect(instances[2].date).toBe('2025-11-12');
      expect(instances[3].date).toBe('2025-11-19');
    });

    it('연을 넘어가는 경우에도 정확히 생성되어야 한다', () => {
      // Given: 12월 말부터 1월 중순까지 반복되는 일정
      const event: EventForm = {
        ...baseEvent,
        date: '2025-12-25', // 목요일
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2026-01-15', // 목요일
        },
      };

      // When: 매주 인스턴스 생성
      const instances = generateWeeklyInstances(event);

      // Then: 연 경계를 넘어서도 정확히 생성됨
      expect(instances).toHaveLength(4);
      expect(instances[0].date).toBe('2025-12-25');
      expect(instances[1].date).toBe('2026-01-01');
      expect(instances[2].date).toBe('2026-01-08');
      expect(instances[3].date).toBe('2026-01-15');
    });

    it('종료일이 주 단위로 정확히 떨어지지 않아도 마지막 날짜까지 포함되어야 한다', () => {
      // Given: 종료일이 정확히 7일 간격이 아닌 일정
      const event: EventForm = {
        ...baseEvent,
        date: '2025-10-01', // 수요일
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2025-10-10', // 금요일 (9일 후)
        },
      };

      // When: 매주 인스턴스 생성
      const instances = generateWeeklyInstances(event);

      // Then: 종료일을 초과하지 않고 적절히 생성됨
      expect(instances).toHaveLength(2); // 10-01(수), 10-08(수)만 포함
      expect(instances[0].date).toBe('2025-10-01');
      expect(instances[1].date).toBe('2025-10-08');
    });
  });
});

describe('Story S03: 매월 31일 규칙', () => {
  const baseEvent: EventForm = {
    title: '월말 결산',
    date: '2025-01-31', // 31일
    startTime: '17:00',
    endTime: '18:00',
    description: '월말 재무 결산',
    location: '본사',
    category: '업무',
    repeat: {
      type: 'monthly',
      interval: 1,
    },
    notificationTime: 60,
  };

  describe('AC1: 31일에 시작한 매월 반복 일정은 31일이 있는 달에만 생성된다', () => {
    it('1월 31일 시작, 12월 31일 종료 시 31일이 있는 달에만 생성되어야 한다 (7개월)', () => {
      // Given: 2025-01-31부터 2025-12-31까지 매월 반복
      const event: EventForm = {
        ...baseEvent,
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2025-12-31',
        },
      };

      // When: 매월 인스턴스 생성
      const instances = generateMonthlyInstances(event);

      // Then: 31일이 있는 달에만 생성 (1월, 3월, 5월, 7월, 8월, 10월, 12월 = 7개)
      expect(instances).toHaveLength(7);
      expect(instances[0].date).toBe('2025-01-31');
      expect(instances[1].date).toBe('2025-03-31');
      expect(instances[2].date).toBe('2025-05-31');
      expect(instances[3].date).toBe('2025-07-31');
      expect(instances[4].date).toBe('2025-08-31');
      expect(instances[5].date).toBe('2025-10-31');
      expect(instances[6].date).toBe('2025-12-31');
    });

    it('각 인스턴스는 원본 이벤트의 속성을 유지해야 한다', () => {
      // Given: 31일에 시작하는 매월 반복 일정
      const event: EventForm = {
        ...baseEvent,
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2025-05-31',
        },
      };

      // When: 매월 인스턴스 생성
      const instances = generateMonthlyInstances(event);

      // Then: 모든 인스턴스가 원본 속성 유지
      instances.forEach((instance: EventForm) => {
        expect(instance.title).toBe(baseEvent.title);
        expect(instance.startTime).toBe(baseEvent.startTime);
        expect(instance.endTime).toBe(baseEvent.endTime);
        expect(instance.description).toBe(baseEvent.description);
        expect(instance.location).toBe(baseEvent.location);
        expect(instance.category).toBe(baseEvent.category);
        expect(instance.notificationTime).toBe(baseEvent.notificationTime);
      });
    });
  });

  describe('AC2: 31일이 없는 달에는 인스턴스가 생성되지 않는다', () => {
    it('2월(28일)에는 31일 반복 일정이 생성되지 않아야 한다', () => {
      // Given: 1월 31일부터 3월 31일까지 매월 반복
      const event: EventForm = {
        ...baseEvent,
        date: '2025-01-31',
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2025-03-31',
        },
      };

      // When: 매월 인스턴스 생성
      const instances = generateMonthlyInstances(event);

      // Then: 2월은 건너뛰고 1월, 3월만 생성 (2개)
      expect(instances).toHaveLength(2);
      expect(instances[0].date).toBe('2025-01-31');
      expect(instances[1].date).toBe('2025-03-31');
    });

    it('4월(30일)에는 31일 반복 일정이 생성되지 않아야 한다', () => {
      // Given: 3월 31일부터 5월 31일까지 매월 반복
      const event: EventForm = {
        ...baseEvent,
        date: '2025-03-31',
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2025-05-31',
        },
      };

      // When: 매월 인스턴스 생성
      const instances = generateMonthlyInstances(event);

      // Then: 4월은 건너뛰고 3월, 5월만 생성 (2개)
      expect(instances).toHaveLength(2);
      expect(instances[0].date).toBe('2025-03-31');
      expect(instances[1].date).toBe('2025-05-31');
    });

    it('6월, 9월, 11월(30일)에는 31일 반복 일정이 생성되지 않아야 한다', () => {
      // Given: 5월 31일부터 12월 31일까지 매월 반복
      const event: EventForm = {
        ...baseEvent,
        date: '2025-05-31',
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2025-12-31',
        },
      };

      // When: 매월 인스턴스 생성
      const instances = generateMonthlyInstances(event);

      // Then: 6월, 9월, 11월은 건너뛰고 5월, 7월, 8월, 10월, 12월만 생성 (5개)
      expect(instances).toHaveLength(5);
      expect(instances[0].date).toBe('2025-05-31');
      expect(instances[1].date).toBe('2025-07-31');
      expect(instances[2].date).toBe('2025-08-31');
      expect(instances[3].date).toBe('2025-10-31');
      expect(instances[4].date).toBe('2025-12-31');

      // 6월, 9월, 11월이 포함되지 않았는지 확인
      const dates = instances.map((i: EventForm) => i.date);
      expect(dates).not.toContain('2025-06-31'); // 존재하지 않는 날짜
      expect(dates).not.toContain('2025-09-31'); // 존재하지 않는 날짜
      expect(dates).not.toContain('2025-11-31'); // 존재하지 않는 날짜
    });
  });

  describe('AC3: 31일이 아닌 날짜는 매월 정상적으로 생성된다', () => {
    it('15일에 시작한 매월 반복 일정은 모든 달에 생성되어야 한다', () => {
      // Given: 2025-01-15부터 2025-06-15까지 매월 반복
      const event: EventForm = {
        ...baseEvent,
        date: '2025-01-15',
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2025-06-15',
        },
      };

      // When: 매월 인스턴스 생성
      const instances = generateMonthlyInstances(event);

      // Then: 6개월 모두 생성 (1월, 2월, 3월, 4월, 5월, 6월)
      expect(instances).toHaveLength(6);
      expect(instances[0].date).toBe('2025-01-15');
      expect(instances[1].date).toBe('2025-02-15');
      expect(instances[2].date).toBe('2025-03-15');
      expect(instances[3].date).toBe('2025-04-15');
      expect(instances[4].date).toBe('2025-05-15');
      expect(instances[5].date).toBe('2025-06-15');
    });

    it('1일에 시작한 매월 반복 일정은 모든 달에 생성되어야 한다', () => {
      // Given: 2025-01-01부터 2025-12-01까지 매월 반복
      const event: EventForm = {
        ...baseEvent,
        date: '2025-01-01',
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2025-12-01',
        },
      };

      // When: 매월 인스턴스 생성
      const instances = generateMonthlyInstances(event);

      // Then: 12개월 모두 생성
      expect(instances).toHaveLength(12);
      expect(instances[0].date).toBe('2025-01-01');
      expect(instances[11].date).toBe('2025-12-01');
    });
  });

  describe('Edge Cases: 경계 조건 테스트', () => {
    it('시작일과 종료일이 같은 경우 1개의 인스턴스만 생성되어야 한다', () => {
      // Given: 시작일과 종료일이 동일한 일정
      const event: EventForm = {
        ...baseEvent,
        date: '2025-01-31',
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2025-01-31',
        },
      };

      // When: 매월 인스턴스 생성
      const instances = generateMonthlyInstances(event);

      // Then: 1개의 인스턴스만 생성
      expect(instances).toHaveLength(1);
      expect(instances[0].date).toBe('2025-01-31');
    });

    it('종료일이 시작일보다 이전인 경우 빈 배열을 반환해야 한다', () => {
      // Given: 종료일이 시작일보다 이전인 잘못된 일정
      const event: EventForm = {
        ...baseEvent,
        date: '2025-05-31',
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2025-01-31',
        },
      };

      // When: 매월 인스턴스 생성 시도
      const instances = generateMonthlyInstances(event);

      // Then: 빈 배열 반환
      expect(instances).toHaveLength(0);
    });

    it('연을 넘어가는 경우에도 31일 규칙이 적용되어야 한다', () => {
      // Given: 12월 31일부터 다음 해 3월 31일까지 매월 반복
      const event: EventForm = {
        ...baseEvent,
        date: '2025-12-31',
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2026-03-31',
        },
      };

      // When: 매월 인스턴스 생성
      const instances = generateMonthlyInstances(event);

      // Then: 2월은 건너뛰고 12월, 1월, 3월만 생성 (3개)
      expect(instances).toHaveLength(3);
      expect(instances[0].date).toBe('2025-12-31');
      expect(instances[1].date).toBe('2026-01-31');
      expect(instances[2].date).toBe('2026-03-31');
    });

    it('종료일이 미지정인 경우 약 12개월간 생성되고 31일 규칙이 적용되어야 한다', () => {
      // Given: 종료일이 없는 매월 31일 반복 일정
      const event: EventForm = {
        ...baseEvent,
        date: '2025-01-31',
        repeat: {
          type: 'monthly',
          interval: 1,
          // endDate 없음
        },
      };

      // When: 매월 인스턴스 생성
      const instances = generateMonthlyInstances(event);

      // Then: 약 7~8개 생성 (31일이 있는 달만)
      // 1년 중 31일이 있는 달: 1월, 3월, 5월, 7월, 8월, 10월, 12월 = 7개월
      expect(instances.length).toBeGreaterThanOrEqual(7);
      expect(instances.length).toBeLessThanOrEqual(8);

      // 모든 인스턴스가 31일인지 확인
      instances.forEach((instance: EventForm) => {
        const date = new Date(instance.date);
        expect(date.getDate()).toBe(31);
      });
    });
  });
});

describe('Story S04: 매년 윤일 규칙', () => {
  const baseEvent: EventForm = {
    title: '생일 축하',
    date: '2024-02-29', // 윤년 2월 29일
    startTime: '12:00',
    endTime: '13:00',
    description: '윤일생 생일',
    location: '집',
    category: '개인',
    repeat: {
      type: 'yearly',
      interval: 1,
    },
    notificationTime: 1440, // 1일 전
  };

  describe('AC1: 윤년 2월 29일에 시작한 매년 반복 일정은 윤년에만 생성된다', () => {
    it('2024년(윤년) 2월 29일 시작 시 윤년에만 생성되어야 한다', () => {
      // Given: 2024-02-29(윤년)부터 2032-02-29(윤년)까지 매년 반복
      const event: EventForm = {
        ...baseEvent,
        date: '2024-02-29',
        repeat: {
          type: 'yearly',
          interval: 1,
          endDate: '2032-02-29',
        },
      };

      // When: 매년 인스턴스 생성
      const instances = generateYearlyInstances(event);

      // Then: 윤년에만 생성 (2024, 2028, 2032 = 3개)
      expect(instances).toHaveLength(3);
      expect(instances[0].date).toBe('2024-02-29');
      expect(instances[1].date).toBe('2028-02-29');
      expect(instances[2].date).toBe('2032-02-29');
    });

    it('평년(2025, 2026, 2027)에는 2월 29일 반복 일정이 생성되지 않아야 한다', () => {
      // Given: 2024-02-29부터 2028-02-29까지 매년 반복
      const event: EventForm = {
        ...baseEvent,
        date: '2024-02-29',
        repeat: {
          type: 'yearly',
          interval: 1,
          endDate: '2028-02-29',
        },
      };

      // When: 매년 인스턴스 생성
      const instances = generateYearlyInstances(event);

      // Then: 평년은 건너뛰고 윤년만 생성 (2024, 2028 = 2개)
      expect(instances).toHaveLength(2);
      const dates = instances.map((i: EventForm) => i.date);
      expect(dates).not.toContain('2025-02-29'); // 평년 (존재하지 않음)
      expect(dates).not.toContain('2026-02-29'); // 평년 (존재하지 않음)
      expect(dates).not.toContain('2027-02-29'); // 평년 (존재하지 않음)
    });

    it('각 인스턴스는 원본 이벤트의 속성을 유지해야 한다', () => {
      // Given: 윤일 매년 반복 일정
      const event: EventForm = {
        ...baseEvent,
        date: '2024-02-29',
        repeat: {
          type: 'yearly',
          interval: 1,
          endDate: '2028-02-29',
        },
      };

      // When: 매년 인스턴스 생성
      const instances = generateYearlyInstances(event);

      // Then: 모든 인스턴스가 원본 속성 유지
      instances.forEach((instance: EventForm) => {
        expect(instance.title).toBe(baseEvent.title);
        expect(instance.startTime).toBe(baseEvent.startTime);
        expect(instance.endTime).toBe(baseEvent.endTime);
        expect(instance.description).toBe(baseEvent.description);
        expect(instance.location).toBe(baseEvent.location);
        expect(instance.category).toBe(baseEvent.category);
        expect(instance.notificationTime).toBe(baseEvent.notificationTime);
      });
    });
  });

  describe('AC2: 윤일이 아닌 날짜는 매년 정상적으로 생성된다', () => {
    it('1월 1일에 시작한 매년 반복 일정은 모든 년도에 생성되어야 한다', () => {
      // Given: 2024-01-01부터 2028-01-01까지 매년 반복
      const event: EventForm = {
        ...baseEvent,
        date: '2024-01-01',
        repeat: {
          type: 'yearly',
          interval: 1,
          endDate: '2028-01-01',
        },
      };

      // When: 매년 인스턴스 생성
      const instances = generateYearlyInstances(event);

      // Then: 5개년 모두 생성 (2024, 2025, 2026, 2027, 2028)
      expect(instances).toHaveLength(5);
      expect(instances[0].date).toBe('2024-01-01');
      expect(instances[1].date).toBe('2025-01-01');
      expect(instances[2].date).toBe('2026-01-01');
      expect(instances[3].date).toBe('2027-01-01');
      expect(instances[4].date).toBe('2028-01-01');
    });

    it('12월 31일에 시작한 매년 반복 일정은 모든 년도에 생성되어야 한다', () => {
      // Given: 2024-12-31부터 2027-12-31까지 매년 반복
      const event: EventForm = {
        ...baseEvent,
        date: '2024-12-31',
        repeat: {
          type: 'yearly',
          interval: 1,
          endDate: '2027-12-31',
        },
      };

      // When: 매년 인스턴스 생성
      const instances = generateYearlyInstances(event);

      // Then: 4개년 모두 생성
      expect(instances).toHaveLength(4);
      expect(instances[0].date).toBe('2024-12-31');
      expect(instances[1].date).toBe('2025-12-31');
      expect(instances[2].date).toBe('2026-12-31');
      expect(instances[3].date).toBe('2027-12-31');
    });

    it('2월 28일에 시작한 매년 반복 일정은 모든 년도에 생성되어야 한다', () => {
      // Given: 2024-02-28부터 2028-02-28까지 매년 반복
      const event: EventForm = {
        ...baseEvent,
        date: '2024-02-28',
        repeat: {
          type: 'yearly',
          interval: 1,
          endDate: '2028-02-28',
        },
      };

      // When: 매년 인스턴스 생성
      const instances = generateYearlyInstances(event);

      // Then: 5개년 모두 생성 (윤년/평년 관계없이)
      expect(instances).toHaveLength(5);
      expect(instances[0].date).toBe('2024-02-28');
      expect(instances[1].date).toBe('2025-02-28');
      expect(instances[2].date).toBe('2026-02-28');
      expect(instances[3].date).toBe('2027-02-28');
      expect(instances[4].date).toBe('2028-02-28');
    });
  });

  describe('Edge Cases: 경계 조건 테스트', () => {
    it('시작일과 종료일이 같은 경우 1개의 인스턴스만 생성되어야 한다', () => {
      // Given: 시작일과 종료일이 동일한 일정
      const event: EventForm = {
        ...baseEvent,
        date: '2024-02-29',
        repeat: {
          type: 'yearly',
          interval: 1,
          endDate: '2024-02-29',
        },
      };

      // When: 매년 인스턴스 생성
      const instances = generateYearlyInstances(event);

      // Then: 1개의 인스턴스만 생성
      expect(instances).toHaveLength(1);
      expect(instances[0].date).toBe('2024-02-29');
    });

    it('종료일이 시작일보다 이전인 경우 빈 배열을 반환해야 한다', () => {
      // Given: 종료일이 시작일보다 이전인 잘못된 일정
      const event: EventForm = {
        ...baseEvent,
        date: '2028-02-29',
        repeat: {
          type: 'yearly',
          interval: 1,
          endDate: '2024-02-29',
        },
      };

      // When: 매년 인스턴스 생성 시도
      const instances = generateYearlyInstances(event);

      // Then: 빈 배열 반환
      expect(instances).toHaveLength(0);
    });

    it('100년마다 윤년이 아닌 규칙도 적용되어야 한다 (2100년은 윤년 아님)', () => {
      // Given: 2096-02-29(윤년)부터 2104-02-29(윤년)까지 매년 반복
      const event: EventForm = {
        ...baseEvent,
        date: '2096-02-29',
        repeat: {
          type: 'yearly',
          interval: 1,
          endDate: '2104-02-29',
        },
      };

      // When: 매년 인스턴스 생성
      const instances = generateYearlyInstances(event);

      // Then: 2100년은 건너뛰고 윤년만 생성 (2096, 2104 = 2개)
      expect(instances).toHaveLength(2);
      expect(instances[0].date).toBe('2096-02-29');
      expect(instances[1].date).toBe('2104-02-29');

      const dates = instances.map((i: EventForm) => i.date);
      expect(dates).not.toContain('2100-02-29'); // 100의 배수이지만 400의 배수가 아니므로 평년
    });

    it('종료일이 미지정인 경우 약 1년간 생성되고 윤일 규칙이 적용되어야 한다', () => {
      // Given: 종료일이 없는 윤일 매년 반복 일정
      const event: EventForm = {
        ...baseEvent,
        date: '2024-02-29',
        repeat: {
          type: 'yearly',
          interval: 1,
          // endDate 없음 (365일 후까지)
        },
      };

      // When: 매년 인스턴스 생성
      const instances = generateYearlyInstances(event);

      // Then: 1개만 생성 (다음 윤년은 4년 후)
      expect(instances).toHaveLength(1);
      expect(instances[0].date).toBe('2024-02-29');
    });
  });
});
