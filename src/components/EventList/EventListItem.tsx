import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import NotificationsIcon from '@mui/icons-material/Notifications';
import RepeatIcon from '@mui/icons-material/Repeat';
import { Box, IconButton, Stack, Typography } from '@mui/material';

import { notificationOptions } from '../../constants/eventConstants';
import { Event } from '../../types';

interface EventListItemProps {
  event: Event;
  isNotified: boolean;
  onEdit: (event: Event) => void;
  onDelete: (id: string) => void;
}

/**
 * 이벤트 목록에서 사용되는 상세 이벤트 아이템
 */
export function EventListItem({ event, isNotified, onEdit, onDelete }: EventListItemProps) {
  return (
    <Box
      role="listitem"
      aria-label={event.title}
      sx={{ border: 1, borderRadius: 2, p: 3, width: '100%' }}
    >
      <Stack direction="row" justifyContent="space-between">
        <Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            {isNotified && <NotificationsIcon color="error" />}
            {event.repeat.type !== 'none' && (
              <RepeatIcon aria-label="반복 일정" fontSize="small" color="action" />
            )}
            <Typography
              fontWeight={isNotified ? 'bold' : 'normal'}
              color={isNotified ? 'error' : 'inherit'}
            >
              {event.title}
            </Typography>
          </Stack>
          <Typography>{event.date}</Typography>
          <Typography>
            {event.startTime} - {event.endTime}
          </Typography>
          <Typography>{event.description}</Typography>
          <Typography>{event.location}</Typography>
          <Typography>카테고리: {event.category}</Typography>
          {event.repeat.type !== 'none' && (
            <Typography>
              반복: {event.repeat.interval}
              {event.repeat.type === 'daily' && '일'}
              {event.repeat.type === 'weekly' && '주'}
              {event.repeat.type === 'monthly' && '월'}
              {event.repeat.type === 'yearly' && '년'}
              마다
              {event.repeat.endDate && ` (종료: ${event.repeat.endDate})`}
            </Typography>
          )}
          <Typography>
            알림:{' '}
            {notificationOptions.find((option) => option.value === event.notificationTime)?.label}
          </Typography>
        </Stack>
        <Stack>
          <IconButton aria-label="Edit event" onClick={() => onEdit(event)}>
            <EditIcon />
          </IconButton>
          <IconButton aria-label="Delete event" onClick={() => onDelete(event.id)}>
            <DeleteIcon />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  );
}
