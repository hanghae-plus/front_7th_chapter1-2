// GET Events handler

import { http, HttpResponse } from 'msw';

import { events } from '@/__mocks__/response/events.json';

export const getEventsHandler = http.get('/api/events', () => {
  // 200 OK
  return HttpResponse.json(
    {
      events,
    },
    { status: 200 }
  );
});
