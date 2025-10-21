import {and, desc, eq} from 'drizzle-orm';
import ContactActions from '@/components/ContactActions';
import Container from '@/components/Container';
import CTAButton from '@/components/CTAButton';
import FAQ from '@/components/FAQ';
import LeadForm from '@/components/LeadForm';
import Section from '@/components/Section';
import Testimonial from '@/components/Testimonial';
import PostCard from '@/components/PostCard';
import {getDB, posts, postTranslations} from '@/lib/db';
import {Locale, isLocale} from '@/lib/i18n';
import {realEstateAgentJsonLd} from '@/lib/jsonld';
import {getEnvValue} from '@/lib/env';
import {getTranslations} from 'next-intl/server';
import {notFound} from 'next/navigation';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export default async function LandingPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const messages = (await import(`@/messages/${locale}.json`)).default as any;
  const tHero = await getTranslations({locale, namespace: 'hero'});
  const tSections = await getTranslations({locale, namespace: 'sections'});
  const tBlog = await getTranslations({locale, namespace: 'blog'});

  const db = getDB();

  const recentRows = await db
    .select({
      id: posts.id,
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
    .orderBy(desc(posts.createdAt))
    .limit(6);

  const recentPosts = recentRows.map((row) => ({
    slug: row.slug,
    title: row.translationTitle ?? row.title,
    excerpt: row.translationExcerpt ?? row.excerpt,
    status: row.status,
    category: row.category,
    pillar: row.pillar
  }));

  const siteUrl = getEnvValue('NEXT_PUBLIC_SITE_URL') || 'https://www.leadimmo.example';
  const phone = getEnvValue('AGENCY_PHONE') || messages.footer.phone;

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(realEstateAgentJsonLd(locale as Locale, `${siteUrl}/${locale}`))
        }}
      />
      <Container as="section" className="py-16" id="top">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              {tHero('eyebrow')}
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              {tHero('title')}
            </h1>
            <p className="mt-4 text-lg text-slate-600">{tHero('subtitle')}</p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <CTAButton href={`/${locale}#lead-form`} variant="primary">
                {tHero('primaryCta')}
              </CTAButton>
              <CTAButton href={`/${locale}#guides`} variant="secondary">
                {tHero('secondaryCta')}
              </CTAButton>
            </div>
            <ContactActions phone={phone} />
          </div>
          <div id="lead-form">
            <LeadForm />
          </div>
        </div>
      </Container>

      <Section eyebrow={tSections('why.title')} id="why" background="muted">
        <ul className="grid gap-6 sm:grid-cols-3">
          {messages.sections.why.points.map((point: string) => (
            <li
              key={point}
              className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-sm"
            >
              {point}
            </li>
          ))}
        </ul>
      </Section>

      <Section title={tSections('proof.title')}>
        <dl className="grid gap-6 sm:grid-cols-3">
          {messages.sections.proof.metrics.map((metric: {label: string; value: string}) => (
            <div
              key={metric.label}
              className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm"
            >
              <dd className="text-3xl font-semibold text-primary">{metric.value}</dd>
              <dt className="mt-3 text-sm text-slate-600">{metric.label}</dt>
            </div>
          ))}
        </dl>
      </Section>

      <Section title={messages.testimonials.title} background="muted">
        <Testimonial items={messages.testimonials.items} />
      </Section>

      <Section title={messages.sections.guides.title} id="guides">
        {recentPosts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {recentPosts.map((post) => (
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
        ) : (
          <p className="text-sm text-slate-600">{tBlog('empty')}</p>
        )}
        <div className="mt-8">
          <CTAButton href={`/${locale}/blog`} variant="ghost">
            {messages.common.viewAll ?? 'View all'}
          </CTAButton>
        </div>
      </Section>

      <Section title={messages.faq.title} background="muted">
        <FAQ items={messages.faq.items} />
      </Section>
    </>
  );
}
