// Manages notifications for upcoming events.
// 다가오는 이벤트에 대한 알림을 관리합니다.

import { useCallback, useEffect, useState } from 'react';

import { checkUpcomingEvents } from '@/hooks/notifications/checkUpcomingEvents';
import { removeNotification as removeNotificationUtil } from '@/hooks/notifications/removeNotification';
import { EventProps } from '@/types/events/Event.types';

export const useNotifications = (events: EventProps[]) => {
  const [notifications, setNotifications] = useState<
    { id: string; message: string }[]
  >([]);
  const [notifiedEvents, setNotifiedEvents] = useState<string[]>([]);

  const handleCheckUpcomingEvents = useCallback(() => {
    checkUpcomingEvents(
      events,
      notifiedEvents,
      setNotifications,
      setNotifiedEvents
    );
  }, [events, notifiedEvents]);

  const removeNotification = (index: number) => {
    removeNotificationUtil(index, setNotifications);
  };

  useEffect(() => {
    const interval = setInterval(handleCheckUpcomingEvents, 1000); // 1초마다 체크
    return () => clearInterval(interval);
  }, [handleCheckUpcomingEvents]);

  return {
    notifications,
    notifiedEvents,
    setNotifications,
    removeNotification,
  };
};
