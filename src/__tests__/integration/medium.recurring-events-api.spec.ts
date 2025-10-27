import { describe, it, expect, beforeEach, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../setupTests';
import { Event, RepeatType } from '../../types';

describe('Recurring Events API - MSW Handlers', () => {
  beforeEach(() => {
    expect.hasAssertions();
  });

  describe('POST /api/events-list', () => {
    it('MEDIUM.4.1 - 반복 이벤트 배열 생성', async () => {
      const mockEvents: Event[] = [];

      server.use(
        http.post('/api/events-list', async ({ request }) => {
          const events = (await request.json()) as Event[];
          const repeatId = `repeat-${Date.now()}`;

          const createdEvents = events.map((event, index) => ({
            ...event,
            id: String(Date.now() + index),
          }));

          mockEvents.push(...createdEvents);
          return HttpResponse.json(createdEvents, { status: 201 });
        })
      );

      const eventsToCreate: Event[] = [
        {
          id: 'temp-1',
          title: '반복 이벤트 1',
          date: '2025-10-01',
          startTime: '09:00',
          endTime: '10:00',
          description: '테스트',
          location: '회의실',
          category: '업무',
          repeat: { type: 'daily' as RepeatType, interval: 1 },
          notificationTime: 10,
        },
        {
          id: 'temp-2',
          title: '반복 이벤트 2',
          date: '2025-10-02',
          startTime: '09:00',
          endTime: '10:00',
          description: '테스트',
          location: '회의실',
          category: '업무',
          repeat: { type: 'daily' as RepeatType, interval: 1 },
          notificationTime: 10,
        },
        {
          id: 'temp-3',
          title: '반복 이벤트 3',
          date: '2025-10-03',
          startTime: '09:00',
          endTime: '10:00',
          description: '테스트',
          location: '회의실',
          category: '업무',
          repeat: { type: 'daily' as RepeatType, interval: 1 },
          notificationTime: 10,
        },
      ];

      const response = await fetch('/api/events-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventsToCreate),
      });

      expect(response.status).toBe(201);

      const createdEvents = await response.json();
      expect(createdEvents).toHaveLength(3);
      expect(createdEvents[0]).toHaveProperty('id');
      expect(createdEvents[1]).toHaveProperty('id');
      expect(createdEvents[2]).toHaveProperty('id');
    });

    it('MEDIUM.4.2 - 빈 배열 요청', async () => {
      server.use(
        http.post('/api/events-list', async ({ request }) => {
          const events = (await request.json()) as Event[];
          return HttpResponse.json(events, { status: 201 });
        })
      );

      const response = await fetch('/api/events-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([]),
      });

      expect(response.status).toBe(201);

      const createdEvents = await response.json();
      expect(createdEvents).toHaveLength(0);
    });
  });

  describe('PUT /api/recurring-events/:repeatId', () => {
    it('MEDIUM.4.3 - 반복 시리즈 일괄 수정', async () => {
      const repeatId = 'abc123';
      const mockEvents: Event[] = [
        {
          id: '1',
          title: '원본 제목',
          date: '2025-10-01',
          startTime: '09:00',
          endTime: '10:00',
          description: '설명',
          location: '회의실',
          category: '업무',
          repeat: { type: 'daily' as RepeatType, interval: 1 },
          notificationTime: 10,
        },
        {
          id: '2',
          title: '원본 제목',
          date: '2025-10-02',
          startTime: '09:00',
          endTime: '10:00',
          description: '설명',
          location: '회의실',
          category: '업무',
          repeat: { type: 'daily' as RepeatType, interval: 1 },
          notificationTime: 10,
        },
        {
          id: '3',
          title: '원본 제목',
          date: '2025-10-03',
          startTime: '09:00',
          endTime: '10:00',
          description: '설명',
          location: '회의실',
          category: '업무',
          repeat: { type: 'daily' as RepeatType, interval: 1 },
          notificationTime: 10,
        },
      ];

      server.use(
        http.put('/api/recurring-events/:repeatId', async ({ request }) => {
          const updates = (await request.json()) as Partial<Event>;
          const updatedEvents = mockEvents.map(event => ({
            ...event,
            ...updates,
          }));
          return HttpResponse.json(updatedEvents, { status: 200 });
        })
      );

      const response = await fetch(`/api/recurring-events/${repeatId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '수정된 제목' }),
      });

      expect(response.status).toBe(200);

      const updatedEvents = await response.json();
      expect(updatedEvents).toHaveLength(3);
      expect(updatedEvents[0].title).toBe('수정된 제목');
      expect(updatedEvents[1].title).toBe('수정된 제목');
      expect(updatedEvents[2].title).toBe('수정된 제목');
    });

    it('MEDIUM.4.4 - 존재하지 않는 repeatId', async () => {
      server.use(
        http.put('/api/recurring-events/:repeatId', async () => {
          return HttpResponse.json([], { status: 200 });
        })
      );

      const response = await fetch('/api/recurring-events/nonexistent', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '수정' }),
      });

      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result).toHaveLength(0);
    });
  });

  describe('DELETE /api/recurring-events/:repeatId', () => {
    it('MEDIUM.4.5 - 반복 시리즈 일괄 삭제', async () => {
      const repeatId = 'abc123';
      const mockEvents: Event[] = [
        {
          id: '1',
          title: '삭제할 이벤트',
          date: '2025-10-01',
          startTime: '09:00',
          endTime: '10:00',
          description: '삭제',
          location: '회의실',
          category: '기타',
          repeat: { type: 'daily' as RepeatType, interval: 1 },
          notificationTime: 10,
        },
      ];

      server.use(
        http.delete('/api/recurring-events/:repeatId', ({ params }) => {
          mockEvents.length = 0;
          return new HttpResponse(null, { status: 204 });
        })
      );

      const response = await fetch(`/api/recurring-events/${repeatId}`, {
        method: 'DELETE',
      });

      expect(response.status).toBe(204);
      expect(mockEvents).toHaveLength(0);
    });

    it('MEDIUM.4.6 - 존재하지 않는 repeatId 삭제', async () => {
      server.use(
        http.delete('/api/recurring-events/:repeatId', async () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      const response = await fetch('/api/recurring-events/nonexistent', {
        method: 'DELETE',
      });

      expect(response.status).toBe(204);
    });
  });
});
