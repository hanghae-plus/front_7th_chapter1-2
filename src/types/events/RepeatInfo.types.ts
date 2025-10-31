export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

// 종료 조건 타입 정의
export type EndConditionType = 'never' | 'date' | 'count';

// 반복 종료 조건 인터페이스
export interface RepeatEndCondition {
  type: EndConditionType;
  endDate?: Date;
  count?: number;
}

export interface RepeatInfoProps {
  type: RepeatType;
  interval: number;
  endDate?: string;
  endCondition?: RepeatEndCondition; // 종료 조건 추가 (호환성을 위해 optional)
  id?: string; // 반복 이벤트 그룹 ID (호환성을 위해 optional)
}
