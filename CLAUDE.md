# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React-based calendar event management application with a focus on testing. This is a Korean language learning assignment project for frontend development (Chapter 1-2).

## Commands

### Development
```bash
pnpm dev                # Run both server and Vite dev server concurrently
pnpm start              # Run Vite dev server only
pnpm server             # Run Express API server (port 3000)
pnpm server:watch       # Run server with watch mode
```

### Testing
```bash
pnpm test               # Run tests in watch mode
pnpm test:ui            # Run tests with Vitest UI
pnpm test:coverage      # Generate test coverage report (outputs to .coverage/)
```

### Build & Lint
```bash
pnpm build              # TypeScript compile + Vite build
pnpm lint               # Run both ESLint and TypeScript checks
pnpm lint:eslint        # Run ESLint only
pnpm lint:tsc           # Run TypeScript compiler checks only
```

## Architecture

### Client-Server Setup

- **Vite Dev Server**: Runs on default Vite port with proxy to `/api` → `http://localhost:3000`
- **Express API Server**: Runs on port 3000, provides REST endpoints for event CRUD operations
- **Data Storage**: File-based JSON storage in `src/__mocks__/response/`
  - `realEvents.json` for development
  - `e2e.json` for E2E tests (controlled by `TEST_ENV` environment variable)

### Application Structure

**Core Data Model** ([src/types.ts](src/types.ts)):
- `Event`: Calendar event with id, date, time range, repeat settings, notifications
- `RepeatInfo`: Repeat configuration (type, interval, endDate)
- `EventForm`: Event data without id (used for creation)

**Custom Hooks Pattern** - All state management extracted to hooks:
- `useEventForm`: Form state, validation, edit mode handling
- `useEventOperations`: Event CRUD operations with API integration
- `useNotifications`: Notification scheduling and display logic
- `useCalendarView`: Calendar navigation, view switching (week/month), holiday fetching
- `useSearch`: Event filtering and search functionality

**Utility Modules**:
- `dateUtils`: Calendar date calculations (week/month views, date formatting)
- `eventOverlap`: Detect overlapping events by date and time range
- `timeValidation`: Validate start/end time logic
- `eventUtils`: Event data manipulation helpers
- `notificationUtils`: Notification timing calculations

**Single Component Design**: [src/App.tsx](src/App.tsx) is a monolithic component (~660 lines) containing all UI rendering logic including:
- Event form (left panel)
- Calendar view switcher (center panel) - renders week or month view
- Event list with search (right panel)
- Overlap warning dialog
- Notification alerts (fixed position)

### Testing Infrastructure

**MSW (Mock Service Worker)**:
- Handlers defined in [src/__mocks__/handlers.ts](src/__mocks__/handlers.ts)
- Mocks API endpoints: GET/POST/PUT/DELETE `/api/events` and bulk operations on `/api/events-list`
- Server setup in [src/setupTests.ts](src/setupTests.ts) with global test configuration
- Uses fake timers with system time set to `2025-10-01` in UTC timezone
- All tests require assertions (`expect.hasAssertions()`)

**Test Organization**:
- Unit tests: `src/__tests__/unit/` and `src/__tests__/hooks/`
- Integration tests: `src/__tests__/medium.integration.spec.tsx`
- Test naming: `easy.*`, `medium.*` prefixes indicate difficulty level
- Coverage reports: Generated to `.coverage/` directory

**Express Server Endpoints**:
- Single event: `/api/events` (GET, POST), `/api/events/:id` (PUT, DELETE)
- Bulk operations: `/api/events-list` (POST, PUT, DELETE)
- Recurring events: `/api/recurring-events/:repeatId` (PUT, DELETE)

### API Integration Notes

The Express server ([server.js](server.js)) handles recurring events specially:
- POST `/api/events-list` generates a shared `repeatId` for all events in a recurring series
- PUT/DELETE `/api/recurring-events/:repeatId` operates on all events with matching `repeat.id`

Note: Recurring event UI is commented out in App.tsx (marked for week 8 assignment).

## Agent Documentation

Agent-related documents are organized in the `.agents/` folder for better maintainability:
- **Feature Specifications**: [.agents/specs/](.agents/specs/) - Detailed feature requirements and API specs (created by 1-feature-designer)
- **Test Design**: [.agents/tests/](.agents/tests/) - Test case specifications in Given-When-Then format (created by 2-test-designer)
- **Development Guides**: [.agents/guides/](.agents/guides/) - Project-wide development guidelines

See [.agents/README.md](.agents/README.md) for the complete documentation structure.

## Development Notes

- UI uses Material-UI (MUI) v7 with Emotion styling
- State notifications use notistack for snackbar display
- The application is fully in Korean (labels, messages, UI text)
- TypeScript strict mode with separated app/node configs
