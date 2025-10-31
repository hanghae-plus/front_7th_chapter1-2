// SettingsFieldsProps.type.ts를 extends 하지 않고 repeat와 notificationTime을 직접 포함하도록 수정한 이유
// EventForm이 SettingsFieldsProps의 모든 필드를 포함하지 않기 때문입니다.

import { BasicFieldsProps } from './BasicFieldsProps.types';
import { DetailFieldsProps } from './DetailFieldsProps.types';
import { RepeatInfoProps } from './RepeatInfo.types';

export interface EventFormProps extends BasicFieldsProps, DetailFieldsProps {
  repeat: RepeatInfoProps;
  notificationTime: number; // 분 단위로 저장
}

// 별칭 타입 - 테스트 호환성을 위해 추가
export type EventForm = EventFormProps;
