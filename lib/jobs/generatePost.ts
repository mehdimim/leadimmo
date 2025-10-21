import type { InferInsertModel } from 'drizzle-orm';

import keywords from '@/data/keywords.json';
import pillars from '@/data/pillars.json';
import { posts, postTranslations } from '@/lib/db';
import { slugify } from '@/lib/slug';
import { translateWithFallback } from '@/lib/translate';
import type { createDBFromBinding } from '@/db/client';

type DrizzleDatabase = ReturnType<typeof createDBFromBinding>;

type EnvShape = Record<string, string | undefined>;

export type GeneratePostResult = {
  postId: string;
  slug: string;
  translatedLocales: string[];
};

export async function generatePostDraft({
  db,
  env
}: {
  db: DrizzleDatabase;
  env: EnvShape;
}): Promise<GeneratePostResult> {
  const keyword = keywords[Math.floor(Math.random() * keywords.length)] ?? keywords[0];
  const pillar = pillars[Math.floor(Math.random() * pillars.length)] ?? pillars[0];

  const id = crypto.randomUUID();
  const title = `Koh Samui ${keyword.primary} outlook`;
  const slug = slugify(`${keyword.primary}-${Date.now()}`);
  const excerpt = `Latest insight on ${keyword.primary} opportunities around Koh Samui, aligned with the ${pillar.title.toLowerCase()}.`;
  const heroKeyword = keyword.keywords?.[0] ?? keyword.primary;
  const bodyHtml = [
    `<p>${keyword.context}</p>`,
    `<h2>Signals to monitor</h2>`,
    `<ul>${keyword.signals.map((signal) => `<li>${signal}</li>`).join('')}</ul>`,
    `<h2>${pillar.title}</h2>`,
    pillar.bodyHtml,
    `<h2>Keyword focus</h2>`,
    `<ul>${[...new Set([...(keyword.keywords ?? []), ...(pillar.keywords ?? [])])]
      .map((item) => `<li>${item}</li>`)
      .join('')}</ul>`,
    `<h2>Action checklist</h2>`,
    `<ol>
      <li>Brief sales teams on ${keyword.primary} talking points for villa tours.</li>
      <li>Publish multilingual snippets targeting ${heroKeyword} and related long-tail searches.</li>
      <li>Engage suppliers linked to ${pillar.title.toLowerCase()} for co-marketing opportunities.</li>
    </ol>`
  ].join('');

  const now = new Date();
  const seoKeywords = [
    ...(keyword.keywords ?? []),
    ...(pillar.keywords ?? [])
  ];

  const insertData: InferInsertModel<typeof posts> = {
    id,
    title,
    slug,
    excerpt,
    bodyHtml,
    category: pillar.category ?? 'market',
    status: 'published',
    pillar: false,
    seoJson: {
      keywords: Array.from(new Set(seoKeywords))
    },
    createdAt: now,
    updatedAt: now
  };

  await db.insert(posts).values(insertData);

  const autoTranslate =
    (env.AUTO_TRANSLATE_LOCALES ?? 'fr,es,th,zh')
      .split(',')
      .map((locale) => locale.trim())
      .filter((locale) => locale.length > 0) ?? [];

  const allowedLocales: Array<'th' | 'fr' | 'es' | 'zh'> = ['th', 'fr', 'es', 'zh'];

  const translatedLocales: string[] = [];

  if (autoTranslate.length > 0) {
    for (const locale of autoTranslate) {
      if (!allowedLocales.includes(locale as 'th' | 'fr' | 'es' | 'zh')) {
        continue;
      }
      const translation = await translateWithFallback(
        `${id}:${locale}`,
        {
          targetLocale: locale as 'th' | 'fr' | 'es' | 'zh',
          title,
          excerpt,
          bodyHtml
        },
        env
      );

      await db
        .insert(postTranslations)
        .values({
          id: crypto.randomUUID(),
          postId: id,
          locale,
          title: translation.title,
          excerpt: translation.excerpt,
          bodyHtml: translation.bodyHtml,
          updatedAt: new Date()
        })
        .onConflictDoUpdate({
          target: [postTranslations.postId, postTranslations.locale],
          set: {
            title: translation.title,
            excerpt: translation.excerpt,
            bodyHtml: translation.bodyHtml,
            updatedAt: new Date()
          }
        });

      translatedLocales.push(locale);
    }
  }

  return {
    postId: id,
    slug,
    translatedLocales
  };
}
