# AI Calendar Application - Copilot Instructions

## Project Overview
This is a Korean calendar application built with React + TypeScript, featuring event management, notifications, and calendar views. The app uses a full-stack architecture with Express.js backend and file-based storage.

## Architecture & Key Components

### Frontend Structure
- **App.tsx**: Main component with form, calendar views (week/month), and event list
- **Hooks Pattern**: Custom hooks for separated concerns:
  - `useEventOperations`: API calls and CRUD operations
  - `useCalendarView`: View state and navigation logic
  - `useEventForm`: Form state and validation
  - `useNotifications`: Time-based notification system
  - `useSearch`: Event filtering and search
- **Utils**: Pure functions for date operations, overlap detection, validation

### Backend (server.js)
- Express server with REST API (`/api/events`, `/api/events-list`, `/api/recurring-events`)
- File-based storage using JSON files in `src/__mocks__/response/`
- Environment-based DB switching (`e2e.json` vs `realEvents.json`)
- UUID generation for event IDs

### State Management Pattern
No external state management - uses React hooks with prop drilling and custom hooks for shared logic.

## Development Workflows

### Running the Application
```bash
pnpm dev          # Runs both server and client with hot reload
pnpm server       # Backend only
pnpm start        # Frontend only
```

### Testing Strategy
```bash
pnpm test         # Vitest with watch mode
pnpm test:ui      # Visual test runner
pnpm test:coverage # Coverage reports
```

**Test Setup**: Uses MSW (Mock Service Worker) with handlers in `src/__mocks__/handlers.ts`. All tests run with:
- Fixed system time: `2025-10-01`
- UTC timezone
- `expect.hasAssertions()` requirement in every test

### Testing Patterns
- **Unit tests**: Pure function testing (utils)
- **Hook tests**: Using `renderHook` from `@testing-library/react`
- **Integration tests**: Full component testing with MSW
- **Test data**: Centralized in `src/__mocks__/response/events.json`

## Project-Specific Conventions

### TypeScript Types
- `Event`: Has `id`, extends `EventForm`
- `EventForm`: Form data without ID
- `RepeatInfo`: Nested repeat configuration (type, interval, endDate)

### Date/Time Handling
- All dates stored as ISO strings (`YYYY-MM-DD`)
- Time stored as 24-hour format strings (`HH:MM`)
- Date operations centralized in `utils/dateUtils.ts`
- Holiday fetching from external API for each month

### Validation & Error Handling
- Form validation happens on blur events
- Time validation with custom error messages
- Overlap detection before saving events
- User confirmation dialogs for overlapping events

### UI Patterns
- Material-UI components throughout
- Korean language interface
- Notification system using notistack
- Visual indicators for notified events (red styling)
- Fixed layout: form (20%), calendar (50%), event list (30%)

### Event Operations
- Create/Read/Update/Delete through REST API
- Bulk operations for recurring events
- File system persistence (not database)
- Automatic refetch after mutations

## Key Integration Points

### API Endpoints
- `GET /api/events` - Fetch all events
- `POST /api/events` - Create single event  
- `PUT /api/events/:id` - Update single event
- `DELETE /api/events/:id` - Delete single event
- Bulk endpoints for recurring event management

### Mock Setup (Testing)
MSW intercepts API calls. Test data in `src/__mocks__/response/events.json` with predefined events for consistent testing.

### Build & Deployment
- Vite for bundling and dev server
- TypeScript compilation with strict mode
- ESLint + Prettier configuration
- Proxy setup for API calls (`/api` → `localhost:3000`)

## Development Notes

### Commented Features
Recurring events UI is commented out but backend logic exists - intentionally incomplete per assignment requirements.

### Korean Localization
All user-facing text in Korean. Categories: `['업무', '개인', '가족', '기타']`

### Time Zones
Fixed to UTC in tests, but production handles local timezone.
