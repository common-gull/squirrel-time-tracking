import { Button, Group, TextInput } from '@mantine/core';
import { db, Task } from '../../database/database.ts';
import { useForm } from '@mantine/form';
import { DateTimePicker } from '@mantine/dates';

interface Props {
    close: () => void;
    task: Task;
}

export function EditTask({ close, task }: Props) {
    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            name: task.name,
            start: new Date(task.start),
            end: task.end && new Date(task.end),
        },
        validate: {
            name: (value) => (value.length < 2 ? 'Name must have at least 2 letters' : null),
        },
    });

    async function deleteTask(id?: number) {
        if (id) {
            await db.tasks.delete(id);
            close();
        }
    }

    async function updateTask(values: { name: string; start: Date; end: '' | Date | undefined }) {
        await db.tasks.update(task.id, {
            name: values.name,
            start: values.start && values.start.toISOString(),
            end: values.end && values.end.toISOString(),
        });
        close();
    }

    return (
        <>
            <form onSubmit={form.onSubmit((values) => updateTask(values))}>
                <TextInput
                    withAsterisk
                    label="Name"
                    placeholder="Checking Email"
                    key={form.key('name')}
                    {...form.getInputProps('name')}
                    mb={'sm'}
                />

                <DateTimePicker
                    withAsterisk
                    label="Start"
                    valueFormat="DD MMM YYYY hh:mm A"
                    key={form.key('start')}
                    {...form.getInputProps('start')}
                    mb={'sm'}
                />

                <DateTimePicker
                    withAsterisk
                    label="End"
                    valueFormat="DD MMM YYYY hh:mm A"
                    key={form.key('end')}
                    {...form.getInputProps('end')}
                />

                <Group justify="flex-end" mt="md">
                    <Button onClick={() => deleteTask(task.id)} variant={'subtle'}>
                        Delete
                    </Button>
                    <Button disabled={!form.isDirty()} type="submit">
                        Update
                    </Button>
                </Group>
            </form>
        </>
    );
}
