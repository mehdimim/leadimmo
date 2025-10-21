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
  const excerpt = `Draft insight exploring ${keyword.primary} opportunities in Koh Samui.`;
  const bodyHtml = [
    `<p>This AI assisted draft explores ${keyword.primary} investments within Koh Samui, connected to the ${pillar.title} pillar.</p>`,
    `<h2>Why it matters</h2>`,
    `<p>${keyword.context}</p>`,
    `<h3>Signals to monitor</h3>`,
    `<ul>${keyword.signals.map((signal) => `<li>${signal}</li>`).join('')}</ul>`
  ].join('');

  const insertData: InferInsertModel<typeof posts> = {
    id,
    title,
    slug,
    excerpt,
    bodyHtml,
    category: 'market',
    status: 'draft',
    pillar: false,
    seoJson: {
      keywords: keyword.keywords
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await db.insert(posts).values(insertData);

  const autoTranslate =
    env.AUTO_TRANSLATE_LOCALES?.split(',')
      .map((locale) => locale.trim())
      .filter((locale) => locale.length > 0) ?? [];

  const llmEnabled = Boolean(env.LLM_API_KEY);
  const allowedLocales: Array<'th' | 'fr' | 'es' | 'zh'> = ['th', 'fr', 'es', 'zh'];

  const translatedLocales: string[] = [];

  if (llmEnabled && autoTranslate.length > 0) {
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
