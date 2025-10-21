'use client';

import { useEffect } from 'react';

import { Locale, rtlLocales } from '@/lib/i18n';

export default function LocaleAttributes({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = rtlLocales.includes(locale) ? 'rtl' : 'ltr';
  }, [locale]);

  return null;
}
