export const runtime = 'edge';

import { and, desc, eq } from 'drizzle-orm';
import Container from '@/components/Container';
import PostCard from '@/components/PostCard';
import { getDB, posts, postTranslations } from '@/lib/db';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { isLocale } from '@/lib/i18n';

export default async function GuidesIndex({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const tBlog = await getTranslations({ locale, namespace: 'blog' });

  const db = getDB();

  const rows = await db
    .select({
      slug: posts.slug,
      title: posts.title,
      excerpt: posts.excerpt,
      status: posts.status,
      category: posts.category,
      pillar: posts.pillar,
      translationTitle: postTranslations.title,
      translationExcerpt: postTranslations.excerpt
    })
    .from(posts)
    .leftJoin(
      postTranslations,
      and(eq(postTranslations.postId, posts.id), eq(postTranslations.locale, locale))
    )
    .where(eq(posts.status, 'published'))
    .orderBy(desc(posts.createdAt));

  const items = rows.map((row) => ({
    slug: row.slug,
    title: row.translationTitle ?? row.title,
    excerpt: row.translationExcerpt ?? row.excerpt,
    status: row.status,
    category: row.category,
    pillar: row.pillar
  }));

  return (
    <Container className="py-16">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-bold text-slate-900">{tBlog('title')}</h1>
      </div>

      {items.length === 0 ? (
        <p className="mt-10 text-sm text-slate-600">{tBlog('empty')}</p>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {items.map((post) => (
            <PostCard
              key={post.slug}
              locale={locale}
              slug={post.pillar ? `c/${post.slug}` : post.slug}
              title={post.title}
              excerpt={post.excerpt}
              status={post.status}
              category={post.category}
              labelDraft={tBlog('draftBadge')}
              labelCategory={tBlog('categoryPrefix')}
              labelPublished={tBlog('publishedBadge')}
              readMoreLabel={tBlog('readMore')}
            />
          ))}
        </div>
      )}
    </Container>
  );
}
