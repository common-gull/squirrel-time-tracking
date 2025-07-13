import React from 'react';
import { MantineProvider } from '@mantine/core';
import { mantineTheme } from '../theme';
import { useTheme } from '../hooks/useTheme';

interface ThemeProviderProps {
    children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const { resolvedTheme } = useTheme();

    return (
        <MantineProvider forceColorScheme={resolvedTheme} theme={mantineTheme}>
            {children}
        </MantineProvider>
    );
};
