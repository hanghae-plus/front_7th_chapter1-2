import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

interface RecurringDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onDeleteSingle: () => void;
  onDeleteAll: () => void;
}

export function RecurringDeleteDialog({
  open,
  onClose,
  onDeleteSingle,
  onDeleteAll,
}: RecurringDeleteDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>반복 일정 삭제</DialogTitle>
      <DialogContent>
        <DialogContentText>해당 일정만 삭제하시겠어요?</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onDeleteAll}>아니오</Button>
        <Button onClick={onDeleteSingle}>예</Button>
      </DialogActions>
    </Dialog>
  );
}
