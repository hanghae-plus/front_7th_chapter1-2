const fs = require('fs');
const path = require('path');

module.exports = async function testWritingAgent({ feature, outDir }) {
  if (!outDir) throw new Error('outDir required');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const testPath = path.join(outDir, 'use-favorite-star-ui.spec.ts');
  const content = `import { render, fireEvent, screen } from '@testing-library/react';
import App from '../../src/App';

describe('이벤트 즐겨찾기 UI(별 버튼) 기능', () => {
  it('이벤트 카드에 즐겨찾기(별) 버튼이 나온다', () => {
    render(<App />);
    expect(screen.getAllByLabelText('즐겨찾기').length).toBeGreaterThan(0);
  });
  it('별 버튼 클릭시 토글되어 상태 및 UI에 반영된다', () => {
    render(<App />);
    const starBtns = screen.getAllByLabelText('즐겨찾기');
    fireEvent.click(starBtns[0]);
    expect(
      starBtns[0].querySelector('svg')?.getAttribute('data-testid')
    ).toBe('StarIcon');
    fireEvent.click(starBtns[0]);
    expect(
      starBtns[0].querySelector('svg')?.getAttribute('data-testid')
    ).toBe('StarBorderIcon');
  });
});
`;
  fs.writeFileSync(testPath, content, 'utf-8');
  return { testPath };
};
