import { Page } from '@playwright/test';
import * as selectors from '../selectors/nav.selectors';

export async function navigateToToday(name: string, page: Page) {
    await page.getByRole('link', { name: selectors.links.today }).click();
}

export async function navigateToSettings(name: string, page: Page) {
    await page.getByRole('link', { name: selectors.links.settings }).click();
}
