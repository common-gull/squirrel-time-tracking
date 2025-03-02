import { Card, Input } from '@mantine/core';
import { useForm } from '@mantine/form';
import { db, Task } from '../../database/database.ts';

interface Props {
    onTaskCreated: (task: Task) => Promise<void>;
}

export function CreateTask({ onTaskCreated }: Props) {
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
        <Card>
            Tasks
            <form onSubmit={form.onSubmit((values) => createTask(values))}>
                <Input
                    placeholder="What task are you focusing on right now?"
                    key={form.key('task')}
                    {...form.getInputProps('task')}
                />
            </form>
        </Card>
    );
}
