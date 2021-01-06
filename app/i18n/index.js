import i18n from 'i18next';
import { initReactI18next, withTranslation } from 'react-i18next';
import moment from 'moment';

const languages = {
    de: { translation: require('./lang/de.json') },
    en: { translation: require('./lang/en.json') },
    es: { translation: require('./lang/es.json') },
    fr: { translation: require('./lang/fr.json') },
    hu: { translation: require('./lang/hu.json') },
    it: { translation: require('./lang/it.json') },
    ru: { translation: require('./lang/ru.json') }
};

const detectedLocale = window.jitsiNodeAPI.getLocale();

i18n
    .use(initReactI18next)
    .init({
        resources: languages,
        lng: detectedLocale,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false // not needed for react as it escapes by default
        }
    });

moment.locale(detectedLocale);



/**
 * Wraps a specific React Component in order to enable translations in it.
 *
 * @param {Component} component - The React Component to wrap.
 * @returns {Component} The React Component which wraps {@link component} and
 * enables translations in it.
 */
export function translate(component) {
    // Use the default list of namespaces.
    return withTranslation([ 'main', 'languages', 'countries' ])(component);
}

export { i18n };
