export function createRecurringEvent(config) {
return { ...config, instances: [] };
}
