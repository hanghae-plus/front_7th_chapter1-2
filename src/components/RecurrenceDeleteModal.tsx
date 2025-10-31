import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import { useEffect, useRef } from 'react';

interface RecurrenceDeleteModalProps {
  isOpen: boolean;
  onConfirm: (type: 'single' | 'all') => void;
  onCancel: () => void;
}

export function RecurrenceDeleteModal({ isOpen, onConfirm, onCancel }: RecurrenceDeleteModalProps) {
  const yesButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      // 모달이 열릴 때 첫 번째 버튼에 포커스
      setTimeout(() => {
        yesButtonRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog
      open={isOpen}
      onClose={onCancel}
      aria-labelledby="recurrence-delete-dialog-title"
      aria-describedby="recurrence-delete-dialog-description"
    >
      <DialogTitle id="recurrence-delete-dialog-title">반복 일정 삭제</DialogTitle>
      <DialogContent>
        <DialogContentText id="recurrence-delete-dialog-description">
          해당 일정만 삭제하시겠어요?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          ref={yesButtonRef}
          onClick={() => onConfirm('single')}
          variant="contained"
          color="error"
        >
          예
        </Button>
        <Button onClick={() => onConfirm('all')} variant="outlined" color="error">
          아니오
        </Button>
      </DialogActions>
    </Dialog>
  );
}
