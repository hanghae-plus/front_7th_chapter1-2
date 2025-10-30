import { http, HttpResponse } from 'msw';

import { events } from '../__mocks__/response/events.json' assert { type: 'json' };
import { Event } from '../types';

export const handlers = [
  http.get('/api/events', () => {
    return HttpResponse.json({ events });
  }),

  http.post('/api/events', async ({ request }) => {
    const newEvent = (await request.json()) as Event;
    newEvent.id = String(events.length + 1);
    return HttpResponse.json(newEvent, { status: 201 });
  }),

  http.put('/api/events/:id', async ({ params, request }) => {
    const { id } = params;
    const updatedEvent = (await request.json()) as Event;
    const index = events.findIndex((event) => event.id === id);

    if (index !== -1) {
      return HttpResponse.json({ ...events[index], ...updatedEvent });
    }

    return new HttpResponse(null, { status: 404 });
  }),

  http.delete('/api/events/:id', ({ params }) => {
    const { id } = params;
    const index = events.findIndex((event) => event.id === id);

    if (index !== -1) {
      return new HttpResponse(null, { status: 204 });
    }

    return new HttpResponse(null, { status: 404 });
  }),

  // 반복 일정 생성 API
  http.post('/api/events-list', async ({ request }) => {
    const { events: newEvents } = (await request.json()) as { events: Event[] };
    const repeatId = String(Date.now()); // 간단한 repeatId 생성
    const createdEvents = newEvents.map((event) => {
      const isRepeatEvent = event.repeat.type !== 'none';
      return {
        ...event,
        id: String(Date.now() + Math.random()),
        repeat: {
          ...event.repeat,
          id: isRepeatEvent ? repeatId : undefined,
        },
      };
    });
    return HttpResponse.json(createdEvents, { status: 201 });
  }),

  // 반복 일정 시리즈 전체 수정 API
  http.put('/api/recurring-events/:repeatId', async ({ params, request }) => {
    const { repeatId } = params;
    const updateData = (await request.json()) as Partial<Event>;
    const updatedEvents: Event[] = [];

    events.forEach((event) => {
      if (event.repeat.id === repeatId) {
        updatedEvents.push({
          ...event,
          ...updateData,
          repeat: updateData.repeat
            ? { ...event.repeat, ...updateData.repeat }
            : event.repeat,
        });
      }
    });

    if (updatedEvents.length === 0) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(updatedEvents);
  }),

  // 반복 일정 시리즈 전체 삭제 API
  http.delete('/api/recurring-events/:repeatId', ({ params }) => {
    const { repeatId } = params;
    const remainingEvents = events.filter((event) => event.repeat.id !== repeatId);

    if (remainingEvents.length === events.length) {
      return new HttpResponse(null, { status: 404 });
    }

    return new HttpResponse(null, { status: 204 });
  }),
];
