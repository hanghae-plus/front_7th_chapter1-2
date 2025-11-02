import { ChangeEvent, useState } from 'react';

import { Event, RepeatType } from '../types';
import { getTimeErrorMessage } from '../utils/timeValidation';

type TimeErrorRecord = Record<'startTimeError' | 'endTimeError', string | null>;

// Default form values
const DEFAULT_CATEGORY = '업무';
const DEFAULT_NOTIFICATION_TIME = 10;
const DEFAULT_REPEAT_TYPE: RepeatType = 'daily';
const DEFAULT_REPEAT_INTERVAL = 1;
const MIN_REPEAT_INTERVAL = 1;

// Helper: Determine if event has recurring configuration
const isRecurringEvent = (event?: Event): boolean => {
  return event?.repeat?.type !== undefined && event.repeat.type !== 'none';
};

export const useEventForm = (initialEvent?: Event) => {
  // Basic event fields
  const [title, setTitle] = useState(initialEvent?.title || '');
  const [date, setDate] = useState(initialEvent?.date || '');
  const [startTime, setStartTime] = useState(initialEvent?.startTime || '');
  const [endTime, setEndTime] = useState(initialEvent?.endTime || '');
  const [description, setDescription] = useState(initialEvent?.description || '');
  const [location, setLocation] = useState(initialEvent?.location || '');
  const [category, setCategory] = useState(initialEvent?.category || DEFAULT_CATEGORY);
  const [notificationTime, setNotificationTime] = useState(
    initialEvent?.notificationTime || DEFAULT_NOTIFICATION_TIME
  );

  // Recurring event fields
  const [isRepeating, setIsRepeating] = useState(isRecurringEvent(initialEvent));
  const [repeatType, _setRepeatType] = useState<RepeatType>(
    isRecurringEvent(initialEvent) ? initialEvent.repeat.type : DEFAULT_REPEAT_TYPE
  );
  const [repeatInterval, _setRepeatInterval] = useState(
    initialEvent?.repeat?.interval || DEFAULT_REPEAT_INTERVAL
  );
  const [repeatEndDate, _setRepeatEndDate] = useState(initialEvent?.repeat?.endDate || '');

  // Edit state
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // Time validation state
  const [{ startTimeError, endTimeError }, setTimeError] = useState<TimeErrorRecord>({
    startTimeError: null,
    endTimeError: null,
  });

  // Repeat field setters with validation
  const setRepeatType = (type: RepeatType): void => {
    _setRepeatType(type);
  };

  const setRepeatInterval = (interval: number): void => {
    if (interval >= MIN_REPEAT_INTERVAL) {
      _setRepeatInterval(interval);
    }
  };

  const setRepeatEndDate = (date: string): void => {
    _setRepeatEndDate(date);
  };

  // Time change handlers with validation
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
    setCategory(DEFAULT_CATEGORY);
    setIsRepeating(false);
    _setRepeatType(DEFAULT_REPEAT_TYPE);
    _setRepeatInterval(DEFAULT_REPEAT_INTERVAL);
    _setRepeatEndDate('');
    setNotificationTime(DEFAULT_NOTIFICATION_TIME);
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
