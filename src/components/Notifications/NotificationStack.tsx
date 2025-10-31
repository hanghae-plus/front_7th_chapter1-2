import CloseIcon from '@mui/icons-material/Close';
import { Alert, AlertTitle, IconButton, Stack } from '@mui/material';

interface Notification {
  id: number;
  message: string;
}

interface NotificationStackProps {
  notifications: Notification[];
  onRemove: (index: number) => void;
}

/**
 * 화면 우측 상단에 표시되는 알림 스택
 */
export function NotificationStack({ notifications, onRemove }: NotificationStackProps) {
  if (notifications.length === 0) {
    return null;
  }

  return (
    <Stack position="fixed" top={16} right={16} spacing={2} alignItems="flex-end">
      {notifications.map((notification, index) => (
        <Alert
          key={index}
          severity="info"
          sx={{ width: 'auto' }}
          action={
            <IconButton size="small" onClick={() => onRemove(index)}>
              <CloseIcon />
            </IconButton>
          }
        >
          <AlertTitle>{notification.message}</AlertTitle>
        </Alert>
      ))}
    </Stack>
  );
}
