import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(initReactI18next) // Passes i18n down to react-i18next
  .use(LanguageDetector) // Detects user language
  .init({
    resources: { // Define your resource object directly here
      en: {
        translation: {
          listNamePlaceholder: 'Add a list...'
        }
      },
      cz: {
        translation: {
          listNamePlaceholder: 'Přidat list...'
        }
      }
    },
    lng: 'en', // Set the default language
    fallbackLng: 'en', // Fallback to English if the translation for a language is missing
    interpolation: {
      escapeValue: false, // React already does escaping
    },
  });

export default i18n;
