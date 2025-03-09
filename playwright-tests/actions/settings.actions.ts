import { Page } from '@playwright/test';
import * as settingsSelectors from '../selectors/settings.selectors';
import { navigateTo } from './nav.actions';
import { links } from '../selectors/nav.selectors';

export async function restoreFromFile(filePath: string, page: Page) {
    await navigateTo(page, links.settings);
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: settingsSelectors.main.restoreFromFile }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filePath);
}
