// 반복 일정 수정 관련 타입 정의

export type EditOption = 'single' | 'all';

export interface EditConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onEditSingle: () => void;
  onEditAll: () => void;
  eventTitle: string;
  loading?: boolean;
}

export interface EditPermissions {
  canEditSingle: boolean;
  canEditAll: boolean;
  requiresConfirmation: boolean;
}

export interface PendingEdit {
  event: import('../events/Event.types').Event;
  updatedData: Partial<import('../events/EventForm.types').EventForm>;
}
