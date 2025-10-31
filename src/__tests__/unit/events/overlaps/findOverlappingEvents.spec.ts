import { EventProps } from '@/types/events/Event.types';
import { findOverlappingEvents } from '@/utils/eventOverlap';

describe('findOverlappingEvents', () => {
  const baseEvents: EventProps[] = [
    {
      id: '1',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '12:00',
      title: '이벤트 1',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
    {
      id: '2',
      date: '2025-07-01',
      startTime: '11:00',
      endTime: '13:00',
      title: '이벤트 2',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
    {
      id: '3',
      date: '2025-07-01',
      startTime: '15:00',
      endTime: '16:00',
      title: '이벤트 3',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
  ];

  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent: EventProps = {
      id: '4',
      date: '2025-07-01',
      startTime: '11:30',
      endTime: '14:30',
      title: '새 이벤트',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const result = findOverlappingEvents(newEvent, baseEvents);
    expect(result).toEqual([baseEvents[0], baseEvents[1]]);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent: EventProps = {
      id: '4',
      date: '2025-07-01',
      startTime: '13:00',
      endTime: '15:00',
      title: '새 이벤트',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const result = findOverlappingEvents(newEvent, baseEvents);
    expect(result).toHaveLength(0);
  });
});
