import { useState, type ReactNode } from 'react';
import { Link, useRouter } from '@/lib/router';
import { useAuth } from '@/lib/auth';
import { Avatar } from '@/components/ui/Avatar';

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
}

export function DashboardLayout({
  nav,
  children,
  title,
}: {
  nav: NavItem[];
  children: ReactNode;
  title: string;
}) {
  const { profile } = useAuth();
  const { path } = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const Sidebar = (
    <nav className="flex flex-col gap-1">
      {nav.map((item) => {
        const active = path === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
              active
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span className={active ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-3">
        <Avatar src={profile?.avatar_url} name={profile?.full_name} size="md" />
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="text-lg font-semibold text-slate-900">{profile?.full_name}</p>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">{Sidebar}</div>
        </aside>

        {/* Mobile sidebar toggle */}
        <div className="mb-4 lg:hidden">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-left text-sm font-medium text-slate-700"
          >
            {mobileOpen ? 'Hide menu' : 'Show menu'}
          </button>
          {mobileOpen && (
            <div className="mt-2 rounded-xl border border-slate-200 bg-white p-3">{Sidebar}</div>
          )}
        </div>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
