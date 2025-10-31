import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

interface EditOptionsDialogProps {
  open: boolean;
  onClose: () => void;
  onEditSingle: () => void;
  onEditAll: () => void;
  title?: string;
  message?: string;
}

const EditOptionsDialog = ({
  open,
  onClose,
  onEditSingle,
  onEditAll,
  title = '반복 일정 수정',
  message = '해당 일정만 수정하시겠어요?',
}: EditOptionsDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onEditSingle}>예</Button>
        <Button onClick={onEditAll}>아니오</Button>
        <Button onClick={onClose}>취소</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditOptionsDialog;
