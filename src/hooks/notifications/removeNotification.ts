// Removes a notification from the list
// 알림 목록에서 알림을 제거합니다.

import React from 'react';

export const removeNotification = (
  index: number,
  setNotifications: React.Dispatch<
    React.SetStateAction<{ id: string; message: string }[]>
  >
) => {
  setNotifications((prev) => prev.filter((_, i) => i !== index));
};
