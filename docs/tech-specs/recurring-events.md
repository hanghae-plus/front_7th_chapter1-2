# Tech Spec: Recurring Events

scope: align with `docs/recurring-function-spec.md` v1.1
owner: Architect

## Goals
- Support daily/weekly/monthly/yearly recurrence with edge rules (31st, Feb 29)
- End conditions: none or until date
- Edit/delete: single vs series
- Visual mark for recurring items

## Data Model (frontend)
- RepeatInfo: { type: 'none'|'daily'|'weekly'|'monthly'|'yearly'; interval: number; endDate?: string }
- Event extends EventForm with id: string

## API Contract (backend)
- GET /api/events → { events: Event[] }
- POST /api/events (single)
- POST /api/events-list (bulk create series, attach repeat.id)
- PUT /api/recurring-events/:repeatId (update series)
- DELETE /api/recurring-events/:repeatId (delete series)

## Series Rules
- Monthly 31st: skip months without 31
- Yearly Feb 29: only leap years

## NFR & Security
- Performance: render < 3s, operations < 500ms
- Consistency: UI reflects updates immediately
- Safety: input validation on date/time/range

## Open Points
- Preview generation limits (range cap)
- Timezone considerations (future work)
