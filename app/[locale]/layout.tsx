import { ReactNode } from 'react';
import { NextIntlClientProvider, createTranslator } from 'next-intl';
import { notFound } from 'next/navigation';
import { unstable_setRequestLocale } from 'next-intl/server';
import { Inter, Noto_Sans_SC, Noto_Sans_Thai } from 'next/font/google';
import type { Metadata } from 'next';

import { getEnvValue } from '@/lib/env';
import LocaleAttributes from '@/components/LocaleAttributes';
import AnalyticsScripts from '@/components/AnalyticsScripts';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import { Locale, isLocale, locales } from '@/lib/i18n';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

const notoThai = Noto_Sans_Thai({
  subsets: ['thai'],
  display: 'swap',
  variable: '--font-noto-thai'
});

const notoSc = Noto_Sans_SC({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-sc'
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type LayoutParams = Promise<{ locale: string }>;

export async function generateMetadata({
  params
}: {
  params: LayoutParams;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const messages = (await import(`@/messages/${locale}.json`)).default;
  const t = createTranslator({ locale, messages, namespace: 'meta' });

  const siteUrl = getEnvValue('NEXT_PUBLIC_SITE_URL') || 'https://www.leadimmo.example';

  return {
    title: t('title'),
    description: t('description'),
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: `${siteUrl}/${locale}`,
      languages: locales.reduce<Record<string, string>>((acc, current) => {
        acc[current] = `${siteUrl}/${current}`;
        return acc;
      }, {})
    }
  };
}

const localeFontClass: Record<Locale, string> = {
  en: inter.className,
  fr: inter.className,
  es: inter.className,
  th: `${inter.className} ${notoThai.className}`,
  zh: `${inter.className} ${notoSc.className}`
};

export default async function LocaleLayout({
  children,
  params
}: {
  children: ReactNode;
  params: LayoutParams;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  unstable_setRequestLocale(locale);

  const messages = (await import(`@/messages/${locale}.json`)).default;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <LocaleAttributes locale={locale} />
      <div
        className={`${inter.variable} ${notoThai.variable} ${notoSc.variable} ${localeFontClass[locale]} bg-slate-50 text-slate-900 min-h-screen flex flex-col`}
      >
        <SiteHeader locale={locale} />
        <main className="flex-1">{children}</main>
        <SiteFooter locale={locale} />
        <AnalyticsScripts />
      </div>
    </NextIntlClientProvider>
  );
}



