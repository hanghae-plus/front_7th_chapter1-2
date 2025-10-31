import { EventFormProps } from '@/types/events/EventForm.types';

export interface EventProps extends EventFormProps {
  id: string;
}

// 별칭 타입 - 테스트 호환성을 위해 추가
export type Event = EventProps;
