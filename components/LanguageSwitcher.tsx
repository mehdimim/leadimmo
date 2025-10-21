'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

import { localeLabels, locales } from '@/lib/i18n';

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('languageSwitcher');

  function handleSelect(nextLocale: string) {
    setOpen(false);
    const segments = (pathname ?? '').split('/');
    if (segments.length > 1) {
      segments[1] = nextLocale;
    }
    const nextPath = segments.join('/') || `/${nextLocale}`;
    router.replace(nextPath);
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-100"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span>{localeLabels[locale as keyof typeof localeLabels] ?? locale.toUpperCase()}</span>
        <span className="text-xs text-slate-500">{String.fromCharCode(0x25bc)}</span>
        <span className="sr-only">{t('trigger')}</span>
      </button>
      {open ? (
        <ul
          className="absolute right-0 z-10 mt-2 w-40 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg"
          role="listbox"
          aria-label={t('label')}
        >
          {locales.map((code) => (
            <li key={code}>
              <button
                type="button"
                className="flex w-full items-center justify-between px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                onClick={() => handleSelect(code)}
                role="option"
                aria-selected={locale === code}
              >
                <span>{localeLabels[code]}</span>
                {locale === code ? <span>{String.fromCharCode(0x2713)}</span> : null}
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              className="flex w-full justify-center border-t border-slate-100 px-4 py-2 text-xs text-slate-500 hover:bg-slate-100"
              onClick={() => setOpen(false)}
            >
              {t('close')}
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  );
}
