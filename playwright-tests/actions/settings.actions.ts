import { Page } from '@playwright/test';
import * as settingsSelectors from '../selectors/settings.selectors';
import { navigateToSettings } from './nav.actions';

export async function restoreFromFile(filePath: string, page: Page) {
    await navigateToSettings(page);
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: settingsSelectors.main.restoreFromFile }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filePath);
}
