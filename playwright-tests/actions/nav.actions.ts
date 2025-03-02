import { Page } from '@playwright/test';
import * as selectors from '../selectors/nav.selectors';

export async function navigateToToday(page: Page) {
    await page.getByRole('link', { name: selectors.links.today }).click();
}

export async function navigateToSettings(page: Page) {
    await page.getByRole('link', { name: selectors.links.settings }).click();
}
