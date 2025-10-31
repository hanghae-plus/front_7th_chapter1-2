// Helper functions for creating event form return object
// 이벤트 폼 반환 객체 생성을 위한 헬퍼 함수들

import { ChangeEvent } from 'react';

import { EventProps } from '@/types/events/Event.types';
import {
  EventFormState,
  BasicFormField,
  RepeatFormField,
} from '@/types/events/EventFormState.types';

// 폼 상태를 기반으로 반환 객체 생성
export const createFormReturnObject = (
  state: EventFormState,
  setBasicField: (field: BasicFormField, value: string) => void,
  setRepeatField: (
    field: RepeatFormField,
    value: string | number | boolean
  ) => void,
  setNotificationTime: (time: number) => void,
  setEditingEvent: (event: EventProps | null) => void,
  handleStartTimeChange: (e: ChangeEvent<HTMLInputElement>) => void,
  handleEndTimeChange: (e: ChangeEvent<HTMLInputElement>) => void,
  resetForm: () => void,
  editEvent: (event: EventProps) => void
) => ({
  // 기본 정보
  title: state.basicInfo.title,
  setTitle: (value: string) => setBasicField('title', value),
  date: state.basicInfo.date,
  setDate: (value: string) => setBasicField('date', value),
  startTime: state.basicInfo.startTime,
  setStartTime: (value: string) => setBasicField('startTime', value),
  endTime: state.basicInfo.endTime,
  setEndTime: (value: string) => setBasicField('endTime', value),
  description: state.basicInfo.description,
  setDescription: (value: string) => setBasicField('description', value),
  location: state.basicInfo.location,
  setLocation: (value: string) => setBasicField('location', value),
  category: state.basicInfo.category,
  setCategory: (value: string) => setBasicField('category', value),

  // 반복 설정
  isRepeating: state.repeatInfo.isRepeating,
  setIsRepeating: (value: boolean) => setRepeatField('isRepeating', value),
  repeatType: state.repeatInfo.type,
  setRepeatType: (value: string) => setRepeatField('type', value),
  repeatInterval: state.repeatInfo.interval,
  setRepeatInterval: (value: number) => setRepeatField('interval', value),
  repeatEndDate: state.repeatInfo.endDate,
  setRepeatEndDate: (value: string) => setRepeatField('endDate', value),

  // 알림 및 에러
  notificationTime: state.notification.time,
  setNotificationTime,
  startTimeError: state.validation.startTimeError,
  endTimeError: state.validation.endTimeError,

  // 편집 상태
  editingEvent: state.editing.event,
  setEditingEvent,

  // 핸들러들
  handleStartTimeChange,
  handleEndTimeChange,
  resetForm,
  editEvent,
});
