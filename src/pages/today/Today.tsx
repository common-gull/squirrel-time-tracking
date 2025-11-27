import { Card, SimpleGrid, Text } from '@mantine/core';
import { db, Task, Todo } from '../../database/database';
import { CurrentTask } from '../../components/tasks/CurrentTask.tsx';
import { TaskList } from '../../components/tasks/TaskList.tsx';
import { useLiveQuery } from 'dexie-react-hooks';
import dayjs from 'dayjs';
import { CreateTodo } from '../../components/todos/CreateTodo.tsx';
import { CreateTask } from '../../components/tasks/CreateTask.tsx';
import { TodoList } from '../../components/todos/TodoList.tsx';
import { useTranslation } from 'react-i18next';

export default function Today() {
    const { t } = useTranslation();
    const today = dayjs().format('YYYY-MM-DD');
    const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');
    const tasks =
        useLiveQuery(() => db.tasks.where('start').between(today, tomorrow).sortBy('start')) ?? [];
    const todos = useLiveQuery(() => db.todos.toArray()) ?? [];
    const completedTasks = tasks.filter((task) => task.end !== undefined);
    const currentTask = tasks.find((task) => task.end === undefined);

    async function cancelTask(task: Task) {
        await db.tasks.delete(task.id);
    }

    async function completeCurrentTask() {
        if (currentTask) {
            await db.tasks.update(currentTask.id, { end: new Date().toISOString() });
        }
    }

    async function handleTaskCreated() {
        await completeCurrentTask();
    }

    async function handleTodoStart(todo: Todo) {
        if (todo.name === currentTask?.name) {
            return;
        }
        const newTask = {
            name: todo.name,
            project: todo.project,
            start: new Date().toISOString(),
        };
        await db.tasks.add(newTask);
        await completeCurrentTask();
    }

    return (
        <div>
            <SimpleGrid cols={{ base: 1, sm: 1, lg: 2 }}>
                <div>
                    <Card>
                        <Text fw={500} size={'xl'}>
                            {t('pages.today.todos')}
                        </Text>
                        <CreateTodo />
                        <TodoList onTodoStart={handleTodoStart} todos={todos} />
                    </Card>
                </div>

                <div>
                    <Card>
                        <Text fw={500} size={'xl'}>
                            {t('pages.today.tasks')}
                        </Text>
                        <CreateTask onTaskCreated={handleTaskCreated} />
                        {currentTask && (
                            <CurrentTask
                                cancel={cancelTask}
                                complete={completeCurrentTask}
                                task={currentTask}
                            />
                        )}
                        <TaskList tasks={completedTasks} />
                    </Card>
                </div>
            </SimpleGrid>
        </div>
    );
}
