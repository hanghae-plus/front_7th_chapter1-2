// 네트워크 에러 감지 및 처리 유틸리티

/**
 * 네트워크 에러인지 확인하는 함수
 * @param error 확인할 에러 객체
 * @returns 네트워크 에러 여부
 */
export const isNetworkError = (error: Error): boolean => {
  return (
    error.message === 'Network Error' ||
    error.message?.includes('Network Error') ||
    (error as Error & { cause?: { message?: string } }).cause?.message ===
      'Network Error' ||
    (error.name === 'TypeError' &&
      error.message?.includes('Failed to fetch')) ||
    (error.name === 'TypeError' && error.message?.includes('fetch')) ||
    !navigator.onLine
  );
};

/**
 * 에러에 따른 사용자 메시지 반환
 * @param error 에러 객체
 * @param defaultMessage 기본 에러 메시지
 * @returns 사용자에게 표시할 에러 메시지
 */
export const getErrorMessage = (
  error: Error,
  defaultMessage: string
): string => {
  return isNetworkError(error)
    ? '네트워크 오류가 발생했습니다'
    : defaultMessage;
};
