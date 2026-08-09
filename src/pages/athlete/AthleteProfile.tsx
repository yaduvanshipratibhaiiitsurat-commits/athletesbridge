import { useEffect, useState } from 'react';
import { Link } from '@/lib/router';
import { useAuth } from '@/lib/auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState, PageLoader } from '@/components/ui/Feedback';
import { getMyAthlete, getAthleteAchievements } from '@/lib/queries';
import type { Athlete, Achievement } from '@/lib/types';
import {
  LayoutDashboard,
  UserCircle,
  Trophy,
  MailOpen,
  TrendingUp,
  Pencil,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Link as LinkIcon,
  Target,
} from 'lucide-react';

const nav = [
  { to: '/athlete/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { to: '/athlete/profile', label: 'My profile', icon: <UserCircle size={18} /> },
  { to: '/athlete/achievements', label: 'Achievements', icon: <Trophy size={18} /> },
  { to: '/athlete/requests', label: 'Sponsorship requests', icon: <MailOpen size={18} /> },
  { to: '/athlete/opportunities', label: 'Opportunities', icon: <TrendingUp size={18} /> },
];

export function AthleteProfile() {
  const { profile } = useAuth();
  const [athlete, setAthlete] = useState<Athlete | null | undefined>(undefined);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const a = await getMyAthlete(profile.id);
      setAthlete(a);
      if (a) setAchievements(await getAthleteAchievements(a.id));
    })();
  }, [profile]);

  if (athlete === undefined) return <DashboardLayout nav={nav} title="Athlete profile"><PageLoader /></DashboardLayout>;

  if (athlete === null) {
    return (
      <DashboardLayout nav={nav} title="Athlete profile">
        <EmptyState
          icon={<UserCircle size={40} />}
          title="No profile yet"
          description="Create your athlete profile to become discoverable by sponsors."
          action={<Link to="/athlete/profile/edit"><Button>Create profile <Pencil size={16} /></Button></Link>}
        />
      </DashboardLayout>
    );
  }

  const social = athlete.social_links ?? {};

  return (
    <DashboardLayout nav={nav} title="Athlete profile">
      <div className="mb-4 flex justify-end">
        <Link to="/athlete/profile/edit"><Button variant="outline" size="sm"><Pencil size={16} /> Edit profile</Button></Link>
      </div>

      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-to-br from-slate-800 to-slate-900" />
        <div className="px-6 pb-6">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <Avatar src={profile?.avatar_url} name={profile?.full_name} size="xl" />
              <div className="pb-1">
                <h1 className="text-2xl font-bold text-slate-900">{profile?.full_name}</h1>
                <p className="text-slate-500">{athlete.sport ?? '—'} {athlete.category ? `· ${athlete.category}` : ''}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {athlete.competition_level && <Badge variant="info">{athlete.competition_level}</Badge>}
              {athlete.sponsorship_types.map((t) => <Badge key={t} variant="neutral">{t}</Badge>)}
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <InfoItem icon={<MapPin size={16} />} label="Location" value={athlete.location} />
            <InfoItem icon={<Calendar size={16} />} label="Age" value={athlete.age != null ? String(athlete.age) : null} />
            <InfoItem icon={<Users size={16} />} label="Gender" value={athlete.gender} />
            <InfoItem icon={<Calendar size={16} />} label="Years active" value={athlete.years_active != null ? String(athlete.years_active) : null} />
          </div>

          {athlete.bio && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-slate-900">About</h3>
              <p className="mt-2 text-slate-600">{athlete.bio}</p>
            </div>
          )}

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <DollarSign size={16} /> Sponsorship requirements
              </h3>
              <div className="mt-3 rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-600">
                  {athlete.sponsorship_requirements ?? 'No specific requirements listed.'}
                </p>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-slate-500">Budget range</span>
                  <span className="font-semibold text-slate-900">
                    {athlete.min_budget && athlete.max_budget
                      ? `$${Number(athlete.min_budget).toLocaleString()} – $${Number(athlete.max_budget).toLocaleString()}`
                      : 'Not specified'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <LinkIcon size={16} /> Social links
              </h3>
              <div className="mt-3 space-y-2">
                {Object.keys(social).length === 0 && <p className="text-sm text-slate-500">No social links added.</p>}
                {Object.entries(social).map(([k, v]) => (
                  <a key={k} href={v} target="_blank" rel="noreferrer" className="block truncate rounded-lg border border-slate-100 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                    <span className="font-medium capitalize text-slate-700">{k}:</span> {v}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Achievements</h2>
          <Link to="/athlete/achievements"><Button variant="ghost" size="sm">Manage</Button></Link>
        </div>
        {achievements.length === 0 ? (
          <EmptyState icon={<Trophy size={32} />} title="No achievements yet" description="Add your competition results to strengthen your profile." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {achievements.map((a) => (
              <Card key={a.id} className="p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                    <Trophy size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">{a.competition}</p>
                    <p className="text-sm text-slate-500">{a.medal ?? '—'} · {a.year ?? '—'} · {a.level ?? '—'}</p>
                    {a.description && <p className="mt-1 text-sm text-slate-600">{a.description}</p>}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) {
  return (
    <div className="rounded-xl border border-slate-100 p-3">
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        {icon} {label}
      </div>
      <p className="mt-1 font-medium text-slate-900">{value ?? '—'}</p>
    </div>
  );
}
