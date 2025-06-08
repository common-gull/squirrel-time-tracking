import { Button, Card, Container, FileButton, Switch, Text, Title } from '@mantine/core';
import { db } from '../../database/database.ts';
import { notifications } from '@mantine/notifications';
import { download } from '../../download/download.ts';
import { useLiveQuery } from 'dexie-react-hooks';

export default function Settings() {
    const backupOnCloseSetting = useLiveQuery(() => db.settings.get('backupOnClose'));

    async function toggleBackupOnClose(checked: boolean) {
        await db.settings.put({ id: 'backupOnClose', value: checked });
        notifications.show({
            message: checked
                ? 'Backup confirmation on close enabled'
                : 'Backup confirmation on close disabled',
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
                throw new Error('Unable to import data!');
            }
            await clearDb();
            await db.settings.bulkAdd(Array.isArray(settings) ? settings : []);
            await db.tasks.bulkAdd(tasks);
            await db.todos.bulkAdd(todos);
            notifications.show({
                message: 'Data restored from file!',
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
            message: 'Data deleted!',
        });
    }

    return (
        <Container>
            <Card mb={'sm'}>
                <Title order={2}>Backup</Title>
                <Text>
                    Before clearing your browser cache, be sure to back up your data to prevent
                    loss. Backing up protects against accidental deletion, system crashes, and
                    software issues, ensuring you can easily restore your settings and preferences.
                </Text>
                <Button onClick={backup} mb="md">
                    Backup
                </Button>
                <Switch
                    label="Ask to backup before closing"
                    checked={backupOnCloseSetting?.value === true}
                    onChange={(event) => toggleBackupOnClose(event.currentTarget.checked)}
                    mb="md"
                />
                <Text size="sm" c="dimmed">
                    When enabled, you'll be prompted to create a backup before closing the
                    application. This gives you control over when backups are created.
                </Text>
            </Card>

            <Card mb={'sm'}>
                <Title order={2}>Restore from file</Title>
                <Text>
                    Restoring from a file will erase all data currently stored in the application
                    and replace it with the data from the file. Please note that this action cannot
                    be undone.
                </Text>
                <FileButton onChange={importData} accept="application/json">
                    {(props) => <Button {...props}>Restore from file</Button>}
                </FileButton>
            </Card>

            <Card mb={'sm'}>
                <Title order={2}>Delete all data</Title>
                <Text>
                    This action will delete all data stored in the local database (as there is no
                    remote database in this local-first app). Please note that this action is
                    irreversible.
                </Text>
                <Button onClick={deleteAllData}>Delete all data</Button>
            </Card>
        </Container>
    );
}
