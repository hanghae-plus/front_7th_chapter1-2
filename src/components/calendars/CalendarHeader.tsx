// Calendar header component with navigation and view selection
// 내비게이션 및 뷰 선택이 포함된 캘린더 헤더 컴포넌트

import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { IconButton, MenuItem, Select, Stack, Typography } from '@mui/material';

import { CalendarHeaderProps } from '@/types/calendars/CalendarHeaderProps.types';

export const CalendarHeader = ({
  view,
  setView,
  onNavigate,
}: CalendarHeaderProps) => {
  return (
    <>
      <Typography variant="h4">일정 보기</Typography>

      <Stack
        direction="row"
        spacing={2}
        justifyContent="space-between"
        alignItems="center"
      >
        <IconButton
          aria-label="Previous"
          onClick={() => onNavigate('prev')}
        >
          <ChevronLeft />
        </IconButton>
        <Select
          size="small"
          aria-label="뷰 타입 선택"
          value={view}
          onChange={(e) => setView(e.target.value as 'week' | 'month')}
        >
          <MenuItem
            value="week"
            aria-label="week-option"
          >
            Week
          </MenuItem>
          <MenuItem
            value="month"
            aria-label="month-option"
          >
            Month
          </MenuItem>
        </Select>
        <IconButton
          aria-label="Next"
          onClick={() => onNavigate('next')}
        >
          <ChevronRight />
        </IconButton>
      </Stack>
    </>
  );
};
