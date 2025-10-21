import clsx from 'clsx';
import type { ReactNode } from 'react';

type ContainerProps = {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'section';
  id?: string;
};

export default function Container({ children, className, as = 'div', id }: ContainerProps) {
  const Component = as;
  return (
    <Component
      id={id}
      className={clsx('mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8', className)}
    >
      {children}
    </Component>
  );
}
