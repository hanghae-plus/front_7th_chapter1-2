// Event Form Component to add or edit events
// 일정 추가 또는 수정을 위한 이벤트 폼 컴포넌트

import { Stack, Typography } from '@mui/material';

import { BasicFields } from './event-forms/BasicFields';
import { DetailFields } from './event-forms/DetailFields';
import { FormActions } from './event-forms/FormActions';
import { SettingFields } from './event-forms/SettingFields';

import { EventFormProps } from '@/types/events/EventForm.types';
import { EventFormHandlers } from '@/types/events/EventFormHandlers.types';

export const EventForm = ({
  title,
  setTitle,
  date,
  setDate,
  startTime,
  endTime,
  description,
  setDescription,
  location,
  setLocation,
  category,
  setCategory,
  isRepeating,
  setIsRepeating,
  notificationTime,
  setNotificationTime,
  startTimeError,
  endTimeError,
  editingEvent,
  handleStartTimeChange,
  handleEndTimeChange,
  onSubmit,
}: EventFormProps & EventFormHandlers) => {
  return (
    <Stack spacing={3}>
      <Typography variant="h4">
        {' '}
        {editingEvent ? '일정 수정' : '일정 추가'}{' '}
      </Typography>

      <BasicFields
        title={title}
        setTitle={setTitle}
        date={date}
        setDate={setDate}
        startTime={startTime}
        endTime={endTime}
        startTimeError={startTimeError}
        endTimeError={endTimeError}
        handleStartTimeChange={handleStartTimeChange}
        handleEndTimeChange={handleEndTimeChange}
      />

      <DetailFields
        description={description}
        setDescription={setDescription}
        location={location}
        setLocation={setLocation}
        category={category}
        setCategory={setCategory}
      />

      <SettingFields
        isRepeating={isRepeating}
        setIsRepeating={setIsRepeating}
        notificationTime={notificationTime}
        setNotificationTime={setNotificationTime}
      />

      <FormActions
        onSubmit={onSubmit}
        isEditing={!!editingEvent}
      />
    </Stack>
  );
};
