// src/types.ts (기존 파일에 타입 추가)
export interface RecurringConfig {
type: 'daily' | 'weekly' | 'monthly' | 'yearly';
startDate: string;
endDate: string;
interval: number;
}

// src/utils/generateRecurringDates.ts (기존 구조 참고)
import { RecurringConfig } from '@/types';

export function generateRecurringDates(config: RecurringConfig): string[] {
// TODO: 구현 필요
return [];
}

// src/hooks/useRecurringEvents.ts (기존 구조 참고)
import { useState } from 'react';
import { RecurringConfig } from '@/types';

export function useRecurringEvents() {
const [events, setEvents] = useState<RecurringConfig[]>([]);

// TODO: 구현 필요
return { events, setEvents };
}
