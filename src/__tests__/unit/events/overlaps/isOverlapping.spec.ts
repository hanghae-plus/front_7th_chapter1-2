import { EventProps } from '@/types/events/Event.types';
import { isOverlapping } from '@/utils/events/eventUtils/overlaps/findOverlappingEvents';

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event1: EventProps = {
      id: '1',
      date: '2025-07-01',
      startTime: '14:00',
      endTime: '16:00',
      title: '이벤트 1',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const event2: EventProps = {
      id: '2',
      date: '2025-07-01',
      startTime: '15:00',
      endTime: '17:00',
      title: '이벤트 2',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    expect(isOverlapping(event1, event2)).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event1: EventProps = {
      id: '1',
      date: '2025-07-01',
      startTime: '14:00',
      endTime: '16:00',
      title: '이벤트 1',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const event2: EventProps = {
      id: '2',
      date: '2025-07-01',
      startTime: '16:00',
      endTime: '18:00',
      title: '이벤트 2',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    expect(isOverlapping(event1, event2)).toBe(false);
  });
});
