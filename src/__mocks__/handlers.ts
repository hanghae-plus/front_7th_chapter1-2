import { http, HttpResponse } from 'msw';

import { events as initialEvents } from '../__mocks__/response/events.json' assert { type: 'json' };
import { BatchCreateEventsRequest, Event, EventForm, UpdateRecurringSeriesRequest } from '../types';

let events = [...initialEvents];

export function resetEventsState() {
  events = [...initialEvents];
}

export const handlers = [
  http.get('/api/events', () => {
    return HttpResponse.json({ events });
  }),

  http.post('/api/events', async ({ request }) => {
    const newEvent = (await request.json()) as EventForm;
    const createdEvent: Event = {
      ...newEvent,
      id: String(events.length + 1),
    };
    events.push(createdEvent);
    return HttpResponse.json(createdEvent, { status: 201 });
  }),

  http.put('/api/events/:id', async ({ params, request }) => {
    const { id } = params;
    const updatedEvent = (await request.json()) as Partial<Event>;
    const index = events.findIndex((event) => event.id === id);

    if (index !== -1) {
      events[index] = { ...events[index], ...updatedEvent };
      return HttpResponse.json(events[index]);
    }

    return new HttpResponse(null, { status: 404 });
  }),

  http.delete('/api/events/:id', ({ params }) => {
    const { id } = params;
    const index = events.findIndex((event) => event.id === id);

    if (index !== -1) {
      events.splice(index, 1);
      return new HttpResponse(null, { status: 204 });
    }

    return new HttpResponse(null, { status: 404 });
  }),

  // 배치 생성 핸들러
  http.post('/api/events-list', async ({ request }) => {
    const body = (await request.json()) as BatchCreateEventsRequest;

    if (!body.events || body.events.length === 0) {
      return new HttpResponse(null, { status: 400 });
    }

    // repeatId 생성 (동일 배치의 모든 일정에 같은 repeatId)
    const repeatId = `repeat-${Math.random().toString(36).substring(2, 11)}`;

    const createdEvents: Event[] = body.events.map((event: EventForm, index: number) => ({
      id: String(events.length + index + 1),
      ...event,
      repeat: {
        ...event.repeat,
        id: event.repeat.type !== 'none' ? repeatId : undefined,
      },
    }));

    events.push(...createdEvents);

    return HttpResponse.json({ events: createdEvents }, { status: 201 });
  }),

  // 반복 시리즈 수정 핸들러
  http.put('/api/recurring-events/:repeatId', async ({ params, request }) => {
    const { repeatId } = params;
    const updateData = (await request.json()) as UpdateRecurringSeriesRequest;

    if (!repeatId) {
      return new HttpResponse(null, { status: 404 });
    }

    const seriesToUpdate = events.filter((event) => event.repeat.id === repeatId);

    if (seriesToUpdate.length === 0) {
      return new HttpResponse(null, { status: 404 });
    }

    seriesToUpdate.forEach((event) => {
      const index = events.findIndex((e) => e.id === event.id);
      if (index !== -1) {
        events[index] = { ...events[index], ...updateData };
      }
    });

    return HttpResponse.json({ success: true, updateData }, { status: 200 });
  }),

  // 반복 시리즈 삭제 핸들러
  http.delete('/api/recurring-events/:repeatId', ({ params }) => {
    const { repeatId } = params;

    if (!repeatId) {
      return new HttpResponse(null, { status: 404 });
    }

    const initialLength = events.length;
    events = events.filter((event) => event.repeat.id !== repeatId);

    if (events.length === initialLength) {
      return new HttpResponse(null, { status: 404 });
    }

    return new HttpResponse(null, { status: 204 });
  }),
];
