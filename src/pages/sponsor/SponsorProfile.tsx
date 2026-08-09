import { useEffect, useState } from 'react';
import { Link } from '@/lib/router';
import { useAuth } from '@/lib/auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState, PageLoader } from '@/components/ui/Feedback';
import { getMySponsor } from '@/lib/queries';
import type { Sponsor } from '@/lib/types';
import {
  LayoutDashboard, Search, Bookmark, MailOpen, Handshake,
  Pencil, MapPin, Globe, DollarSign, Target, Building2,
} from 'lucide-react';

const nav = [
  { to: '/sponsor/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { to: '/sponsor/discover', label: 'Discover athletes', icon: <Search size={18} /> },
  { to: '/sponsor/shortlist', label: 'Shortlist', icon: <Bookmark size={18} /> },
  { to: '/sponsor/requests', label: 'Sponsorship requests', icon: <MailOpen size={18} /> },
  { to: '/sponsor/profile', label: 'My profile', icon: <Handshake size={18} /> },
];

export function SponsorProfile() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sponsor, setSponsor] = useState<Sponsor | null | undefined>(undefined);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const sp = await getMySponsor(profile.id);
      setSponsor(sp);
      setLoading(false);
    })();
  }, [profile]);

  if (loading) return <DashboardLayout nav={nav} title="My profile"><PageLoader /></DashboardLayout>;

  if (sponsor === null) {
    return (
      <DashboardLayout nav={nav} title="My profile">
        <EmptyState
          icon={<Handshake size={40} />}
          title="No sponsor profile yet"
          description="Create your sponsor profile to start discovering and sponsoring athletes."
          action={<Link to="/sponsor/profile/edit"><Button>Create profile <Pencil size={16} /></Button></Link>}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout nav={nav} title="My profile">
      <div className="mb-4 flex justify-end">
        <Link to="/sponsor/profile/edit"><Button variant="outline" size="sm"><Pencil size={16} /> Edit profile</Button></Link>
      </div>

      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-to-br from-slate-800 to-slate-900" />
        <div className="px-6 pb-6">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <Avatar name={sponsor?.company_name} src={sponsor?.logo_url} size="xl" />
              <div className="pb-1">
                <h1 className="text-2xl font-bold text-slate-900">{sponsor?.company_name ?? 'Your company'}</h1>
                <p className="text-slate-500">{sponsor?.industry ?? '—'}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {sponsor?.sponsorship_types.map((t) => <Badge key={t} variant="neutral">{t}</Badge>)}
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoItem icon={<MapPin size={16} />} label="Location" value={sponsor?.location} />
            <InfoItem icon={<Building2 size={16} />} label="Industry" value={sponsor?.industry} />
            <InfoItem icon={<Globe size={16} />} label="Website" value={sponsor?.website} />
            <InfoItem icon={<DollarSign size={16} />} label="Sponsorship budget" value={sponsor?.sponsorship_budget != null ? `$${Number(sponsor.sponsorship_budget).toLocaleString()}` : null} />
          </div>

          {sponsor?.description && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-slate-900">About</h3>
              <p className="mt-2 text-slate-600">{sponsor.description}</p>
            </div>
          )}

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Target size={16} /> Preferred sports</h3>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {sponsor?.preferred_sports.length === 0 && <p className="text-sm text-slate-500">No preferences set.</p>}
                {sponsor?.preferred_sports.map((s) => <Badge key={s} variant="info">{s}</Badge>)}
              </div>
            </div>
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Target size={16} /> Preferred competition levels</h3>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {sponsor?.preferred_levels.length === 0 && <p className="text-sm text-slate-500">No preferences set.</p>}
                {sponsor?.preferred_levels.map((l) => <Badge key={l} variant="info">{l}</Badge>)}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </DashboardLayout>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) {
  return (
    <div className="rounded-xl border border-slate-100 p-3">
      <div className="flex items-center gap-1.5 text-xs text-slate-400">{icon} {label}</div>
      <p className="mt-1 font-medium text-slate-900">{value ?? '—'}</p>
    </div>
  );
}
