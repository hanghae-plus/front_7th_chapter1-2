// Basic Fields Component to input title, date, and time
// 기본 필드 컴포넌트 (제목, 날짜, 시간 입력)
// 80줄이 넘은 이유: MUI 컴포넌트의 Tooltip을 사용하여 시간 입력 필드에 유효성 검사 메시지를 표시하는 기능이 추가되어 코드가 길어졌습니다.
// 이는 코드의 가독성과 유지보수성을 높이기 위한 중요한 기능입니다.

import {
  FormControl,
  FormLabel,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material';

import { BasicFieldsProps } from '@/types/events/BasicFieldsProps.types';
import { BasicFieldsFormHandlers } from '@/types/events/EventFormHandlers.types';
import { getTimeErrorMessage } from '@/utils/timeValidation';

export const BasicFields = ({
  title,
  setTitle,
  date,
  setDate,
  startTime,
  endTime,
  startTimeError,
  endTimeError,
  handleStartTimeChange,
  handleEndTimeChange,
}: BasicFieldsProps & BasicFieldsFormHandlers) => {
  return (
    <>
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

      <Stack
        direction="row"
        spacing={2}
      >
        <FormControl fullWidth>
          <FormLabel htmlFor="start-time">시작 시간</FormLabel>
          <Tooltip
            title={startTimeError || ''}
            open={!!startTimeError}
            placement="top"
          >
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
          <Tooltip
            title={endTimeError || ''}
            open={!!endTimeError}
            placement="top"
          >
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
    </>
  );
};
