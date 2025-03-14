// @ts-check
// had to change from demo app 
// const { test, expect } = require('@playwright/test');
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/ea/client');
});

test('has title', async ({ page }) => {
    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle("Enviro Atlas");
});

test.describe('Data Catalog expand and collapse', () => {
    test('data catalog is open', async ({ page }) => {
        // Expect the data catalog is open.
        await expect(page.locator('id=data-catalog')).toHaveAttribute("open");
    });

    test('should close data catalog panel when collapse clicked', async ({ page }) => {
        // Click collapse fab
        const fab = page.getByTestId('data-catalog-fab');
        await fab.click();
        await expect(page.locator('id=data-catalog')).toHaveAttribute("hidden");
    });

    test('should open data catalog panel when expand clicked', async ({ page }) => {
        // Click collapse fab
        const fab = page.getByTestId('data-catalog-fab');
        await fab.click();
        // Click expand action
        const expand = page.getByTestId('data-catalog-expand');
        await expand.click();
        await expect(page.locator('id=data-catalog')).toHaveAttribute("open");
    });
});

test.describe('Integrate sidebar buttons and Data Catalog buttons (national/subnational/climate/add data)', () => {
    test('should change panel when subnational action is clicked', async ({ page }) => {
        await expect(page.getByTestId('subnational')).toHaveAttribute("hidden");
        // Click subnational action button
        const subnationalCatAction = page.getByTestId('subnational-catalog-action');
        await subnationalCatAction.click();
        // Expect panel changes
        await expect(page.getByTestId('subnational')).toHaveAttribute("open");
        // Expect action button in sidebar is active
        const subnationalSideAction = page.getByTestId('subnational-sidebar-action');
        await expect(subnationalSideAction).toHaveAttribute("active");
        // Expect action button in catalog is active
        await expect(subnationalCatAction).toHaveAttribute("active");
        await expect(page.getByTestId('national')).toHaveAttribute("hidden");
    });
});

test.describe('links should open in a new window', () => {
    
})

test.describe('Integrate add to map button click and layer list panel', () => {
    test('should open layer list when "Add to map" is clicked', async ({ page }) => {
        // Open Ecosystem Markets topic

        // Click "Add to map" button

        // Expect Layers panel opens 

        // Expect Layers action button is active

    });
});