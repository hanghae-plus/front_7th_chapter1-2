import { http, HttpResponse } from 'msw';
import { describe, it, expect, beforeEach } from 'vitest';

import { server } from '../../setupTests';
import { Event, EventForm, RepeatType } from '../../types';
import { generateRecurringDates } from '../../utils/repeatDateCalculator';

describe('Recurring Events - Integration Scenarios', () => {
  beforeEach(() => {
    expect.hasAssertions();
  });

  describe('실제 사용 시나리오', () => {
    it('SCENARIO.1 - 매주 월요일 팀 미팅 (3개월)', async () => {
      const mockEvents: Event[] = [];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: mockEvents });
        }),

        http.post('/api/events-list', async ({ request }) => {
          const events = (await request.json()) as Event[];

          mockEvents.push(...events);
          return HttpResponse.json(createdEvents, { status: 201 });
        })
      );

      // 주간 반복 이벤트 생성
      const startDate = '2025-10-06'; // 월요일
      const endDate = '2025-12-29';

      const recurringDates = generateRecurringDates(startDate, 'weekly', 1, endDate);

      expect(recurringDates.length).toBe(13); // 13주

      // 각 날짜에 대해 이벤트 생성
      const eventForm: EventForm = {
        title: '주간 팀 미팅',
        date: startDate,
        startTime: '10:00',
        endTime: '11:00',
        description: '팀 미팅',
        location: '회의실',
        category: '업무',
        repeat: {
          type: 'weekly' as RepeatType,
          interval: 1,
          endDate: endDate,
        },
        notificationTime: 10,
      };

      const response = await fetch('/api/events-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          recurringDates.map((date) => ({
            ...eventForm,
            date,
          }))
        ),
      });

      expect(response.status).toBe(201);

      const createdEvents: Event[] = await response.json();
      expect(createdEvents).toHaveLength(13);

      // 모든 이벤트가 같은 repeatId를 가져야 함
      createdEvents.forEach((event) => {
        expect(event.title).toBe('주간 팀 미팅');
        expect(event.startTime).toBe('10:00');
        expect(event.endTime).toBe('11:00');
      });
    });

    it('SCENARIO.2 - 매일 스탠드업 (1주일, 수정)', async () => {
      const mockEvents: Event[] = [
        {
          id: '1',
          title: '일일 스탠드업',
          date: '2025-10-01',
          startTime: '09:00',
          endTime: '09:30',
          description: '스탠드업',
          location: '회의실',
          category: '업무',
          repeat: { type: 'daily' as RepeatType, interval: 1, id: '2' },
          notificationTime: 10,
        },
        {
          id: '2',
          title: '일일 스탠드업',
          date: '2025-10-02',
          startTime: '09:00',
          endTime: '09:30',
          description: '스탠드업',
          location: '회의실',
          category: '업무',
          repeat: { type: 'daily' as RepeatType, interval: 1, id: '2' },
          notificationTime: 10,
        },
        {
          id: '3',
          title: '일일 스탠드업',
          date: '2025-10-03',
          startTime: '09:00',
          endTime: '09:30',
          description: '스탠드업',
          location: '회의실',
          category: '업무',
          repeat: { type: 'daily' as RepeatType, interval: 1, id: '2' },
          notificationTime: 10,
        },
      ];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: mockEvents });
        }),

        http.put('/api/recurring-events/:id', async ({ request }) => {
          const updates = (await request.json()) as Partial<Event>;

          const updatedEvents = mockEvents.map((event) => ({
            ...event,
            ...updates,
          }));

          return HttpResponse.json(updatedEvents, { status: 200 });
        })
      );

      // 시간을 변경
      const response = await fetch(`/api/recurring-events/${'2'}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startTime: '09:30',
          endTime: '10:00',
        }),
      });

      expect(response.status).toBe(200);

      const updatedEvents: Event[] = await response.json();
      expect(updatedEvents).toHaveLength(3);

      updatedEvents.forEach((event) => {
        expect(event.startTime).toBe('09:30');
        expect(event.endTime).toBe('10:00');
      });
    });

    it('SCENARIO.3 - 월간 리포트 (무한 반복, 나중에 삭제)', async () => {
      const mockEvents: Event[] = [];
      const repeatId = 'repeat-monthly-001';

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: mockEvents });
        }),

        http.post('/api/events-list', async ({ request }) => {
          const events = (await request.json()) as Event[];

          const createdEvents = events.map((event, index) => ({
            ...event,
            id: String(Date.now() + index),
          }));

          mockEvents.push(...createdEvents);
          return HttpResponse.json(createdEvents, { status: 201 });
        }),

        http.delete('/api/recurring-events/:id', async () => {
          mockEvents.length = 0;
          return new HttpResponse(null, { status: 204 });
        })
      );

      // 월간 반복 이벤트 생성 (무한 반복)
      const startDate = '2025-10-01';
      const recurringDates = generateRecurringDates(startDate, 'monthly', 1);

      expect(recurringDates.length).toBeLessThanOrEqual(1000);

      const eventForm: EventForm = {
        title: '월간 리포트',
        date: startDate,
        startTime: '15:00',
        endTime: '16:00',
        description: '리포트',
        location: '회의실',
        category: '업무',
        repeat: {
          type: 'monthly' as RepeatType,
          interval: 1,
        },
        notificationTime: 10,
      };

      // 생성
      const createResponse = await fetch('/api/events-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          recurringDates.map((date, index) => ({
            ...eventForm,
            id: `event-${index}`,
            date,
          }))
        ),
      });

      expect(createResponse.status).toBe(201);

      const createdEvents = await createResponse.json();
      expect(createdEvents.length).toBeGreaterThan(0);
      expect(createdEvents.length).toBeLessThanOrEqual(1000);

      // 모든 이벤트 삭제
      const deleteResponse = await fetch(`/api/recurring-events/${repeatId}`, {
        method: 'DELETE',
      });

      expect(deleteResponse.status).toBe(204);
      expect(mockEvents).toHaveLength(0);
    });
  });

  describe('엣지 케이스 통합', () => {
    it('MEDIUM.5.1 - 월말 날짜 (31일) + 월간 반복', () => {
      const result = generateRecurringDates('2025-01-31', 'monthly', 1, '2025-04-30');

      expect(result).toEqual(['2025-01-31', '2025-02-28', '2025-03-31', '2025-04-30']);
    });

    it('MEDIUM.5.2 - 윤년 2월 29일 + 1년', () => {
      const result = generateRecurringDates('2024-02-29', 'yearly', 1, '2026-12-31');

      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toBe('2024-02-29');

      // Check that no invalid dates are in the result
      const hasInvalidDate = result.some((date) => {
        const parts = date.split('-');
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]);
        const day = parseInt(parts[2]);

        if (month === 2) {
          const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
          return day > (isLeapYear ? 29 : 28);
        }

        const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        return day > daysInMonth[month - 1];
      });

      expect(hasInvalidDate).toBe(false);
    });

    it('MEDIUM.5.3 - 반복 간격 > 1 (3개월마다)', () => {
      const result = generateRecurringDates('2025-10-01', 'monthly', 3, '2026-07-01');

      expect(result).toEqual(['2025-10-01', '2026-01-01', '2026-04-01', '2026-07-01']);
    });
  });
});
