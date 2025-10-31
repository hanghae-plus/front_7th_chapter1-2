// Overlap dialog component props definition
// 겹치는 일정 다이얼로그 컴포넌트 props 정의

import { EventProps } from '@/types/events/Event.types';

export interface OverlapDialogProps {
  isOpen: boolean;
  overlappingEvents: EventProps[];
}

export interface OverlapDialogHandlerProps {
  onClose: () => void;
  onContinue: () => void;
}
