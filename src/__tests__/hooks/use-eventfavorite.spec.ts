import { renderHook, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { useEventfavorite } from '../../hooks/use-eventfavorite.ts';
import { server } from '../../setupTests.ts';

const enqueueSnackbarFn = vi.fn();

vi.mock('notistack', async () => {
  const actual = await vi.importActual('notistack');
  return {
    ...actual,
    useSnackbar: () => ({
      enqueueSnackbar: enqueueSnackbarFn,
    }),
  };
});

describe('useEventfavorite', () => {
  beforeEach(() => {
    server.resetHandlers();
    enqueueSnackbarFn.mockClear();
  });

  it('시나리오 1 - 정상 처리', async () => {
    server.use(
      http.post('/api/endpoint', () => {
        return HttpResponse.json({ success: true });
      })
    );

    const { result } = renderHook(() => useEventfavorite());

    await act(async () => {
      await result.current.handleAction('test-id', { title: 'test-title' });
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
