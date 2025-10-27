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

  // Recurring events API endpoints
  http.post('/api/events-list', async ({ request }) => {
    const eventsData = (await request.json()) as Event[];

    const createdEvents = eventsData.map((event, index) => {
      const newEvent = { ...event };
      newEvent.id = String(Date.now() + index);
      events.push(newEvent);
      return newEvent;
    });

    return HttpResponse.json(createdEvents, { status: 201 });
  }),

  http.put('/api/recurring-events/:repeatId', async ({ request }) => {
    const updates = (await request.json()) as Partial<Event>;

    // Find all events with the matching repeatId
    // For now, we'll match based on a pattern or look for shared characteristics
    // This is a simplified implementation
    const updatedEvents: Event[] = [];

    for (const event of events) {
      // Check if event is part of the recurring series
      // We'll use a simple heuristic: if there are multiple events with similar base properties
      const updated = { ...event, ...updates } as Event;
      const index = events.findIndex((e) => e.id === event.id);
      if (index !== -1) {
        events[index] = updated;
      }
      updatedEvents.push(updated);
    }

    return HttpResponse.json(updatedEvents, { status: 200 });
  }),

  http.delete('/api/recurring-events/:repeatId', () => {
    // For this simplified implementation, we'll keep the array as is
    // This will be handled in the hook logic

    return new HttpResponse(null, { status: 204 });
  }),
];
