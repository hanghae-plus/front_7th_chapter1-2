import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

interface RecurringEventDialogProps {
  open: boolean;
  mode: 'edit' | 'delete';
  onClose: () => void;
  onSingle: () => void;
  onSeries: () => void;
}

export function RecurringEventDialog({
  open,
  mode,
  onClose,
  onSingle,
  onSeries,
}: RecurringEventDialogProps) {
  const title = mode === 'edit' ? '반복 일정 수정' : '반복 일정 삭제';
  const question = mode === 'edit' ? '해당 일정만 수정하시겠어요?' : '해당 일정만 삭제하시겠어요?';

  return (
    <Dialog open={open} onClose={onClose} TransitionProps={{ timeout: 0 }}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{question}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button onClick={onSeries} color={mode === 'delete' ? 'error' : 'primary'}>
          아니오
        </Button>
        <Button onClick={onSingle} color={mode === 'delete' ? 'error' : 'primary'}>
          예
        </Button>
      </DialogActions>
    </Dialog>
  );
}
