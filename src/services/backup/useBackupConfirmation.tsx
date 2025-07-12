import { useCallback, useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../database/database.ts';

export const useBackupConfirmation = () => {
    const backupOnCloseSetting = useLiveQuery(() => db.settings.get('backupOnClose'));
    const beforeUnloadHandlerRef = useRef<((event: BeforeUnloadEvent) => void) | null>(null);

    const handleBeforeUnload = useCallback(
        (event: BeforeUnloadEvent) => {
            if (backupOnCloseSetting?.value === true) {
                event.preventDefault();
            }
        },
        [backupOnCloseSetting?.value],
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
