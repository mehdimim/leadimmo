import { NextResponse } from 'next/server';

import { isAdminAuthenticated } from '@/lib/auth';
import { getDB, posts, postTranslations } from '@/lib/db';
import { logger } from '@/lib/logger';
import { translateWithFallback } from '@/lib/translate';
import { translatePostSchema } from '@/lib/validation';
import { eq } from 'drizzle-orm';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = translatePostSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const db = getDB();
    const [post] = await db
      .select({
        id: posts.id,
        title: posts.title,
        excerpt: posts.excerpt,
        bodyHtml: posts.bodyHtml
      })
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const translation = await translateWithFallback(
      `${post.id}:${parsed.data.targetLocale}`,
      {
        targetLocale: parsed.data.targetLocale,
        title: post.title,
        excerpt: post.excerpt,
        bodyHtml: post.bodyHtml
      }
    );

    await db
      .insert(postTranslations)
      .values({
        id: crypto.randomUUID(),
        postId: post.id,
        locale: parsed.data.targetLocale,
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

    logger.info('post_translated', {
      postId: post.id,
      targetLocale: parsed.data.targetLocale,
      source: translation.source
    });

    return NextResponse.json({
      message:
        translation.source === 'llm'
          ? 'Translation stored.'
          : 'LLM not configured: stored English copy with translation note.',
      source: translation.source
    });
  } catch (error) {
    logger.error('post_translate_failed', {
      postId: id,
      error: error instanceof Error ? error.message : 'unknown'
    });
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
