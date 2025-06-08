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
            labelKey: 'navigation.today',
            icon: <IconHome2 size={16} stroke={1.5} />,
        },
    },
    {
        path: '/task-log',
        element: <TaskLog />,
        nav: {
            labelKey: 'navigation.taskLog',
            icon: <IconLogs size={16} stroke={1.5} />,
        },
    },
    {
        path: '/reports',
        element: <Reports />,
        nav: {
            labelKey: 'navigation.reports',
            icon: <IconReport size={16} stroke={1.5} />,
        },
    },
    {
        path: '/settings',
        element: <Settings />,
        nav: {
            labelKey: 'navigation.settings',
            icon: <IconSettings size={16} stroke={1.5} />,
        },
    },
];
