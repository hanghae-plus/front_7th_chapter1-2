// Helper to expect a toast message with specific variant

import { Mock } from 'vitest';

export const expectToastMessage = (
  enqueueSnackbarFn: Mock,
  message: string,
  variant: 'error' | 'info' | 'success'
) => expect(enqueueSnackbarFn).toHaveBeenCalledWith(message, { variant });
