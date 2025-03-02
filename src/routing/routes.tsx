import { Today } from '../pages/today/Today.tsx';
import { Settings } from '../pages/settings/Settings.tsx';
import { IconHome2, IconSettings } from '@tabler/icons-react';

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
