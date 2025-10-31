// Event form reducer for managing complex form state with useReducer
// useReducer를 사용한 복잡한 폼 상태 관리를 위한 이벤트 폼 리듀서

import {
  EventFormState,
  EventFormAction,
} from '@/types/events/EventFormState.types';
import { getTimeErrorMessage } from '@/utils/timeValidation';

// 초기 상태 정의
export const createInitialFormState = (): EventFormState => ({
  basicInfo: {
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    description: '',
    location: '',
    category: '업무',
  },
  repeatInfo: {
    isRepeating: false,
    type: 'none',
    interval: 1,
    endDate: '',
  },
  notification: {
    time: 10,
  },
  validation: {
    startTimeError: null,
    endTimeError: null,
  },
  editing: {
    event: null,
  },
});

// 메인 리듀서 함수
export const eventFormReducer = (
  state: EventFormState,
  action: EventFormAction
): EventFormState => {
  switch (action.type) {
    case 'SET_BASIC_FIELD':
      return {
        ...state,
        basicInfo: {
          ...state.basicInfo,
          [action.field]: action.value,
        },
      };

    case 'SET_REPEAT_FIELD':
      return {
        ...state,
        repeatInfo: {
          ...state.repeatInfo,
          [action.field]: action.value,
        },
      };

    case 'SET_NOTIFICATION_TIME':
      return {
        ...state,
        notification: {
          ...state.notification,
          time: action.value,
        },
      };

    case 'SET_TIME_VALIDATION':
      return {
        ...state,
        validation: {
          ...state.validation,
          startTimeError: action.startTimeError,
          endTimeError: action.endTimeError,
        },
      };

    case 'SET_START_TIME': {
      const errors = getTimeErrorMessage(action.value, state.basicInfo.endTime);
      return {
        ...state,
        basicInfo: {
          ...state.basicInfo,
          startTime: action.value,
        },
        validation: {
          ...state.validation,
          ...errors,
        },
      };
    }

    case 'SET_END_TIME': {
      const errors = getTimeErrorMessage(
        state.basicInfo.startTime,
        action.value
      );
      return {
        ...state,
        basicInfo: {
          ...state.basicInfo,
          endTime: action.value,
        },
        validation: {
          ...state.validation,
          ...errors,
        },
      };
    }

    case 'RESET_FORM':
      return createInitialFormState();

    case 'LOAD_EVENT':
      return {
        basicInfo: {
          title: action.event.title,
          date: action.event.date,
          startTime: action.event.startTime,
          endTime: action.event.endTime,
          description: action.event.description,
          location: action.event.location,
          category: action.event.category,
        },
        repeatInfo: {
          isRepeating: action.event.repeat.type !== 'none',
          type: action.event.repeat.type,
          interval: action.event.repeat.interval,
          endDate: action.event.repeat.endDate || '',
        },
        notification: {
          time: action.event.notificationTime,
        },
        validation: {
          startTimeError: null,
          endTimeError: null,
        },
        editing: {
          event: action.event,
        },
      };

    case 'SET_EDITING_EVENT':
      return {
        ...state,
        editing: {
          event: action.event,
        },
      };

    default:
      return state;
  }
};
