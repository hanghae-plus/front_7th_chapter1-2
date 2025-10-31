import NotificationsIcon from '@mui/icons-material/Notifications';
import RepeatIcon from '@mui/icons-material/Repeat';
import { Box, Stack, Typography } from '@mui/material';

import { Event } from '../../types';

interface CalendarEventCardProps {
  event: Event;
  isNotified: boolean;
}

/**
 * 캘린더 뷰(주간/월간)에서 사용되는 간략한 이벤트 카드
 */
export function CalendarEventCard({ event, isNotified }: CalendarEventCardProps) {
  return (
    <Box
      sx={{
        p: 0.5,
        my: 0.5,
        backgroundColor: isNotified ? '#ffebee' : '#f5f5f5',
        borderRadius: 1,
        fontWeight: isNotified ? 'bold' : 'normal',
        color: isNotified ? '#d32f2f' : 'inherit',
        minHeight: '18px',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        {isNotified && <NotificationsIcon fontSize="small" />}
        {event.repeat.type !== 'none' && <RepeatIcon fontSize="small" />}
        <Typography variant="caption" noWrap sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
          {event.title}
        </Typography>
      </Stack>
    </Box>
  );
}
