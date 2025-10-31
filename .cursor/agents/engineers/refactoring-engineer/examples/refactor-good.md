// src/features/recurring-events/constants.ts
export const RECURRENCE_TYPE = {
DAILY: 'daily',
WEEKLY: 'weekly',
MONTHLY: 'monthly',
YEARLY: 'yearly'
} as const;

// src/features/recurring-events/generators/daily.ts
import { EventInstance } from '../types';

export function generateDailyInstances(
title: string,
startDate: Date,
endDate: Date
): EventInstance[] {
const instances: EventInstance[] = [];
for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
instances.push({ date: d.toISOString().split('T')[0], title });
}
return instances;
}

// src/features/recurring-events/generators/monthly.ts
import { EventInstance } from '../types';
import { hasDay } from '../utils';

export function generateMonthlyInstances(
title: string,
startDate: Date,
endDate: Date
): EventInstance[] {
const instances: EventInstance[] = [];
const day = startDate.getDate();

for (let d = new Date(startDate); d <= endDate; d.setMonth(d.getMonth() + 1)) {
if (hasDay(d.getFullYear(), d.getMonth() + 1, day)) {
const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
instances.push({ date: dateStr, title });
}
}
return instances;
}

// src/features/recurring-events/index.ts
import { RecurringEvent } from './types';
import { RECURRENCE_TYPE } from './constants';
import { generateDailyInstances } from './generators/daily';
import { generateMonthlyInstances } from './generators/monthly';

export function createRecurringEvent(config: Omit<RecurringEvent, 'id'>): RecurringEvent {
const start = new Date(config.startDate);
const end = new Date(config.endDate);

let instances;
switch (config.recurrence) {
case RECURRENCE_TYPE.DAILY:
instances = generateDailyInstances(config.title, start, end);
break;
case RECURRENCE_TYPE.MONTHLY:
instances = generateMonthlyInstances(config.title, start, end);
break;
// ... 다른 타입들
default:
instances = [];
}

return { id: crypto.randomUUID(), ...config, instances };
}
