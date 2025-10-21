import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';

import { isAdminAuthenticated } from '@/lib/auth';

type AdminGuardProps = {
  children: ReactNode;
  locale: string;
};

export default async function AdminGuard({ children, locale }: AdminGuardProps) {
  if (!(await isAdminAuthenticated())) {
    redirect(`/${locale}/admin/login`);
  }

  return <>{children}</>;
}
