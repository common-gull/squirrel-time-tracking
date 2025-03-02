import { Page } from '@playwright/test';
import * as todaySelectors from '../selectors/today.selectors';

export async function addTodo(name: string, page: Page) {
    await page.getByRole('textbox', { name: todaySelectors.todos.input }).click();
    await page.getByRole('textbox', { name: todaySelectors.todos.input }).fill(name);
    await page.getByRole('textbox', { name: todaySelectors.todos.input }).press('Enter');
}

export async function addTask(name: string, page: Page) {
    await page.getByRole('textbox', { name: todaySelectors.tasks.input }).click();
    await page.getByRole('textbox', { name: todaySelectors.tasks.input }).fill(name);
    await page.getByRole('textbox', { name: todaySelectors.tasks.input }).press('Enter');
}
