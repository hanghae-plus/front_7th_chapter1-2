// Initializes events loading on component mount
// 컴포넌트 마운트 시 이벤트 로딩을 초기화합니다.

import { useSnackbar } from 'notistack';

export const initEvents =
  (
    fetchEvents: () => Promise<void>,
    enqueueSnackbar: ReturnType<typeof useSnackbar>['enqueueSnackbar']
  ) =>
  async () => {
    await fetchEvents();
    enqueueSnackbar('일정 로딩 완료!', { variant: 'info' });
  };
