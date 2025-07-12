import { Button, Card, Container, FileButton, Switch, Text, Title } from '@mantine/core';
import { db } from '../../database/database.ts';
import { notifications } from '@mantine/notifications';
import { download } from '../../download/download.ts';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTranslation } from 'react-i18next';

export default function Settings() {
    const { t } = useTranslation();
    const backupOnCloseSetting = useLiveQuery(() => db.settings.get('backupOnClose'));

    async function toggleBackupOnClose(checked: boolean) {
        await db.settings.put({ id: 'backupOnClose', value: checked });
        notifications.show({
            message: checked ? t('notifications.backupEnabled') : t('notifications.backupDisabled'),
        });
    }

    function importData(file: File | null) {
        if (!file) {
            return;
        }
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = async function (e) {
            if (typeof e.target?.result !== 'string') {
                return;
            }

            // TODO - Import validation/data migrator
            const { settings, tasks, todos } = JSON.parse(e.target.result);
            if (!tasks) {
                throw new Error(t('notifications.importError'));
            }
            await clearDb();
            await db.settings.bulkAdd(Array.isArray(settings) ? settings : []);
            await db.tasks.bulkAdd(tasks);
            await db.todos.bulkAdd(todos);
            notifications.show({
                message: t('notifications.dataRestored'),
            });
        };
    }

    async function backup() {
        const settings = await db.settings.toArray();
        const tasks = await db.tasks.toArray();
        const todos = await db.todos.toArray();
        download(`squirrel-backup_${new Date().toISOString()}.json`, { settings, tasks, todos });
    }

    async function clearDb() {
        await db.tasks.clear();
        await db.todos.clear();
        await db.settings.clear();
    }

    async function deleteAllData() {
        await clearDb();
        notifications.show({
            message: t('notifications.dataDeleted'),
        });
    }

    return (
        <Container>
            <Card mb={'sm'}>
                <Title order={2}>{t('pages.settings.backup.title')}</Title>
                <Text>{t('pages.settings.backup.description')}</Text>
                <Button onClick={backup} mb="md">
                    {t('pages.settings.backup.button')}
                </Button>
                <Switch
                    label={t('pages.settings.backup.askBeforeClosing')}
                    checked={backupOnCloseSetting?.value === true}
                    onChange={(event) => toggleBackupOnClose(event.currentTarget.checked)}
                    mb="md"
                />
                <Text size="sm" c="dimmed">
                    {t('pages.settings.backup.askBeforeClosingDescription')}
                </Text>
            </Card>

            <Card mb={'sm'}>
                <Title order={2}>{t('pages.settings.restore.title')}</Title>
                <Text>{t('pages.settings.restore.description')}</Text>
                <FileButton onChange={importData} accept="application/json">
                    {(props) => <Button {...props}>{t('pages.settings.restore.button')}</Button>}
                </FileButton>
            </Card>

            <Card mb={'sm'}>
                <Title order={2}>{t('pages.settings.deleteData.title')}</Title>
                <Text>{t('pages.settings.deleteData.description')}</Text>
                <Button onClick={deleteAllData}>{t('pages.settings.deleteData.button')}</Button>
            </Card>
        </Container>
    );
}
