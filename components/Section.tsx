import clsx from 'clsx';
import type { ReactNode } from 'react';

type SectionProps = {
  title?: ReactNode;
  eyebrow?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
  background?: 'default' | 'muted';
  id?: string;
};

export default function Section({
  title,
  eyebrow,
  description,
  children,
  className,
  background = 'default',
  id
}: SectionProps) {
  return (
    <section
      id={id}
      className={clsx(
        'py-16 sm:py-20',
        background === 'muted' && 'bg-slate-100',
        className
      )}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {(eyebrow || title || description) && (
          <header className="mb-10 max-w-3xl">
            {eyebrow ? (
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                {eyebrow}
              </p>
            ) : null}
            {title ? <h2 className="mt-2 text-3xl font-bold tracking-tight">{title}</h2> : null}
            {description ? <p className="mt-4 text-lg text-slate-600">{description}</p> : null}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
