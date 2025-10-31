import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { IconButton, MenuItem, Select, Stack } from '@mui/material';

interface CalendarNavigationProps {
  view: 'week' | 'month';
  onViewChange: (view: 'week' | 'month') => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

/**
 * 캘린더 네비게이션 컴포넌트 (뷰 전환 및 이전/다음 버튼)
 */
export function CalendarNavigation({ view, onViewChange, onNavigate }: CalendarNavigationProps) {
  return (
    <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
      <IconButton aria-label="Previous" onClick={() => onNavigate('prev')}>
        <ChevronLeftIcon />
      </IconButton>
      <Select
        size="small"
        aria-label="뷰 타입 선택"
        value={view}
        onChange={(e) => onViewChange(e.target.value as 'week' | 'month')}
      >
        <MenuItem value="week" aria-label="week-option">
          Week
        </MenuItem>
        <MenuItem value="month" aria-label="month-option">
          Month
        </MenuItem>
      </Select>
      <IconButton aria-label="Next" onClick={() => onNavigate('next')}>
        <ChevronRightIcon />
      </IconButton>
    </Stack>
  );
}
