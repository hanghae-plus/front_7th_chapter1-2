// 반복 일정 삭제 관련 타입 정의

export type DeleteOption = 'single' | 'all';

export interface DeleteConfirmDialogProps {
  open: boolean;
  eventTitle: string;
  onDeleteSingle: () => void;
  onDeleteAll: () => void;
  onClose: () => void;
  loading?: boolean;
}

export interface DeletePermissions {
  canDeleteSingle: boolean;
  canDeleteAll: boolean;
  requiresConfirmation: boolean;
}

export interface PendingDelete {
  event: import('../events/Event.types').Event;
}
