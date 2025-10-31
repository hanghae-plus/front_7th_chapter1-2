import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { ChangeEvent } from 'react';

import { categories, notificationOptions } from '../../constants/eventConstants';
import { Event, RepeatType } from '../../types';
import { getTimeErrorMessage } from '../../utils/timeValidation';

interface EventFormProps {
  // Form values
  title: string;
  setTitle: (value: string) => void;
  date: string;
  setDate: (value: string) => void;
  startTime: string;
  endTime: string;
  description: string;
  setDescription: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  isRepeating: boolean;
  setIsRepeating: (value: boolean) => void;
  repeatType: RepeatType;
  setRepeatType: (value: RepeatType) => void;
  repeatInterval: number;
  setRepeatInterval: (value: number) => void;
  repeatEndDate: string;
  setRepeatEndDate: (value: string) => void;
  notificationTime: number;
  setNotificationTime: (value: number) => void;

  // Error states
  startTimeError: string | null;
  endTimeError: string | null;

  // Event being edited
  editingEvent: Event | null;

  // Handlers
  handleStartTimeChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleEndTimeChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
}

/**
 * 이벤트 생성/수정 폼 컴포넌트
 */
export function EventForm({
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
  handleStartTimeChange,
  handleEndTimeChange,
  onSubmit,
}: EventFormProps) {
  return (
    <Stack spacing={2} sx={{ width: '20%' }}>
      <Typography variant="h4">{editingEvent ? '일정 수정' : '일정 추가'}</Typography>

      <FormControl fullWidth>
        <FormLabel htmlFor="title">제목</FormLabel>
        <TextField
          id="title"
          size="small"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </FormControl>

      <FormControl fullWidth>
        <FormLabel htmlFor="date">날짜</FormLabel>
        <TextField
          id="date"
          size="small"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </FormControl>

      <Stack direction="row" spacing={2}>
        <FormControl fullWidth>
          <FormLabel htmlFor="start-time">시작 시간</FormLabel>
          <Tooltip title={startTimeError || ''} open={!!startTimeError} placement="top">
            <TextField
              id="start-time"
              size="small"
              type="time"
              value={startTime}
              onChange={handleStartTimeChange}
              onBlur={() => getTimeErrorMessage(startTime, endTime)}
              error={!!startTimeError}
            />
          </Tooltip>
        </FormControl>
        <FormControl fullWidth>
          <FormLabel htmlFor="end-time">종료 시간</FormLabel>
          <Tooltip title={endTimeError || ''} open={!!endTimeError} placement="top">
            <TextField
              id="end-time"
              size="small"
              type="time"
              value={endTime}
              onChange={handleEndTimeChange}
              onBlur={() => getTimeErrorMessage(startTime, endTime)}
              error={!!endTimeError}
            />
          </Tooltip>
        </FormControl>
      </Stack>

      <FormControl fullWidth>
        <FormLabel htmlFor="description">설명</FormLabel>
        <TextField
          id="description"
          size="small"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </FormControl>

      <FormControl fullWidth>
        <FormLabel htmlFor="location">위치</FormLabel>
        <TextField
          id="location"
          size="small"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </FormControl>

      <FormControl fullWidth>
        <FormLabel id="category-label">카테고리</FormLabel>
        <Select
          id="category"
          size="small"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-labelledby="category-label"
          aria-label="카테고리"
        >
          {categories.map((cat) => (
            <MenuItem key={cat} value={cat} aria-label={`${cat}-option`}>
              {cat}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {!editingEvent && (
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

          {isRepeating && (
            <>
              <FormControl fullWidth>
                <FormLabel htmlFor="repeat-type">반복</FormLabel>
                <Select
                  id="repeat-type"
                  size="small"
                  value={repeatType === 'none' ? '' : repeatType}
                  onChange={(e) => setRepeatType(e.target.value as RepeatType)}
                  aria-label="반복"
                >
                  <MenuItem value="daily" aria-label="매일">
                    매일
                  </MenuItem>
                  <MenuItem value="weekly" aria-label="매주">
                    매주
                  </MenuItem>
                  <MenuItem value="monthly" aria-label="매월">
                    매월
                  </MenuItem>
                  <MenuItem value="yearly" aria-label="매년">
                    매년
                  </MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <FormLabel htmlFor="repeat-interval">반복 간격</FormLabel>
                <TextField
                  id="repeat-interval"
                  size="small"
                  type="number"
                  value={repeatInterval}
                  onChange={(e) => setRepeatInterval(parseInt(e.target.value, 10) || 1)}
                  inputProps={{
                    min: 1,
                    step: 1,
                  }}
                  helperText="반복 주기를 설정합니다. (예: 2 = 격일/격주/격월)"
                />
              </FormControl>

              <FormControl fullWidth>
                <FormLabel htmlFor="repeat-end-date">종료 날짜</FormLabel>
                <TextField
                  id="repeat-end-date"
                  size="small"
                  type="date"
                  value={repeatEndDate}
                  onChange={(e) => setRepeatEndDate(e.target.value)}
                  aria-label="종료 날짜"
                />
              </FormControl>
            </>
          )}
        </>
      )}

      <FormControl fullWidth>
        <FormLabel htmlFor="notification">알림 설정</FormLabel>
        <Select
          id="notification"
          size="small"
          value={notificationTime}
          onChange={(e) => setNotificationTime(Number(e.target.value))}
        >
          {notificationOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* ! 반복은 8주차 과제에 포함됩니다. 구현하고 싶어도 참아주세요~ */}
      <Button
        data-testid="event-submit-button"
        onClick={onSubmit}
        variant="contained"
        color="primary"
      >
        {editingEvent ? '일정 수정' : '일정 추가'}
      </Button>
    </Stack>
  );
}
