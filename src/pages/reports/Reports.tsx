import { Button, Card, Grid, NativeSelect, Table, Text } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import dayjs from 'dayjs';
import { useLiveQuery } from 'dexie-react-hooks';
import { Task } from '../../database/database.ts';
import { useCallback, useState } from 'react';
import { calculateTaskHours } from '../../services/reports/reports.service.ts';
import { TaskHours } from '../../services/reports/interfaces/task-hours.ts';
import { useTranslation } from 'react-i18next';

interface Settings {
    dateRange: [string, string];
    groupBy: keyof Pick<Task, 'name' | 'project'>;
}

export default function Reports() {
    const { t } = useTranslation();

    const copyToClipboard = useCallback(
        async (value: string) => {
            await navigator.clipboard.writeText(value);
            notifications.show({
                title: t('notifications.copied'),
                message: value,
                color: 'green',
                autoClose: 2000,
            });
        },
        [t],
    );

    const [settings, setSettings] = useState<Settings>({
        dateRange: [
            dayjs().subtract(7, 'd').startOf('day').format('YYYY-MM-DD'),
            dayjs().endOf('day').format('YYYY-MM-DD'),
        ],
        groupBy: 'name',
    });

    const form = useForm<Settings>({
        mode: 'uncontrolled',
        initialValues: settings,
    });

    const { data, dates, dailyTotals, grandTotal }: TaskHours = useLiveQuery(
        async () =>
            calculateTaskHours(
                dayjs(settings.dateRange[0]).startOf('day').toDate(),
                dayjs(settings.dateRange[1]).endOf('day').toDate(),
                settings.groupBy,
            ),
        [settings],
        { data: {}, dates: [], dailyTotals: {}, grandTotal: 0 },
    );

    const clickableStyle = { cursor: 'pointer' };

    const rows = Object.values(data).map((task) => (
        <Table.Tr key={task.name}>
            <Table.Td>{task.name}</Table.Td>
            {dates.map((date) => {
                const total = task.totals[date] ?? 0;
                const fixedTotal = total.toFixed(2);
                return (
                    <Table.Td
                        key={date}
                        style={clickableStyle}
                        onClick={() => copyToClipboard(fixedTotal)}
                    >
                        <Text c={fixedTotal === '0.00' ? 'dimmed' : ''}>{fixedTotal}</Text>
                    </Table.Td>
                );
            })}
        </Table.Tr>
    ));

    const totalRow = (
        <Table.Tr style={{ fontWeight: 'bold', borderTop: '2px solid #dee2e6' }}>
            <Table.Td style={{ fontWeight: 'bold' }}>{t('pages.reports.dailyTotal')}</Table.Td>
            {dates.map((date) => {
                const total = dailyTotals[date] ?? 0;
                const fixedTotal = total.toFixed(2);
                return (
                    <Table.Td
                        key={date}
                        style={{ fontWeight: 'bold', cursor: 'pointer' }}
                        onClick={() => copyToClipboard(fixedTotal)}
                    >
                        <Text c={fixedTotal === '0.00' ? 'dimmed' : ''}>{fixedTotal}</Text>
                    </Table.Td>
                );
            })}
        </Table.Tr>
    );

    return (
        <Grid>
            <Grid.Col
                span={{ base: 12, sm: 12, md: 8, lg: 9 }}
                order={{ base: 2, sm: 2, md: 1, lg: 1 }}
            >
                <Card>
                    <Text size="lg">{t('pages.reports.title')}</Text>
                    <Table.ScrollContainer minWidth={undefined}>
                        <Table>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th style={{ textTransform: 'capitalize' }}>
                                        {settings.groupBy}
                                    </Table.Th>
                                    {dates.map((date) => (
                                        <Table.Th key={date}>{date}</Table.Th>
                                    ))}
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {rows}
                                {totalRow}
                            </Table.Tbody>
                        </Table>
                    </Table.ScrollContainer>
                    <Text
                        size="lg"
                        mt="md"
                        style={{ fontWeight: 'bold', cursor: 'pointer', display: 'inline-block' }}
                        onClick={() => copyToClipboard(grandTotal.toFixed(2))}
                    >
                        {t('pages.reports.totalHours')}: {grandTotal.toFixed(2)}
                    </Text>
                </Card>
            </Grid.Col>
            <Grid.Col
                span={{ base: 12, sm: 12, md: 4, lg: 3 }}
                order={{ base: 1, sm: 1, md: 2, lg: 2 }}
            >
                <Card>
                    {t('pages.reports.settings')}
                    <form onSubmit={form.onSubmit((values) => setSettings(values))}>
                        <DatePickerInput
                            type="range"
                            dropdownType="modal"
                            allowSingleDateInRange
                            maxDate={dayjs().format('YYYY-MM-DD')}
                            minDate={dayjs().subtract(6, 'month').format('YYYY-MM-DD')}
                            withAsterisk
                            label={t('pages.reports.dateRange')}
                            key={form.key('dateRange')}
                            {...form.getInputProps('dateRange')}
                            mb={'sm'}
                        />
                        <NativeSelect
                            label={t('pages.reports.groupBy')}
                            data={[
                                { label: t('pages.reports.name'), value: 'name' },
                                { label: t('pages.reports.project'), value: 'project' },
                            ]}
                            key={form.key('groupBy')}
                            {...form.getInputProps('groupBy')}
                            mb={'sm'}
                        />
                        <Button type={'submit'}>{t('pages.reports.update')}</Button>
                    </form>
                </Card>
            </Grid.Col>
        </Grid>
    );
}
