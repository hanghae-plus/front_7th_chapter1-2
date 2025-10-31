// Event card component to display individual event details
// 개별 일정 세부 정보를 표시하는 일정 카드 컴포넌트

import { Notifications } from '@mui/icons-material';
import { Box, Stack, Typography } from '@mui/material';

import { EventCardProps } from '@/types/calendars/EventCardProps.types';

export const CalendarEventCard = ({ event, isNotified }: EventCardProps) => {
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
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
      >
        {isNotified && <Notifications fontSize="small" />}
        <Typography
          variant="caption"
          noWrap
          sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}
        >
          {event.title}
        </Typography>
      </Stack>
    </Box>
  );
};
