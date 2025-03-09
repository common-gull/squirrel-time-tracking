export interface TaskHours {
    data: {
        [name: string]: {
            name: string;
            date: string;
            totals: { [date: string]: number };
        };
    };
    dates: string[];
}
