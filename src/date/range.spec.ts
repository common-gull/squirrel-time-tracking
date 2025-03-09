import { describe, expect, test } from 'vitest';
import { calculateRange } from './range.ts';

describe('range', () => {
    describe('calculateRange', () => {
        const tests: { start: Date; end: Date; unit: 'd'; expected: string[] }[] = [
            {
                start: new Date(2025, 0, 1),
                end: new Date(2025, 0, 1),
                unit: 'd',
                expected: ['2025-01-01'],
            },
            {
                start: new Date(2025, 0, 1),
                end: new Date(2025, 0, 10),
                unit: 'd',
                expected: [
                    '2025-01-01',
                    '2025-01-02',
                    '2025-01-03',
                    '2025-01-04',
                    '2025-01-05',
                    '2025-01-06',
                    '2025-01-07',
                    '2025-01-08',
                    '2025-01-09',
                    '2025-01-10',
                ],
            },
            {
                start: new Date(2025, 1, 27),
                end: new Date(2025, 2, 1),
                unit: 'd',
                expected: ['2025-02-27', '2025-02-28', '2025-03-01'],
            },
            {
                start: new Date(2024, 1, 27),
                end: new Date(2024, 2, 1),
                unit: 'd',
                expected: ['2024-02-27', '2024-02-28', '2024-02-29', '2024-03-01'],
            },
        ];

        test.each(tests)(
            'calculates expected ranges for start=$start and end=$end',
            ({ start, end, unit, expected }) => {
                const result = calculateRange(start, end, unit);
                expect(result).toEqual(expected);
            },
        );
    });
});
