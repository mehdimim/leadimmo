import {getRequestConfig} from 'next-intl/server';

import {defaultLocale, locales} from '@/lib/i18n';

export default getRequestConfig(async ({requestLocale}) => {
  const locale = (await requestLocale) ?? defaultLocale;
  const normalized = locales.includes(locale as (typeof locales)[number])
    ? (locale as (typeof locales)[number])
    : defaultLocale;

  return {
    locale: normalized,
    messages: (await import(`../messages/${normalized}.json`)).default
  };
});
