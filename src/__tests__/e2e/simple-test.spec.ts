import { test, expect } from '@playwright/test';

test('간단한 일정 추가 테스트', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  
  // DOM 구조 확인을 위한 스크린샷
  await page.screenshot({ path: 'debug-1-initial.png', fullPage: true });
  
  // 기본 필드만 입력
  await page.fill('#title', '테스트 일정');
  await page.fill('#date', '2024-01-15');
  await page.fill('#start-time', '10:00');
  await page.fill('#end-time', '11:00');
  
  await page.screenshot({ path: 'debug-2-filled.png', fullPage: true });
  
  // 카테고리 선택 시도
  await page.screenshot({ path: 'debug-3-before-select.png', fullPage: true });
  
  // 실제 DOM 구조를 보기 위해 페이지 내용 출력
  const categoryHTML = await page.locator('#category').innerHTML();
  console.log('Category HTML:', categoryHTML);
  
  // select 요소가 있는지 확인
  const selectCount = await page.locator('select').count();
  console.log('Select count:', selectCount);
  
  // 모든 select 요소의 속성 출력
  for (let i = 0; i < selectCount; i++) {
    const select = page.locator('select').nth(i);
    const id = await select.getAttribute('id');
    const ariaLabel = await select.getAttribute('aria-label');
    console.log(`Select ${i}: id=${id}, aria-label=${ariaLabel}`);
  }
  
  await page.screenshot({ path: 'debug-4-after-select.png', fullPage: true });
  
  // 저장 버튼 클릭
  await page.click('[data-testid="event-submit-button"]');
  
  await page.screenshot({ path: 'debug-5-after-submit.png', fullPage: true });
  
  // 일정 리스트 확인
  const eventList = page.locator('[data-testid="event-list"]');
  const eventListText = await eventList.textContent();
  console.log('Event List Text:', eventListText);
  
  await page.screenshot({ path: 'debug-6-final.png', fullPage: true });
  
  // 실패해도 계속 진행하여 디버깅 정보 수집
});

