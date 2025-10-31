import { Notifications, Repeat } from '@mui/icons-material';
import { Box, Stack, Typography } from '@mui/material';

import { Event } from '../types';

interface EventItemProps {
  event: Event;
  isNotified: boolean;
  showFullDetails?: boolean;
}

export function EventItem({ event, isNotified, showFullDetails = false }: EventItemProps) {
  const isRepeating = event.repeat.type !== 'none';

  if (showFullDetails) {
    return null; // EventList에서 사용하는 전체 상세 버전은 별도 처리
  }

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
      <Stack direction="row" spacing={0.5} alignItems="center">
        {isRepeating && <Repeat data-testid="repeat-icon" fontSize="small" />}
        {isNotified && <Notifications fontSize="small" />}
        <Typography variant="caption" noWrap sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
          {event.title}
        </Typography>
      </Stack>
    </Box>
  );
}
