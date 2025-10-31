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
  type: 'edit' | 'delete';
  onClose: () => void;
  onSingle: () => void;
  onAll: () => void;
}

export function RecurringEventDialog({
  open,
  type,
  onClose,
  onSingle,
  onAll,
}: RecurringEventDialogProps) {
  const title = type === 'edit' ? '반복 일정 수정' : '반복 일정 삭제';
  const message = type === 'edit' ? '해당 일정만 수정하시겠어요?' : '해당 일정만 삭제하시겠어요?';

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onSingle}>예</Button>
        <Button onClick={onAll}>아니오</Button>
      </DialogActions>
    </Dialog>
  );
}
