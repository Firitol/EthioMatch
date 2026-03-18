'use client';

import { Navigation } from '@/components/navigation';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navigation />
      <main>{children}</main>
    </>
  );
}
