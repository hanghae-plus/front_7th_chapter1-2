import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

interface RecurringEventUpdateDialogProps {
  open: boolean;
  onClose: () => void;
  onYes: () => void;
  onNo: () => void;
}

export const RecurringEventUpdateDialog = ({
  open,
  onClose,
  onYes,
  onNo,
}: RecurringEventUpdateDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="recurring-event-update-dialog-title">
      <DialogTitle id="recurring-event-update-dialog-title">반복 이벤트 수정</DialogTitle>
      <DialogContent>
        <DialogContentText>이 이벤트만 수정하시겠습니까?</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onNo} color="primary" variant="outlined">
          아니오
        </Button>
        <Button onClick={onYes} color="primary" variant="contained" autoFocus>
          예
        </Button>
      </DialogActions>
    </Dialog>
  );
};
