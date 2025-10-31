// POST Events handler

import { http, HttpResponse } from 'msw';

import { events } from '@/__mocks__/response/events.json';
import { EventProps } from '@/types/events/Event.types';
import { EventFormProps } from '@/types/events/EventForm.types';

export const postEventsHandler = http.post(
  '/api/events',
  async ({ request }) => {
    // The reason why we use an EventForm here is that the id is not included in the request body
    // id will be generated on the server side
    const eventForm = (await request.json()) as EventFormProps;

    // Validate required fields
    if (
      !eventForm.title ||
      !eventForm.date ||
      !eventForm.startTime ||
      !eventForm.endTime ||
      !eventForm.description ||
      !eventForm.location ||
      !eventForm.category ||
      !eventForm.repeat ||
      !eventForm.notificationTime
    ) {
      return HttpResponse.json(
        { error: 'Title, date, startTime, and endTime are required' },
        { status: 400 }
      );
    }

    // Generate a new ID
    // Using crypto.randomUUID() to generate a unique identifier
    const newId = crypto.randomUUID();

    // Convert EventForm to Event (add id)
    // Why we convert here? Because the EventForm does not have an id field
    const newEvent: EventProps = {
      ...eventForm,
      id: newId,
    };

    // Add the new event to the mock data
    // The reason why we push to events array directly is that this is a mock server
    // Why we save in memory? Because we want to keep the state during the test session
    events.push(newEvent);

    // 201 Created
    return HttpResponse.json(newEvent, { status: 201 });
  }
);
