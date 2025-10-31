// Setting Fields Component to configure repeating events and notifications
// 설정 필드 컴포넌트 (반복 일정 및 알림 설정)

import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Select,
} from '@mui/material';

import { NOTIFICATION_OPTIONS } from '@/constants/notifications';
import { SettingFieldsFormHandlers } from '@/types/events/EventFormHandlers.types';
import { SettingFieldsProps } from '@/types/events/SettingFieldsProps.types';

export const SettingFields = ({
  isRepeating,
  setIsRepeating,
  notificationTime,
  setNotificationTime,
}: SettingFieldsProps & SettingFieldsFormHandlers) => {
  return (
    <>
      <FormControl>
        <FormControlLabel
          control={
            <Checkbox
              checked={isRepeating}
              onChange={(e) => setIsRepeating(e.target.checked)}
            />
          }
          label="반복 일정"
        />
      </FormControl>

      <FormControl fullWidth>
        <FormLabel htmlFor="notification">알림 설정</FormLabel>
        <Select
          id="notification"
          size="small"
          value={notificationTime}
          onChange={(e) => setNotificationTime(Number(e.target.value))}
        >
          {NOTIFICATION_OPTIONS.map((option) => (
            <MenuItem
              key={option.value}
              value={option.value}
            >
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );
};
