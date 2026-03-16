'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Heart, MessageCircle, User, LogOut } from 'lucide-react';
import { useAuth } from '@/app/auth-context';
import { Button } from '@/components/ui/button';
import { useCallback, useEffect } from 'react';

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, currentUser } = useAuth();

  const isActive = (path: string) => pathname === path;

  const handleLogout = useCallback(async () => {
    logout();
    // Push to login after state updates
    await router.push('/login');
  }, [logout, router]);

  // Redirect to login if user logs out while on protected route
  useEffect(() => {
    if (!currentUser && pathname && pathname.startsWith('/app')) {
      router.push('/login');
    }
  }, [currentUser, pathname, router]);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/app" className="flex items-center gap-2">
          <Heart className="w-8 h-8 text-red-500 fill-red-500" />
          <span className="text-xl font-bold text-gray-900 hidden sm:inline">
            Ethiomatch
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/app/discover">
            <Button
              variant={isActive('/app/discover') ? 'default' : 'ghost'}
              size="sm"
              className="gap-2"
            >
              <Heart size={18} />
              <span className="hidden sm:inline">Discover</span>
            </Button>
          </Link>

          <Link href="/app/messages">
            <Button
              variant={isActive('/app/messages') ? 'default' : 'ghost'}
              size="sm"
              className="gap-2"
            >
              <MessageCircle size={18} />
              <span className="hidden sm:inline">Messages</span>
            </Button>
          </Link>

          <Link href="/app/profile">
            <Button
              variant={isActive('/app/profile') ? 'default' : 'ghost'}
              size="sm"
              className="gap-2"
            >
              <User size={18} />
              <span className="hidden sm:inline">Profile</span>
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-red-600 hover:text-red-700 gap-2"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}
