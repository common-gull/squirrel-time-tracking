import { expect, Page, test } from '@playwright/test';
import { navigateTo } from '../../actions/nav.actions';
import { restoreFromFile } from '../../actions/settings.actions';
import { fileURLToPath } from 'url';
import * as path from 'node:path';
import { links } from '../../selectors/nav.selectors';
import { settings } from '../../selectors/reports.selectors';

const startPath = '/#/reports';
// @ts-expect-error dnm
const __filename = fileURLToPath(import.meta.url);
const restoreFilePath = path.join(
    path.dirname(__filename),
    '..',
    '..',
    'test-files',
    'data-for-reports-page.json',
);

async function setup(page: Page) {
    await page.clock.setFixedTime(new Date('2025-02-25T10:00:00'));
    await page.goto(startPath);
    await restoreFromFile(restoreFilePath, page);
    await navigateTo(page, links.reports);
}

function getScreenshotOpts(page: Page) {
    return { mask: [page.locator('header'), page.locator('nav')] };
}

test('Screenshot shows expected data with default settings set', async ({ page }) => {
    await setup(page);
    await expect(page).toHaveScreenshot(getScreenshotOpts(page));
});

test('Screenshot shows expected data with default range and group by set to project', async ({
    page,
}) => {
    await setup(page);
    await page.getByLabel(settings.groupBy).selectOption(settings.project);
    await page.getByRole('button', { name: settings.update }).click();
    await expect(page).toHaveScreenshot(getScreenshotOpts(page));
});

test('Screenshot shows expected data with custom settings', async ({ page }) => {
    await setup(page);
    await page.getByRole('button', { name: settings.dateRange }).click();
    await page.getByRole('button', { name: '18 February 2025', exact: true }).click();
    await page.getByRole('button', { name: '22 February 2025', exact: true }).click();
    await page.getByLabel(settings.groupBy).selectOption(settings.project);
    await page.getByRole('button', { name: settings.update }).click();
    await expect(page).toHaveScreenshot(getScreenshotOpts(page));
});
