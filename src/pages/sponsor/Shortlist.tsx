import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AthleteCard } from '@/components/athlete/AthleteCard';
import { EmptyState, PageLoader } from '@/components/ui/Feedback';
import { supabase } from '@/lib/supabase';
import { getMySponsor } from '@/lib/queries';
import { computeMatch } from '@/lib/types';
import type { Sponsor, Athlete, Profile, Achievement } from '@/lib/types';
import {
  LayoutDashboard, Search, Bookmark, MailOpen, Handshake,
} from 'lucide-react';

const nav = [
  { to: '/sponsor/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { to: '/sponsor/discover', label: 'Discover athletes', icon: <Search size={18} /> },
  { to: '/sponsor/shortlist', label: 'Shortlist', icon: <Bookmark size={18} /> },
  { to: '/sponsor/requests', label: 'Sponsorship requests', icon: <MailOpen size={18} /> },
  { to: '/sponsor/profile', label: 'My profile', icon: <Handshake size={18} /> },
];

interface ShortlistRow {
  id: string;
  athlete_id: string;
  athlete: Athlete & { profiles?: Profile };
}

export function Shortlist() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sponsor, setSponsor] = useState<Sponsor | null>(null);
  const [rows, setRows] = useState<ShortlistRow[]>([]);
  const [achievementsMap, setAchievementsMap] = useState<Record<string, Achievement[]>>({});

  useEffect(() => {
    if (!profile) return;
    let cancelled = false;
    (async () => {
      const sp = await getMySponsor(profile.id);
      if (cancelled) return;
      setSponsor(sp);
      if (sp) {
        const { data: sl } = await supabase
          .from('shortlists')
          .select('id, athlete_id, athlete:athletes(*, profiles:profiles!user_id(*))')
          .eq('sponsor_id', sp.id)
          .order('created_at', { ascending: false });
        if (cancelled) return;
        const slRows = (sl as ShortlistRow[]) ?? [];
        setRows(slRows);

        const achMap: Record<string, Achievement[]> = {};
        await Promise.all(
          slRows.map(async (r) => {
            const { data: ach } = await supabase.from('achievements').select('*').eq('athlete_id', r.athlete_id);
            achMap[r.athlete_id] = (ach as Achievement[]) ?? [];
          }),
        );
        if (cancelled) return;
        setAchievementsMap(achMap);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [profile]);

  if (loading) return <DashboardLayout nav={nav} title="Shortlist"><PageLoader /></DashboardLayout>;

  return (
    <DashboardLayout nav={nav} title="Shortlist">
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Your shortlist</h1>
        <p className="text-sm text-slate-500">Athletes you've saved for later.</p>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={<Bookmark size={40} />}
          title="No shortlisted athletes yet"
          description="Browse the discover page and bookmark athletes you're interested in."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((r) => {
            const match = sponsor ? computeMatch(r.athlete, sponsor, achievementsMap[r.athlete_id] ?? []) : null;
            return (
              <AthleteCard
                key={r.id}
                athlete={r.athlete}
                profile={r.athlete.profiles}
                achievements={achievementsMap[r.athlete_id] ?? []}
                match={match ?? undefined}
                shortlisted
              />
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
