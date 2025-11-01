import { useCallback, useEffect, useState } from 'react';

import { Event } from '../types';

export const useNotifications = (events: Event[]) => {
  const [notifications, setNotifications] = useState<
    {
      id: string;
      message: string;
      time: Date;
    }[]
  >([]);
  const [notifiedEvents, setNotifiedEvents] = useState<string[]>([]);

  const checkUpcomingEvents = useCallback(() => {
    const now = new Date();
    events.forEach((event) => {
      if (notifiedEvents.includes(event.id)) {
        return;
      }

      const eventDateTime = new Date(`${event.date}T${event.startTime}`);
      const notificationThreshold = event.notificationTime * 60 * 1000; // minutes to milliseconds

      if (
        eventDateTime.getTime() - now.getTime() <= notificationThreshold &&
        eventDateTime.getTime() > now.getTime()
      ) {
        setNotifications((prev) => [
          ...prev,
          {
            id: event.id,
            message: `${event.notificationTime}분 후 ${event.title} 일정이 시작됩니다.`,
            time: now,
          },
        ]);
        setNotifiedEvents((prev) => [...prev, event.id]);
      }
    });
  }, [events, notifiedEvents]);

  useEffect(() => {
    const interval = setInterval(() => {
      checkUpcomingEvents();
    }, 1000); // 1초마다 실행

    return () => clearInterval(interval);
  }, [checkUpcomingEvents]);

  return { notifications, notifiedEvents, setNotifications };
};
