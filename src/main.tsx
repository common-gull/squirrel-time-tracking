import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import { Notifications } from '@mantine/notifications';
import { HashRouter } from 'react-router';
import './i18n';
import { ThemeProvider } from './components/ThemeProvider';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <HashRouter>
            <ThemeProvider>
                <Notifications />
                <App />
            </ThemeProvider>
        </HashRouter>
    </StrictMode>,
);
