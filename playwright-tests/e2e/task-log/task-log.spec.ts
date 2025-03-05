import { expect, Page, test } from '@playwright/test';
import { navigateToTaskLog } from '../../actions/nav.actions';
import { restoreFromFile } from '../../actions/settings.actions';
import { fileURLToPath } from 'url';
import * as path from 'node:path';
import * as selectors from '../../selectors/task.log.selectors';
import { join } from 'path';
import { tmpdir } from 'os';
import { readFile } from 'fs/promises';

const startPath = '/#/task-log';
// @ts-expect-error dnm
const __filename = fileURLToPath(import.meta.url);
const restoreFilePath = path.join(
    path.dirname(__filename),
    '..',
    '..',
    'test-files',
    'restore-file-1.json',
);

async function setup(page: Page) {
    await page.goto(startPath);
    await restoreFromFile(restoreFilePath, page);
    await navigateToTaskLog(page);
}

async function exportData(buttonName: string, page: Page) {
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: buttonName }).click();

    const download = await downloadPromise;
    const downloadPath = join(tmpdir(), download.suggestedFilename());
    await download.saveAs(downloadPath);

    return downloadPath;
}

async function readExport(downloadPath: string) {
    return readFile(downloadPath, 'utf-8');
}

test('Clicking Export All Rows downloads CSV data', async ({ page }) => {
    await setup(page);
    const downloadPath = await exportData(selectors.table.exportAllRows, page);
    const fileData = await readExport(downloadPath);

    expect(fileData).toBe(
        'name,start,id,end,duration\n' +
            'Investigate network connectivity issues,"2/22/2025, 1:22:59 PM",1,"2/22/2025, 1:23:04 PM",00:00:05\n' +
            'Prepare for impromptu meeting,"2/23/2025, 1:22:44 PM",2,"2/23/2025, 1:22:54 PM",00:00:09\n' +
            'Respond to last-minute client request,"2/23/2025, 1:23:04 PM",3,"2/23/2025, 1:32:00 PM",00:08:55',
    );
});

test('Clicking Export Page Rows downloads CSV data', async ({ page }) => {
    await setup(page);
    const downloadPath = await exportData(selectors.table.exportPageRows, page);
    const fileData = await readExport(downloadPath);

    expect(fileData).toBe(
        'name,start,id,end,duration\n' +
            'Investigate network connectivity issues,"2/22/2025, 1:22:59 PM",1,"2/22/2025, 1:23:04 PM",00:00:05\n' +
            'Prepare for impromptu meeting,"2/23/2025, 1:22:44 PM",2,"2/23/2025, 1:22:54 PM",00:00:09\n' +
            'Respond to last-minute client request,"2/23/2025, 1:23:04 PM",3,"2/23/2025, 1:32:00 PM",00:08:55',
    );
});

test('Clicking Export Select Rows downloads CSV data', async ({ page }) => {
    await setup(page);
    await page.getByLabel(selectors.table.toggleSelectRow).first().click();
    const downloadPath = await exportData(selectors.table.exportSelectedRows, page);
    const fileData = await readExport(downloadPath);

    expect(fileData).toBe(
        'name,start,id,end,duration\n' +
            'Investigate network connectivity issues,"2/22/2025, 1:22:59 PM",1,"2/22/2025, 1:23:04 PM",00:00:05',
    );
});
