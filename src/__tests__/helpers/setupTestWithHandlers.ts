// Helper to setup test handlers with initial events and optional snackbar mock

import { Mock } from 'vitest';

import data from '@/__mocks__/response/realEvents.json' assert { type: 'json' };
import { createIsolatedTestHandlers } from '@/__mocks__/utils/createIsolatedTestHandlers';
import { server } from '@/setupTests';
import { EventProps } from '@/types/events/Event.types';

export const setupTestWithHandlers = (
  initEvents = data.events as EventProps[],
  enqueueSnackbarFn?: Mock
) => {
  const { handlers } = createIsolatedTestHandlers(initEvents);
  server.use(...handlers);
  if (enqueueSnackbarFn) {
    enqueueSnackbarFn.mockClear();
  }
  return handlers;
};
