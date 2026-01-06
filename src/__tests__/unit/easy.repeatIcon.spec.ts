// Ai Edit
import { describe, expect, it } from 'vitest';

import { Event } from '../../types';
import { getRepeatIcon, shouldShowRepeatIcon } from '../../utils/repeatIconUtils';

describe('shouldShowRepeatIcon - 반복 아이콘 표시 로직', () => {
  it('반복 일정(repeatGroupId 있고 repeat.type이 none이 아닌 경우)은 true를 반환한다', () => {
    // 🔍 Given: repeatGroupId가 있고 repeat.type이 'daily'인 일정
    const event: Event = {
      id: '1',
      title: '매일 회의',
      date: '2025-10-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'daily', interval: 1, endDate: '2025-10-05' },
      notificationTime: 10,
      repeatGroupId: 'repeat-123',
      isRepeatInstance: true,
    };

    // 🎯 When: shouldShowRepeatIcon 호출
    const result = shouldShowRepeatIcon(event);

    // ✅ Then: true 반환
    expect(result).toBe(true);
  });

  it('단일 수정된 반복 일정(repeat.type이 none)은 false를 반환한다', () => {
    // 🔍 Given: repeatGroupId가 있지만 repeat.type이 'none'인 일정 (단일 수정됨)
    const event: Event = {
      id: '2',
      title: '수정된 회의',
      date: '2025-10-02',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
      repeatGroupId: 'repeat-123',
      isRepeatInstance: false,
    };

    // 🎯 When: shouldShowRepeatIcon 호출
    const result = shouldShowRepeatIcon(event);

    // ✅ Then: false 반환
    expect(result).toBe(false);
  });

  it('일반 일정(repeatGroupId 없음)은 false를 반환한다', () => {
    // 🔍 Given: repeatGroupId가 없는 일정
    const event: Event = {
      id: '3',
      title: '일반 회의',
      date: '2025-10-03',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    // 🎯 When: shouldShowRepeatIcon 호출
    const result = shouldShowRepeatIcon(event);

    // ✅ Then: false 반환
    expect(result).toBe(false);
  });

  it('repeatGroupId가 있지만 repeat.type이 정의되지 않은 경우 false를 반환한다', () => {
    // 🔍 Given: repeatGroupId가 있지만 repeat.type이 없는 일정
    const event: Event = {
      id: '4',
      title: '잘못된 반복 일정',
      date: '2025-10-04',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
      repeatGroupId: 'repeat-456',
    };

    // 🎯 When: shouldShowRepeatIcon 호출
    const result = shouldShowRepeatIcon(event);

    // ✅ Then: false 반환 (repeat.type이 'none'이므로)
    expect(result).toBe(false);
  });
});

describe('getRepeatIcon - 반복 아이콘 문자열 반환', () => {
  it('반복 일정인 경우 " 🔁" 문자열을 반환한다', () => {
    // 🔍 Given: 반복 일정
    const event: Event = {
      id: '1',
      title: '매일 회의',
      date: '2025-10-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'daily', interval: 1, endDate: '2025-10-05' },
      notificationTime: 10,
      repeatGroupId: 'repeat-123',
      isRepeatInstance: true,
    };

    // 🎯 When: getRepeatIcon 호출
    const result = getRepeatIcon(event);

    // ✅ Then: " 🔁" 반환
    expect(result).toBe(' 🔁');
  });

  it('일반 일정인 경우 빈 문자열을 반환한다', () => {
    // 🔍 Given: 일반 일정
    const event: Event = {
      id: '2',
      title: '일반 회의',
      date: '2025-10-02',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    // 🎯 When: getRepeatIcon 호출
    const result = getRepeatIcon(event);

    // ✅ Then: 빈 문자열 반환
    expect(result).toBe('');
  });
});

