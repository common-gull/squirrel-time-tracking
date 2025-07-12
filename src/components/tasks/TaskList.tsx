import { Text, Modal, Timeline, Anchor, Card } from '@mantine/core';
import { calculateDuration, formatDuration } from '../../date/duration.ts';
import { useDisclosure } from '@mantine/hooks';
import { Task } from '../../database/database.ts';
import { useState } from 'react';
import { IconCheck } from '@tabler/icons-react';
import { EditTask } from './EditTask.tsx';
import { useTranslation } from 'react-i18next';

interface Props {
    tasks: Task[];
}

export function TaskList({ tasks }: Props) {
    const { t } = useTranslation();
    const [opened, { open, close }] = useDisclosure(false, { onClose: handleClose });
    const [currentTask, setCurrentTask] = useState<Task>();

    function openTask(task: Task) {
        setCurrentTask(task);
        open();
    }

    function handleClose() {
        setCurrentTask(undefined);
    }

    if (!tasks.length) {
        return null;
    }

    return (
        <Card style={{ overflowX: 'hidden' }} withBorder mt={'sm'}>
            <Text size={'l'}>{t('tasks.completed')}</Text>

            <Modal opened={opened} onClose={close} title={t('pages.taskLog.editTask')}>
                {currentTask && <EditTask close={close} task={currentTask} />}
            </Modal>

            <Timeline active={tasks.length} bulletSize={36} m={'xl'}>
                {tasks.map((task) => {
                    const start = new Date(task.start);
                    const end = new Date(task.end || task.start);

                    return (
                        <Timeline.Item
                            key={task.id}
                            title={
                                <Anchor onClick={() => openTask(task)}>
                                    <Text size={'xl'}>{task.name}</Text>
                                </Anchor>
                            }
                            bullet={<IconCheck size={20} />}
                        >
                            {task.project && (
                                <Text c="dimmed" size="sm">
                                    {t('tasks.projectLabel')}: {task.project}
                                </Text>
                            )}
                            <Text c="dimmed" size="lg">
                                {t('common.start')}: {start.toLocaleTimeString()}
                            </Text>
                            <Text c="dimmed" size="lg">
                                {t('common.end')}: {end.toLocaleTimeString()}
                            </Text>
                            <Text size="xs" mt={4}>
                                {t('common.duration')}:{' '}
                                {formatDuration(calculateDuration(task.start, task.end))}
                            </Text>
                        </Timeline.Item>
                    );
                })}
            </Timeline>
        </Card>
    );
}
