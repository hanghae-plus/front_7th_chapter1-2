import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import App from '../App.tsx';

describe('Recurring - Repeat Type Selection (integration)', () => {
  it('토글을 켜면 반복 유형 드롭다운이 나타난다', async () => {
    render(React.createElement(App));

    // MUI Checkbox를 role로 찾기
    const toggle = screen.getByRole('checkbox', { name: '반복 일정' });
    expect(toggle).not.toBeChecked();

    // 토글 클릭
    fireEvent.click(toggle);

    expect(toggle).toBeChecked();

    // 반복 유형 드롭다운 나타나는지 확인
    const repeatTypeLabel = await screen.findByText('반복 유형');
    expect(repeatTypeLabel).toBeInTheDocument();
  });
});
