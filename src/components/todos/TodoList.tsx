import { Text, Card, ActionIcon, Group, Grid, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { db, Todo } from '../../database/database.ts';
import { IconEdit, IconPlayerPlay, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { EditTodo } from './EditTodo.tsx';

interface Props {
    onTodoStart: (todo: Todo) => void;
    todos: Todo[];
}

export function TodoList({ onTodoStart, todos }: Props) {
    const { t } = useTranslation();
    const [opened, { open, close }] = useDisclosure(false);
    const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

    if (!todos.length) {
        return null;
    }

    async function deleteTodo(todo: Todo) {
        await db.todos.delete(todo.id);
    }

    function openEditModal(todo: Todo) {
        setSelectedTodo(todo);
        open();
    }

    function handleClose() {
        close();
        setSelectedTodo(null);
    }

    return (
        <>
            <Modal opened={opened} onClose={handleClose} title={t('todos.editTodo')}>
                {selectedTodo && <EditTodo todo={selectedTodo} close={handleClose} />}
            </Modal>

            <Card withBorder mt={'sm'}>
                <Grid align={'center'} grow>
                    {todos.map((todo) => {
                        const isComplete = Boolean(todo.completedOn);
                        return (
                            <Grid.Col span={'content'} key={todo.id}>
                                <Card withBorder>
                                    <Group justify={'space-between'}>
                                        <div>
                                            <Text size={'l'}>{todo.name}</Text>
                                            {todo.project && (
                                                <Text c="dimmed" size={'sm'}>
                                                    {todo.project}
                                                </Text>
                                            )}
                                        </div>

                                        <Group justify={'flex-end'}>
                                            {!isComplete && (
                                                <>
                                                    <ActionIcon
                                                        variant="filled"
                                                        aria-label={t('todos.startTask')}
                                                        onClick={() => onTodoStart(todo)}
                                                    >
                                                        <IconPlayerPlay
                                                            style={{ width: '70%', height: '70%' }}
                                                            stroke={1.5}
                                                        />
                                                    </ActionIcon>
                                                </>
                                            )}

                                            <ActionIcon
                                                variant="light"
                                                aria-label={t('common.edit')}
                                                onClick={() => openEditModal(todo)}
                                            >
                                                <IconEdit
                                                    style={{ width: '70%', height: '70%' }}
                                                    stroke={1.5}
                                                />
                                            </ActionIcon>

                                            <ActionIcon
                                                variant="filled"
                                                color={'red'}
                                                aria-label={t('common.delete')}
                                                onClick={() => deleteTodo(todo)}
                                            >
                                                <IconTrash
                                                    style={{ width: '70%', height: '70%' }}
                                                    stroke={1.5}
                                                />
                                            </ActionIcon>
                                        </Group>
                                    </Group>
                                </Card>
                            </Grid.Col>
                        );
                    })}
                </Grid>
            </Card>
        </>
    );
}
