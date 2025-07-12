import { useLiveQuery } from 'dexie-react-hooks';
import { db, Task } from '../../database/database.ts';
import { Button, Group, Stack, Modal } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';
import { isoStringToLocaleString } from '../../date/format.ts';
import { calculateDuration, formatDuration } from '../../date/duration.ts';
import { download } from '../../download/download.ts';
import Papa from 'papaparse';
import { EditTask } from '../../components/tasks/EditTask.tsx';
import { useTranslation } from 'react-i18next';
import { MantineTable } from '../../components/table/MantineTable.tsx';
import { ColumnDef, Row, useReactTable } from '@tanstack/react-table';
import { useState } from 'react';
import { useDisclosure } from '@mantine/hooks';

interface FormattedTask extends Task, Record<string, string | number | undefined> {
    duration: string;
}

export default function TaskLog() {
    const { t } = useTranslation();
    const [editingTask, setEditingTask] = useState<FormattedTask | null>(null);
    const [opened, { open, close }] = useDisclosure(false);

    const columns: ColumnDef<FormattedTask>[] = [
        {
            accessorKey: 'id',
            header: t('pages.taskLog.columns.id'),
            enableHiding: true,
        },
        {
            accessorKey: 'name',
            header: t('pages.taskLog.columns.name'),
        },
        {
            accessorKey: 'project',
            header: t('pages.taskLog.columns.project'),
        },
        {
            accessorKey: 'start',
            header: t('pages.taskLog.columns.start'),
        },
        {
            accessorKey: 'end',
            header: t('pages.taskLog.columns.end'),
        },
        {
            accessorKey: 'duration',
            header: t('pages.taskLog.columns.duration'),
            enableSorting: true,
        },
    ];

    const tasks: FormattedTask[] = useLiveQuery(
        async () => {
            const tasks = await db.tasks.toArray();
            return tasks
                .filter((task) => Boolean(task.end))
                .map((task) => ({
                    ...task,
                    start: isoStringToLocaleString(task.start),
                    end: task.end && isoStringToLocaleString(task.end),
                    duration: task.end
                        ? formatDuration(calculateDuration(task.start, task.end))
                        : '',
                }));
        },
        [],
        [],
    );

    const handleExportRows = (rows: Row<FormattedTask>[]) => {
        const rowData = rows.map((row) => row.original);
        const csv = Papa.unparse(rowData, {
            header: true,
            newline: '\n',
            skipEmptyLines: true,
        });
        download(`squirrel-export_${new Date().toISOString()}.csv`, csv);
    };

    const handleRowEdit = (row: Row<FormattedTask>) => {
        const task = row.original;
        setEditingTask(task);
        open();
    };

    const handleCloseEdit = () => {
        setEditingTask(null);
        close();
    };

    const renderTopToolbar = ({
        table,
        selectedRows,
    }: {
        table: ReturnType<typeof useReactTable<FormattedTask>>;
        selectedRows: Row<FormattedTask>[];
    }) => (
        <Group>
            <Button
                disabled={table.getPrePaginationRowModel().rows.length === 0}
                onClick={() => handleExportRows(table.getPrePaginationRowModel().rows)}
                leftSection={<IconDownload />}
                variant="filled"
            >
                {t('pages.taskLog.export.allRows')}
            </Button>
            <Button
                disabled={table.getRowModel().rows.length === 0}
                onClick={() => handleExportRows(table.getRowModel().rows)}
                leftSection={<IconDownload />}
                variant="filled"
            >
                {t('pages.taskLog.export.pageRows')}
            </Button>
            <Button
                disabled={selectedRows.length === 0}
                onClick={() => handleExportRows(selectedRows)}
                leftSection={<IconDownload />}
                variant="filled"
            >
                {t('pages.taskLog.export.selectedRows')}
            </Button>
        </Group>
    );

    return (
        <>
            <MantineTable
                data={tasks}
                columns={columns}
                enableRowSelection={true}
                enableEditing={true}
                enableColumnVisibility={true}
                enableFiltering={true}
                enableSorting={true}
                enablePagination={true}
                initialColumnVisibility={{ id: false }}
                pageSize={10}
                onRowEdit={handleRowEdit}
                renderTopToolbar={renderTopToolbar}
                getRowId={(row) => row.id?.toString() || ''}
            />

            <Modal opened={opened} onClose={handleCloseEdit} title={t('pages.taskLog.editTask')}>
                {editingTask && (
                    <Stack>
                        <EditTask
                            close={handleCloseEdit}
                            task={{
                                id: editingTask.id,
                                name: editingTask.name,
                                start: editingTask.start,
                                end: editingTask.end,
                                project: editingTask.project,
                            }}
                        />
                    </Stack>
                )}
            </Modal>
        </>
    );
}
