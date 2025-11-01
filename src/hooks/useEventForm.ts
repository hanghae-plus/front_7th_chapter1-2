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
    initialEvent ? initialEvent.repeat.type !== 'none' : false
  );
  const [repeatType, setRepeatType] = useState<RepeatType>(initialEvent?.repeat.type || 'none');
  const [repeatInterval, setRepeatInterval] = useState(initialEvent?.repeat.interval || 1);
  const [repeatEndDate, setRepeatEndDate] = useState(initialEvent?.repeat.endDate || '');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(initialEvent?.repeat.daysOfWeek || []);
  const [dayOfMonth, setDayOfMonth] = useState(initialEvent?.repeat.dayOfMonth || 1);
  const [monthOfYear, setMonthOfYear] = useState(initialEvent?.repeat.monthOfYear || 0);
  const [notificationTime, setNotificationTime] = useState(initialEvent?.notificationTime || 10);

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
    setRepeatType('none');
    setRepeatInterval(1);
    setRepeatEndDate('');
    setDaysOfWeek([]);
    setDayOfMonth(1);
    setMonthOfYear(0);
    setNotificationTime(10);
  };

  const editEvent = (_event: Event, onEditRecurringEvent?: (event: Event) => void) => {
    setEditingEvent(_event);
    setTitle(_event.title);
    setDate(_event.date);
    setStartTime(_event.startTime);
    setEndTime(_event.endTime);
    setDescription(_event.description);
    setLocation(_event.location);
    setCategory(_event.category);
    setIsRepeating(_event.repeat.type !== 'none');
    setRepeatType(_event.repeat.type);
    setRepeatInterval(_event.repeat.interval);
    setRepeatEndDate(_event.repeat.endDate || '');
    setDaysOfWeek(_event.repeat.daysOfWeek || []);
    setDayOfMonth(_event.repeat.dayOfMonth || 1);
    setMonthOfYear(_event.repeat.monthOfYear || 0);
    setNotificationTime(_event.notificationTime);

    if (_event.repeat.type !== 'none' && onEditRecurringEvent) {
      onEditRecurringEvent(_event);
    }
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
    daysOfWeek,
    setDaysOfWeek,
    dayOfMonth,
    setDayOfMonth,
    monthOfYear,
    setMonthOfYear,
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
