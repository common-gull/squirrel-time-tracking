import { test, expect, Page } from '@playwright/test';
import { addTask, addTodo } from '../../actions/today.actions';
import { navigateToSettings, navigateToToday } from '../../actions/nav.actions';
import * as todaySelectors from '../../selectors/today.selectors';
import * as settingsSelectors from '../../selectors/settings.selectors';
import { join } from 'path';
import { tmpdir } from 'os';
import { readFile } from 'fs/promises';
import { restoreFromFile } from '../../actions/settings.actions';

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

// TODO - Look into using fixtures
async function setup(page: Page) {
    await page.goto(startPath);
    await navigateToToday(page);

    await addTodo(todos.updateProjectTimeline, page);
    await addTodo(todos.emailFollowUps, page);
    await addTask(tasks.investigateNetworkConnectivity, page);
    await addTask(tasks.prepareForMeeting, page);
    await addTask(tasks.respondToClientRequest, page);
    await checkTaskAndTodosExist(page);

    await navigateToSettings(page);
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

test('Delete all data removes all todos and tasks when clicked', async ({ page }) => {
    await setup(page);
    await page.getByRole('button', { name: settingsSelectors.main.deleteAllData }).click();
    await expect(page.getByRole('alert')).toBeVisible();
    await navigateToToday(page);
    await checkTaskAndTodosDoNotExist(page);
});

test('Backup downloads all stored data', async ({ page }) => {
    await setup(page);
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: settingsSelectors.main.backup }).click();

    const download = await downloadPromise;
    const downloadPath = join(tmpdir(), download.suggestedFilename());
    await download.saveAs(downloadPath);

    const fileData = await readFile(downloadPath, 'utf-8');
    const fileJson = JSON.parse(fileData);

    expect(fileJson).toEqual({
        settings: {},
        tasks: [
            {
                end: expect.any(String),
                id: 1,
                name: 'Investigate network connectivity issues',
                start: expect.any(String),
            },
            {
                end: expect.any(String),
                id: 2,
                name: 'Prepare for impromptu meeting',
                start: expect.any(String),
            },
            {
                id: 3,
                name: 'Respond to last-minute client request',
                start: expect.any(String),
            },
        ],
        todos: [
            {
                createdOn: expect.any(String),
                id: 1,
                name: 'Update Project Timeline',
            },
            {
                createdOn: expect.any(String),
                id: 2,
                name: 'Email Follow-ups',
            },
        ],
    });
});

test('Restore from file restores tasks and todos', async ({ page }) => {
    await setup(page);
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: settingsSelectors.main.backup }).click();

    const download = await downloadPromise;
    const downloadPath = join(tmpdir(), download.suggestedFilename());
    await download.saveAs(downloadPath);

    await page.getByRole('button', { name: settingsSelectors.main.deleteAllData }).click();
    await navigateToToday(page);
    await checkTaskAndTodosDoNotExist(page);

    await restoreFromFile(downloadPath, page);

    await navigateToToday(page);
    await checkTaskAndTodosExist(page);
});
