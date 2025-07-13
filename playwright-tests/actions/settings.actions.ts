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

export async function selectTheme(page: Page, theme: 'auto' | 'light' | 'dark') {
    await navigateTo(page, links.settings);
    await page.getByRole('radio', { name: settingsSelectors.main.theme[theme] }).click();
}

export async function getSelectedTheme(page: Page): Promise<string> {
    await navigateTo(page, links.settings);
    const autoRadio = page.getByRole('radio', { name: settingsSelectors.main.theme.auto });
    const lightRadio = page.getByRole('radio', { name: settingsSelectors.main.theme.light });
    const darkRadio = page.getByRole('radio', { name: settingsSelectors.main.theme.dark });

    if (await autoRadio.isChecked()) return 'auto';
    if (await lightRadio.isChecked()) return 'light';
    if (await darkRadio.isChecked()) return 'dark';

    return 'unknown';
}
