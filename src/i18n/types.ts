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
    };
    navigation: {
        today: string;
        taskLog: string;
        reports: string;
        settings: string;
    };
    app: {
        title: string;
    };
    pages: {
        today: {
            todos: string;
            tasks: string;
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
}
