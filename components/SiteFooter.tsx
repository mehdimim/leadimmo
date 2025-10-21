'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

type SiteFooterProps = {
  locale: string;
};

export default function SiteFooter({ locale }: SiteFooterProps) {
  const tFooter = useTranslations('footer');
  const tNav = useTranslations('navigation');

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div>
          <p className="font-semibold text-slate-900">LeadImmo</p>
          <p>{tFooter('address')}</p>
          <p>{tFooter('phone')}</p>
        </div>
        <div className="flex flex-col gap-2 text-sm text-slate-600 sm:text-right">
          <Link href={`/${locale}/blog`}>{tNav('blog')}</Link>
          <Link href={`/${locale}#lead-form`}>{tNav('home')}</Link>
          <p>{tFooter('privacy')}</p>
          <p>{tFooter('terms')}</p>
        </div>
      </div>
    </footer>
  );
}
