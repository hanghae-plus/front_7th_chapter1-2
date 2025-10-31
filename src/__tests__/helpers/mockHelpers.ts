import { randomUUID } from 'crypto';

import { http, HttpResponse } from 'msw';

import { server } from '../../setupTests';
import { Event } from '../../types';
import { generateRecurringEvents } from '../../utils/recurringEventUtils';

/**
 * Setup complete mock handlers for recurring event tests
 * <!-- 반복 일정 테스트를 위한 완전한 mock 핸들러 설정 -->
 */
export function setupRecurringEventMocks(initialEvents: Event[]) {
  // Expand template recurring events into instances
  // <!-- 템플릿 반복 이벤트를 인스턴스로 확장 -->
  const expandedEvents: Event[] = [];

  for (const event of initialEvents) {
    if (event.repeat.type !== 'none' && !event.repeat.id) {
      // Template event without repeat.id - expand it
      const repeatId = randomUUID();
      const instances = generateRecurringEvents(event).map((instance) => ({
        ...instance,
        repeat: {
          ...instance.repeat,
          id: repeatId,
        },
      }));
      expandedEvents.push(...instances);
    } else {
      // Already an instance or normal event
      expandedEvents.push(event);
    }
  }

  const mockEvents: Event[] = [...expandedEvents];

  server.use(
    // GET: Return mock events
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),

    // POST: Create new event (for single instance conversion)
    http.post('/api/events', async ({ request }) => {
      const newEvent = (await request.json()) as Event;
      newEvent.id = `new-${mockEvents.length + 1}`;
      mockEvents.push(newEvent);
      return HttpResponse.json(newEvent, { status: 201 });
    }),

    // POST: Create recurring events list
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

      mockEvents.push(...eventsWithIds);
      return HttpResponse.json(eventsWithIds, { status: 201 });
    }),

    // PUT: Update existing event (for recurring event update)
    http.put('/api/events/:id', async ({ params, request }) => {
      const { id } = params;
      const updatedEventData = (await request.json()) as Partial<Event>;

      const index = mockEvents.findIndex((event) => event.id === id);
      if (index !== -1) {
        // Update existing event in mock array
        mockEvents[index] = {
          ...mockEvents[index],
          ...updatedEventData,
          id: id as string,
        };
        return HttpResponse.json(mockEvents[index]);
      }

      return new HttpResponse(null, { status: 404 });
    }),

    // PUT: Update all instances in recurring series
    http.put('/api/recurring-events/:repeatId', async ({ params, request }) => {
      const { repeatId } = params;
      const updateData = await request.json();

      const seriesEvents = mockEvents.filter((event) => event.repeat?.id === repeatId);

      if (seriesEvents.length === 0) {
        return new HttpResponse(null, { status: 404 });
      }

      // Update all instances in the series
      mockEvents.forEach((event, index) => {
        if (event.repeat?.id === repeatId) {
          mockEvents[index] = {
            ...event,
            ...updateData,
            id: event.id,
            date: event.date, // Keep original date
            repeat: event.repeat, // Keep original repeat metadata
          };
        }
      });

      const updatedEvents = mockEvents.filter((event) => event.repeat?.id === repeatId);
      return HttpResponse.json(updatedEvents);
    }),

    // DELETE: Delete event
    http.delete('/api/events/:id', ({ params }) => {
      const { id } = params;
      const index = mockEvents.findIndex((event) => event.id === id);
      if (index !== -1) {
        mockEvents.splice(index, 1);
      }
      return new HttpResponse(null, { status: 204 });
    }),

    // DELETE: Delete all instances in recurring series
    http.delete('/api/recurring-events/:repeatId', ({ params }) => {
      const { repeatId } = params;
      const seriesEvents = mockEvents.filter((event) => event.repeat?.id === repeatId);

      if (seriesEvents.length === 0) {
        return new HttpResponse(null, { status: 404 });
      }

      // Remove all instances with this repeatId
      for (let i = mockEvents.length - 1; i >= 0; i--) {
        if (mockEvents[i].repeat?.id === repeatId) {
          mockEvents.splice(i, 1);
        }
      }

      return new HttpResponse(null, { status: 204 });
    })
  );

  return mockEvents; // Return reference for test assertions
}
