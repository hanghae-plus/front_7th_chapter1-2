// DELETE Events handler

import { http, HttpResponse } from 'msw';

import { events } from '@/__mocks__/response/events.json';

export const deleteEventsHandler = http.delete(
  '/api/events/:id',
  ({ params }) => {
    const { id } = params;

    const eventIndex = events.findIndex((event) => event.id === id);

    // If event not found, return 404
    if (eventIndex === -1) {
      return HttpResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Remove the event from the mock data
    events.splice(eventIndex, 1);

    // 204 No Content
    return new HttpResponse(null, { status: 204 });
  }
);
