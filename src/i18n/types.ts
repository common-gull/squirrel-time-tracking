export interface TranslationKeys {
    common: {
        save: string;
        cancel: string;
        delete: string;
        edit: string;
        add: string;
        close: string;
        confirm: string;
        loading: string;
        error: string;
        success: string;
        warning: string;
        info: string;
        backup: string;
        complete: string;
        start: string;
        end: string;
        duration: string;
        project: string;
    };
    navigation: {
        today: string;
        taskLog: string;
        reports: string;
        settings: string;
    };
    app: {
        title: string;
        squirrelIcon: string;
    };
    pages: {
        today: {
            todos: string;
            tasks: string;
        };
        reports: {
            title: string;
            settings: string;
            dateRange: string;
            groupBy: string;
            update: string;
            name: string;
            project: string;
        };
        settings: {
            backup: {
                title: string;
                description: string;
                button: string;
                askBeforeClosing: string;
                askBeforeClosingDescription: string;
            };
            restore: {
                title: string;
                description: string;
                button: string;
            };
            deleteData: {
                title: string;
                description: string;
                button: string;
            };
        };
        taskLog: {
            columns: {
                id: string;
                name: string;
                project: string;
                start: string;
                end: string;
                duration: string;
            };
            editTask: string;
            export: {
                allRows: string;
                pageRows: string;
                selectedRows: string;
            };
        };
    };
    tasks: {
        createPlaceholder: string;
        project: string;
        task: string;
        description: string;
        date: string;
        duration: string;
        start: string;
        stop: string;
        complete: string;
        cancel: string;
        name: string;
        namePlaceholder: string;
        projectPlaceholder: string;
        end: string;
        update: string;
        nameValidation: string;
        current: {
            title: string;
            startLabel: string;
            durationLabel: string;
        };
        completed: string;
        projectLabel: string;
    };
    todos: {
        title: string;
        createPlaceholder: string;
        markComplete: string;
        startTask: string;
        name: string;
        project: string;
        namePlaceholder: string;
        projectPlaceholder: string;
        addTodo: string;
        nameValidation: string;
    };
    forms: {
        required: string;
        invalidEmail: string;
        invalidDate: string;
        submit: string;
        reset: string;
    };
    notifications: {
        backupEnabled: string;
        backupDisabled: string;
        dataRestored: string;
        dataDeleted: string;
        importError: string;
    };
}
