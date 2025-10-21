import {desc, eq, inArray} from 'drizzle-orm';
import AdminGuard from '@/components/AdminGuard';
import Container from '@/components/Container';
import CTAButton from '@/components/CTAButton';
import AdminPostsTable, {
  AdminActionState,
  AdminPostEntry,
  AdminPostLabels
} from '@/components/AdminPostsTable';
import {isAdminAuthenticated} from '@/lib/auth';
import {getDB, posts, postTranslations} from '@/lib/db';
import {Locale} from '@/lib/i18n';
import {getTranslations} from 'next-intl/server';
import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

async function mutateStatus(
  locale: string,
  status: 'draft' | 'published',
  _prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  'use server';

  if (!(await isAdminAuthenticated())) {
    redirect(`/${locale}/admin/login`);
  }

  const postId = formData.get('postId');
  if (!postId || typeof postId !== 'string') {
    return {error: 'Missing post id'};
  }

  const db = getDB();
  await db
    .update(posts)
    .set({status, updatedAt: new Date()})
    .where(eq(posts.id, postId));

  revalidatePath(`/${locale}/blog`);
  revalidatePath(`/${locale}`);
  return {};
}

async function removePost(
  locale: string,
  _prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  'use server';

  if (!(await isAdminAuthenticated())) {
    redirect(`/${locale}/admin/login`);
  }

  const postId = formData.get('postId');
  if (!postId || typeof postId !== 'string') {
    return {error: 'Missing post id'};
  }

  const db = getDB();
  await db.delete(postTranslations).where(eq(postTranslations.postId, postId));
  await db.delete(posts).where(eq(posts.id, postId));

  revalidatePath(`/${locale}/blog`);
  revalidatePath(`/${locale}`);
  return {};
}

type AdminPostsParams = Promise<{locale: Locale}>;

export default async function AdminPostsPage({
  params
}: {
  params: AdminPostsParams;
}) {
  const {locale} = await params;

  if (!(await isAdminAuthenticated())) {
    redirect(`/${locale}/admin/login`);
  }

  const tAdmin = await getTranslations({locale, namespace: 'admin'});

  const db = getDB();

  const postRows = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      status: posts.status,
      category: posts.category,
      createdAt: posts.createdAt
    })
    .from(posts)
    .orderBy(desc(posts.createdAt));

  const translationRows =
    postRows.length === 0
      ? []
      : await db
          .select({
            postId: postTranslations.postId,
            locale: postTranslations.locale,
            title: postTranslations.title
          })
          .from(postTranslations)
          .where(inArray(postTranslations.postId, postRows.map((post) => post.id)));

  const postsWithTranslations: AdminPostEntry[] = postRows.map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    status: post.status,
    category: post.category,
    translations: translationRows
      .filter((translation) => translation.postId === post.id)
      .map((translation) => ({
        locale: translation.locale,
        title: translation.title
      }))
  }));

  const labels: AdminPostLabels = {
    published: tAdmin('published'),
    draft: tAdmin('draft'),
    publish: tAdmin('publish'),
    unpublish: tAdmin('unpublish'),
    delete: tAdmin('delete'),
    translate: tAdmin('translate'),
    translationSuccess: tAdmin('translationSuccess'),
    translationStub: tAdmin('translationStub'),
    error: tAdmin('error'),
    status: tAdmin('status')
  };

  const publish = mutateStatus.bind(null, locale, 'published');
  const unpublish = mutateStatus.bind(null, locale, 'draft');
  const remove = removePost.bind(null, locale);

  return (
    <AdminGuard locale={locale}>
      <Container className="py-16">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-slate-900">{tAdmin('postsTitle')}</h1>
          <div className="flex gap-3">
            <CTAButton href={`/${locale}/admin/login?logout=1`} variant="secondary">
              {tAdmin('logout')}
            </CTAButton>
            <CTAButton href={`/api/leads/export`} variant="ghost">
              {tAdmin('exportLeads')}
            </CTAButton>
          </div>
        </div>
        <AdminPostsTable
          posts={postsWithTranslations}
          labels={labels}
          publishAction={publish}
          unpublishAction={unpublish}
          deleteAction={remove}
        />
      </Container>
    </AdminGuard>
  );
}
