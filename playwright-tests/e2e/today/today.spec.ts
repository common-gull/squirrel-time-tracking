import { test, expect } from '@playwright/test';
import * as todaySelectors from '../../selectors/today.selectors';
import { addTask, addTodo } from '../../actions/today.actions';

const baseURL = 'http://localhost:4173/#/';

const todos = {
    updateProjectTimeline: 'Update Project Timeline',
    emailFollowUps: 'Email Follow-ups',
};

const tasks = {
    investigateNetworkConnectivity: 'Investigate network connectivity issues',
    prepareForMeeting: 'Prepare for impromptu meeting',
    respondToClientRequest: 'Respond to last-minute client request',
};

test('todos can be added and removed', async ({ page }) => {
    await page.goto(baseURL);
    await addTodo(todos.updateProjectTimeline, page);
    await addTodo(todos.emailFollowUps, page);

    await expect(page.getByText(todos.updateProjectTimeline)).toBeVisible();
    await expect(page.getByText(todos.emailFollowUps)).toBeVisible();

    await page.getByRole('button', { name: todaySelectors.todos.delete }).nth(1).click();
    await expect(page.getByText(todos.emailFollowUps)).not.toBeVisible();

    await page.getByRole('button', { name: todaySelectors.todos.delete }).click();
    await expect(page.getByText(todos.updateProjectTimeline)).not.toBeVisible();
});

test('todo is updated to completed state when complete button is clicked', async ({ page }) => {
    await page.goto(baseURL);
    await addTodo(todos.emailFollowUps, page);

    await expect(page.getByRole('button', { name: todaySelectors.todos.start })).toBeVisible();
    await expect(page.getByRole('button', { name: todaySelectors.todos.complete })).toBeVisible();

    await page.getByRole('button', { name: todaySelectors.todos.complete }).click();

    await expect(page.getByRole('button', { name: todaySelectors.todos.start })).not.toBeVisible();
    await expect(
        page.getByRole('button', { name: todaySelectors.todos.complete }),
    ).not.toBeVisible();
});

test('task is created when start todo is clicked', async ({ page }) => {
    await page.goto(baseURL);
    await addTodo(todos.emailFollowUps, page);

    await page.getByRole('button', { name: todaySelectors.todos.start }).click();
    await expect(
        page.getByText(todaySelectors.tasks.currentTask + todos.emailFollowUps),
    ).toBeVisible();
});

test('current task is completed when a new task is added', async ({ page }) => {
    await page.goto(baseURL);

    await addTask(tasks.prepareForMeeting, page);
    await expect(
        page.getByText(todaySelectors.tasks.currentTask + tasks.prepareForMeeting),
    ).toBeVisible();

    await addTask(tasks.respondToClientRequest, page);

    await expect(
        page.getByText(todaySelectors.tasks.currentTask + tasks.prepareForMeeting),
    ).not.toBeVisible();

    await expect(
        page.getByText(todaySelectors.tasks.currentTask + tasks.respondToClientRequest),
    ).toBeVisible();
});

test('completed tasks are visible', async ({ page }) => {
    await page.goto(baseURL);

    await addTask(tasks.investigateNetworkConnectivity, page);
    await addTask(tasks.prepareForMeeting, page);
    await addTask(tasks.respondToClientRequest, page);
    await page.locator('button').filter({ hasText: todaySelectors.tasks.complete }).click();

    await expect(
        page.locator('a').filter({ hasText: tasks.investigateNetworkConnectivity }),
    ).toBeVisible();
    await expect(page.locator('a').filter({ hasText: tasks.prepareForMeeting })).toBeVisible();
    await expect(page.locator('a').filter({ hasText: tasks.respondToClientRequest })).toBeVisible();
});

test('completed task can be updated', async ({ page }) => {
    await page.goto(baseURL);

    const updatedTaskDesc = 'Important call';

    await addTask(tasks.investigateNetworkConnectivity, page);
    await page.locator('button').filter({ hasText: todaySelectors.tasks.complete }).click();
    await page.locator('a').filter({ hasText: tasks.investigateNetworkConnectivity }).click();
    await page.getByRole('textbox', { name: todaySelectors.tasks.editTask.name }).click();
    await page
        .getByRole('textbox', { name: todaySelectors.tasks.editTask.name })
        .fill(updatedTaskDesc);

    await page.getByLabel(todaySelectors.tasks.editTask.start).click();
    await page.locator(todaySelectors.tasks.editTask.timeInput).click();
    await page.locator(todaySelectors.tasks.editTask.timeInput).fill('08:30');
    await page.locator(todaySelectors.tasks.editTask.timeInput).press('Enter');

    await page.getByLabel(todaySelectors.tasks.editTask.end).click();
    await page.locator(todaySelectors.tasks.editTask.timeInput).click();
    await page.locator(todaySelectors.tasks.editTask.timeInput).fill('09:30');
    await page.locator(todaySelectors.tasks.editTask.timeInput).press('Enter');

    await page.getByRole('button', { name: todaySelectors.tasks.editTask.update }).click();

    await expect(
        page.locator('a').filter({ hasText: tasks.investigateNetworkConnectivity }),
    ).not.toBeVisible();
    await expect(page.locator('a').filter({ hasText: updatedTaskDesc })).toBeVisible();
    await expect(page.getByText('Start: 8:30:00 AM')).toBeVisible();
    await expect(page.getByText('End: 9:30:00 AM')).toBeVisible();
    await expect(page.getByText('Duration: 01:00:')).toBeVisible();
});

test('completed tasks can be deleted', async ({ page }) => {
    await page.goto(baseURL);

    await addTask(tasks.investigateNetworkConnectivity, page);
    await page.locator('button').filter({ hasText: todaySelectors.tasks.complete }).click();

    await page.locator('a').filter({ hasText: tasks.investigateNetworkConnectivity }).click();
    await page
        .getByLabel(todaySelectors.tasks.editTask.heading)
        .getByRole('button', { name: todaySelectors.tasks.editTask.delete })
        .click();

    await expect(
        page.locator('a').filter({ hasText: tasks.investigateNetworkConnectivity }),
    ).not.toBeVisible();
});

test('tasks and todos are visible after reload', async ({ page }) => {
    await page.goto(baseURL);

    await addTodo(todos.emailFollowUps, page);
    await addTask(tasks.investigateNetworkConnectivity, page);
    await page.locator('button').filter({ hasText: todaySelectors.tasks.complete }).click();
    await addTask(tasks.prepareForMeeting, page);
    await expect(
        page.getByText(todaySelectors.tasks.currentTask + tasks.prepareForMeeting),
    ).toBeVisible();

    await page.reload();

    await expect(page.getByText(todos.emailFollowUps)).toBeVisible();
    await expect(
        page.locator('a').filter({ hasText: tasks.investigateNetworkConnectivity }),
    ).toBeVisible();
    await expect(
        page.getByText(todaySelectors.tasks.currentTask + tasks.prepareForMeeting),
    ).toBeVisible();
});

test('task can be canceled and does not appear in completed', async ({ page }) => {
    await page.goto(baseURL);

    await addTask(tasks.investigateNetworkConnectivity, page);
    await page.locator('button').filter({ hasText: todaySelectors.tasks.cancel }).click();
    await expect(
        page.locator('a').filter({ hasText: tasks.investigateNetworkConnectivity }),
    ).not.toBeVisible();
});
