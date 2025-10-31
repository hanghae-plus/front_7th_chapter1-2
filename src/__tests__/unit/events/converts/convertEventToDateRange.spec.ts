import data from '@/__mocks__/response/events.json';
import { EventProps } from '@/types/events/Event.types';
import { convertEventToDateRange } from '@/utils/events/eventUtils/converts/convertToDateRange';

describe('convertEventToDateRange', () => {
  // There is no wrong date format event in the mock data, so we create one here for testing.
  const eventWithWrongDate: EventProps = {
    id: '1',
    title: '새로운 이벤트',
    date: '2025-2020-04',
    startTime: '09:00',
    endTime: '10:00',
    description: '새로운 이벤트',
    location: 'LA',
    category: '이벤트',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };
  // There is no wrong time format event in the mock data, so we create one here for testing.
  const eventWithWrongTimes: EventProps = {
    id: '2',
    title: '새로운 이벤트',
    date: '2025-09-30',
    startTime: '500:32',
    endTime: '-1:-2',
    description: '새로운 이벤트',
    location: 'LA',
    category: '이벤트',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const result = convertEventToDateRange(data.events[0] as EventProps);
    expect(result).toEqual({
      start: new Date(2025, 9, 15, 9, 0),
      end: new Date(2025, 9, 15, 10, 0),
    });
  });

  // Test that convertEventToDateRange returns Invalid Date for events with invalid date formats.
  // 잘못된 날짜 형식의 Event 객체에 대해 Invalid Date를 반환하는지 테스트합니다.
  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const result = convertEventToDateRange(eventWithWrongDate);
    expect(Number.isNaN(result.start.getTime())).toBe(true);
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const result = convertEventToDateRange(eventWithWrongTimes);
    expect(Number.isNaN(result.start.getTime())).toBe(true);
    expect(Number.isNaN(result.end.getTime())).toBe(true);
  });
});
