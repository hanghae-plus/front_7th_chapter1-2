import { Event, EventForm, RepeatType } from '../../types';
import { shouldAllowOverlapBypass } from '../../utils/overlapBypassLogic';

describe('shouldAllowOverlapBypass >', () => {
  const createEvent = (id: string, repeatType: RepeatType = 'none'): Event => ({
    id,
    title: `Event ${id}`,
    date: '2025-10-15',
    startTime: '09:00',
    endTime: '10:00',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: repeatType, interval: 1 },
    notificationTime: 10,
  });

  describe('일반 + 일반 일정 겹침', () => {
    it('일반 일정끼리 겹치면 false를 반환한다 (bypass 불가)', () => {
      const newEvent = createEvent('new', 'none');
      const overlappingEvents = [createEvent('1', 'none'), createEvent('2', 'none')];

      const result = shouldAllowOverlapBypass(newEvent, overlappingEvents);

      expect(result).toBe(false);
    });
  });

  describe('반복 + 일반 일정 겹침', () => {
    it('새 일정이 반복이고 기존이 일반이면 true를 반환한다 (bypass 허용)', () => {
      const newEvent = createEvent('new', 'daily');
      const overlappingEvents = [createEvent('1', 'none')];

      const result = shouldAllowOverlapBypass(newEvent, overlappingEvents);

      expect(result).toBe(true);
    });

    it('새 일정이 일반이고 기존이 반복이면 true를 반환한다 (bypass 허용)', () => {
      const newEvent = createEvent('new', 'none');
      const overlappingEvents = [createEvent('1', 'daily')];

      const result = shouldAllowOverlapBypass(newEvent, overlappingEvents);

      expect(result).toBe(true);
    });

    it('여러 겹침 중 하나라도 반복 일정이 있으면 true를 반환한다', () => {
      const newEvent = createEvent('new', 'daily');
      const overlappingEvents = [
        createEvent('1', 'daily'), // 반복+반복 ✓
        createEvent('2', 'none'), // 반복+일반 ✓
      ];

      const result = shouldAllowOverlapBypass(newEvent, overlappingEvents);

      expect(result).toBe(true);
    });
  });

  describe('반복 + 반복 일정 겹침', () => {
    it('반복 일정끼리 겹치면 true를 반환한다 (bypass 허용)', () => {
      const newEvent = createEvent('new', 'daily');
      const overlappingEvents = [createEvent('1', 'weekly'), createEvent('2', 'monthly')];

      const result = shouldAllowOverlapBypass(newEvent, overlappingEvents);

      expect(result).toBe(true);
    });
  });

  describe('엣지 케이스', () => {
    it('겹치는 일정이 없으면 false를 반환한다', () => {
      const newEvent = createEvent('new', 'daily');
      const overlappingEvents: Event[] = [];

      const result = shouldAllowOverlapBypass(newEvent, overlappingEvents);

      expect(result).toBe(false);
    });

    it('EventForm 타입도 처리할 수 있다', () => {
      const newEventForm: EventForm = {
        title: 'New Event',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      };
      const overlappingEvents = [createEvent('1', 'daily')];

      const result = shouldAllowOverlapBypass(newEventForm, overlappingEvents);

      expect(result).toBe(true);
    });
  });
});
