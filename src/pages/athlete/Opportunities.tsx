import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState, PageLoader } from '@/components/ui/Feedback';
import { supabase } from '@/lib/supabase';
import { getMyAthlete, getAthleteAchievements } from '@/lib/queries';
import { computeMatch } from '@/lib/types';
import type { Athlete, Sponsor, Achievement } from '@/lib/types';
import {
  LayoutDashboard, UserCircle, Trophy, MailOpen, TrendingUp,
  Target, DollarSign, MapPin, ArrowRight,
} from 'lucide-react';

const nav = [
  { to: '/athlete/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { to: '/athlete/profile', label: 'My profile', icon: <UserCircle size={18} /> },
  { to: '/athlete/achievements', label: 'Achievements', icon: <Trophy size={18} /> },
  { to: '/athlete/requests', label: 'Sponsorship requests', icon: <MailOpen size={18} /> },
  { to: '/athlete/opportunities', label: 'Opportunities', icon: <TrendingUp size={18} /> },
];

export function Opportunities() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [opportunities, setOpportunities] = useState<{ sponsor: Sponsor; score: number; reasons: string[] }[]>([]);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const athlete = await getMyAthlete(profile.id);
      if (!athlete) {
        setLoading(false);
        return;
      }
      const achievements = await getAthleteAchievements(athlete.id);
      const { data: sponsors } = await supabase.from('sponsors').select('*');
      const list = ((sponsors as Sponsor[]) ?? [])
        .map((sponsor) => {
          const m = computeMatch(athlete as Athlete, sponsor, achievements);
          return { sponsor, score: m.score, reasons: m.reasons };
        })
        .sort((a, b) => b.score - a.score);
      setOpportunities(list);
      setLoading(false);
    })();
  }, [profile]);

  if (loading) return <DashboardLayout nav={nav} title="Opportunities"><PageLoader /></DashboardLayout>;

  return (
    <DashboardLayout nav={nav} title="Opportunities">
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Opportunities</h1>
        <p className="text-sm text-slate-500">Sponsors ranked by compatibility with your profile.</p>
      </div>

      {opportunities.length === 0 ? (
        <EmptyState icon={<TrendingUp size={40} />} title="No opportunities yet" description="Once sponsors join the platform, you'll see the best matches for your profile here." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {opportunities.map(({ sponsor, score, reasons }) => (
            <Card key={sponsor.id} hover className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{sponsor.company_name ?? 'A sponsor'}</p>
                  <p className="text-sm text-slate-500">{sponsor.industry ?? '—'}</p>
                </div>
                <div className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-600">
                  {score}% Match
                </div>
              </div>

              {sponsor.description && <p className="mt-3 text-sm text-slate-600">{sponsor.description}</p>}

              <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500">
                {sponsor.sponsorship_budget != null && (
                  <span className="flex items-center gap-1"><DollarSign size={14} className="text-emerald-500" /> ${sponsor.sponsorship_budget.toLocaleString()} budget</span>
                )}
                {sponsor.location && <span className="flex items-center gap-1"><MapPin size={14} /> {sponsor.location}</span>}
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {sponsor.preferred_sports.slice(0, 3).map((s) => <Badge key={s} variant="info">{s}</Badge>)}
                {sponsor.sponsorship_types.slice(0, 2).map((t) => <Badge key={t} variant="neutral">{t}</Badge>)}
              </div>

              <div className="mt-4 rounded-xl bg-slate-50 p-3">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-700"><Target size={13} /> Why this match?</p>
                <ul className="mt-1.5 space-y-0.5">
                  {reasons.slice(0, 3).map((r, i) => (
                    <li key={i} className="text-xs text-slate-600">• {r}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-xs text-slate-400">To connect, sponsors send the proposal — you'll see it in Requests.</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
