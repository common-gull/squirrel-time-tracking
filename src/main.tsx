import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import { MantineProvider } from '@mantine/core';
import { BrowserRouter } from 'react-router';
import { mantineTheme } from './theme.ts';
import { Notifications } from '@mantine/notifications';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <MantineProvider defaultColorScheme={'dark'} theme={mantineTheme}>
                <Notifications />
                <App />
            </MantineProvider>
        </BrowserRouter>
    </StrictMode>,
);
