// 반복 일정 수정 다이얼로그 훅
import { useState, useCallback } from 'react';

import { Event } from '@/types/events/Event.types';
import { EventForm } from '@/types/events/EventForm.types';
import { PendingEdit } from '@/types/recurring/EditTypes';

/**
 * 반복 일정 수정 다이얼로그 상태 관리 훅
 */
export const useRecurringEditDialog = () => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingEdit, setPendingEdit] = useState<PendingEdit | null>(null);

  /**
   * 다이얼로그 표시
   * @param event 수정할 이벤트
   * @param updatedData 업데이트할 데이터
   */
  const showDialog = useCallback(
    (event: Event, updatedData: Partial<EventForm>) => {
      setPendingEdit({ event, updatedData });
      setShowConfirmDialog(true);
    },
    []
  );

  /**
   * 다이얼로그 닫기
   */
  const closeDialog = useCallback(() => {
    setShowConfirmDialog(false);
    setPendingEdit(null);
  }, []);

  /**
   * 다이얼로그 상태 초기화
   */
  const resetDialog = useCallback(() => {
    setShowConfirmDialog(false);
    setPendingEdit(null);
  }, []);

  return {
    showConfirmDialog,
    pendingEdit,
    showDialog,
    closeDialog,
    resetDialog,
  };
};
