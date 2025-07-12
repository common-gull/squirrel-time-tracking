import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ns1 from './locales/en.json';

export const defaultNS = 'ns1';

export const resources = {
    en: {
        ns1: ns1,
    },
} as const;

i18n.use(initReactI18next).init({
    fallbackLng: 'en',
    defaultNS,
    resources,
});

export default i18n;
