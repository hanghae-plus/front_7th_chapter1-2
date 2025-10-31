import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import { useEffect, useRef } from 'react';

interface RecurrenceEditModalProps {
  isOpen: boolean;
  onConfirm: (type: 'single' | 'all') => void;
  onCancel: () => void;
}

export function RecurrenceEditModal({ isOpen, onConfirm, onCancel }: RecurrenceEditModalProps) {
  const yesButtonRef = useRef<HTMLButtonElement>(null);

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
      aria-labelledby="recurrence-edit-dialog-title"
      aria-describedby="recurrence-edit-dialog-description"
    >
      <DialogTitle id="recurrence-edit-dialog-title">반복 일정 수정</DialogTitle>
      <DialogContent>
        <DialogContentText id="recurrence-edit-dialog-description">
          해당 일정만 수정하시겠어요?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          ref={yesButtonRef}
          onClick={() => onConfirm('single')}
          variant="contained"
          color="primary"
          autoFocus
        >
          예
        </Button>
        <Button onClick={() => onConfirm('all')} variant="outlined" color="primary">
          아니오
        </Button>
      </DialogActions>
    </Dialog>
  );
}
