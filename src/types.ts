export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RepeatInfo {
  type: RepeatType;
  interval: number;
  endDate?: string;
}

export interface EventForm {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  location: string;
  category: string;
  repeat: RepeatInfo;
  notificationTime: number;
}

export interface Event extends EventForm {
  id: string;
  seriesId?: string;
  isSeriesDefinition?: boolean;
  excludedDates?: string[];
  originalDate?: string;
}

// ============================================================================
// TDD-CYCLE-2: Recurring Event UI Types (Skeleton)
// ============================================================================

/**
 * Modal state for recurring event confirmation dialogs
 * Used when user attempts to edit/delete a recurring event
 */
export interface RecurringModalState {
  isOpen: boolean;
  type: 'edit' | 'delete';
  event: Event | null;
}

/**
 * Props for RecurringConfirmModal component
 */
export interface RecurringConfirmModalProps {
  isOpen: boolean;
  type: 'edit' | 'delete';
  onSingle: () => void;
  onAll: () => void;
  onClose: () => void;
}
