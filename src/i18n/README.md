# Internationalization (i18n) Setup

This project uses `react-i18next` for internationalization support.

## Setup

The i18n configuration is automatically initialized when the app starts via the import in `main.tsx`.

## Usage

### In React Components

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('common.loading')}</h1>
      <button>{t('common.save')}</button>
    </div>
  );
}
```

### Translation Keys

All translation keys are defined in `src/i18n/locales/en.json`. The structure follows a nested approach:

- `common.*` - Common UI elements (save, cancel, loading, etc.)
- `navigation.*` - Navigation menu items
- `app.*` - App-specific text (title, etc.)
- `pages.*` - Page-specific content
- `tasks.*` - Task-related text
- `todos.*` - Todo-related text
- `forms.*` - Form validation and labels

### Adding New Translations

1. Add the new key-value pair to `src/i18n/locales/en.json`
2. Use the translation in your component with `t('your.new.key')`

### Adding New Languages

1. Create a new JSON file in `src/i18n/locales/` (e.g., `es.json` for Spanish)
2. Add the import and resource to `src/i18n/index.ts`
3. Update the i18n configuration to include the new language

## Current Languages

- English (en) - Default language

## Type Safety

The project includes TypeScript interfaces for translation keys to provide better development experience and catch missing translations at compile time. 