import { Page } from '@playwright/test';

export async function navigateTo(page: Page, link: string) {
    await page.getByRole('link', { name: link }).click();
}
