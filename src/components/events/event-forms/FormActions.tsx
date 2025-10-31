// Form Actions Component for submitting the event form
// 일정 폼 제출을 위한 폼 액션 컴포넌트
import { Button } from '@mui/material';

import { FormActionsHandlers } from '@/types/events/EventFormHandlers.types';

export const FormActions = ({ onSubmit, isEditing }: FormActionsHandlers) => {
  return (
    <Button
      data-testid="event-submit-button"
      onClick={onSubmit}
      variant="contained"
      color="primary"
    >
      {isEditing ? '일정 수정' : '일정 추가'}
    </Button>
  );
};
