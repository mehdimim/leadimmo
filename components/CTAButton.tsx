import clsx from 'clsx';
import Link from 'next/link';
import type { ReactNode } from 'react';

type CTAButtonProps = {
  href?: string;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  type?: 'button' | 'submit' | 'reset';
  className?: string;
};

const baseStyles =
  'inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';

const variantStyles: Record<NonNullable<CTAButtonProps['variant']>, string> = {
  primary:
    'bg-primary text-white shadow-soft hover:bg-primary-light focus-visible:outline-primary',
  secondary:
    'bg-white text-primary border border-primary hover:bg-primary/10 focus-visible:outline-primary',
  ghost:
    'text-primary hover:text-primary-dark hover:bg-primary/10 focus-visible:outline-primary'
};

export default function CTAButton({
  href,
  children,
  variant = 'primary',
  type = 'button',
  className
}: CTAButtonProps) {
  const classes = clsx(baseStyles, variantStyles[variant], className);

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes}>
      {children}
    </button>
  );
}
