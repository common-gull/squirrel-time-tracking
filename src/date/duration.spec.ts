import { describe, expect, test } from 'vitest';
import { calculateDuration, formatDuration } from './duration.ts';
import { Duration } from 'dayjs/plugin/duration';

describe('duration', () => {
    describe('calculateDuration', () => {
        const tests: {
            start: string;
            end: string;
            expected: {
                weeks: number;
                days: number;
                hours: number;
                minutes: number;
                seconds: number;
            };
        }[] = [
            {
                start: '2025-01-01T00:00:00.000Z',
                end: '2025-01-01T00:00:00.000Z',
                expected: {
                    weeks: 0,
                    days: 0,
                    hours: 0,
                    minutes: 0,
                    seconds: 0,
                },
            },
            {
                start: '2025-01-01T00:00:00.000Z',
                end: '2025-01-08T01:01:01.000Z',
                expected: {
                    weeks: 1,
                    days: 7,
                    hours: 1,
                    minutes: 1,
                    seconds: 1,
                },
            },
        ];

        test.each(tests)(
            'calculates expected duration for start=$start and end=$end',
            ({ start, end, expected }) => {
                const result = calculateDuration(start, end);
                expect(result.weeks()).toBe(expected.weeks);
                expect(result.days()).toBe(expected.days);
                expect(result.hours()).toBe(expected.hours);
                expect(result.minutes()).toBe(expected.minutes);
                expect(result.seconds()).toBe(expected.seconds);
            },
        );
    });

    describe('formatDuration', () => {
        const tests: {
            duration: Duration;
            expected: string;
        }[] = [
            {
                duration: calculateDuration('2025-01-01T12:00:00.000Z', '2025-01-01T12:05:37.000Z'),
                expected: '00:05:37',
            },
            {
                duration: calculateDuration('2025-01-01T12:00:00.000Z', '2025-01-01T13:05:37.000Z'),
                expected: '01:05:37',
            },
            {
                duration: calculateDuration('2025-01-01T12:00:00.000Z', '2025-01-01T13:01:01.000Z'),
                expected: '01:01:01',
            },
        ];

        test.each(tests)('formats duration $duration to $expected', ({ duration, expected }) => {
            const result = formatDuration(duration);
            expect(result).toBe(expected);
        });
    });
});
