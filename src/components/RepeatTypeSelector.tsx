import { FormControl, FormLabel, MenuItem, Select } from '@mui/material';
import { RepeatType } from '../types';

interface RepeatTypeSelectorProps {
  value: RepeatType;
  onChange: (v: RepeatType) => void;
}

/**
 * 반복 유형(매일/매주/매월/매년) 선택 컴포넌트
 * - 라벨, 역할/aria-label 접근성 연결
 * - 테스트 및 접근성 일관성 보장(옵션 aria-label: *-option)
 */
export default function RepeatTypeSelector({ value, onChange }: RepeatTypeSelectorProps) {
  return (
    <FormControl fullWidth>
      <FormLabel id="repeat-type-label">반복 유형</FormLabel>
      <Select
        size="small"
        value={value}
        onChange={(e) => onChange(e.target.value as RepeatType)}
        aria-labelledby="repeat-type-label"
        aria-label="반복 유형"
      >
        <MenuItem value="daily" aria-label="daily-option">
          매일
        </MenuItem>
        <MenuItem value="weekly" aria-label="weekly-option">
          매주
        </MenuItem>
        <MenuItem value="monthly" aria-label="monthly-option">
          매월
        </MenuItem>
        <MenuItem value="yearly" aria-label="yearly-option">
          매년
        </MenuItem>
      </Select>
    </FormControl>
  );
}
