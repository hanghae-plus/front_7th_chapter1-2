import { useSnackbar } from 'notistack';
import { useState, useCallback } from 'react';

interface UseEventfavoriteReturn {
  loading: boolean;
  error: string | null;
  handleAction: (eventId: string, data: Record<string, unknown>) => Promise<void>;
}

export const useEventfavorite = (): UseEventfavoriteReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  // 공통 API 호출 함수
  const makeApiCall = useCallback(
    async (endpoint: string, method: string, data?: Record<string, unknown>) => {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    },
    []
  );

  const handleAction = useCallback(
    async (eventId: string, data: Record<string, unknown>) => {
      try {
        setLoading(true);
        setError(null);

        await makeApiCall('/api/endpoint', 'POST', data);

        enqueueSnackbar('작업이 완료되었습니다.', { variant: 'success' });
      } catch (error) {
        console.error('Error in handleAction:', error);
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
        setError(errorMessage);
        enqueueSnackbar('작업 실패', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    },
    [makeApiCall, enqueueSnackbar]
  );

  return {
    loading,
    error,
    handleAction,
  };
};
