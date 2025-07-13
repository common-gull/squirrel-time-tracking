import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../database/database';

export type ThemePreference = 'auto' | 'light' | 'dark';
export type ColorScheme = 'light' | 'dark';

const useSystemTheme = (): ColorScheme => {
    const [systemTheme, setSystemTheme] = useState<ColorScheme>(() => {
        if (typeof window !== 'undefined' && window.matchMedia) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'dark'; // Default fallback
    });

    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) {
            return;
        }

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            setSystemTheme(e.matches ? 'dark' : 'light');
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    return systemTheme;
};

export const useTheme = () => {
    const systemTheme = useSystemTheme();
    const themePreference = useLiveQuery(
        async () => {
            const setting = await db.settings.get('theme');
            return (setting?.value as ThemePreference) || 'auto';
        },
        [],
        'auto',
    );

    const resolvedTheme: ColorScheme = themePreference === 'auto' ? systemTheme : themePreference;

    const setThemePreference = async (preference: ThemePreference) => {
        await db.settings.put({ id: 'theme', value: preference });
    };

    return {
        themePreference,
        resolvedTheme,
        systemTheme,
        setThemePreference,
    };
};
