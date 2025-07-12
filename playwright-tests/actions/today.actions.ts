import { Page } from '@playwright/test';
import * as todaySelectors from '../selectors/today.selectors';

export async function addTodo(name: string, page: Page, project?: string) {
    await page.getByRole('textbox', { name: todaySelectors.todos.name }).click();
    await page.getByRole('textbox', { name: todaySelectors.todos.name }).fill(name);

    if (project) {
        await page.getByRole('textbox', { name: todaySelectors.todos.project }).click();
        await page.getByRole('textbox', { name: todaySelectors.todos.project }).fill(project);
    }

    await page.getByRole('textbox', { name: todaySelectors.todos.name }).press('Enter');
}

export async function addTask(name: string, page: Page) {
    await page.getByRole('textbox', { name: todaySelectors.tasks.input }).click();
    await page.getByRole('textbox', { name: todaySelectors.tasks.input }).fill(name);
    await page.getByRole('textbox', { name: todaySelectors.tasks.input }).press('Enter');
}

// The newer version of the Mantine time picker is more complex. There could be a better way to do this.
export async function updateTimePicker(
    page: Page,
    selector: string,
    hour: string,
    minute: string,
    timePeriod: string,
) {
    const endInput = page.locator(selector);
    await endInput.nth(0).click();
    await endInput.nth(0).fill(hour);
    await endInput.nth(1).fill(minute);
    await page.locator('select').selectOption(timePeriod);
    await endInput.nth(1).press('Enter');
}
