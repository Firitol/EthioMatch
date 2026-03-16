'use client';

import { AuthProvider } from '@/app/auth-context';
import { Navigation } from '@/components/navigation';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <Navigation />
      <main className="pt-0">
        {children}
      </main>
    </AuthProvider>
  );
}
