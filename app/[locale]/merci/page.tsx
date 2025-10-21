export const runtime = 'edge';

import CTAButton from '@/components/CTAButton';
import Container from '@/components/Container';
import { isLocale } from '@/lib/i18n';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

export default async function ThankYouPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const tThankYou = await getTranslations({ locale, namespace: 'thankYou' });
  const tHero = await getTranslations({ locale, namespace: 'hero' });
  const tNav = await getTranslations({ locale, namespace: 'navigation' });

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-semibold text-slate-900">{tThankYou('title')}</h1>
      <p className="mt-4 max-w-2xl text-lg text-slate-600">{tThankYou('subtitle')}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <CTAButton href={`/${locale}/blog`} variant="primary">
          {tNav('blog')}
        </CTAButton>
        <CTAButton href={`/${locale}`} variant="secondary">
          {tHero('primaryCta')}
        </CTAButton>
      </div>
    </Container>
  );
}

