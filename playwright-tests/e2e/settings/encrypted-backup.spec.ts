import { test, expect, Page } from '@playwright/test';
import { addTask, addTodo } from '../../actions/today.actions';
import { navigateTo } from '../../actions/nav.actions';
import * as todaySelectors from '../../selectors/today.selectors';
import * as settingsSelectors from '../../selectors/settings.selectors';
import { join } from 'path';
import { tmpdir } from 'os';
import { readFile } from 'fs/promises';
import { restoreFromFile } from '../../actions/settings.actions';
import { links } from '../../selectors/nav.selectors';

const startPath = '/#/settings';

const todos = {
    updateProjectTimeline: 'Update Project Timeline',
    emailFollowUps: 'Email Follow-ups',
};

const tasks = {
    investigateNetworkConnectivity: 'Investigate network connectivity issues',
    prepareForMeeting: 'Prepare for impromptu meeting',
    respondToClientRequest: 'Respond to last-minute client request',
};

async function setup(page: Page) {
    await page.goto(startPath);
    await navigateTo(page, links.today);

    await addTodo(todos.updateProjectTimeline, page);
    await addTodo(todos.emailFollowUps, page);
    await addTask(tasks.investigateNetworkConnectivity, page);
    await addTask(tasks.prepareForMeeting, page);
    await addTask(tasks.respondToClientRequest, page);
    await checkTaskAndTodosExist(page);

    await navigateTo(page, links.settings);
}

async function checkTaskAndTodosExist(page: Page) {
    await expect(page.getByText(todos.emailFollowUps)).toBeVisible();
    await expect(page.getByText(todos.updateProjectTimeline)).toBeVisible();
    await expect(page.locator('a').filter({ hasText: tasks.prepareForMeeting })).toBeVisible();
    await expect(
        page.locator('a').filter({ hasText: tasks.investigateNetworkConnectivity }),
    ).toBeVisible();
    await expect(
        page.getByText(todaySelectors.tasks.currentTask + tasks.respondToClientRequest),
    ).toBeVisible();
}

async function checkTaskAndTodosDoNotExist(page: Page) {
    await expect(page.getByText(todos.emailFollowUps)).not.toBeVisible();
    await expect(page.getByText(todos.updateProjectTimeline)).not.toBeVisible();
    await expect(page.locator('a').filter({ hasText: tasks.prepareForMeeting })).not.toBeVisible();
    await expect(
        page.locator('a').filter({ hasText: tasks.investigateNetworkConnectivity }),
    ).not.toBeVisible();
    await expect(
        page.getByText(todaySelectors.tasks.currentTask + tasks.respondToClientRequest),
    ).not.toBeVisible();
}

async function selectEncryptedBackupType(page: Page) {
    await page.locator('input[value="encrypted"]').click();
}

async function selectPlainBackupType(page: Page) {
    await page.locator('input[value="plain"]').click();
}

async function createEncryptedBackup(page: Page, password: string) {
    await selectEncryptedBackupType(page);

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: settingsSelectors.main.backup }).click();

    await expect(page.getByText('Set Backup Password')).toBeVisible();

    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByLabel('Confirm Password').fill(password);

    await page.getByRole('button', { name: 'Create Backup' }).click();

    const download = await downloadPromise;
    const downloadPath = join(tmpdir(), download.suggestedFilename());
    await download.saveAs(downloadPath);

    return downloadPath;
}

async function restoreEncryptedBackup(page: Page, filePath: string, password: string) {
    await page.getByRole('button', { name: settingsSelectors.main.restoreFromFile }).click();

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);

    await expect(page.getByText('Encrypted Backup Detected')).toBeVisible();

    await page.getByLabel('Password', { exact: true }).fill(password);

    await page.getByRole('button', { name: 'Restore', exact: true }).click();

    await expect(page.getByText('Data restored from file!')).toBeVisible();
}

test.describe('Encrypted Backup Flow', () => {
    test('Can create encrypted backup with strong password', async ({ page }) => {
        await setup(page);

        const password = 'StrongPassword123!';
        const downloadPath = await createEncryptedBackup(page, password);

        const fileData = await readFile(downloadPath, 'utf-8');
        const fileJson = JSON.parse(fileData);

        expect(fileJson.format).toBe('squirrel-encrypted-backup');
        expect(fileJson.version).toBe('1.0');
        expect(fileJson.metadata).toBeDefined();
        expect(fileJson.crypto).toBeDefined();
        expect(fileJson.data).toBeDefined();

        expect(fileJson.crypto.salt).toBeDefined();
        expect(fileJson.crypto.iv).toBeDefined();
        expect(fileJson.crypto.authTag).toBeDefined();

        expect(fileJson.data).not.toContain('Update Project Timeline');
        expect(fileJson.data).not.toContain('Email Follow-ups');
    });

    test('Password strength indicator shows correct feedback', async ({ page }) => {
        await setup(page);
        await selectEncryptedBackupType(page);

        await page.getByRole('button', { name: settingsSelectors.main.backup }).click();
        await expect(page.getByText('Set Backup Password')).toBeVisible();

        await page.getByLabel('Password', { exact: true }).fill('weak');
        await expect(page.getByText('Weak')).toBeVisible();
        await expect(page.getByText('Password Requirements:')).toBeVisible();

        await page.getByLabel('Password', { exact: true }).fill('Password');
        await expect(page.getByText('Fair')).toBeVisible();

        await page.getByLabel('Password', { exact: true }).fill('Password1');
        await expect(page.getByText('Good')).toBeVisible();

        await page.getByLabel('Password', { exact: true }).fill('Password1!');
        await expect(page.getByText('Strong')).toBeVisible();
    });

    test('Password validation prevents weak passwords', async ({ page }) => {
        await setup(page);
        await selectEncryptedBackupType(page);

        await page.getByRole('button', { name: settingsSelectors.main.backup }).click();
        await expect(page.getByText('Set Backup Password')).toBeVisible();

        await page.getByLabel('Password', { exact: true }).fill('weak');
        await page.getByLabel('Confirm Password').fill('weak');

        const createButton = page.getByRole('button', { name: 'Create Backup' });
        await expect(createButton).toBeDisabled();

        await page.getByLabel('Password', { exact: true }).fill('StrongPassword123!');
        await page.getByLabel('Confirm Password').fill('StrongPassword123!');

        await expect(createButton).toBeEnabled();
    });

    test('Password mismatch validation works', async ({ page }) => {
        await setup(page);
        await selectEncryptedBackupType(page);

        await page.getByRole('button', { name: settingsSelectors.main.backup }).click();
        await expect(page.getByText('Set Backup Password')).toBeVisible();

        await page.getByLabel('Password', { exact: true }).fill('StrongPassword123!');
        await page.getByLabel('Confirm Password').fill('DifferentPassword123!');

        await expect(page.getByText('Passwords do not match')).toBeVisible();

        const createButton = page.getByRole('button', { name: 'Create Backup' });
        await expect(createButton).toBeDisabled();
    });

    test('Loading state shows during backup creation', async ({ page }) => {
        await setup(page);
        await selectEncryptedBackupType(page);

        await page.getByRole('button', { name: settingsSelectors.main.backup }).click();
        await expect(page.getByText('Set Backup Password')).toBeVisible();

        await page.getByLabel('Password', { exact: true }).fill('StrongPassword123!');
        await page.getByLabel('Confirm Password').fill('StrongPassword123!');

        await page.getByRole('button', { name: 'Create Backup' }).click();

        await expect(
            page.locator('.mantine-Alert-root').getByText('Creating encrypted backup...'),
        ).toBeVisible();
    });

    test('Backup type selection shows correct descriptions', async ({ page }) => {
        await setup(page);

        await selectPlainBackupType(page);
        await expect(
            page.getByText('Standard backups are saved as plain JSON files'),
        ).toBeVisible();

        await selectEncryptedBackupType(page);
        await expect(
            page.getByText('Encrypted backups protect your data with password-based encryption'),
        ).toBeVisible();
    });
});

test.describe('Encrypted Backup Restore Flow', () => {
    test('Can restore encrypted backup with correct password', async ({ page }) => {
        await setup(page);

        const password = 'StrongPassword123!';
        const downloadPath = await createEncryptedBackup(page, password);

        await page.getByRole('button', { name: settingsSelectors.main.deleteAllData }).click();
        await navigateTo(page, links.today);
        await checkTaskAndTodosDoNotExist(page);

        await navigateTo(page, links.settings);
        await restoreEncryptedBackup(page, downloadPath, password);

        await navigateTo(page, links.today);
        await checkTaskAndTodosExist(page);
    });

    test('Restore fails with incorrect password', async ({ page }) => {
        await setup(page);

        const password = 'StrongPassword123!';
        const wrongPassword = 'WrongPassword123!';
        const downloadPath = await createEncryptedBackup(page, password);

        await page.getByRole('button', { name: settingsSelectors.main.deleteAllData }).click();

        await page.getByRole('button', { name: settingsSelectors.main.restoreFromFile }).click();

        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles(downloadPath);

        await expect(page.getByText('Encrypted Backup Detected')).toBeVisible();
        await page.getByLabel('Password', { exact: true }).fill(wrongPassword);
        await page.getByRole('button', { name: 'Restore', exact: true }).click();

        await expect(
            page.locator('.mantine-Alert-root').getByText('Invalid password or corrupted file'),
        ).toBeVisible();
    });

    test('Loading state shows during restore', async ({ page }) => {
        await setup(page);

        const password = 'StrongPassword123!';
        const downloadPath = await createEncryptedBackup(page, password);

        await page.getByRole('button', { name: settingsSelectors.main.restoreFromFile }).click();

        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles(downloadPath);

        await expect(page.getByText('Encrypted Backup Detected')).toBeVisible();
        await page.getByLabel('Password', { exact: true }).fill(password);
        await page.getByRole('button', { name: 'Restore', exact: true }).click();

        await expect(
            page.locator('.mantine-Alert-root').getByText('Decrypting backup data...'),
        ).toBeVisible();
    });

    test('Encrypted backup detection works correctly', async ({ page }) => {
        await setup(page);

        const password = 'StrongPassword123!';
        const downloadPath = await createEncryptedBackup(page, password);

        await page.getByRole('button', { name: settingsSelectors.main.restoreFromFile }).click();

        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles(downloadPath);

        await expect(page.getByText('Encrypted Backup Detected')).toBeVisible();
        await expect(page.getByText('This backup is password protected')).toBeVisible();
    });

    test('Plain backup still works after encrypted backup implementation', async ({ page }) => {
        await setup(page);

        await selectPlainBackupType(page);
        const downloadPromise = page.waitForEvent('download');
        await page.getByRole('button', { name: settingsSelectors.main.backup }).click();

        const download = await downloadPromise;
        const downloadPath = join(tmpdir(), download.suggestedFilename());
        await download.saveAs(downloadPath);

        await page.getByRole('button', { name: settingsSelectors.main.deleteAllData }).click();
        await navigateTo(page, links.today);
        await checkTaskAndTodosDoNotExist(page);

        await navigateTo(page, links.settings);
        await restoreFromFile(downloadPath, page);

        await navigateTo(page, links.today);
        await checkTaskAndTodosExist(page);
    });
});

test.describe('Encrypted Backup Error Handling', () => {
    test('Shows error for corrupted encrypted file', async ({ page }) => {
        await setup(page);

        const { writeFileSync } = await import('fs');
        const corruptedPath = join(tmpdir(), 'corrupted-backup.json');
        writeFileSync(corruptedPath, 'corrupted json content {');

        await page.getByRole('button', { name: settingsSelectors.main.restoreFromFile }).click();

        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles(corruptedPath);

        await expect(page.getByText('Unrecognized backup file format')).toBeVisible();
    });

    test('Handles file selection cancellation gracefully', async ({ page }) => {
        await setup(page);
        await selectEncryptedBackupType(page);

        await page.getByRole('button', { name: settingsSelectors.main.backup }).click();
        await expect(page.getByText('Set Backup Password')).toBeVisible();

        await page.getByRole('button', { name: 'Cancel' }).click();

        await expect(page.getByText('Set Backup Password')).not.toBeVisible();
    });

    test('Handles restore modal cancellation gracefully', async ({ page }) => {
        await setup(page);

        const password = 'StrongPassword123!';
        const downloadPath = await createEncryptedBackup(page, password);

        await page.getByRole('button', { name: settingsSelectors.main.restoreFromFile }).click();

        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles(downloadPath);

        await expect(page.getByText('Encrypted Backup Detected')).toBeVisible();

        await page.getByRole('button', { name: 'Cancel' }).click();

        await expect(page.getByText('Encrypted Backup Detected')).not.toBeVisible();
    });
});
