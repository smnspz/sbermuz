export type Locale = 'it' | 'en';
export const defaultLocale: Locale = 'it';

const translations = {
  'nav.about': { it: 'chi siamo', en: 'about us' },
  'nav.archive': { it: 'archivio', en: 'archive' },
  'nav.listen': { it: 'ascolta', en: 'listen' },
  'hero.badge': { it: 'Prossimo evento', en: 'Next event' },
  'hero.freeEntry': { it: 'Ingresso gratuito', en: 'Free entry' },
  'hero.details': { it: 'Dettagli evento', en: 'Event details' },
  'hero.addCalendar': { it: 'Aggiungi al calendario', en: 'Add to calendar' },
  'info.aboutTitle': { it: 'Chi siamo', en: 'About us' },
  'info.aboutText': { it: 'Collettivo musicale genovese. Organizziamo concerti dal 2024.', en: 'Genoese music collective. Organizing concerts since 2024.' },
  'info.bandTitle': { it: 'Suoni in una band?', en: 'Play in a band?' },
  'info.bandText': { it: 'Proponici, ascoltiamo tutto.', en: 'Pitch us, we listen to everything.' },
  'info.writeUs': { it: 'Scrivici', en: 'Write to us' },
  'info.listenTitle': { it: 'Ascolta', en: 'Listen' },
  'info.listenText': { it: 'Le band che sono passate dal collettivo.', en: 'Bands that have played with the collective.' },
  'gallery.title': { it: 'Archivio eventi', en: 'Event archive' },
  'gallery.all': { it: 'Tutti', en: 'All' },
  'event.back': { it: 'torna alla home', en: 'back to home' },
  'event.addCalendar': { it: 'Aggiungi al calendario', en: 'Add to calendar' },
  'event.where': { it: 'Dove', en: 'Where' },
  'event.mapTitle': { it: 'Mappa evento', en: 'Event map' },
  'event.tocTitle': { it: 'In questa pagina', en: 'On this page' },
  'event.tocEntry': { it: 'Ingresso', en: 'Entry' },
  'photo.back': { it: 'torna al sito', en: 'back to site' },
  'footer.about': { it: 'Chi siamo', en: 'About us' },
  'footer.archive': { it: 'Archivio', en: 'Archive' },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, locale: Locale = 'it'): string {
  return translations[key][locale];
}
