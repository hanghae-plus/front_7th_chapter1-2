import { Event } from '../../types';
import { expandEventsForRange } from '../../utils/repeat';

describe('[Story] 예외 반영 확장 - 문자열 정규화', () => {
  it('exceptions 항목에 공백이 있어도 해당 날짜를 확장에서 제외한다 (Red)', () => {
    const series: Event = {
      id: 's-1',
      title: '주간 회의',
      date: '2025-11-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '업무',
      repeat: {
        type: 'weekly',
        interval: 1,
        id: 'r-777',
        exceptions: [' 2025-11-05 '],
      },
      notificationTime: 10,
    };

    const start = new Date('2025-11-03');
    const end = new Date('2025-11-09');

    const expanded = expandEventsForRange([series], start, end);

    // 현재 구현은 공백을 정규화하지 않아 실패 예상(Red)
    expect(expanded.find((e) => e.date === '2025-11-05')).toBeUndefined();
  });
});
