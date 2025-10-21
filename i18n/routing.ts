import {defineRouting} from 'next-intl/routing';

import {defaultLocale, localePrefix, locales} from '@/lib/i18n';

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix
});
