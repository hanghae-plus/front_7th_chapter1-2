// 반복 정보 인터페이스 정의
import { RepeatType } from './RepeatType.types';

export interface RepeatInfo {
  type: RepeatType;
  interval: number; // 1 이상의 양의 정수
  endDate?: Date;
}
