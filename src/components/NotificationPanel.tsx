// Notification panel to display notifications
// 알림 패널 컴포넌트

import { Close } from '@mui/icons-material';
import { Alert, AlertTitle, IconButton, Stack } from '@mui/material';

import {
  NotificationPanelHandlerProps,
  NotificationPanelProps,
} from '@/types/NotificationPanel.type';

export const NotificationPanel = ({
  notifications,
  setNotifications,
}: NotificationPanelProps & NotificationPanelHandlerProps) => {
  if (notifications.length === 0) return null;

  return (
    <Stack
      position="fixed"
      top={16}
      right={16}
      spacing={2}
      alignItems="flex-end"
    >
      {notifications.map((notification, index) => (
        <Alert
          key={index}
          severity="info"
          sx={{ width: 'auto' }}
          action={
            <IconButton
              size="small"
              onClick={() =>
                setNotifications((prev) => prev.filter((_, i) => i !== index))
              }
            >
              <Close />
            </IconButton>
          }
        >
          <AlertTitle>{notification.message}</AlertTitle>
        </Alert>
      ))}
    </Stack>
  );
};
