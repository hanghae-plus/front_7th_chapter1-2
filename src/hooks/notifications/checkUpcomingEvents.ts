// Checks for upcoming events and creates notifications
// 임박한 이벤트를 확인하고 알림을 생성합니다.

import React from 'react';

import { EventProps } from '@/types/events/Event.types';
import {
  createNotificationMessage,
  getUpcomingEvents,
} from '@/utils/notificationUtils';

export const checkUpcomingEvents = (
  events: EventProps[],
  notifiedEvents: string[],
  setNotifications: React.Dispatch<
    React.SetStateAction<{ id: string; message: string }[]>
  >,
  setNotifiedEvents: React.Dispatch<React.SetStateAction<string[]>>
) => {
  const now = new Date();
  const upcomingEvents = getUpcomingEvents(events, now, notifiedEvents);

  setNotifications((prev) => [
    ...prev,
    ...upcomingEvents.map((event) => ({
      id: event.id,
      message: createNotificationMessage(event),
    })),
  ]);

  setNotifiedEvents((prev) => [...prev, ...upcomingEvents.map(({ id }) => id)]);
};
