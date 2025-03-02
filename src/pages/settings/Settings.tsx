import { Button, Card, Container, FileButton, Text, Title } from '@mantine/core';
import { db } from '../../database/database.ts';
import { notifications } from '@mantine/notifications';

export function Settings() {
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
            const { tasks, todos } = JSON.parse(e.target.result);
            if (!tasks) {
                throw new Error('Unable to import data!');
            }
            await clearDb();
            await db.tasks.bulkAdd(tasks);
            await db.todos.bulkAdd(todos);
            notifications.show({
                message: 'Data restored from file!',
            });
        };
    }

    async function backup() {
        const settings = {};
        const tasks = await db.tasks.toArray();
        const todos = await db.todos.toArray();

        const jsonString = `data:application/json;charset=utf-8,${encodeURIComponent(
            JSON.stringify({ settings, tasks, todos }),
        )}`;
        const link = document.createElement('a');
        link.href = jsonString;
        link.download = 'data.json';
        link.click();
    }

    async function clearDb() {
        await db.tasks.clear();
        await db.todos.clear();
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
                <Button onClick={backup}>Backup</Button>
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
