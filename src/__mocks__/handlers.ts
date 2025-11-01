import { http, HttpResponse } from 'msw';

import { Event } from '../types';
import eventsData from './response/events.json';

const { events } = eventsData;

// 반복 일정 시리즈를 메모리에 저장
const recurringSeriesStore = new Map<string, Event['repeat']>();

export const handlers = [
  http.get('/api/events', () => {
    return HttpResponse.json({ events });
  }),
  http.post('/api/events', async ({ request }) => {
    const newEvent = (await request.json()) as Event;
    newEvent.id = String(events.length + 1);
    // 반복 일정인 경우 repeat.id 생성
    if (newEvent.repeat && newEvent.repeat.type !== 'none' && !newEvent.repeat.id) {
      newEvent.repeat.id = `r-${Date.now()}`;
    }
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

  // 반복 일정 시리즈 예외 추가 (단일 인스턴스 삭제)
  http.put('/api/recurring-events/:repeatId', async ({ params, request }) => {
    const { repeatId } = params as Record<string, string>;
    const body = (await request.json()) as { repeat?: { exceptions?: string[] } };

    if (!body.repeat?.exceptions) {
      return new HttpResponse('Bad Request', { status: 400 });
    }

    // 시리즈 정보 저장
    recurringSeriesStore.set(repeatId, {
      type: 'weekly', // 기본값, 실제로는 이벤트에서 가져와야 함
      interval: 1,
      id: repeatId,
      exceptions: body.repeat.exceptions,
    });

    return HttpResponse.json({}, { status: 200 });
  }),

  // 반복 일정 시리즈 전체 삭제
  http.delete('/api/recurring-events/:repeatId', ({ params }) => {
    const { repeatId } = params as Record<string, string>;

    // 시리즈가 이미 삭제되었거나 존재하지 않아도 성공으로 처리 (멱등성)
    recurringSeriesStore.delete(repeatId);

    return new HttpResponse(null, { status: 204 });
  }),
];
