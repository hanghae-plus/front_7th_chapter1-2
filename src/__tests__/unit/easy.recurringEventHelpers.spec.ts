import { EventForm, RepeatType } from '../../types';
import {
  shouldGenerateEventOnDate,
  normalizeEndDate,
  createRecurringEventInstance,
} from '../../utils/recurringEventUtils';

// 반복 일정 생성 헬퍼 함수 테스트
describe('shouldGenerateEventOnDate', () => {
  it('[FR-4.2] 날짜가 종료일을 초과하면 false를 반환해야 한다', () => {
    const date = new Date('2026-01-01');
    const endDate = '2025-12-31';

    const result = shouldGenerateEventOnDate(date, endDate);

    expect(result).toBe(false);
  });

  it('[FR-4.2] 날짜가 2025-12-31을 초과하면 false를 반환해야 한다', () => {
    const date = new Date('2026-01-01');
    const endDate = '2026-01-05'; // endDate가 2025-12-31을 초과하지만, 함수는 최대 2025-12-31까지만 허용

    const result = shouldGenerateEventOnDate(date, endDate);

    expect(result).toBe(false);
  });

  it('날짜가 종료일 이내이면 true를 반환해야 한다', () => {
    const date = new Date('2025-01-15');
    const endDate = '2025-12-31';

    const result = shouldGenerateEventOnDate(date, endDate);

    expect(result).toBe(true);
  });

  it('날짜가 종료일과 같으면 true를 반환해야 한다', () => {
    const date = new Date('2025-12-31');
    const endDate = '2025-12-31';

    const result = shouldGenerateEventOnDate(date, endDate);

    expect(result).toBe(true);
  });
});

describe('normalizeEndDate', () => {
  it('[FR-4.2] 종료일이 2025-12-31을 초과하면 2025-12-31로 정규화해야 한다', () => {
    const endDate = '2026-01-05';

    const result = normalizeEndDate(endDate);

    expect(result).toBe('2025-12-31');
  });

  it('종료일이 2025-12-31 이하면 그대로 반환해야 한다', () => {
    const endDate = '2025-12-31';

    const result = normalizeEndDate(endDate);

    expect(result).toBe('2025-12-31');
  });

  it('종료일이 2025-12-31보다 작으면 그대로 반환해야 한다', () => {
    const endDate = '2025-01-15';

    const result = normalizeEndDate(endDate);

    expect(result).toBe('2025-01-15');
  });
});

describe('createRecurringEventInstance', () => {
  const baseEvent: EventForm = {
    title: '반복 회의',
    date: '2025-01-15',
    startTime: '09:00',
    endTime: '10:00',
    description: '설명',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'daily', interval: 1, endDate: '2025-01-17' },
    notificationTime: 10,
  };

  it('기본 일정 정보를 복사하고 날짜만 변경해야 한다', () => {
    const newDate = '2025-01-16';
    const repeatId = 'test-repeat-id';
    const repeatType: RepeatType = 'daily';

    const instance = createRecurringEventInstance(baseEvent, newDate, repeatType, repeatId);

    expect(instance.title).toBe(baseEvent.title);
    expect(instance.startTime).toBe(baseEvent.startTime);
    expect(instance.endTime).toBe(baseEvent.endTime);
    expect(instance.description).toBe(baseEvent.description);
    expect(instance.location).toBe(baseEvent.location);
    expect(instance.category).toBe(baseEvent.category);
    expect(instance.notificationTime).toBe(baseEvent.notificationTime);
    expect(instance.date).toBe(newDate);
    expect(instance.repeat.type).toBe(repeatType);
    expect(instance.repeat.interval).toBe(1); // [FR-2.4] interval은 항상 1
    expect(instance.repeat.id).toBe(repeatId);
  });

  it('[FR-2.4] 생성된 인스턴스의 interval은 항상 1이어야 한다', () => {
    const newDate = '2025-01-16';
    const repeatId = 'test-repeat-id';
    const repeatTypes: RepeatType[] = ['daily', 'weekly', 'monthly', 'yearly'];

    repeatTypes.forEach((repeatType) => {
      const instance = createRecurringEventInstance(baseEvent, newDate, repeatType, repeatId);
      expect(instance.repeat.interval).toBe(1);
    });
  });

  it('repeat.id가 올바르게 설정되어야 한다', () => {
    const newDate = '2025-01-16';
    const repeatId = 'test-repeat-id-123';
    const repeatType: RepeatType = 'weekly';

    const instance = createRecurringEventInstance(baseEvent, newDate, repeatType, repeatId);

    expect(instance.repeat.id).toBe(repeatId);
  });

  it('endDate는 원본 일정의 endDate를 유지해야 한다', () => {
    const newDate = '2025-01-16';
    const repeatId = 'test-repeat-id';
    const repeatType: RepeatType = 'daily';

    const instance = createRecurringEventInstance(baseEvent, newDate, repeatType, repeatId);

    expect(instance.repeat.endDate).toBe(baseEvent.repeat.endDate);
  });
});

