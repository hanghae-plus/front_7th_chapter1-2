// 반복 이벤트 인터페이스 정의
import { RepeatInfo } from './RepeatInfo.types';

export interface RecurringEvent {
  id: string;
  title: string;
  date: Date;
  repeatInfo: RepeatInfo;
  repeatId: string; // 반복 그룹 식별자
}
