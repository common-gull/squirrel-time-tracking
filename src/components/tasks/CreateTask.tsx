import { Input } from '@mantine/core';
import { useForm } from '@mantine/form';
import { db, Task } from '../../database/database.ts';
import { useTranslation } from 'react-i18next';

interface Props {
    onTaskCreated: (task: Task) => Promise<void>;
}

export function CreateTask({ onTaskCreated }: Props) {
    const { t } = useTranslation();
    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            task: '',
        },
    });

    async function createTask({ task }: typeof form.values) {
        const trimmedTask = task.trim();
        if (!trimmedTask) {
            return;
        }

        const newTask = {
            name: task,
            start: new Date().toISOString(),
        };
        const id = await db.tasks.add(newTask);
        await onTaskCreated({ id, ...newTask });
        form.reset();
    }

    return (
        <>
            <form onSubmit={form.onSubmit((values) => createTask(values))}>
                <Input
                    placeholder={t('tasks.createPlaceholder')}
                    key={form.key('task')}
                    {...form.getInputProps('task')}
                />
            </form>
        </>
    );
}
