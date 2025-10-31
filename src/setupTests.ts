import { setupServer } from 'msw/node';
import '@testing-library/jest-dom';

import { handlers } from './__mocks__/handlers';

// ! Hard 여기 제공 안함
/* msw */
export const server = setupServer(...handlers);

vi.stubEnv('TZ', 'UTC');

beforeAll(() => {
  server.listen();
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

beforeEach(() => {
  expect.hasAssertions(); // ? Med: 이걸 왜 써야하는지 물어보자

  vi.setSystemTime(new Date('2025-10-01')); // ? Med: 이걸 왜 써야하는지 물어보자
});

afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});

afterAll(() => {
  vi.resetAllMocks();
  vi.useRealTimers();
  server.close();
});
// Reduce file handle usage from MUI icons during tests to avoid EMFILE on Windows
vi.mock('@mui/icons-material', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  const Stub = (props: Record<string, unknown>) => React.createElement('span', props);
  return {
    __esModule: true,
    Notifications: Stub,
    ChevronLeft: Stub,
    ChevronRight: Stub,
    Delete: Stub,
    Edit: Stub,
    Close: Stub,
    default: Stub,
  };
});
