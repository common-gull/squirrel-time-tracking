import { useCallback, useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { modals } from '@mantine/modals';
import { Text } from '@mantine/core';
import { db } from '../../database/database.ts';
import { download } from '../../download/download.ts';

export const useBackupConfirmation = () => {
    const backupOnCloseSetting = useLiveQuery(() => db.settings.get('backupOnClose'));
    const beforeUnloadHandlerRef = useRef<((event: BeforeUnloadEvent) => void) | null>(null);

    const backup = useCallback(async () => {
        const settings = await db.settings.toArray();
        const tasks = await db.tasks.toArray();
        const todos = await db.todos.toArray();
        download(`squirrel-backup_${new Date().toISOString()}.json`, { settings, tasks, todos });
    }, []);

    const handleBeforeUnload = useCallback(
        (event: BeforeUnloadEvent) => {
            if (backupOnCloseSetting?.value === true) {
                event.preventDefault();
                event.returnValue = '';

                modals.openConfirmModal({
                    title: 'Backup before closing?',
                    children: (
                        <Text size="sm">
                            Would you like to create a backup before closing the application? This
                            will download your data to keep it safe.
                        </Text>
                    ),
                    labels: { confirm: 'Yes, backup', cancel: 'No, just close' },
                    onConfirm: () => {
                        backup();
                        // Allow the window to close after backup
                        setTimeout(() => {
                            window.close();
                        }, 100);
                    },
                    onCancel: () => {
                        // Allow the window to close without backup
                        setTimeout(() => {
                            window.close();
                        }, 100);
                    },
                });
            }
        },
        [backupOnCloseSetting?.value, backup],
    );

    useEffect(() => {
        if (beforeUnloadHandlerRef.current) {
            window.removeEventListener('beforeunload', beforeUnloadHandlerRef.current);
        }

        beforeUnloadHandlerRef.current = handleBeforeUnload;
        window.addEventListener('beforeunload', handleBeforeUnload, false);

        return () => {
            if (beforeUnloadHandlerRef.current) {
                window.removeEventListener('beforeunload', beforeUnloadHandlerRef.current);
            }
        };
    }, [handleBeforeUnload]);
};
