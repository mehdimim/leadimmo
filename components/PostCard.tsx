import clsx from 'clsx';
import Link from 'next/link';

type PostCardProps = {
  locale: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  category?: string | null;
  status?: 'draft' | 'published';
  labelDraft: string;
  labelCategory: string;
  labelPublished?: string;
  readMoreLabel?: string;
};

export default function PostCard({
  locale,
  slug,
  title,
  excerpt,
  category,
  status,
  labelDraft,
  labelCategory,
  labelPublished = 'Published',
  readMoreLabel = 'Read more'
}: PostCardProps) {
  return (
    <Link
      href={`/${locale}/blog/${slug}`}
      className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-500">
        {category ? (
          <span>
            {labelCategory}: {category}
          </span>
        ) : (
          <span />
        )}
        <span
          className={clsx(
            'rounded-full px-2 py-0.5 font-semibold',
            status === 'draft'
              ? 'bg-amber-100 text-amber-700'
              : 'bg-emerald-100 text-emerald-700'
          )}
        >
          {status === 'draft' ? labelDraft : labelPublished}
        </span>
      </div>
      <h3 className="mt-4 text-xl font-semibold text-slate-900">{title}</h3>
      <p className="mt-3 flex-1 text-sm leading-6 text-slate-600 line-clamp-3">{excerpt}</p>
      <span className="mt-5 text-sm font-medium text-primary">{readMoreLabel}</span>
    </Link>
  );
}
