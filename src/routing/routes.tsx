import { IconHome2, IconSettings } from '@tabler/icons-react';
import { lazy } from 'react';

const Settings = lazy(() => import('../pages/settings/Settings'));
const Today = lazy(() => import('../pages/today/Today'));

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
        path: '/settings',
        element: <Settings />,
        nav: {
            label: 'Settings',
            icon: <IconSettings size={16} stroke={1.5} />,
        },
    },
];
