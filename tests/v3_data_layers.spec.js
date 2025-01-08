const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('https://enviroatlas.epa.gov/enviroatlas/interactivemap/?eaLayer=eaLyrNum_98');
});

test('Acres of land enrolled in CRP', async ({ page }) => {
    // Expect a title "to contain" a substring.
    test.slow();
    await page.locator('id=widgets_LayerList_Widget_17_panel');
    await page.locator('id=widgets_LayerList_Widget_17');
    await page.screenshot({ path: 'C:/Users/TLOMBA01/Documents/EnviroAtlas/EnviroAtlas_v4/tests/screenshot.png' });
  });