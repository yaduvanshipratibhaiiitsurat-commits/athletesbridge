import { useEffect, useState } from 'react';
import { Link } from '@/lib/router';
import { useAuth } from '@/lib/auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/Feedback';
import { PageLoader } from '@/components/ui/Feedback';
import { getMyAthlete, getAthleteAchievements } from '@/lib/queries';
import { supabase } from '@/lib/supabase';
import type { Athlete, Achievement, SponsorshipRequest, Sponsor } from '@/lib/types';
import {
  LayoutDashboard,
  UserCircle,
  Trophy,
  MailOpen,
  Bookmark,
  CheckCircle2,
  Eye,
  TrendingUp,
  Pencil,
  ArrowRight,
} from 'lucide-react';

const nav = [
  { to: '/athlete/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { to: '/athlete/profile', label: 'My profile', icon: <UserCircle size={18} /> },
  { to: '/athlete/achievements', label: 'Achievements', icon: <Trophy size={18} /> },
  { to: '/athlete/requests', label: 'Sponsorship requests', icon: <MailOpen size={18} /> },
  { to: '/athlete/opportunities', label: 'Opportunities', icon: <TrendingUp size={18} /> },
];

export function AthleteDashboard() {
  const { profile } = useAuth();
  const [athlete, setAthlete] = useState<Athlete | null | undefined>(undefined);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [requests, setRequests] = useState<SponsorshipRequest[]>([]);
  const [sponsors, setSponsors] = useState<Record<string, Sponsor>>({});
  const [shortlistCount, setShortlistCount] = useState(0);

  useEffect(() => {
    if (!profile) return;
    let cancelled = false;
    (async () => {
      const a = await getMyAthlete(profile.id);
      if (cancelled) return;
      setAthlete(a);
      if (a) {
        const [ach, reqs, sl] = await Promise.all([
          getAthleteAchievements(a.id),
          supabase
            .from('sponsorship_requests')
            .select('*')
            .eq('athlete_id', a.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('shortlists')
            .select('id', { count: 'exact', head: true })
            .eq('athlete_id', a.id),
        ]);
        if (cancelled) return;
        setAchievements(ach);
        setRequests((reqs.data as SponsorshipRequest[]) ?? []);
        setShortlistCount(sl.count ?? 0);
        if (reqs.data && reqs.data.length > 0) {
          const ids = [...new Set(reqs.data.map((r) => r.sponsor_id))];
          const { data: sp } = await supabase.from('sponsors').select('*').in('id', ids);
          if (cancelled) return;
          const map: Record<string, Sponsor> = {};
          (sp as Sponsor[])?.forEach((s) => (map[s.id] = s));
          setSponsors(map);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [profile]);

  if (athlete === undefined) return <DashboardLayout nav={nav} title="Athlete dashboard"><PageLoader /></DashboardLayout>;

  if (athlete === null) {
    return (
      <DashboardLayout nav={nav} title="Athlete dashboard">
        <EmptyState
          icon={<UserCircle size={40} />}
          title="Create your athlete profile"
          description="You haven't set up your athlete profile yet. Add your sport, achievements and sponsorship needs so sponsors can discover you."
          action={<Link to="/athlete/profile/edit"><Button>Edit profile <Pencil size={16} /></Button></Link>}
        />
      </DashboardLayout>
    );
  }

  const completion = computeCompletion(athlete, achievements);
  const accepted = requests.filter((r) => r.status === 'accepted').length;
  const pending = requests.filter((r) => r.status === 'pending').length;

  return (
    <DashboardLayout nav={nav} title="Athlete dashboard">
      {/* Completion banner */}
      {completion < 100 && (
        <Card className="mb-6 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-slate-900">Profile {completion}% complete</p>
              <p className="text-sm text-slate-500">A complete profile gets more sponsor matches.</p>
            </div>
            <Link to="/athlete/profile/edit">
              <Button variant="outline" size="sm">Complete profile <ArrowRight size={14} /></Button>
            </Link>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${completion}%` }} />
          </div>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Eye size={18} />} label="Profile views" value={athlete.profile_views} accent="blue" />
        <StatCard icon={<Bookmark size={18} />} label="Shortlists" value={shortlistCount} accent="amber" />
        <StatCard icon={<MailOpen size={18} />} label="Sponsorship requests" value={requests.length} hint={`${pending} pending`} accent="emerald" />
        <StatCard icon={<CheckCircle2 size={18} />} label="Accepted sponsorships" value={accepted} accent="emerald" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Recent requests */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Recent sponsorship requests</h2>
            <Link to="/athlete/requests"><Button variant="ghost" size="sm">View all</Button></Link>
          </div>
          {requests.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No requests yet. Keep your profile up to date and sponsors will find you.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {requests.slice(0, 4).map((r) => {
                const sp = sponsors[r.sponsor_id];
                return (
                  <li key={r.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">{sp?.company_name ?? 'A sponsor'}</p>
                      <p className="text-sm text-slate-500">${r.amount.toLocaleString()} · {r.sponsorship_type ?? '—'}</p>
                    </div>
                    <Badge variant={r.status === 'accepted' ? 'success' : r.status === 'rejected' ? 'danger' : 'warning'}>
                      {r.status}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {/* Recent achievements */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Recent achievements</h2>
            <Link to="/athlete/achievements"><Button variant="ghost" size="sm">View all</Button></Link>
          </div>
          {achievements.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No achievements added yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {achievements.slice(0, 4).map((a) => (
                <li key={a.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                  <Trophy size={18} className="text-amber-500" />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{a.competition}</p>
                    <p className="text-sm text-slate-500">{a.medal ?? '—'} · {a.year ?? '—'} · {a.level ?? '—'}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}

function computeCompletion(athlete: Athlete, achievements: Achievement[]): number {
  const fields = [
    athlete.sport,
    athlete.category,
    athlete.location,
    athlete.bio,
    athlete.competition_level,
    athlete.years_active != null ? 'x' : null,
    athlete.min_budget != null ? 'x' : null,
    athlete.max_budget != null ? 'x' : null,
    athlete.sponsorship_types.length > 0 ? 'x' : null,
    athlete.sponsorship_requirements,
    achievements.length > 0 ? 'x' : null,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}
