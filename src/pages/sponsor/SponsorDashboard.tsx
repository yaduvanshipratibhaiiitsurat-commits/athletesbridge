import { useEffect, useState } from 'react';
import { Link } from '@/lib/router';
import { useAuth } from '@/lib/auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState, PageLoader } from '@/components/ui/Feedback';
import { AthleteCard } from '@/components/athlete/AthleteCard';
import { supabase } from '@/lib/supabase';
import { getMySponsor } from '@/lib/queries';
import { computeMatch } from '@/lib/types';
import type { Sponsor, Athlete, Profile, Achievement, SponsorshipRequest, Shortlist } from '@/lib/types';
import {
  LayoutDashboard,
  Search,
  Bookmark,
  MailOpen,
  Handshake,
  Pencil,
  ArrowRight,
  TrendingUp,
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

export function SponsorDashboard() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sponsor, setSponsor] = useState<Sponsor | null | undefined>(undefined);
  const [shortlisted, setShortlisted] = useState<Shortlist[]>([]);
  const [requests, setRequests] = useState<SponsorshipRequest[]>([]);
  const [recommended, setRecommended] = useState<{ athlete: AthleteWithProfile; achievements: Achievement[]; score: number; reasons: string[] }[]>([]);

  useEffect(() => {
    if (!profile) return;
    let cancelled = false;
    (async () => {
      const sp = await getMySponsor(profile.id);
      if (cancelled) return;
      setSponsor(sp);
      if (sp) {
        const [sl, reqs, athRes] = await Promise.all([
          supabase.from('shortlists').select('*, athlete:athletes(*, profiles:profiles!user_id(*), achievements(*)').eq('sponsor_id', sp.id).order('created_at', { ascending: false }),
          supabase.from('sponsorship_requests').select('*').eq('sponsor_id', sp.id).order('created_at', { ascending: false }),
          supabase.from('athletes').select('*, profiles:profiles!user_id(*)').limit(20),
        ]);
        if (cancelled) return;
        setShortlisted((sl.data as Shortlist[]) ?? []);
        setRequests((reqs.data as SponsorshipRequest[]) ?? []);

        const athletes = (athRes.data as AthleteWithProfile[]) ?? [];
        const enriched = await Promise.all(
          athletes.map(async (a) => {
            const { data: ach } = await supabase.from('achievements').select('*').eq('athlete_id', a.id);
            const achievements = (ach as Achievement[]) ?? [];
            const m = computeMatch(a, sp, achievements);
            return { athlete: a, achievements, score: m.score, reasons: m.reasons };
          }),
        );
        if (cancelled) return;
        enriched.sort((x, y) => y.score - x.score);
        setRecommended(enriched.slice(0, 3));
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [profile]);

  if (loading) return <DashboardLayout nav={nav} title="Sponsor dashboard"><PageLoader /></DashboardLayout>;

  if (sponsor === null) {
    return (
      <DashboardLayout nav={nav} title="Sponsor dashboard">
        <EmptyState
          icon={<Handshake size={40} />}
          title="Create your sponsor profile"
          description="Tell athletes who you are, what sports you support, and what kind of sponsorships you offer."
          action={<Link to="/sponsor/profile/edit"><Button>Edit profile <Pencil size={16} /></Button></Link>}
        />
      </DashboardLayout>
    );
  }

  const accepted = requests.filter((r) => r.status === 'accepted').length;
  const pending = requests.filter((r) => r.status === 'pending').length;

  return (
    <DashboardLayout nav={nav} title="Sponsor dashboard">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back{sponsor?.company_name ? `, ${sponsor.company_name}` : ''}</h1>
          <p className="text-sm text-slate-500">Here's your sponsorship activity at a glance.</p>
        </div>
        <Link to="/sponsor/profile/edit"><Button variant="outline" size="sm"><Pencil size={16} /> Edit profile</Button></Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Bookmark size={18} />} label="Shortlisted athletes" value={shortlisted.length} accent="amber" />
        <StatCard icon={<MailOpen size={18} />} label="Requests sent" value={requests.length} hint={`${pending} pending`} accent="emerald" />
        <StatCard icon={<Handshake size={18} />} label="Active partnerships" value={accepted} accent="emerald" />
        <StatCard icon={<TrendingUp size={18} />} label="Profile completion" value={sponsor ? computeSponsorCompletion(sponsor) + '%' : '—'} accent="blue" />
      </div>

      {/* Recommended athletes */}
      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Recommended athletes</h2>
          <Link to="/sponsor/discover"><Button variant="ghost" size="sm">Discover more <ArrowRight size={14} /></Button></Link>
        </div>
        {recommended.length === 0 ? (
          <EmptyState icon={<Search size={40} />} title="No athletes to recommend yet" description="Once athletes join the platform, your top matches will appear here." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.map(({ athlete, achievements, score, reasons }) => (
              <AthleteCard
                key={athlete.id}
                athlete={athlete}
                profile={athlete.profiles}
                achievements={achievements}
                match={{ score, reasons }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent requests */}
      <Card className="mt-6 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Recent sponsorship requests</h2>
          <Link to="/sponsor/requests"><Button variant="ghost" size="sm">View all</Button></Link>
        </div>
        {requests.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No requests sent yet. Discover athletes and send your first proposal.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {requests.slice(0, 4).map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">${r.amount.toLocaleString()} · {r.sponsorship_type ?? '—'}</p>
                  <p className="text-sm text-slate-500">{new Date(r.created_at).toLocaleDateString()}</p>
                </div>
                <Badge variant={r.status === 'accepted' ? 'success' : r.status === 'rejected' ? 'danger' : 'warning'}>
                  {r.status}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </DashboardLayout>
  );
}

function computeSponsorCompletion(s: Sponsor): number {
  const fields = [
    s.company_name, s.industry, s.description, s.location, s.website,
    s.sponsorship_budget != null ? 'x' : null,
    s.preferred_sports.length > 0 ? 'x' : null,
    s.preferred_levels.length > 0 ? 'x' : null,
    s.sponsorship_types.length > 0 ? 'x' : null,
  ];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
}
