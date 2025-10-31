// Export all handlers from individual files

import { deleteEventsHandler } from '@/__mocks__/handlers/delete';
import { getEventsHandler } from '@/__mocks__/handlers/get';
import { postEventsHandler } from '@/__mocks__/handlers/post';
import { putEventsHandler } from '@/__mocks__/handlers/put';

export const handlers = [
  deleteEventsHandler,
  getEventsHandler,
  postEventsHandler,
  putEventsHandler,
];
