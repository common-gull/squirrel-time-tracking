import { Button, Group, TextInput } from '@mantine/core';
import { db, Todo } from '../../database/database.ts';
import { useForm } from '@mantine/form';
import { useTranslation } from 'react-i18next';

interface Props {
    close: () => void;
    todo: Todo;
}

export function EditTodo({ close, todo }: Props) {
    const { t } = useTranslation();
    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            name: todo.name,
            project: todo.project || '',
        },
        validate: {
            name: (value) => (value.trim().length < 2 ? t('todos.nameValidation') : null),
        },
        transformValues: ({ name, project }) => ({
            name: name.trim(),
            project: project.trim(),
        }),
    });

    async function updateTodo(values: typeof form.values) {
        await db.todos.update(todo.id, {
            name: values.name,
            project: values.project || undefined,
        });
        close();
    }

    return (
        <form onSubmit={form.onSubmit((values) => updateTodo(values))}>
            <TextInput
                withAsterisk
                label={t('todos.name')}
                placeholder={t('todos.namePlaceholder')}
                key={form.key('name')}
                {...form.getInputProps('name')}
                mb={'sm'}
            />

            <TextInput
                label={t('todos.project')}
                placeholder={t('todos.projectPlaceholder')}
                key={form.key('project')}
                {...form.getInputProps('project')}
                mb={'sm'}
            />

            <Group justify="flex-end" mt="md">
                <Button variant={'subtle'} onClick={close}>
                    {t('common.cancel')}
                </Button>
                <Button disabled={!form.isDirty()} type="submit">
                    {t('todos.update')}
                </Button>
            </Group>
        </form>
    );
}
