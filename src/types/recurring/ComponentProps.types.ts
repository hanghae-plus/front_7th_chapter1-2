// 컴포넌트 Props 타입 정의
import { RepeatInfo } from './RepeatInfo.types';

export interface RecurringSelectorProps {
  value?: RepeatInfo;
  onChange: (repeatInfo: RepeatInfo | null) => void;
  disabled?: boolean;
  className?: string;
  hideEndDate?: boolean;
  maxEndDate?: string;
  intervalMin?: number;
  intervalMax?: number;
}
