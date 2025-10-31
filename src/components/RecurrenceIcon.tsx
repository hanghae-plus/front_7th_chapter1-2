import RepeatIcon from '@mui/icons-material/Repeat';
import { Box } from '@mui/material';

interface RecurrenceIconProps {
  isRecurring: boolean;
}

export function RecurrenceIcon({ isRecurring }: RecurrenceIconProps) {
  if (!isRecurring) {
    return null;
  }

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        ml: 1,
      }}
      aria-label="반복 일정"
    >
      <RepeatIcon sx={{ fontSize: 16, color: 'primary.main' }} />
    </Box>
  );
}
