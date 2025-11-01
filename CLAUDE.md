# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based calendar application for event management with recurring event support. The application uses Material-UI for components, MSW for API mocking during tests, and Vitest for testing.

## Development Commands

### Running the Application
```bash
# Development mode (runs both server and frontend concurrently)
pnpm dev

# Run frontend only
pnpm start

# Run backend server only
pnpm server

# Run backend with auto-reload
pnpm server:watch
```

### Testing
```bash
# Run tests in watch mode
pnpm test

# Run tests with UI
pnpm test:ui

# Generate coverage report
pnpm test:coverage
```

### Linting and Type Checking
```bash
# Run both ESLint and TypeScript checks
pnpm lint

# Run ESLint only
pnpm lint:eslint

# Run TypeScript compiler check
pnpm lint:tsc
```

### Building
```bash
pnpm build
```

## Architecture

### Backend Server (server.js)
- Express server running on port 3000
- File-based JSON storage in `src/__mocks__/response/`
- Two database files:
  - `realEvents.json` - production data
  - `e2e.json` - test data (when TEST_ENV=e2e)
- API endpoints:
  - `GET /api/events` - fetch all events
  - `POST /api/events` - create single event
  - `PUT /api/events/:id` - update single event
  - `DELETE /api/events/:id` - delete single event
  - `POST /api/events-list` - create multiple events (for recurring)
  - `PUT /api/events-list` - update multiple events
  - `DELETE /api/events-list` - delete multiple events by IDs
  - `PUT /api/recurring-events/:repeatId` - update all events in a recurring series
  - `DELETE /api/recurring-events/:repeatId` - delete all events in a recurring series

### Frontend Architecture

#### Key Hooks
- **useEventOperations** (`src/hooks/useEventOperations.ts`): Manages CRUD operations for events, fetches from API
- **useEventForm** (`src/hooks/useEventForm.ts`): Manages form state and validation for event creation/editing
- **useCalendarView** (`src/hooks/useCalendarView.ts`): Manages calendar view state (month/week), navigation, and holiday data
- **useNotifications** (`src/hooks/useNotifications.ts`): Manages notification display logic based on event times
- **useSearch** (`src/hooks/useSearch.ts`): Filters events based on search term

#### Core Types (`src/types.ts`)
- **Event**: Complete event object with id
- **EventForm**: Event data without id (for creation)
- **RepeatInfo**: Repetition configuration (type, interval, endDate)
- **RepeatType**: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'

#### Utility Modules
- **dateUtils.ts**: Date calculations, week/month generation, formatting
- **eventUtils.ts**: Event-specific operations (generating recurring events)
- **eventOverlap.ts**: Detects overlapping events
- **timeValidation.ts**: Validates time ranges
- **notificationUtils.ts**: Notification logic

### Testing Setup

#### Test Environment
- Testing framework: Vitest with jsdom environment
- UI library: @testing-library/react
- MSW (Mock Service Worker) for API mocking
- Setup file: `src/setupTests.ts`
  - Uses fake timers with system time set to 2025-10-01
  - Timezone set to UTC
  - `expect.hasAssertions()` enforced in beforeEach

#### Test Structure
- **Unit tests**: `src/__tests__/unit/` - test individual utilities
- **Hook tests**: `src/__tests__/hooks/` - test custom hooks
- **Integration tests**: `src/__tests__/medium.integration.spec.tsx` - test full user flows
- Test data: `src/__mocks__/response/events.json`
- MSW handlers: `src/__mocks__/handlers.ts`

## Recurring Events Implementation Notes

The specification in `.github/PULL_REQUEST_TEMPLATE.md` indicates that recurring events are a key feature with specific requirements:

1. **Repeat Types**: daily, weekly, monthly, yearly
   - Monthly on 31st: only creates on days that have 31st (not last day of month)
   - Yearly on leap day (Feb 29): only creates on Feb 29 (not Feb 28 in non-leap years)

2. **Repeat End Date**: Must be specified, max date 2025-12-31

3. **Editing Recurring Events**:
   - "Edit only this event?" → Yes: converts to single event (removes repeat icon)
   - "Edit only this event?" → No: updates entire series (keeps repeat icon)

4. **Deleting Recurring Events**:
   - "Delete only this event?" → Yes: deletes single instance
   - "Delete only this event?" → No: deletes entire series

5. **Overlap Detection**: Recurring events do NOT check for overlap

6. **Visual Indicator**: Recurring events should display with an icon in calendar view

## Important Implementation Details

- The server uses `randomUUID()` from Node's crypto module for generating IDs
- Recurring events in a series share a `repeat.id` field
- Vite proxy forwards `/api` requests to Express server on port 3000
- Frontend uses notistack for snackbar notifications
- All dates/times should respect the UTC timezone in tests
- Event notifications are calculated based on `notificationTime` (in minutes before event)

## Code Style

- TypeScript with strict type checking
- React 19 with functional components and hooks
- ESLint with Prettier integration
- File naming: camelCase for files, PascalCase for components
- Test files use `.spec.ts` or `.spec.tsx` extension
