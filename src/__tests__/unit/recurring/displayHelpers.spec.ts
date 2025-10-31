// 반복 일정 표시 헬퍼 함수 테스트
import { describe, it, expect } from 'vitest';

import { RepeatInfoProps } from '@/types/events/RepeatInfo.types';
import {
  isRecurringEvent,
  getRecurringIcon,
  getRecurringIconLabel,
} from '@/utils/recurring/displayHelpers';

describe('반복 일정 표시 헬퍼 함수', () => {
  describe('isRecurringEvent', () => {
    it('반복 정보가 있는 이벤트를 반복 일정으로 감지해야 함', () => {
      const repeatInfo: RepeatInfoProps = {
        type: 'daily',
        interval: 1,
      };

      expect(isRecurringEvent(repeatInfo)).toBe(true);
    });

    it('반복 정보가 없거나 none인 이벤트를 일반 일정으로 감지해야 함', () => {
      const noneRepeat: RepeatInfoProps = {
        type: 'none',
        interval: 1,
      };

      expect(isRecurringEvent(noneRepeat)).toBe(false);
      expect(isRecurringEvent(null)).toBe(false);
      expect(isRecurringEvent(undefined)).toBe(false);
    });

    it('잘못된 반복 정보를 일반 일정으로 처리해야 함', () => {
      const invalidRepeat = {
        type: 'invalid',
        interval: 0,
      } as unknown as RepeatInfoProps;

      expect(isRecurringEvent(invalidRepeat)).toBe(false);
    });
  });

  describe('getRecurringIcon', () => {
    it('매일 반복에 대해 올바른 아이콘을 반환해야 함', () => {
      const repeatInfo: RepeatInfoProps = {
        type: 'daily',
        interval: 1,
      };

      expect(getRecurringIcon(repeatInfo)).toBe('📅');
    });

    it('매주 반복에 대해 올바른 아이콘을 반환해야 함', () => {
      const repeatInfo: RepeatInfoProps = {
        type: 'weekly',
        interval: 1,
      };

      expect(getRecurringIcon(repeatInfo)).toBe('📆');
    });

    it('매월 반복에 대해 올바른 아이콘을 반환해야 함', () => {
      const repeatInfo: RepeatInfoProps = {
        type: 'monthly',
        interval: 1,
      };

      expect(getRecurringIcon(repeatInfo)).toBe('🗓️');
    });

    it('매년 반복에 대해 올바른 아이콘을 반환해야 함', () => {
      const repeatInfo: RepeatInfoProps = {
        type: 'yearly',
        interval: 1,
      };

      expect(getRecurringIcon(repeatInfo)).toBe('📝');
    });

    it('반복 정보가 없으면 기본 아이콘을 반환해야 함', () => {
      expect(getRecurringIcon(null)).toBe('🔄');
      expect(getRecurringIcon(undefined)).toBe('🔄');
    });

    it('none 타입에 대해 빈 문자열을 반환해야 함', () => {
      const noneRepeat: RepeatInfoProps = {
        type: 'none',
        interval: 1,
      };

      expect(getRecurringIcon(noneRepeat)).toBe('');
    });
  });

  describe('getRecurringIconLabel', () => {
    it('매일 반복에 대해 올바른 라벨을 반환해야 함', () => {
      const repeatInfo: RepeatInfoProps = {
        type: 'daily',
        interval: 1,
      };

      expect(getRecurringIconLabel(repeatInfo)).toBe('매일 반복 일정');
    });

    it('매주 반복에 대해 올바른 라벨을 반환해야 함', () => {
      const repeatInfo: RepeatInfoProps = {
        type: 'weekly',
        interval: 2,
      };

      expect(getRecurringIconLabel(repeatInfo)).toBe('2주마다 반복 일정');
    });

    it('매월 반복에 대해 올바른 라벨을 반환해야 함', () => {
      const repeatInfo: RepeatInfoProps = {
        type: 'monthly',
        interval: 3,
      };

      expect(getRecurringIconLabel(repeatInfo)).toBe('3개월마다 반복 일정');
    });

    it('매년 반복에 대해 올바른 라벨을 반환해야 함', () => {
      const repeatInfo: RepeatInfoProps = {
        type: 'yearly',
        interval: 1,
      };

      expect(getRecurringIconLabel(repeatInfo)).toBe('매년 반복 일정');
    });

    it('반복 정보가 없으면 빈 문자열을 반환해야 함', () => {
      expect(getRecurringIconLabel(null)).toBe('');
      expect(getRecurringIconLabel(undefined)).toBe('');
    });
  });
});
