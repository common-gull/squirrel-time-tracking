import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);

export function calculateDuration(startDate: string, endDate?: string) {
    const start = dayjs(startDate);
    const end = dayjs(endDate);

    const diff = end.diff(start);
    const dur = dayjs.duration(diff);

    const hours = String(dur.hours()).padStart(2, '0');
    const minutes = String(dur.minutes()).padStart(2, '0');
    const seconds = String(dur.seconds()).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
}
