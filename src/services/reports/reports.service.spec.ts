import { beforeEach, describe, expect, it, vi } from 'vitest';
import { calculateTaskHours } from './reports.service.ts';
import { Task } from '../../database/database.ts';
import { TaskHours } from './interfaces/task-hours.ts';

const mocks = vi.hoisted(() => {
    return {
        db: {
            tasks: {
                where: vi.fn().mockReturnThis(),
                above: vi.fn().mockReturnThis(),
                and: vi.fn().mockReturnThis(),
                sortBy: vi.fn(),
            },
        },
    };
});

vi.mock('../../database/database.ts', () => {
    return {
        db: mocks.db,
    };
});

describe('reports service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    describe('calculateTaskHours', () => {
        interface Test {
            name: string;
            start: Date;
            end: Date;
            groupBy: keyof Pick<Task, 'name' | 'project'>;
            tasks: Task[];
            expected: TaskHours;
        }

        const tests: Test[] = [
            {
                name: 'returns tasks grouped by project',
                start: new Date('2025-01-01T12:00:00.000Z'),
                end: new Date('2025-01-02T12:00:00.000Z'),
                groupBy: 'project',
                tasks: [
                    {
                        id: 1,
                        name: 'Task1',
                        project: 'Project1',
                        start: '2025-01-01T12:00:00.000Z',
                        end: '2025-01-01T12:45:00.000Z',
                    },
                    {
                        id: 2,
                        name: 'Task2',
                        project: 'Project1',
                        start: '2025-01-01T12:00:00.000Z',
                        end: '2025-01-01T12:45:00.000Z',
                    },
                    {
                        id: 3,
                        name: 'Task3',
                        project: 'Project1',
                        start: '2025-01-02T12:00:00.000Z',
                        end: '2025-01-02T12:15:00.000Z',
                    },
                ],
                expected: {
                    data: {
                        Project1: {
                            date: '2025-01-01',
                            name: 'Project1',
                            totals: {
                                '2025-01-01': 1.5,
                                '2025-01-02': 0.25,
                            },
                        },
                    },
                    dates: ['2025-01-01', '2025-01-02'],
                    dailyTotals: {
                        '2025-01-01': 1.5,
                        '2025-01-02': 0.25,
                    },
                    grandTotal: 1.75,
                },
            },
            {
                name: 'returns tasks grouped by name',
                start: new Date('2025-01-01T12:00:00.000Z'),
                end: new Date('2025-01-02T12:00:00.000Z'),
                groupBy: 'name',
                tasks: [
                    {
                        id: 1,
                        name: 'Task1',
                        project: 'Project1',
                        start: '2025-01-01T12:00:00.000Z',
                        end: '2025-01-01T12:45:00.000Z',
                    },
                    {
                        id: 2,
                        name: 'Task2',
                        project: 'Project1',
                        start: '2025-01-01T12:00:00.000Z',
                        end: '2025-01-01T12:45:00.000Z',
                    },
                    {
                        id: 3,
                        name: 'Task1',
                        project: 'Project1',
                        start: '2025-01-02T12:00:00.000Z',
                        end: '2025-01-02T12:15:00.000Z',
                    },
                ],
                expected: {
                    data: {
                        Task1: {
                            date: '2025-01-01',
                            name: 'Task1',
                            totals: {
                                '2025-01-01': 0.75,
                                '2025-01-02': 0.25,
                            },
                        },
                        Task2: {
                            date: '2025-01-01',
                            name: 'Task2',
                            totals: {
                                '2025-01-01': 0.75,
                                '2025-01-02': 0,
                            },
                        },
                    },
                    dates: ['2025-01-01', '2025-01-02'],
                    dailyTotals: {
                        '2025-01-01': 1.5,
                        '2025-01-02': 0.25,
                    },
                    grandTotal: 1.75,
                },
            },
        ];
        it.each(tests)('$name', async ({ start, end, tasks, groupBy, expected }) => {
            mocks.db.tasks.sortBy.mockResolvedValue(tasks);
            const result = await calculateTaskHours(start, end, groupBy);
            expect(result).toEqual(expected);
        });
    });
});
