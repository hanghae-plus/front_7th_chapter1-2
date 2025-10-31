import { EventProps } from '@/types/events/Event.types';

const 초 = 1000;
const 분 = 초 * 60;

export function getUpcomingEvents(
  events: EventProps[],
  now: Date,
  notifiedEvents: string[]
) {
  return events.filter((event) => {
    const eventStart = new Date(`${event.date}T${event.startTime}`);
    const timeDiff = (eventStart.getTime() - now.getTime()) / 분;
    return (
      timeDiff > 0 &&
      timeDiff <= event.notificationTime &&
      !notifiedEvents.includes(event.id)
    );
  });
}

export function createNotificationMessage({
  notificationTime,
  title,
}: EventProps) {
  return `${notificationTime}분 후 ${title} 일정이 시작됩니다.`;
}
