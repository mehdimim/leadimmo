'use client';

import { useTranslations } from 'next-intl';

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    fbq?: (...args: unknown[]) => void;
  }
}

type ContactActionsProps = {
  phone: string;
};

export default function ContactActions({ phone }: ContactActionsProps) {
  const t = useTranslations('contact');
  const sanitized = phone.replace(/[^+\d]/g, '');
  const whatsapp = `https://wa.me/${sanitized.replace('+', '')}`;

  function track(event: 'click_call' | 'click_whatsapp') {
    if (typeof window === 'undefined') {
      return;
    }
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event });
    if (typeof window.fbq === 'function') {
      window.fbq('trackCustom', event);
    }
  }

  return (
    <div className="mt-4 flex flex-col gap-2 text-sm text-primary sm:flex-row sm:items-center sm:gap-4">
      <a
        href={`tel:${sanitized}`}
        onClick={() => track('click_call')}
        className="font-semibold hover:underline"
      >
        {t('call')} - {phone}
      </a>
      <a
        href={whatsapp}
        target="_blank"
        rel="noreferrer"
        onClick={() => track('click_whatsapp')}
        className="font-semibold hover:underline"
      >
        {t('whatsapp')}
      </a>
    </div>
  );
}
