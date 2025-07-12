import { test, expect } from '@playwright/test';
import * as todaySelectors from '../../selectors/today.selectors';
import { addTask, addTodo, updateTimePicker } from '../../actions/today.actions';

const startPath = '/#/';

const todos = {
    invalidTodoName: 'A ',
    updateProjectTimeline: 'Update Project Timeline',
    emailFollowUps: 'Email Follow-ups',
};

const projects = {
    projectA: 'Project-A',
};

const tasks = {
    investigateNetworkConnectivity: 'Investigate network connectivity issues',
    prepareForMeeting: 'Prepare for impromptu meeting',
    respondToClientRequest: 'Respond to last-minute client request',
};

test('todos can be added and removed', async ({ page }) => {
    await page.goto(startPath);
    await addTodo(todos.updateProjectTimeline, page);
    await addTodo(todos.emailFollowUps, page);

    await expect(page.getByText(todos.updateProjectTimeline)).toBeVisible();
    await expect(page.getByText(todos.emailFollowUps)).toBeVisible();

    await page.getByRole('button', { name: todaySelectors.todos.delete }).nth(1).click();
    await expect(page.getByText(todos.emailFollowUps)).not.toBeVisible();

    await page.getByRole('button', { name: todaySelectors.todos.delete }).click();
    await expect(page.getByText(todos.updateProjectTimeline)).not.toBeVisible();
});

test('todo can be added with project', async ({ page }) => {
    await page.goto(startPath);
    await addTodo(todos.updateProjectTimeline, page, projects.projectA);

    await expect(page.getByText(todos.updateProjectTimeline)).toBeVisible();
    await expect(page.getByText(projects.projectA)).toBeVisible();
});

test('todo name must have at least two characters', async ({ page }) => {
    await page.goto(startPath);
    await addTodo(todos.invalidTodoName, page);
    await expect(page.getByText('Name must include at least 2 characters')).toBeVisible();
});

test('task is created when start todo is clicked', async ({ page }) => {
    await page.goto(startPath);
    await addTodo(todos.emailFollowUps, page);

    await page.getByRole('button', { name: todaySelectors.todos.start }).click();
    await expect(
        page.getByText(todaySelectors.tasks.currentTask + todos.emailFollowUps),
    ).toBeVisible();
});

test('project from todo is carried over to task', async ({ page }) => {
    await page.goto(startPath);
    await addTodo(todos.emailFollowUps, page, projects.projectA);

    await page.getByRole('button', { name: todaySelectors.todos.start }).click();
    await page.locator('button').filter({ hasText: todaySelectors.tasks.complete }).click();
    await page.locator('a').filter({ hasText: todos.emailFollowUps }).click();

    await expect(
        page.getByRole('textbox', { name: todaySelectors.tasks.editTask.project }).nth(1),
    ).toHaveValue(projects.projectA);
});

test('current task is completed when a new task is added', async ({ page }) => {
    await page.goto(startPath);

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
    await page.goto(startPath);

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
    await page.goto(startPath);

    const updatedTaskDesc = 'Important call';

    await addTask(tasks.investigateNetworkConnectivity, page);
    await page.locator('button').filter({ hasText: todaySelectors.tasks.complete }).click();
    await page.locator('a').filter({ hasText: tasks.investigateNetworkConnectivity }).click();
    await page.getByRole('textbox', { name: todaySelectors.tasks.editTask.name }).nth(1).click();
    await page
        .getByRole('textbox', { name: todaySelectors.tasks.editTask.name })
        .nth(1)
        .fill(updatedTaskDesc);

    await page.getByLabel(todaySelectors.tasks.editTask.start).click();
    await updateTimePicker(page, todaySelectors.tasks.editTask.timeInput, '08', '30', 'AM');

    await page.getByLabel(todaySelectors.tasks.editTask.end).click();
    await updateTimePicker(page, todaySelectors.tasks.editTask.timeInput, '09', '30', 'AM');

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
    await page.goto(startPath);

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
    await page.goto(startPath);

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
    await page.goto(startPath);

    await addTask(tasks.investigateNetworkConnectivity, page);
    await page.locator('button').filter({ hasText: todaySelectors.tasks.cancel }).click();
    await expect(
        page.locator('a').filter({ hasText: tasks.investigateNetworkConnectivity }),
    ).not.toBeVisible();
});
