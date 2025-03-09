import { Button, Group, TextInput } from '@mantine/core';
import { db, Task } from '../../database/database.ts';
import { useForm } from '@mantine/form';
import { DateTimePicker } from '@mantine/dates';
import { timePickerFormat } from '../../date/format.ts';

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
            project: task.project,
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

    async function updateTask(values: typeof form.values) {
        await db.tasks.update(task.id, {
            name: values.name,
            start: values.start && values.start.toISOString(),
            end: values.end && values.end.toISOString(),
            project: values.project,
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

                <TextInput
                    label="Project"
                    placeholder="Project A"
                    key={form.key('project')}
                    {...form.getInputProps('project')}
                    mb={'sm'}
                />

                <DateTimePicker
                    dropdownType="modal"
                    withAsterisk
                    label="Start"
                    valueFormat={timePickerFormat}
                    key={form.key('start')}
                    {...form.getInputProps('start')}
                    mb={'sm'}
                />

                <DateTimePicker
                    dropdownType="modal"
                    withAsterisk
                    label="End"
                    valueFormat={timePickerFormat}
                    key={form.key('end')}
                    {...form.getInputProps('end')}
                />

                <Group justify="space-between" mt="md">
                    <Button onClick={() => deleteTask(task.id)} variant={'subtle'} color={'red'}>
                        Delete
                    </Button>
                    <Group>
                        <Button variant={'subtle'} onClick={close}>
                            Cancel
                        </Button>
                        <Button disabled={!form.isDirty()} type="submit">
                            Update
                        </Button>
                    </Group>
                </Group>
            </form>
        </>
    );
}
