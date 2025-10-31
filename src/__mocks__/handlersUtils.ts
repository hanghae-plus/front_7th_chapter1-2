// Mock handlers utilities for parallel test execution
// 병렬 테스트 실행을 위한 Mock handlers 유틸리티

import { createIsolatedTestHandlers } from './utils/createIsolatedTestHandlers';

import { EventProps } from '@/types/events/Event.types';

// Create setup functions for mock handlers with isolated event data
// 격리된 이벤트 데이터를 가진 mock handler 설정 함수들 생성
export const setupMockHandlerCreation = (initEvents = [] as EventProps[]) => {
  return () => {
    const { handlers } = createIsolatedTestHandlers(initEvents);
    return handlers.find((h) => h.info.method === 'POST')!;
  };
};

export const setupMockHandlerUpdating = (initEvents = [] as EventProps[]) => {
  return () => {
    const { handlers } = createIsolatedTestHandlers(initEvents);
    return handlers.find((h) => h.info.method === 'PUT')!;
  };
};

export const setupMockHandlerDeletion = (initEvents = [] as EventProps[]) => {
  return () => {
    const { handlers } = createIsolatedTestHandlers(initEvents);
    return handlers.find((h) => h.info.method === 'DELETE')!;
  };
};
