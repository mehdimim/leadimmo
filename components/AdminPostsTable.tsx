'use client';

import { useState } from 'react';
import { useFormState } from 'react-dom';

import { locales } from '@/lib/i18n';

export type AdminActionState = {
  error?: string | null;
};

export type AdminPostEntry = {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  category: string | null;
  translations: { locale: string; title: string }[];
};

export type AdminPostLabels = {
  published: string;
  draft: string;
  publish: string;
  unpublish: string;
  delete: string;
  status: string;
  translate: string;
  translationSuccess: string;
  translationStub: string;
  error: string;
};

type AdminPostsTableProps = {
  posts: AdminPostEntry[];
  labels: AdminPostLabels;
  publishAction: (state: AdminActionState, formData: FormData) => Promise<AdminActionState>;
  unpublishAction: (state: AdminActionState, formData: FormData) => Promise<AdminActionState>;
  deleteAction: (state: AdminActionState, formData: FormData) => Promise<AdminActionState>;
};

const INITIAL_STATE: AdminActionState = {};

export default function AdminPostsTable({
  posts,
  labels,
  publishAction,
  unpublishAction,
  deleteAction
}: AdminPostsTableProps) {
  return (
    <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
          <tr>
            <th className="px-6 py-3">Title</th>
            <th className="px-6 py-3">{labels.status}</th>
            <th className="px-6 py-3">Translations</th>
            <th className="px-6 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {posts.map((post) => (
            <tr key={post.id}>
              <td className="px-6 py-4 align-top">
                <p className="font-semibold text-slate-900">{post.title}</p>
                <p className="text-xs text-slate-500">{post.slug}</p>
              </td>
              <td className="px-6 py-4 align-top">
                <StatusBadge status={post.status} labels={labels} />
                <div className="mt-3 flex gap-2">
                  {post.status === 'draft' ? (
                    <MutationForm action={publishAction} postId={post.id}>
                      {labels.publish}
                    </MutationForm>
                  ) : (
                    <MutationForm action={unpublishAction} postId={post.id}>
                      {labels.unpublish}
                    </MutationForm>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 align-top">
                <TranslationList postId={post.id} translations={post.translations} labels={labels} />
              </td>
              <td className="px-6 py-4 align-top text-right">
                <MutationForm action={deleteAction} postId={post.id} tone="danger">
                  {labels.delete}
                </MutationForm>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({
  status,
  labels
}: {
  status: 'draft' | 'published';
  labels: Pick<AdminPostLabels, 'draft' | 'published'>;
}) {
  const isPublished = status === 'published';
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
      }`}
    >
      {isPublished ? labels.published : labels.draft}
    </span>
  );
}

function MutationForm({
  action,
  postId,
  children,
  tone = 'default'
}: {
  action: (state: AdminActionState, formData: FormData) => Promise<AdminActionState>;
  postId: string;
  children: React.ReactNode;
  tone?: 'default' | 'danger';
}) {
  const [state, formAction] = useFormState(action, INITIAL_STATE);

  return (
    <form action={formAction}>
      <input type="hidden" name="postId" value={postId} />
      <button
        type="submit"
        className={`rounded-full px-3 py-1 text-xs font-semibold ${
          tone === 'danger'
            ? 'bg-red-100 text-red-700 hover:bg-red-200'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
        }`}
      >
        {children}
      </button>
      {state?.error ? <p className="mt-2 text-xs text-red-600">{state.error}</p> : null}
    </form>
  );
}

function TranslationList({
  postId,
  translations,
  labels
}: {
  postId: string;
  translations: { locale: string; title: string }[];
  labels: AdminPostLabels;
}) {
  const [message, setMessage] = useState<string | null>(null);

  async function handleTranslate(locale: string) {
    setMessage(null);
    const res = await fetch(`/api/posts/${postId}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetLocale: locale })
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setMessage(data?.error ?? labels.error);
      return;
    }

    const data = (await res.json()) as { source: string };
    setMessage(data.source === 'llm' ? labels.translationSuccess : labels.translationStub);
  }

  const existing = new Set(translations.map((t) => t.locale));

  return (
    <div className="space-y-3 text-xs text-slate-600">
      <ul className="flex flex-wrap gap-2">
        {translations.map((translation) => (
          <li
            key={translation.locale}
            className="rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary"
          >
            {translation.locale}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2">
        {locales
          .filter((locale) => locale !== 'en')
          .map((locale) => (
            <button
              key={locale}
              type="button"
              className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600 hover:bg-slate-200"
              onClick={() => handleTranslate(locale)}
              disabled={existing.has(locale)}
            >
              {existing.has(locale) ? `${locale} \u2713` : `${labels.translate} ${locale}`}
            </button>
          ))}
      </div>
      {message ? <p className="text-xs text-primary">{message}</p> : null}
    </div>
  );
}

