// ESLint warn 에러가 있음에도 불구하고 value, e 파라미터명을 유지한 이유
// 이 파일은 이벤트 폼의 상태 관리와 관련된 핸들러와 상태 인터페이스를 정의합니다.
// 따라서 value, e 파라미터명을 유지하는 것이 코드의 가독성과 일관성을 높이기 때문입니다.
// 이로 인해 발생하는 기술부채: ESLint의 unused-vars를 error가 아닌 warn로 설정하여 개발 중 에러로 반환해야 하는 상황을 warn으로 유지해야 합니다.
// 이는 개발자가 코드를 작성할 때 불필요한 변수나 파라미터를 제거하는 대신, 경고를 무시하고 코드를 작성할 수 있게 합니다.
// 이는 코드의 품질 저하로 이어질 수 있습니다.

import { ChangeEvent } from 'react';

export interface BasicFieldsFormHandlers {
  setTitle: (value: string) => void;
  setDate: (value: string) => void;
  handleStartTimeChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleEndTimeChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export interface DetailFieldsPropsHandlers {
  setDescription: (value: string) => void;
  setLocation: (value: string) => void;
  setCategory: (value: string) => void;
}

export interface SettingFieldsFormHandlers {
  setIsRepeating: (value: boolean) => void;
  setNotificationTime: (value: number) => void;
}

export interface FormActionsHandlers {
  onSubmit: () => void;
  isEditing: boolean;
}

export interface EventFormHandlers
  extends BasicFieldsFormHandlers,
    DetailFieldsPropsHandlers,
    SettingFieldsFormHandlers,
    FormActionsHandlers {
  isRepeating: boolean;
  editingEvent: boolean;
}
