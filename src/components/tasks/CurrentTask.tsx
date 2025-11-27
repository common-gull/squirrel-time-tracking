import { Task } from '../../database/database.ts';
import { Button, Card, Group, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import { calculateDuration, formatDuration } from '../../date/duration.ts';
import { isoStringToLocaleTimeString } from '../../date/format.ts';
import { useTranslation } from 'react-i18next';

interface Props {
    cancel: (task: Task) => void;
    complete: (task: Task) => void;
    task: Task;
}

export function CurrentTask({ cancel, complete, task }: Props) {
    const { t } = useTranslation();
    const [duration, setDuration] = useState<string>(() =>
        formatDuration(calculateDuration(task.start)),
    );

    useEffect(() => {
        const timer = setInterval(() => {
            setDuration(formatDuration(calculateDuration(task.start)));
        }, 1000);
        return () => {
            clearInterval(timer);
        };
    }, [task.start]);

    return (
        <Card p="xl" ta={'center'} withBorder mt={'sm'}>
            <Text fz="lg" tt="uppercase" fw={700} c="dimmed">
                {t('tasks.current.title')}
            </Text>
            <Text fz="mm" fw={500}>
                {task.name}
            </Text>
            <Text fz="sm" fw={500}>
                {t('tasks.current.startLabel')}: {isoStringToLocaleTimeString(task.start)}
            </Text>
            <Text fz="sm" mb={'sm'} fw={500}>
                {t('tasks.current.durationLabel')}: {duration}
            </Text>
            <Group justify={'center'}>
                <Button onClick={() => cancel(task)} variant={'light'}>
                    {t('common.cancel')}
                </Button>
                <Button onClick={() => complete(task)}>{t('common.complete')}</Button>
            </Group>
        </Card>
    );
}
