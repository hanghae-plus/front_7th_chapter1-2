import { ChangeEvent, useState } from 'react';

import { Event, RepeatType } from '../types';
import { getTimeErrorMessage } from '../utils/timeValidation';

type TimeErrorRecord = Record<'startTimeError' | 'endTimeError', string | null>;

export const useEventForm = (initialEvent?: Event) => {
  const [title, setTitle] = useState(initialEvent?.title || '');
  const [date, setDate] = useState(initialEvent?.date || '');
  const [startTime, setStartTime] = useState(initialEvent?.startTime || '');
  const [endTime, setEndTime] = useState(initialEvent?.endTime || '');
  const [description, setDescription] = useState(initialEvent?.description || '');
  const [location, setLocation] = useState(initialEvent?.location || '');
  const [category, setCategory] = useState(initialEvent?.category || '업무');
  const [isRepeating, setIsRepeating] = useState(
    initialEvent?.repeat?.type ? initialEvent.repeat.type !== 'none' : false
  );
  const [repeatType, _setRepeatType] = useState<RepeatType>(
    initialEvent?.repeat?.type && initialEvent.repeat.type !== 'none'
      ? initialEvent.repeat.type
      : 'daily'
  );
  const [repeatInterval, _setRepeatInterval] = useState(initialEvent?.repeat?.interval || 1);
  const [repeatEndDate, _setRepeatEndDate] = useState(initialEvent?.repeat?.endDate || '');
  const [notificationTime, setNotificationTime] = useState(initialEvent?.notificationTime || 10);

  // TDD RED Phase: Skeleton implementations for repeat setters
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  const setRepeatType = (_type: RepeatType): void => {
    throw new Error('NotImplementedError: setRepeatType');
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  const setRepeatInterval = (_interval: number): void => {
    throw new Error('NotImplementedError: setRepeatInterval');
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  const setRepeatEndDate = (_date: string): void => {
    throw new Error('NotImplementedError: setRepeatEndDate');
  };

  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const [{ startTimeError, endTimeError }, setTimeError] = useState<TimeErrorRecord>({
    startTimeError: null,
    endTimeError: null,
  });

  const handleStartTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newStartTime = e.target.value;
    setStartTime(newStartTime);
    setTimeError(getTimeErrorMessage(newStartTime, endTime));
  };

  const handleEndTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newEndTime = e.target.value;
    setEndTime(newEndTime);
    setTimeError(getTimeErrorMessage(startTime, newEndTime));
  };

  const resetForm = () => {
    setTitle('');
    setDate('');
    setStartTime('');
    setEndTime('');
    setDescription('');
    setLocation('');
    setCategory('업무');
    setIsRepeating(false);
    _setRepeatType('daily');
    _setRepeatInterval(1);
    _setRepeatEndDate('');
    setNotificationTime(10);
  };

  const editEvent = (event: Event) => {
    setEditingEvent(event);
    setTitle(event.title);
    setDate(event.date);
    setStartTime(event.startTime);
    setEndTime(event.endTime);
    setDescription(event.description);
    setLocation(event.location);
    setCategory(event.category);
    setIsRepeating(event.repeat.type !== 'none');
    _setRepeatType(event.repeat.type);
    _setRepeatInterval(event.repeat.interval);
    _setRepeatEndDate(event.repeat.endDate || '');
    setNotificationTime(event.notificationTime);
  };

  return {
    title,
    setTitle,
    date,
    setDate,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    description,
    setDescription,
    location,
    setLocation,
    category,
    setCategory,
    isRepeating,
    setIsRepeating,
    repeatType,
    setRepeatType,
    repeatInterval,
    setRepeatInterval,
    repeatEndDate,
    setRepeatEndDate,
    notificationTime,
    setNotificationTime,
    startTimeError,
    endTimeError,
    editingEvent,
    setEditingEvent,
    handleStartTimeChange,
    handleEndTimeChange,
    resetForm,
    editEvent,
  };
};
