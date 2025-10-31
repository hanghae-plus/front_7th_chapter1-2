// 반복 일정 삭제 확인 다이얼로그 컴포넌트
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
import { useEffect } from 'react';

import { DeleteConfirmDialogProps } from '@/types/recurring/DeleteTypes';

export const DeleteConfirmDialog = ({
  open,
  eventTitle,
  onDeleteSingle,
  onDeleteAll,
  onClose,
  loading = false,
}: DeleteConfirmDialogProps) => {
  // ESC 키 처리는 Material-UI Dialog가 자동으로 처리
  useEffect(() => {
    if (open) {
      // 다이얼로그가 열릴 때 첫 번째 버튼에 포커스
      const timer = setTimeout(() => {
        const firstButton = document.querySelector(
          '[data-testid="delete-single-button"]'
        ) as HTMLElement;
        if (firstButton) {
          firstButton.focus();
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      disableEscapeKeyDown={loading}
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="delete-dialog-title">일정 삭제</DialogTitle>

      <DialogContent>
        <Typography
          id="delete-dialog-description"
          variant="body1"
          paragraph
        >
          해당 일정만 삭제하시겠어요?
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          paragraph
        >
          전체 반복 일정을 삭제하려면 "아니오"를 선택해주세요.
        </Typography>

        <Typography
          variant="body2"
          fontWeight="bold"
        >
          "{eventTitle}"
        </Typography>
      </DialogContent>

      <DialogActions>
        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <CircularProgress
              size={20}
              role="progressbar"
            />
          </Box>
        )}

        <Button
          data-testid="delete-single-button"
          onClick={onDeleteSingle}
          disabled={loading}
          variant="contained"
          color="primary"
          autoFocus
        >
          예 (이 일정만)
        </Button>

        <Button
          onClick={onDeleteAll}
          disabled={loading}
          variant="contained"
          color="warning"
        >
          아니오 (전체 반복 일정)
        </Button>

        <Button
          onClick={onClose}
          disabled={loading}
          variant="outlined"
        >
          취소
        </Button>
      </DialogActions>
    </Dialog>
  );
};
