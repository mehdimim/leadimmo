'use client';

import CTAButton from '@/components/CTAButton';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

type SiteHeaderProps = {
  locale: string;
};

export default function SiteHeader({ locale }: SiteHeaderProps) {
  const tNav = useTranslations('navigation');
  const tHero = useTranslations('hero');

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link href={`/${locale}`} className="text-lg font-semibold text-slate-900">
          LeadImmo
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <Link href={`/${locale}`} className="hover:text-primary">
            {tNav('home')}
          </Link>
          <Link href={`/${locale}/blog`} className="hover:text-primary">
            {tNav('blog')}
          </Link>
          <Link href={`/${locale}#guides`} className="hover:text-primary">
            {tNav('guides')}
          </Link>
          <Link href={`/${locale}/admin/login`} className="hover:text-primary">
            {tNav('admin')}
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <CTAButton href={`/${locale}#lead-form`} variant="secondary" className="hidden sm:inline-flex">
            {tHero('primaryCta')}
          </CTAButton>
        </div>
      </div>
    </header>
  );
}
