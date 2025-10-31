# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
모든 질문과 요청에 대해 **무조건 한국어로만** 답변합니다.

## Project Overview

This is a **React calendar application** with recurring event support. It's built using React 19, TypeScript, Vite, and Material-UI, with a focus on test-driven development using Vitest and MSW (Mock Service Worker).

## Development Commands

### Running the Application
- `pnpm dev` - Start both the development server (Vite) and the API server concurrently
- `pnpm start` - Start only the Vite dev server (port 5173, proxies `/api` to port 3000)
- `pnpm server` - Start only the Express API server (port 3000)
- `pnpm server:watch` - Start API server with auto-reload on changes

### Testing
- `pnpm test` - Run Vitest in watch mode (interactive)
- `pnpm test:ui` - Open Vitest UI for visual test exploration
- `pnpm test:coverage` - Generate test coverage report in `./.coverage`
- **Single test file**: `pnpm test <filename>` or `pnpm test <pattern>`

### Building and Linting
- `pnpm build` - TypeScript compilation + Vite production build
- `pnpm lint` - Run both ESLint and TypeScript checks
- `pnpm lint:eslint` - ESLint only
- `pnpm lint:tsc` - TypeScript type checking only

## Architecture

### API Server (server.js)
Express server that persists events to JSON files:
- `src/__mocks__/response/realEvents.json` - Development data
- `src/__mocks__/response/e2e.json` - E2E test data (when `TEST_ENV=e2e`)

**Key Endpoints:**
- `GET/POST /api/events` - Single event operations
- `PUT/DELETE /api/events/:id` - Update/delete single event
- `POST/PUT/DELETE /api/events-list` - Batch operations
- `PUT/DELETE /api/recurring-events/:repeatId` - Recurring series operations

### Frontend Architecture

**State Management Pattern:**
- Custom hooks encapsulate all business logic and state
- App.tsx is primarily a presentation layer that composes hooks
- Each hook has a single, well-defined responsibility

**Core Hooks:**
- `useEventOperations` - CRUD operations for events, handles recurring event logic
- `useEventForm` - Form state and validation for event creation/editing
- `useCalendarView` - Calendar navigation (week/month views), holiday fetching
- `useNotifications` - Event notification system based on time
- `useSearch` - Event filtering and search

**Recurring Events:**
- Events with `repeat.type !== 'none'` are recurring
- All events in a series share the same `repeat.recurrenceId`
- `generateRecurringEvents()` in `src/utils/recurringEventUtils.ts` creates event instances
- Edit/delete operations offer "single" or "all" options via modals

**Key Components:**
- `RecurrenceEditModal` - Prompt user when editing recurring events (this event vs. all events)
- `RecurrenceDeleteModal` - Prompt user when deleting recurring events
- `RecurrenceSelector` - UI for selecting repeat type and interval

### Testing Strategy

**Test Organization:**
- `src/__tests__/unit/` - Pure utility function tests
- `src/__tests__/hooks/` - Hook behavior tests (using React Testing Library)
- `src/__tests__/components/` - Component tests
- `src/__tests__/integration/` - Full feature integration tests

**MSW Setup:**
- Test handlers: `src/__mocks__/handlers.ts` (for unit/integration tests)
- Real server: `server.js` (for development)
- MSW server initialized in `src/setupTests.ts`
- Test environment uses `jsdom` and fake timers (`vi.useFakeTimers()`)
- System time is set to `2025-10-01` in `setupTests.ts` for consistent test behavior
- All tests run in UTC timezone (`TZ=UTC`)

**Important Testing Notes:**
- All tests have `testTimeout: 30000` (30 seconds)
- Tests use `beforeEach(() => { expect.hasAssertions() })` to ensure assertions exist
- When writing tests, always account for the fixed system time of `2025-10-01`

### Type System

Core types are defined in `src/types.ts`:
- `Event` - Full event object with `id`
- `EventForm` - Event data without `id` (for creation)
- `RepeatInfo` - Recurring event configuration
- `RepeatType` - `'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'`

### Date Handling

Uses `date-fns` library extensively. Key utilities in `src/utils/dateUtils.ts`:
- `formatDate`, `formatMonth`, `formatWeek` - Display formatting
- `getWeekDates`, `getWeeksAtMonth` - Calendar view data
- `getEventsForDay` - Filter events for a specific day

### Custom Agents

This repository has custom AI agents in `.claude/agents/`:
- `implementer.md` - Feature implementation
- `test-writer.md` - Test creation
- `test-designer.md` - Test scenario design
- `qa.md` - Quality assurance
- `refactorer.md` - Code refactoring
- `pm.md` - Project management
- `doc-keeper.md` - Documentation management
- `orchestrator.md` - Agent coordination

These agents follow strict personas and workflows defined in `.claude/docs/workflows.md` and have associated checklists in `.claude/docs/check-lists/`.

## Key Patterns

### Adding Recurring Events
1. User fills form and enables "반복 일정" checkbox
2. `generateRecurringEvents()` creates all event instances with same `recurrenceId`
3. Each instance is POSTed to `/api/events`

### Editing Recurring Events
1. User clicks edit on a recurring event
2. `RecurrenceEditModal` asks: "이 일정만" (single) vs "모든 일정" (all)
3. If "single": event's `repeat.type` is set to `'none'`, removing it from series
4. If "all": all events with matching `recurrenceId` are updated via PUT requests

### Deleting Recurring Events
1. Similar modal flow to editing
2. If "all": all events with matching `recurrenceId` are deleted

### Event Overlap Detection
- `findOverlappingEvents()` in `src/utils/eventOverlap.ts`
- Checks if events overlap by date and time range
- Dialog prompts user to confirm or cancel when overlap detected

## Development Notes

- Use Material-UI components (`@mui/material`) for all UI
- Notifications use `notistack` library (`useSnackbar` hook)
- Vite proxies `/api` requests to `localhost:3000` in development
- When writing tests for recurring events, ensure MSW handlers are updated if needed
- Tests should follow the existing pattern: unit tests for utils, React Testing Library for hooks/components
