// 반복 일정 수정 확인 다이얼로그 컴포넌트
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  Box,
} from '@mui/material';
import React from 'react';

import { EditConfirmDialogProps } from '@/types/recurring/EditTypes';

const EditConfirmDialog: React.FC<EditConfirmDialogProps> = ({
  open,
  onClose,
  onEditSingle,
  onEditAll,
  eventTitle,
  loading = false,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="edit-confirm-dialog-title"
      aria-describedby="edit-confirm-dialog-description"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="edit-confirm-dialog-title">반복 일정 수정</DialogTitle>

      <DialogContent>
        <Typography
          id="edit-confirm-dialog-description"
          gutterBottom
        >
          해당 일정만 수정하시겠어요?
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
        >
          "{eventTitle}"의 수정 범위를 선택해주세요.
        </Typography>

        {loading && (
          <Box
            display="flex"
            justifyContent="center"
            mt={2}
          >
            <CircularProgress role="progressbar" />
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onEditSingle}
          disabled={loading}
          autoFocus
        >
          예 (해당 일정만)
        </Button>
        <Button
          onClick={onEditAll}
          disabled={loading}
        >
          아니오 (전체 일정)
        </Button>
        <Button
          onClick={onClose}
          disabled={loading}
        >
          취소
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditConfirmDialog;
