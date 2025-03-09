import { IconHome2, IconLogs, IconReport, IconSettings } from '@tabler/icons-react';
import { lazy } from 'react';

const Reports = lazy(() => import('../pages/reports/Reports.tsx'));
const Settings = lazy(() => import('../pages/settings/Settings'));
const Today = lazy(() => import('../pages/today/Today'));
const TaskLog = lazy(() => import('../pages/task-log/TaskLog.tsx'));

export const routes = [
    {
        index: true,
        path: '/',
        element: <Today />,
        nav: {
            label: 'Today',
            icon: <IconHome2 size={16} stroke={1.5} />,
        },
    },
    {
        path: '/task-log',
        element: <TaskLog />,
        nav: {
            label: 'Task Log',
            icon: <IconLogs size={16} stroke={1.5} />,
        },
    },
    {
        path: '/reports',
        element: <Reports />,
        nav: {
            label: 'Reports',
            icon: <IconReport size={16} stroke={1.5} />,
        },
    },
    {
        path: '/settings',
        element: <Settings />,
        nav: {
            label: 'Settings',
            icon: <IconSettings size={16} stroke={1.5} />,
        },
    },
];
