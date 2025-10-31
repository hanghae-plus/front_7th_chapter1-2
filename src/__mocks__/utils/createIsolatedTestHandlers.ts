// Isolated MSW handlers for parallel test execution
// 병렬 테스트 실행을 위한 격리된 MSW 핸들러
// File exceeds 80 lines due to complete HTTP methods implementation (GET, POST, PUT, DELETE)
// 완전한 HTTP 메서드 구현(GET, POST, PUT, DELETE)으로 인해 80줄 초과

import { http, HttpResponse } from 'msw';

import { TestEventStore } from '../store/testEventStore';

import { EventProps } from '@/types/events/Event.types';
import { EventFormProps } from '@/types/events/EventForm.types';

// Isolated test handlers with in-memory event store
// 메모리 내 이벤트 저장소를 가진 격리된 테스트 핸들러
export const createIsolatedTestHandlers = (initEvents: EventProps[] = []) => {
  const store = new TestEventStore(initEvents);

  // GET Events handler
  const getHandler = http.get('/api/events', () => {
    return HttpResponse.json({ events: store.getEvents() });
  });

  // POST Events handler
  const postHandler = http.post('/api/events', async ({ request }) => {
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
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newEvent: EventProps = {
      ...eventForm,
      id: crypto.randomUUID(),
    };

    store.addEvent(newEvent);
    return HttpResponse.json(newEvent, { status: 201 });
  });

  // PUT Events handler
  const putHandler = http.put(
    '/api/events/:id',
    async ({ request, params }) => {
      const { id } = params;
      const updates = (await request.json()) as Partial<EventFormProps>;

      const updatedEvent = store.updateEvent(id as string, updates);

      if (!updatedEvent) {
        return HttpResponse.json({ error: 'Event not found' }, { status: 404 });
      }

      return HttpResponse.json(updatedEvent);
    }
  );

  // DELETE Events handler
  const deleteHandler = http.delete('/api/events/:id', ({ params }) => {
    const { id } = params;
    const deleted = store.deleteEvent(id as string);

    if (!deleted) {
      return HttpResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return HttpResponse.json({ message: 'Event deleted successfully' });
  });

  return {
    handlers: [getHandler, postHandler, putHandler, deleteHandler],
    store: {
      // Expose only read-only operations and necessary mutations
      // 읽기 전용 작업과 필요한 변경 작업만 노출
      getEvents: () => store.getEvents(),
      getEventById: (id: string) => store.getEventById(id),
      getEventCount: () => store.getEventCount(),
      reset: (newInitEvents?: EventProps[]) => store.reset(newInitEvents),
    },
    reset: (newInitEvents?: EventProps[]) => store.reset(newInitEvents),
  };
};
