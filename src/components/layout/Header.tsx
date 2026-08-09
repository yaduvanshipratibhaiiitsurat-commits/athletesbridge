import { useState } from 'react';
import { Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { Link, useRouter } from '@/lib/router';
import { useAuth, isAthlete, isSponsor } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';

export function Header() {
  const { profile, signOut } = useAuth();
  const { navigate, path } = useRouter();
  const [open, setOpen] = useState(false);

  const isActive = (p: string) => path === p || (p !== '/' && path.startsWith(p));

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const dashboardLink = profile
    ? isAthlete(profile)
      ? '/athlete/dashboard'
      : '/sponsor/dashboard'
    : null;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
            <span className="text-lg font-bold">A</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Athlete<span className="text-emerald-500">Bridge</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            to="/about"
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              isActive('/about') ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            About
          </Link>
          {profile && dashboardLink && (
            <Link
              to={dashboardLink}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isActive('/athlete') || isActive('/sponsor')
                  ? 'text-slate-900'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dashboard
            </Link>
          )}
          {isSponsor(profile) && (
            <Link
              to="/sponsor/discover"
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isActive('/sponsor/discover') ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Discover
            </Link>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {profile ? (
            <>
              <Link to={dashboardLink!}>
                <Avatar src={profile.avatar_url} name={profile.full_name} size="sm" />
              </Link>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut size={16} /> Sign out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Get started</Button>
              </Link>
            </>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-slate-700 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            <Link to="/about" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
              About
            </Link>
            {profile && dashboardLink && (
              <Link to={dashboardLink} onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                <LayoutDashboard size={16} /> Dashboard
              </Link>
            )}
            {isSponsor(profile) && (
              <Link to="/sponsor/discover" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                Discover athletes
              </Link>
            )}
            {profile ? (
              <Button variant="outline" size="sm" className="mt-2 w-full" onClick={handleSignOut}>
                <LogOut size={16} /> Sign out
              </Button>
            ) : (
              <div className="mt-2 flex gap-2">
                <Link to="/login" onClick={() => setOpen(false)} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    Log in
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setOpen(false)} className="flex-1">
                  <Button size="sm" className="w-full">
                    Get started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
