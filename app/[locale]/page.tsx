import { and, desc, eq } from 'drizzle-orm';

import ContactActions from '@/components/ContactActions';
import CTAButton from '@/components/CTAButton';
import FAQ from '@/components/FAQ';
import LeadForm from '@/components/LeadForm';
import PostCard from '@/components/PostCard';
import Section from '@/components/Section';
import Testimonial from '@/components/Testimonial';
import { getEnvValue } from '@/lib/env';
import { getDB, posts, postTranslations } from '@/lib/db';
import { Locale, isLocale } from '@/lib/i18n';
import { realEstateAgentJsonLd } from '@/lib/jsonld';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

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
  const tHero = await getTranslations({ locale, namespace: 'hero' });
  const tBlog = await getTranslations({ locale, namespace: 'blog' });

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

  const heroBullets = (messages.hero.bullets ?? []) as string[];
  const valueCards = (messages.sections.value.cards ?? []) as Array<{
    icon: string;
    title: string;
    description: string;
  }>;
  const valueCta = messages.sections.value.cta as { label?: string; href?: string } | undefined;
  const workflowSteps = (messages.sections.workflow.steps ?? []) as Array<{
    title: string;
    description: string;
  }>;
  const workflowCta = messages.sections.workflow.cta as { label?: string; href?: string } | undefined;
  const references = (messages.sections.references?.items ?? []) as Array<{
    title: string;
    location: string;
    metric: string;
    description: string;
  }>;
  const referencesCta = messages.sections.references?.cta as { label?: string; href?: string } | undefined;
  const stackItems = (messages.sections.stack.items ?? []) as Array<{
    title: string;
    description: string;
  }>;
  const testimonials = (messages.testimonials.items ?? []) as Array<{
    quote: string;
    author: string;
    location?: string;
    result?: string;
  }>;

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(realEstateAgentJsonLd(locale as Locale, `${siteUrl}/${locale}`))
        }}
      />
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
        <div className="absolute inset-0 -z-10 opacity-70 [background-image:radial-gradient(circle_at_top,_rgba(14,165,233,0.25),_transparent_55%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.28),_transparent_45%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.1fr,0.9fr] lg:items-start lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-200">
              {tHero('eyebrow')}
            </p>
            <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              <span className="block text-slate-100">{tHero('title')}</span>
              {messages.hero.highlight ? (
                <span className="mt-4 block bg-gradient-to-r from-sky-300 via-emerald-300 to-sky-100 bg-clip-text text-3xl text-transparent sm:text-[2.5rem]">
                  {messages.hero.highlight}
                </span>
              ) : null}
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-200 sm:text-xl">{tHero('subtitle')}</p>
            {heroBullets.length > 0 ? (
              <ul className="mt-8 space-y-3 text-base text-slate-100 sm:text-lg">
                {heroBullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-3">
                    <span className="mt-1 flex h-7 w-7 items-center justify-center rounded-full border border-sky-400/50 bg-sky-500/10 text-sm font-semibold text-sky-200">
                      +
                    </span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <CTAButton href={`/${locale}#lead-form`} variant="primary">
                {tHero('primaryCta')}
              </CTAButton>
              <CTAButton href={`/${locale}#guides`} variant="secondary">
                {tHero('secondaryCta')}
              </CTAButton>
            </div>
            {messages.hero.trustLabel ? (
              <p className="mt-8 text-xs font-medium uppercase tracking-[0.35em] text-slate-400">
                {messages.hero.trustLabel}
              </p>
            ) : null}
            <ContactActions phone={phone} />
          </div>

          <div id="lead-form">
            <div className="rounded-3xl border border-white/10 bg-white/95 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
              <LeadForm />
            </div>
          </div>
        </div>
      </section>

      <Section
        eyebrow={messages.sections.value.eyebrow}
        title={messages.sections.value.title}
        description={messages.sections.value.description}
        id="why"
      >
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {valueCards.map((card) => (
            <article
              key={card.title}
              className="group flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sm font-semibold text-sky-700">
                {card.icon}
              </span>
              <h3 className="mt-6 text-xl font-semibold text-slate-900">{card.title}</h3>
              <p className="mt-3 text-sm text-slate-600">{card.description}</p>
            </article>
          ))}
        </div>
        {valueCta?.label ? (
          <div className="mt-8">
            <CTAButton href={valueCta.href ?? `/${locale}/guides`} variant="ghost">
              {valueCta.label}
            </CTAButton>
          </div>
        ) : null}
      </Section>

      <Section
        background="muted"
        eyebrow={messages.sections.workflow.eyebrow}
        title={messages.sections.workflow.title}
        description={messages.sections.workflow.description}
      >
        <div className="grid gap-6 md:grid-cols-3">
          {workflowSteps.map((step, index) => (
            <article
              key={step.title}
              className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-base font-semibold uppercase tracking-widest text-white">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-6 text-xl font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-3 text-sm text-slate-600">{step.description}</p>
            </article>
          ))}
        </div>
        {workflowCta?.label ? (
          <div className="mt-8">
            <CTAButton href={workflowCta.href ?? `/${locale}/guides`} variant="secondary">
              {workflowCta.label}
            </CTAButton>
          </div>
        ) : null}
      </Section>

      <Section
        eyebrow={messages.sections.proof.eyebrow}
        title={messages.sections.proof.title}
        description={messages.sections.proof.description}
      >
        <dl className="grid gap-6 md:grid-cols-3">
          {messages.sections.proof.metrics.map((metric: { label: string; value: string }) => (
            <div
              key={metric.label}
              className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
            >
              <dd className="text-3xl font-semibold text-primary sm:text-4xl">{metric.value}</dd>
              <dt className="mt-3 text-sm text-slate-600">{metric.label}</dt>
            </div>
          ))}
        </dl>
      </Section>

      {references.length > 0 ? (
        <Section
          eyebrow={messages.sections.references?.eyebrow}
          title={messages.sections.references?.title}
          description={messages.sections.references?.description}
        >
          <div className="grid gap-6 lg:grid-cols-3">
            {references.map((item) => (
              <article
                key={`${item.title}-${item.location}`}
                className="flex h-full flex-col rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-[1px] shadow-lg"
              >
                <div className="flex h-full flex-col rounded-[calc(1.5rem-1px)] bg-white p-6">
                  <span className="text-xs uppercase tracking-[0.3em] text-slate-400">{item.location}</span>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm font-semibold text-sky-700">{item.metric}</p>
                  <p className="mt-4 text-sm text-slate-600">{item.description}</p>
                </div>
              </article>
            ))}
          </div>
          {referencesCta?.label ? (
            <div className="mt-8">
              <CTAButton href={referencesCta.href ?? `/${locale}#lead-form`} variant="primary">
                {referencesCta.label}
              </CTAButton>
            </div>
          ) : null}
        </Section>
      ) : null}

      <Section
        background="muted"
        eyebrow={messages.sections.stack.eyebrow}
        title={messages.sections.stack.title}
        description={messages.sections.stack.description}
      >
        <div className="grid gap-6 md:grid-cols-3">
          {stackItems.map((item) => (
            <article
              key={item.title}
              className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-3 text-sm text-slate-600">{item.description}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section title={messages.testimonials.title}>
        <Testimonial
          items={testimonials.map((item) => ({
            quote: item.quote,
            author: item.author,
            role: item.location,
            badge: item.result
          }))}
        />
      </Section>

      <Section
        title={messages.sections.guides.title}
        description={messages.sections.guides.description}
        id="guides"
        background="muted"
      >
        {recentPosts.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-2">
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
          <CTAButton href={`/${locale}/guides`} variant="ghost">
            {messages.common.viewAll ?? 'View all'}
          </CTAButton>
        </div>
      </Section>

      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 py-16 sm:py-20">
        <div className="absolute inset-0 -z-10 opacity-70 [background-image:radial-gradient(circle_at_top_left,_rgba(14,165,233,0.22),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(16,185,129,0.28),_transparent_50%)]" />
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-200">
            {messages.sections.cta.eyebrow}
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {messages.sections.cta.title}
          </h2>
          <p className="mt-4 text-base text-slate-200 sm:text-lg">{messages.sections.cta.description}</p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <CTAButton href={`/${locale}#lead-form`} variant="primary">
              {messages.sections.cta.primaryCta}
            </CTAButton>
            <CTAButton href={`/${locale}#top`} variant="ghost">
              {messages.sections.cta.secondaryCta}
            </CTAButton>
          </div>
        </div>
      </section>

      <Section title={messages.faq.title} background="muted">
        <FAQ items={messages.faq.items} />
      </Section>
    </>
  );
}
