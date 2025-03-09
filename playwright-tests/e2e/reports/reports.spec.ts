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

function tableDataToLongString(tableData: string[]) {
    return tableData.join('').replace(/,/g, '');
}

test('Displays expected table data with default settings', async ({ page }) => {
    await setup(page);
    const tableData = [
        'name,2025-02-18,2025-02-19,2025-02-20,2025-02-21,2025-02-22,2025-02-23,2025-02-24,2025-02-25',
        'Investigate network connectivity issues,0.00,0.00,0.00,0.00,2.00,0.00,0.00,0.00',
        'Prepare for impromptu meeting,0.00,0.00,0.00,0.00,0.68,0.00,0.00,0.00',
        'Meeting with client,0.00,0.00,0.00,0.00,1.00,0.00,0.00,0.00',
        'Create UI mocks for client,0.00,0.00,0.00,0.00,0.00,1.00,0.00,0.00',
        'Email client,0.00,0.00,0.00,0.00,0.00,0.25,0.00,0.00',
        'System design,0.00,0.00,0.00,0.00,0.00,1.75,0.00,0.00',
        'Lunch,0.00,0.00,0.00,0.00,0.00,0.75,0.00,0.00',
    ];
    await expect(page.getByRole('table')).toContainText(tableDataToLongString(tableData));
});

test('Displays expected table data with default range and group by set to project', async ({
    page,
}) => {
    await setup(page);
    await page.getByLabel(settings.groupBy).selectOption(settings.project);
    await page.getByRole('button', { name: settings.update }).click();

    const tableData = [
        'project,2025-02-18,2025-02-19,2025-02-20,2025-02-21,2025-02-22,2025-02-23,2025-02-24,2025-02-25',
        'No Project,0.00,0.00,0.00,0.00,2.00,0.75,0.00,0.00',
        'P-1234,0.00,0.00,0.00,0.00,1.68,1.25,0.00,0.00',
        'P-5678,0.00,0.00,0.00,0.00,0.00,1.75,0.00,0.00',
    ];
    await expect(page.getByRole('table')).toContainText(tableDataToLongString(tableData));
});

test('Displays expected table data with custom settings', async ({ page }) => {
    await setup(page);
    await page.getByRole('button', { name: settings.dateRange }).click();

    await page.getByRole('button', { name: '18 February 2025', exact: true }).click();
    await page.getByRole('button', { name: '22 February 2025', exact: true }).click();

    await page.getByLabel(settings.groupBy).selectOption(settings.project);
    await page.getByRole('button', { name: settings.update }).click();

    const tableData = [
        'project,2025-02-18,2025-02-19,2025-02-20,2025-02-21,2025-02-22',
        'No Project,0.00,0.00,0.00,0.00,2.00',
        'P-1234,0.00,0.00,0.00,0.00,1.68',
    ];
    await expect(page.getByRole('table')).toContainText(tableDataToLongString(tableData));
});
