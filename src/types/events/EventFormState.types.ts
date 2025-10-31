// Event form state and action type definitions for useReducer pattern
// useReducer 패턴을 위한 이벤트 폼 상태 및 액션 타입 정의

import { EventProps } from '@/types/events/Event.types';
import { RepeatType } from '@/types/events/RepeatInfo.types';

// 이벤트 폼의 전체 상태 구조
export interface EventFormState {
  // 기본 이벤트 정보
  basicInfo: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    description: string;
    location: string;
    category: string;
  };

  // 반복 설정 정보
  repeatInfo: {
    isRepeating: boolean;
    type: RepeatType;
    interval: number;
    endDate: string;
  };

  // 알림 설정
  notification: {
    time: number; // 분 단위
  };

  // 유효성 검사 에러
  validation: {
    startTimeError: string | null;
    endTimeError: string | null;
  };

  // 편집 모드 상태
  editing: {
    event: EventProps | null;
  };
}

// 액션 타입들
export type EventFormAction =
  | {
      type: 'SET_BASIC_FIELD';
      field: keyof EventFormState['basicInfo'];
      value: string;
    }
  | {
      type: 'SET_REPEAT_FIELD';
      field: keyof EventFormState['repeatInfo'];
      value: string | number | boolean;
    }
  | { type: 'SET_NOTIFICATION_TIME'; value: number }
  | {
      type: 'SET_TIME_VALIDATION';
      startTimeError: string | null;
      endTimeError: string | null;
    }
  | { type: 'SET_START_TIME'; value: string }
  | { type: 'SET_END_TIME'; value: string }
  | { type: 'RESET_FORM' }
  | { type: 'LOAD_EVENT'; event: EventProps }
  | { type: 'SET_EDITING_EVENT'; event: EventProps | null };

// 폼 필드 타입 정의
export type BasicFormField = keyof EventFormState['basicInfo'];
export type RepeatFormField = keyof EventFormState['repeatInfo'];

// 시간 검증 결과 타입
export interface TimeValidationResult {
  startTimeError: string | null;
  endTimeError: string | null;
}
