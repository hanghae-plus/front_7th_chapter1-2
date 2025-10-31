import { EventProps } from '@/types/events/Event.types';
import { getEventsForDay } from '@/utils/dateUtils';

describe('getEventsForDay', () => {
  const events: EventProps[] = [
    {
      id: '1',
      title: '이벤트 1',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
    {
      id: '2',
      title: '이벤트 2',
      date: '2025-07-01',
      startTime: '14:00',
      endTime: '15:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
    {
      id: '3',
      title: '이벤트 3',
      date: '2025-07-02',
      startTime: '11:00',
      endTime: '12:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
  ];

  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    const dayEvents = getEventsForDay(events, 1);
    expect(dayEvents).toHaveLength(2);
    expect(dayEvents[0].title).toBe('이벤트 1');
    expect(dayEvents[1].title).toBe('이벤트 2');
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const dayEvents = getEventsForDay(events, 3);
    expect(dayEvents).toHaveLength(0);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    const dayEvents = getEventsForDay(events, 0);
    expect(dayEvents).toHaveLength(0);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    const dayEvents = getEventsForDay(events, 32);
    expect(dayEvents).toHaveLength(0);
  });
});
