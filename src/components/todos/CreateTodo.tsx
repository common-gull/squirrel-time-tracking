import { Button, Card, Group, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { db } from '../../database/database.ts';
import { useTranslation } from 'react-i18next';

export function CreateTodo() {
    const { t } = useTranslation();
    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            name: '',
            project: '',
        },
        validate: {
            name: (value) =>
                value.trim().length < 2 ? t('todos.nameValidation') : null,
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
                        label={t('todos.name')}
                        placeholder={t('todos.namePlaceholder')}
                        key={form.key('name')}
                        {...form.getInputProps('name')}
                    />
                    <TextInput
                        label={t('todos.project')}
                        placeholder={t('todos.projectPlaceholder')}
                        key={form.key('project')}
                        {...form.getInputProps('project')}
                    />
                </Group>
                <Group justify={'end'}>
                    <Button mt={'sm'} disabled={!form.isDirty()} type="submit">
                        {t('todos.addTodo')}
                    </Button>
                </Group>
            </form>
        </Card>
    );
}
