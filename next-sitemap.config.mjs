const locales = ['en', 'th', 'fr', 'es', 'zh'];

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.leadimmo.example';

/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl,
  generateRobotsTxt: true,
  exclude: ['/api/*', '/server-sitemap-index.xml'],
  transform: async (_, path) => {
    const normalizedPath = path === '/' ? '' : path;
    const locale = locales.find((item) => normalizedPath.startsWith(`/${item}`));
    const canonical =
      locale != null ? `${siteUrl}${normalizedPath}` : `${siteUrl}/en${normalizedPath}`;

    return {
      loc: canonical,
      changefreq: 'weekly',
      priority: normalizedPath === '' ? 1 : 0.7,
      lastmod: new Date().toISOString(),
      alternateRefs: locales.map((targetLocale) => ({
        href: `${siteUrl}/${targetLocale}${normalizedPath.replace(locale ? `/${locale}` : '', '')}`,
        hreflang: targetLocale
      }))
    };
  },
  additionalPaths: async () =>
    locales.map((locale) => ({
      loc: `${siteUrl}/${locale}`,
      changefreq: 'weekly',
      priority: locale === 'en' ? 1 : 0.7,
      lastmod: new Date().toISOString(),
      alternateRefs: locales.map((targetLocale) => ({
        href: `${siteUrl}/${targetLocale}`,
        hreflang: targetLocale
      }))
    }))
};

export default config;
