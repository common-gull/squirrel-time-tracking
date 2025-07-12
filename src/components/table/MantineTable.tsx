import React, { useState } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    ColumnDef,
    flexRender,
    Row,
    SortingState,
    ColumnFiltersState,
    VisibilityState,
    RowSelectionState,
} from '@tanstack/react-table';
import {
    Table,
    TableScrollContainer,
    Pagination,
    Group,
    TextInput,
    ActionIcon,
    Checkbox,
    Button,
    Stack,
    Paper,
    Menu,
    Text,
    Box,
    Flex,
} from '@mantine/core';
import { IconChevronUp, IconChevronDown, IconSearch, IconEdit, IconEye } from '@tabler/icons-react';

interface MantineTableProps<TData> {
    data: TData[];
    columns: ColumnDef<TData>[];
    enableRowSelection?: boolean;
    enableEditing?: boolean;
    enableColumnVisibility?: boolean;
    enableFiltering?: boolean;
    enableSorting?: boolean;
    enablePagination?: boolean;
    initialColumnVisibility?: VisibilityState;
    pageSize?: number;
    onRowEdit?: (row: Row<TData>) => void;
    renderTopToolbar?: (props: {
        table: ReturnType<typeof useReactTable<TData>>;
        selectedRows: Row<TData>[];
    }) => React.ReactNode;
    getRowId?: (row: TData) => string;
}

export const MantineTable = <TData,>({
    data,
    columns,
    enableRowSelection = false,
    enableEditing = false,
    enableColumnVisibility = false,
    enableFiltering = false,
    enableSorting = true,
    enablePagination = true,
    initialColumnVisibility = {},
    pageSize = 10,
    onRowEdit,
    renderTopToolbar,
    getRowId,
}: MantineTableProps<TData>) => {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] =
        useState<VisibilityState>(initialColumnVisibility);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [globalFilter, setGlobalFilter] = useState('');

    const tableColumns = React.useMemo(() => {
        const cols: ColumnDef<TData>[] = [];

        if (enableRowSelection) {
            cols.push({
                id: 'select',
                header: ({ table }) => (
                    <Checkbox
                        checked={table.getIsAllRowsSelected()}
                        indeterminate={table.getIsSomeRowsSelected()}
                        onChange={table.getToggleAllRowsSelectedHandler()}
                        aria-label="Toggle all rows selected"
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox
                        checked={row.getIsSelected()}
                        disabled={!row.getCanSelect()}
                        onChange={row.getToggleSelectedHandler()}
                        aria-label="Toggle select row"
                    />
                ),
                enableSorting: false,
                enableHiding: false,
            });
        }

        cols.push(...columns);

        if (enableEditing) {
            cols.push({
                id: 'actions',
                header: 'Actions',
                cell: ({ row }) => (
                    <ActionIcon variant="subtle" onClick={() => onRowEdit?.(row)} aria-label="Edit">
                        <IconEdit size={16} />
                    </ActionIcon>
                ),
                enableSorting: false,
                enableHiding: false,
            });
        }

        return cols;
    }, [columns, enableRowSelection, enableEditing, onRowEdit]);

    const table = useReactTable({
        data,
        columns: tableColumns,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            globalFilter,
        },
        enableRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getRowId,
        initialState: {
            pagination: {
                pageSize,
            },
        },
    });

    const selectedRows = table.getSelectedRowModel().rows;

    return (
        <Stack>
            {(renderTopToolbar || enableFiltering || enableColumnVisibility) && (
                <Paper p="md" withBorder>
                    <Group justify="space-between" mb="sm">
                        {enableFiltering && (
                            <TextInput
                                placeholder="Search all columns..."
                                value={globalFilter}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                                leftSection={<IconSearch size={16} />}
                                style={{ minWidth: 200 }}
                            />
                        )}
                        <Group>
                            {enableColumnVisibility && (
                                <Menu>
                                    <Menu.Target>
                                        <Button
                                            variant="subtle"
                                            leftSection={<IconEye size={16} />}
                                        >
                                            Columns
                                        </Button>
                                    </Menu.Target>
                                    <Menu.Dropdown>
                                        {table.getAllLeafColumns().map((column) => {
                                            if (column.id === 'select' || column.id === 'actions')
                                                return null;
                                            return (
                                                <Menu.Item key={column.id}>
                                                    <Checkbox
                                                        checked={column.getIsVisible()}
                                                        onChange={column.getToggleVisibilityHandler()}
                                                        label={
                                                            typeof column.columnDef.header ===
                                                            'string'
                                                                ? column.columnDef.header
                                                                : column.id
                                                        }
                                                    />
                                                </Menu.Item>
                                            );
                                        })}
                                    </Menu.Dropdown>
                                </Menu>
                            )}
                        </Group>
                    </Group>
                    {renderTopToolbar && renderTopToolbar({ table, selectedRows })}
                </Paper>
            )}

            <TableScrollContainer minWidth={800}>
                <Table striped highlightOnHover>
                    <Table.Thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <Table.Tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <Table.Th
                                        key={header.id}
                                        style={{
                                            cursor: header.column.getCanSort()
                                                ? 'pointer'
                                                : 'default',
                                            userSelect: 'none',
                                        }}
                                        onClick={header.column.getToggleSortingHandler()}
                                    >
                                        <Flex align="center" gap="xs">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef.header,
                                                      header.getContext(),
                                                  )}
                                            {enableSorting && header.column.getCanSort() && (
                                                <Box>
                                                    {header.column.getIsSorted() === 'asc' ? (
                                                        <IconChevronUp size={16} />
                                                    ) : header.column.getIsSorted() === 'desc' ? (
                                                        <IconChevronDown size={16} />
                                                    ) : null}
                                                </Box>
                                            )}
                                        </Flex>
                                    </Table.Th>
                                ))}
                            </Table.Tr>
                        ))}
                    </Table.Thead>
                    <Table.Tbody>
                        {table.getRowModel().rows.map((row) => (
                            <Table.Tr key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <Table.Td key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </Table.Td>
                                ))}
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </TableScrollContainer>

            {enablePagination && (
                <Group justify="space-between" mt="md">
                    <Group>
                        <Text size="sm">
                            Showing {table.getRowModel().rows.length} of{' '}
                            {table.getPrePaginationRowModel().rows.length} entries
                        </Text>
                        {enableRowSelection && (
                            <Text size="sm">({selectedRows.length} selected)</Text>
                        )}
                    </Group>
                    <Group>
                        <Pagination
                            value={table.getState().pagination.pageIndex + 1}
                            onChange={(page) => table.setPageIndex(page - 1)}
                            total={table.getPageCount()}
                            withEdges
                        />
                    </Group>
                </Group>
            )}
        </Stack>
    );
};
