import Container from '@/components/Container';
import {
  clearAdminSession,
  createAdminSession,
  isAdminAuthenticated,
  verifyAdminCredentials
} from '@/lib/auth';
import AdminLoginForm, {LoginFormState} from '@/components/AdminLoginForm';
import {isLocale} from '@/lib/i18n';
import {adminLoginSchema} from '@/lib/validation';
import {getTranslations} from 'next-intl/server';
import {redirect} from 'next/navigation';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

async function authenticate(
  locale: string,
  _state: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  'use server';

  const raw = {
    username: formData.get('username'),
    password: formData.get('password')
  };

  const parsed = adminLoginSchema.safeParse(raw);
  if (!parsed.success) {
    return {error: 'Invalid credentials'};
  }

  const {username, password} = parsed.data;
  if (!verifyAdminCredentials(username, password)) {
    return {error: 'Invalid credentials'};
  }

  await createAdminSession();
  redirect(`/${locale}/admin/posts`);
}

type PageParams = Promise<{locale: string}>;
type PageSearchParams = Promise<{logout?: string}>;

export default async function AdminLoginPage({
  params,
  searchParams
}: {
  params: PageParams;
  searchParams?: PageSearchParams;
}) {
  const {locale} = await params;
  if (!isLocale(locale)) {
    redirect('/en/admin/login');
  }

  const resolvedSearchParams = (await searchParams) ?? {};

  if (resolvedSearchParams.logout) {
    await clearAdminSession();
  }

  if (await isAdminAuthenticated()) {
    redirect(`/${locale}/admin/posts`);
  }

  const tAdmin = await getTranslations({locale, namespace: 'admin'});

  return (
    <Container className="py-20">
      <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-semibold text-slate-900">{tAdmin('loginTitle')}</h1>
        <AdminLoginForm
          action={authenticate.bind(null, locale)}
          labels={{
            username: tAdmin('username'),
            password: tAdmin('password'),
            submit: tAdmin('submit')
          }}
        />
      </div>
    </Container>
  );
}
