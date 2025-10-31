import { randomUUID } from 'crypto';

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

  http.post('/api/events-list', async ({ request }) => {
    const { events: newEvents } = (await request.json()) as { events: Event[] };
    const repeatId = randomUUID();

    const eventsWithIds = newEvents.map((event) => ({
      ...event,
      id: randomUUID(),
      repeat: {
        ...event.repeat,
        id: event.repeat.type !== 'none' ? repeatId : undefined,
      },
    }));

    return HttpResponse.json(eventsWithIds, { status: 201 });
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

  http.put('/api/recurring-events/:repeatId', async ({ params, request }) => {
    const { repeatId } = params;
    const updateData = await request.json();

    const seriesEvents = events.filter((event) => event.repeat?.id === repeatId);

    if (seriesEvents.length === 0) {
      return new HttpResponse(null, { status: 404 });
    }

    // Return updated events
    const updatedEvents = seriesEvents.map((event) => ({
      ...event,
      ...updateData,
      id: event.id,
      repeat: event.repeat,
    }));

    return HttpResponse.json(updatedEvents);
  }),

  http.delete('/api/events/:id', ({ params }) => {
    const { id } = params;
    const index = events.findIndex((event) => event.id === id);

    if (index !== -1) {
      return new HttpResponse(null, { status: 204 });
    }

    return new HttpResponse(null, { status: 404 });
  }),

  http.delete('/api/recurring-events/:repeatId', ({ params }) => {
    const { repeatId } = params;
    const seriesEvents = events.filter((event) => event.repeat?.id === repeatId);

    if (seriesEvents.length === 0) {
      return new HttpResponse(null, { status: 404 });
    }

    return new HttpResponse(null, { status: 204 });
  }),
];
