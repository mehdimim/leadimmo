import {eq} from 'drizzle-orm';
import Container from '@/components/Container';
import {getDB, posts, postTranslations} from '@/lib/db';
import {Locale, isLocale, locales} from '@/lib/i18n';
import {articleJsonLd, breadcrumbJsonLd} from '@/lib/jsonld';
import {getEnvValue} from '@/lib/env';
import {getTranslations} from 'next-intl/server';
import type {Metadata} from 'next';
import {notFound} from 'next/navigation';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

type PageParams = Promise<{
  locale: string;
  slug: string;
}>;

async function fetchPostWithTranslations(slug: string) {
  const db = getDB();
  const [post] = await db
    .select({
      id: posts.id,
      slug: posts.slug,
      title: posts.title,
      excerpt: posts.excerpt,
      status: posts.status,
      bodyHtml: posts.bodyHtml,
      category: posts.category,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt
    })
    .from(posts)
    .where(eq(posts.slug, slug))
    .limit(1);

  if (!post) {
    return null;
  }

  const translations = await db
    .select({
      id: postTranslations.id,
      locale: postTranslations.locale,
      title: postTranslations.title,
      excerpt: postTranslations.excerpt,
      bodyHtml: postTranslations.bodyHtml
    })
    .from(postTranslations)
    .where(eq(postTranslations.postId, post.id));

  return {post, translations};
}

export async function generateMetadata({params}: {params: PageParams}): Promise<Metadata> {
  const {locale, slug} = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const fetched = await fetchPostWithTranslations(slug);
  if (!fetched || fetched.post.status !== 'published') {
    notFound();
  }

  const translation = fetched.translations.find((item) => item.locale === locale);
  const title = translation?.title ?? fetched.post.title;
  const description = translation?.excerpt ?? fetched.post.excerpt ?? '';

  const siteUrl = getEnvValue('NEXT_PUBLIC_SITE_URL') || 'https://www.leadimmo.example';
  const alternates = locales.reduce<Record<string, string>>((acc, loc) => {
    acc[loc] = `${siteUrl}/${loc}/blog/${slug}`;
    return acc;
  }, {});

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/${locale}/blog/${slug}`,
      languages: alternates
    }
  };
}

export default async function BlogArticle({
  params
}: {
  params: PageParams;
}) {
  const {locale, slug} = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const fetched = await fetchPostWithTranslations(slug);
  if (!fetched || fetched.post.status !== 'published') {
    notFound();
  }

  const translation = fetched.translations.find((item) => item.locale === locale);
  const contentLocale = (translation ? locale : 'en') as Locale;

  const title = translation?.title ?? fetched.post.title;
  const excerpt = translation?.excerpt ?? fetched.post.excerpt;
  const bodyHtml = translation?.bodyHtml ?? fetched.post.bodyHtml;

  const siteUrl = getEnvValue('NEXT_PUBLIC_SITE_URL') || 'https://www.leadimmo.example';
  const articleUrl = `${siteUrl}/${locale}/blog/${slug}`;

  const tBlog = await getTranslations({locale, namespace: 'blog'});
  const tNav = await getTranslations({locale, namespace: 'navigation'});
  const normalizeDate = (value: unknown) => {
    if (value instanceof Date) {
      return value;
    }
    const numeric = Number(value);
    if (Number.isFinite(numeric)) {
      return new Date(numeric * 1000);
    }
    return new Date();
  };

  const createdAt = normalizeDate(fetched.post.createdAt);
  const updatedAt = normalizeDate(fetched.post.updatedAt);

  return (
    <Container className="py-16">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            articleJsonLd({
              locale: contentLocale,
              url: articleUrl,
              title,
              description: excerpt,
              datePublished: createdAt,
              dateModified: updatedAt
            })
          )
        }}
      />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd({
              locale: contentLocale,
              items: [
                {position: 1, name: tNav('home'), item: `${siteUrl}/${locale}`},
                {position: 2, name: tBlog('title'), item: `${siteUrl}/${locale}/blog`},
                {position: 3, name: title, item: articleUrl}
              ]
            })
          )
        }}
      />
      <article className="mx-auto max-w-3xl">
        <p className="text-sm uppercase tracking-widest text-primary">
          {fetched.post.category ?? 'Insight'}
        </p>
        <h1 className="mt-4 text-4xl font-bold text-slate-900">{title}</h1>
        {excerpt ? <p className="mt-4 text-lg text-slate-600">{excerpt}</p> : null}
        <div
          className="prose prose-slate mt-10 max-w-none prose-headings:text-slate-900 prose-strong:text-slate-900"
          dangerouslySetInnerHTML={{__html: bodyHtml}}
        />
      </article>
    </Container>
  );
}
