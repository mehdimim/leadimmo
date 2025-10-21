export const locales = ['en', 'th', 'fr', 'es', 'zh'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeLabels: Record<Locale, string> = {
  en: 'English',
  th: 'ไทย',
  fr: 'Français',
  es: 'Español',
  zh: '中文 (简体)'
};

export const rtlLocales: Locale[] = [];

export const localePrefix = 'always';

export function isLocale(maybeLocale: string): maybeLocale is Locale {
  return locales.includes(maybeLocale as Locale);
}
