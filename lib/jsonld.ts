import { getEnvValue } from '@/lib/env';
import { Locale, defaultLocale } from './i18n';

type JsonLd = Record<string, unknown>;

function getAgencyDetails() {
  return {
    name: getEnvValue('AGENCY_NAME') || 'Agency Koh Samui (placeholder)',
    phone: getEnvValue('AGENCY_PHONE') || '+66-0000-0000',
    city: getEnvValue('AGENCY_CITY') || 'Ko Samui'
  };
}

export function realEstateAgentJsonLd(locale: Locale, url: string): JsonLd {
  const agency = getAgencyDetails();
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    '@id': `${url}#realestateagent`,
    'name': agency.name,
    'url': url,
    'telephone': agency.phone,
    'areaServed': agency.city,
    'address': {
      '@type': 'PostalAddress',
      'addressLocality': agency.city,
      'addressCountry': 'TH'
    },
    'inLanguage': locale
  };
}

export function articleJsonLd({
  locale,
  url,
  title,
  description,
  datePublished,
  dateModified
}: {
  locale: Locale;
  url: string;
  title: string;
  description?: string | null;
  datePublished: Date;
  dateModified: Date;
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${url}#article`,
    'url': url,
    'headline': title,
    'description': description ?? '',
    'datePublished': datePublished.toISOString(),
    'dateModified': dateModified.toISOString(),
    'inLanguage': locale,
    'publisher': realEstateAgentJsonLd(defaultLocale, url)
  };
}

export function breadcrumbJsonLd({
  locale,
  items
}: {
  locale: Locale;
  items: Array<{ position: number; name: string; item: string }>;
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item) => ({
      '@type': 'ListItem',
      'position': item.position,
      'name': item.name,
      'item': item.item,
      'inLanguage': locale
    }))
  };
}
