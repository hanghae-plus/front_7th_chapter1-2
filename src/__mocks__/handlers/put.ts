// PUT Events handler
// Update an existing event by ID
// If the event does not exist, return 404

import { http, HttpResponse } from 'msw';

import { events } from '@/__mocks__/response/events.json';
import { EventProps } from '@/types/events/Event.types';
import { EventFormProps } from '@/types/events/EventForm.types';

export const putEventsHandler = http.put(
  '/api/events/:id',
  async ({ params, request }) => {
    const { id } = params;
    // The reason why we use an EventForm here is that the id is not included in the request body
    // id is taken from the URL parameter
    const eventForm = (await request.json()) as EventFormProps;

    const eventIndex = events.findIndex((event) => event.id === id);

    // If event not found, return 404
    if (eventIndex === -1) {
      return HttpResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Create the updated event object
    // Merge the existing id with the new data from eventForm
    const updatedEvent: EventProps = {
      ...eventForm,
      id: id as string,
    };

    events[eventIndex] = updatedEvent;

    // 200 OK
    return HttpResponse.json(events[eventIndex], { status: 200 });
  }
);
