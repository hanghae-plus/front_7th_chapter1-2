import { useState } from 'react';

import { Event } from '../types';

export function useRecurringEvents() {
  const [isRecurringDialogOpen, setIsRecurringDialogOpen] = useState(false);
  const [recurringDialogType, setRecurringDialogType] = useState<'edit' | 'delete'>('edit');
  const [pendingEvent, setPendingEvent] = useState<Event | null>(null);

  const openRecurringDialog = (event: Event, action: 'edit' | 'delete') => {
    if (event.repeat.type !== 'none') {
      setPendingEvent(event);
      setRecurringDialogType(action);
      setIsRecurringDialogOpen(true);
      return true;
    }
    return false;
  };

  const closeRecurringDialog = () => {
    setIsRecurringDialogOpen(false);
    setPendingEvent(null);
  };

  return {
    isRecurringDialogOpen,
    recurringDialogType,
    pendingEvent,
    openRecurringDialog,
    closeRecurringDialog,
  };
}
