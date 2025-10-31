import { EventProps } from '@/types/events/Event.types';
import { createNotificationMessage } from '@/utils/notificationUtils';

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event: EventProps = {
      id: '1',
      title: '중요 회의',
      date: '2023-05-10',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 15,
    };
    const message = createNotificationMessage(event);
    expect(message).toBe('15분 후 중요 회의 일정이 시작됩니다.');
  });
});
