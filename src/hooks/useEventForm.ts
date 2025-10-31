// Event form hook using useReducer pattern for better state management
// 더 나은 상태 관리를 위해 useReducer 패턴을 사용하는 이벤트 폼 훅

import { ChangeEvent, useEffect, useReducer } from 'react';

import { createFormReturnObject } from '@/helpers/events/eventFormHelpers';
import { EventProps } from '@/types/events/Event.types';
import {
  BasicFormField,
  RepeatFormField,
} from '@/types/events/EventFormState.types';
import {
  eventFormReducer,
  createInitialFormState,
} from '@/utils/events/eventFormReducer';

export const useEventForm = (initialEvent?: EventProps) => {
  const [state, dispatch] = useReducer(
    eventFormReducer,
    createInitialFormState()
  );

  // 초기 이벤트가 있으면 로드
  useEffect(() => {
    if (initialEvent) {
      dispatch({ type: 'LOAD_EVENT', event: initialEvent });
    }
  }, [initialEvent]);

  // 기본 필드 설정 헬퍼
  const setBasicField = (field: BasicFormField, value: string) => {
    dispatch({ type: 'SET_BASIC_FIELD', field, value });
  };

  // 반복 필드 설정 헬퍼
  const setRepeatField = (
    field: RepeatFormField,
    value: string | number | boolean
  ) => {
    dispatch({ type: 'SET_REPEAT_FIELD', field, value });
  };

  // 시간 변경 핸들러들
  const handleStartTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_START_TIME', value: e.target.value });
  };

  const handleEndTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_END_TIME', value: e.target.value });
  };

  // 폼 초기화
  const resetForm = () => {
    dispatch({ type: 'RESET_FORM' });
  };

  // 이벤트 편집 모드
  const editEvent = (event: EventProps) => {
    dispatch({ type: 'LOAD_EVENT', event });
  };

  // 알림 시간 설정
  const setNotificationTime = (time: number) => {
    dispatch({ type: 'SET_NOTIFICATION_TIME', value: time });
  };

  // 편집 중인 이벤트 설정
  const setEditingEvent = (event: EventProps | null) => {
    dispatch({ type: 'SET_EDITING_EVENT', event });
  };

  // 헬퍼를 사용하여 반환 객체 생성
  return createFormReturnObject(
    state,
    setBasicField,
    setRepeatField,
    setNotificationTime,
    setEditingEvent,
    handleStartTimeChange,
    handleEndTimeChange,
    resetForm,
    editEvent
  );
};
