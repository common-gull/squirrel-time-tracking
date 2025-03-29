import { Button, Card, Group, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { db } from '../../database/database.ts';

export function CreateTodo() {
    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            name: '',
            project: '',
        },
        validate: {
            name: (value) =>
                value.trim().length < 2 ? 'Name must include at least 2 characters' : null,
        },
        transformValues: ({ name, project }) => ({
            name: name.trim(),
            project: project.trim(),
        }),
    });

    async function createTodo({ name, project }: typeof form.values) {
        await db.todos.add({ name, project, createdOn: new Date().toISOString() });
        form.reset();
    }

    return (
        <Card withBorder>
            <form onSubmit={form.onSubmit((values) => createTodo(values))}>
                <Group align={'start'} grow>
                    <TextInput
                        label={'Name'}
                        placeholder="System Design"
                        key={form.key('name')}
                        {...form.getInputProps('name')}
                    />
                    <TextInput
                        label={'Project'}
                        placeholder="Project-A"
                        key={form.key('project')}
                        {...form.getInputProps('project')}
                    />
                </Group>
                <Group justify={'end'}>
                    <Button mt={'sm'} disabled={!form.isDirty()} type="submit">
                        Add Todo
                    </Button>
                </Group>
            </form>
        </Card>
    );
}
