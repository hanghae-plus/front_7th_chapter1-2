// src/features/recurring-events/utils.ts
export function hasDay(year: number, month: number, day: number): boolean {
const date = new Date(year, month - 1, day);
return date.getMonth() === month - 1 && date.getDate() === day;
}

export function isLeapYear(year: number): boolean {
return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

// src/features/recurring-events/index.ts
import { RecurringEvent, EventInstance } from './types';
import { hasDay, isLeapYear } from './utils';

export function createRecurringEvent(config: Omit<RecurringEvent, 'id'>): RecurringEvent {
const instances: EventInstance[] = [];
const start = new Date(config.startDate);
const end = new Date(config.endDate);

if (config.recurrence === 'daily') {
for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
instances.push({
date: d.toISOString().split('T')[0],
title: config.title
});
}
} else if (config.recurrence === 'monthly') {
const day = start.getDate();
for (let d = new Date(start); d <= end; d.setMonth(d.getMonth() + 1)) {
// 매월 31일 규칙: 31일이 없는 달은 건너뜀
if (hasDay(d.getFullYear(), d.getMonth() + 1, day)) {
instances.push({
date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
title: config.title
});
}
}
}
// ... 다른 recurrence 타입 구현

return {
id: crypto.randomUUID(),
...config,
instances
};
}
