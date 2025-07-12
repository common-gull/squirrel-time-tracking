import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import { MantineProvider } from '@mantine/core';
import { mantineTheme } from './theme.ts';
import { Notifications } from '@mantine/notifications';
import { HashRouter } from 'react-router';
import './i18n';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <HashRouter>
            <MantineProvider defaultColorScheme={'dark'} theme={mantineTheme}>
                <Notifications />
                <App />
            </MantineProvider>
        </HashRouter>
    </StrictMode>,
);
