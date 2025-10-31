// Notification panel component props definition
// 알림 패널 컴포넌트 props 정의

import { Dispatch, SetStateAction } from 'react';
export interface NotificationPanelProps {
  notifications: Notification[];
}

interface Notification {
  id: string;
  message: string;
}

export interface NotificationPanelHandlerProps {
  setNotifications: Dispatch<SetStateAction<Notification[]>>;
}
