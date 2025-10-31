// 반복 일정 수정 메인 훅 (리팩터링됨)
import { useCallback } from 'react';

import { useRecurringEditAPI } from './useRecurringEditAPI';
import { useRecurringEditDialog } from './useRecurringEditDialog';

import { Event } from '@/types/events/Event.types';
import { EventForm } from '@/types/events/EventForm.types';
import { validateEditPermissions } from '@/utils/recurring/recurringEdit';

/**
 * 반복 일정 수정 메인 훅
 * 다이얼로그 상태와 API 호출을 조합하여 완전한 수정 기능 제공
 *
 * @param eventList 현재 이벤트 목록
 * @param onUpdate 이벤트 목록 업데이트 콜백
 */
export const useRecurringEdit = (
  eventList: Event[],
  onUpdate: (events: Event[]) => void
) => {
  const api = useRecurringEditAPI(eventList, onUpdate);
  const dialog = useRecurringEditDialog();

  /**
   * 편집 시작 - 권한 확인 후 다이얼로그 표시 또는 직접 수정
   * @param event 수정할 이벤트
   * @param updatedData 업데이트할 데이터
   */
  const startEdit = useCallback(
    async (event: Event, updatedData: Partial<EventForm>) => {
      const permissions = validateEditPermissions(event);

      if (permissions.requiresConfirmation) {
        // 반복 이벤트인 경우 확인 다이얼로그 표시
        dialog.showDialog(event, updatedData);
      } else {
        // 단일 이벤트인 경우 바로 업데이트
        await api.performSingleEdit(event, updatedData);
      }
    },
    [api.performSingleEdit, dialog.showDialog]
  );

  /**
   * 단일 수정 처리
   */
  const handleEditSingle = useCallback(async () => {
    if (!dialog.pendingEdit) return;

    dialog.closeDialog();
    await api.performSingleEdit(
      dialog.pendingEdit.event,
      dialog.pendingEdit.updatedData
    );
  }, [dialog.pendingEdit, dialog.closeDialog, api.performSingleEdit]);

  /**
   * 전체 수정 처리
   */
  const handleEditAll = useCallback(async () => {
    if (!dialog.pendingEdit) return;

    dialog.closeDialog();
    await api.performAllEdit(
      dialog.pendingEdit.event.repeat.id!,
      dialog.pendingEdit.updatedData
    );
  }, [dialog.pendingEdit, dialog.closeDialog, api.performAllEdit]);

  /**
   * 취소 처리
   */
  const handleCancel = useCallback(() => {
    dialog.resetDialog();
  }, [dialog.resetDialog]);

  return {
    isLoading: api.isLoading,
    error: api.error,
    showConfirmDialog: dialog.showConfirmDialog,
    pendingEdit: dialog.pendingEdit,
    startEdit,
    handleEditSingle,
    handleEditAll,
    handleCancel,
  };
};
