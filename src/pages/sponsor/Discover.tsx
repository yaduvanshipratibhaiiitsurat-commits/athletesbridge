import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AthleteCard } from '@/components/athlete/AthleteCard';
import { Input, Select, Label } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { EmptyState, PageLoader, Spinner } from '@/components/ui/Feedback';
import { supabase } from '@/lib/supabase';
import { getMySponsor } from '@/lib/queries';
import { computeMatch, SPORTS, COMPETITION_LEVELS, SPONSORSHIP_TYPES } from '@/lib/types';
import type { Athlete, Profile, Achievement, Sponsor } from '@/lib/types';
import {
  LayoutDashboard, Search, Bookmark, MailOpen, Handshake, Filter, X,
} from 'lucide-react';

const nav = [
  { to: '/sponsor/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { to: '/sponsor/discover', label: 'Discover athletes', icon: <Search size={18} /> },
  { to: '/sponsor/shortlist', label: 'Shortlist', icon: <Bookmark size={18} /> },
  { to: '/sponsor/requests', label: 'Sponsorship requests', icon: <MailOpen size={18} /> },
  { to: '/sponsor/profile', label: 'My profile', icon: <Handshake size={18} /> },
];

interface AthleteWithProfile extends Athlete {
  profiles?: Profile;
}

interface Filters {
  search: string;
  sport: string;
  location: string;
  competitionLevel: string;
  maxAge: string;
  minBudget: string;
  maxBudget: string;
  sponsorshipType: string;
}

const emptyFilters: Filters = {
  search: '', sport: '', location: '', competitionLevel: '',
  maxAge: '', minBudget: '', maxBudget: '', sponsorshipType: '',
};

export function Discover() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sponsor, setSponsor] = useState<Sponsor | null>(null);
  const [athletes, setAthletes] = useState<AthleteWithProfile[]>([]);
  const [achievementsMap, setAchievementsMap] = useState<Record<string, Achievement[]>>({});
  const [shortlistedIds, setShortlistedIds] = useState<Set<string>>(new Set());
  const [shortlistLoading, setShortlistLoading] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!profile) return;
    let cancelled = false;
    (async () => {
      const sp = await getMySponsor(profile.id);
      if (cancelled) return;
      setSponsor(sp);

      const { data: athRes } = await supabase
        .from('athletes')
        .select('*, profiles:profiles!user_id(*)')
        .order('created_at', { ascending: false });
      if (cancelled) return;
      const aths = (athRes as AthleteWithProfile[]) ?? [];
      setAthletes(aths);

      const achMap: Record<string, Achievement[]> = {};
      await Promise.all(
        aths.map(async (a) => {
          const { data: ach } = await supabase.from('achievements').select('*').eq('athlete_id', a.id);
          achMap[a.id] = (ach as Achievement[]) ?? [];
        }),
      );
      if (cancelled) return;
      setAchievementsMap(achMap);

      if (sp) {
        const { data: sl } = await supabase.from('shortlists').select('athlete_id').eq('sponsor_id', sp.id);
        if (cancelled) return;
        setShortlistedIds(new Set(((sl as { athlete_id: string }[]) ?? []).map((s) => s.athlete_id)));
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [profile]);

  const toggleShortlist = async (athleteId: string) => {
    if (!sponsor) return;
    setShortlistLoading(athleteId);
    if (shortlistedIds.has(athleteId)) {
      const { error } = await supabase.from('shortlists').delete().eq('sponsor_id', sponsor.id).eq('athlete_id', athleteId);
      if (!error) setShortlistedIds((prev) => { const n = new Set(prev); n.delete(athleteId); return n; });
    } else {
      const { error } = await supabase.from('shortlists').insert({ sponsor_id: sponsor.id, athlete_id: athleteId });
      if (!error) setShortlistedIds((prev) => new Set(prev).add(athleteId));
    }
    setShortlistLoading(null);
  };

  const filtered = useMemo(() => {
    return athletes.filter((a) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const name = (a.profiles?.full_name ?? '').toLowerCase();
        if (!name.includes(q) && !(a.sport ?? '').toLowerCase().includes(q) && !(a.bio ?? '').toLowerCase().includes(q)) return false;
      }
      if (filters.sport && a.sport !== filters.sport) return false;
      if (filters.location) {
        const loc = (a.location ?? '').toLowerCase();
        if (!loc.includes(filters.location.toLowerCase())) return false;
      }
      if (filters.competitionLevel && a.competition_level !== filters.competitionLevel) return false;
      if (filters.maxAge && (a.age == null || a.age > Number(filters.maxAge))) return false;
      if (filters.minBudget && (a.max_budget == null || a.max_budget < Number(filters.minBudget))) return false;
      if (filters.maxBudget && (a.min_budget == null || a.min_budget > Number(filters.maxBudget))) return false;
      if (filters.sponsorshipType && !a.sponsorship_types.includes(filters.sponsorshipType)) return false;
      return true;
    });
  }, [athletes, filters]);

  const ranked = useMemo(() => {
    if (!sponsor) return filtered.map((a) => ({ athlete: a, match: undefined as undefined | { score: number; reasons: string[] } }));
    return filtered
      .map((a) => {
        const m = computeMatch(a, sponsor, achievementsMap[a.id] ?? []);
        return { athlete: a, match: m };
      })
      .sort((x, y) => (y.match?.score ?? 0) - (x.match?.score ?? 0));
  }, [filtered, sponsor, achievementsMap]);

  const activeFilterCount = Object.values(filters).filter((v) => v).length;

  if (loading) return <DashboardLayout nav={nav} title="Discover athletes"><PageLoader /></DashboardLayout>;

  return (
    <DashboardLayout nav={nav} title="Discover athletes">
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Discover athletes</h1>
        <p className="text-sm text-slate-500">Search and filter athletes by sport, level, budget and more.</p>
      </div>

      {/* Search bar */}
      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            placeholder="Search by name, sport, or keyword…"
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
          <Filter size={16} /> Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 rounded-full bg-emerald-500 px-1.5 py-0.5 text-xs text-white">{activeFilterCount}</span>
          )}
        </Button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">Filters</h3>
            {activeFilterCount > 0 && (
              <button onClick={() => setFilters(emptyFilters)} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900">
                <X size={12} /> Clear all
              </button>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label>Sport</Label>
              <Select value={filters.sport} onChange={(e) => setFilters((f) => ({ ...f, sport: e.target.value }))}>
                <option value="">All sports</option>
                {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>
            <div>
              <Label>Location</Label>
              <Input value={filters.location} onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))} placeholder="City or country" />
            </div>
            <div>
              <Label>Competition level</Label>
              <Select value={filters.competitionLevel} onChange={(e) => setFilters((f) => ({ ...f, competitionLevel: e.target.value }))}>
                <option value="">All levels</option>
                {COMPETITION_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </Select>
            </div>
            <div>
              <Label>Max age</Label>
              <Input type="number" value={filters.maxAge} onChange={(e) => setFilters((f) => ({ ...f, maxAge: e.target.value }))} placeholder="Any" />
            </div>
            <div>
              <Label>Min budget ($)</Label>
              <Input type="number" value={filters.minBudget} onChange={(e) => setFilters((f) => ({ ...f, minBudget: e.target.value }))} placeholder="Any" />
            </div>
            <div>
              <Label>Max budget ($)</Label>
              <Input type="number" value={filters.maxBudget} onChange={(e) => setFilters((f) => ({ ...f, maxBudget: e.target.value }))} placeholder="Any" />
            </div>
            <div>
              <Label>Sponsorship type</Label>
              <Select value={filters.sponsorshipType} onChange={(e) => setFilters((f) => ({ ...f, sponsorshipType: e.target.value }))}>
                <option value="">All types</option>
                {SPONSORSHIP_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {ranked.length === 0 ? (
        <EmptyState icon={<Search size={40} />} title="No athletes found" description="Try adjusting your search or filters to find more athletes." />
      ) : (
        <>
          <p className="mb-4 text-sm text-slate-500">{ranked.length} athlete{ranked.length !== 1 ? 's' : ''} found</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ranked.map(({ athlete, match }) => (
              <AthleteCard
                key={athlete.id}
                athlete={athlete}
                profile={athlete.profiles}
                achievements={achievementsMap[athlete.id] ?? []}
                match={match}
                shortlisted={shortlistedIds.has(athlete.id)}
                onShortlist={() => toggleShortlist(athlete.id)}
                shortlistLoading={shortlistLoading === athlete.id}
              />
            ))}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
