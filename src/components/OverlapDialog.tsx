// Dialog component to warn users about overlapping events when scheduling new ones
// 사용자가 새 일정을 예약할 때 겹치는 일정에 대해 경고하는 대화 상자 구성 요소

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from '@mui/material';

import {
  OverlapDialogHandlerProps,
  OverlapDialogProps,
} from '@/types/OverlapDialog.types';

export const OverlapDialog = ({
  isOpen,
  onClose,
  overlappingEvents,
  onContinue,
}: OverlapDialogProps & OverlapDialogHandlerProps) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
    >
      <DialogTitle>일정 겹침 경고</DialogTitle>
      <DialogContent>
        <DialogContentText>
          다음 일정과 겹칩니다:
          {overlappingEvents.map((event) => (
            <Typography
              key={event.id}
              component="span"
              display="block"
            >
              {event.title} ({event.date} {event.startTime}-{event.endTime})
            </Typography>
          ))}
          계속 진행하시겠습니까?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button
          color="error"
          onClick={onContinue}
        >
          계속 진행
        </Button>
      </DialogActions>
    </Dialog>
  );
};
