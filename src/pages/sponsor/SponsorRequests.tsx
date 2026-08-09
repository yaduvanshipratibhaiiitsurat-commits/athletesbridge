import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState, PageLoader } from '@/components/ui/Feedback';
import { supabase } from '@/lib/supabase';
import { getMySponsor } from '@/lib/queries';
import type { SponsorshipRequest, Athlete, Profile } from '@/lib/types';
import {
  LayoutDashboard, Search, Bookmark, MailOpen, Handshake,
  DollarSign, Calendar, Trophy, ArrowRight,
} from 'lucide-react';
import { Link } from '@/lib/router';

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

export function SponsorRequests() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<SponsorshipRequest[]>([]);
  const [athletes, setAthletes] = useState<Record<string, AthleteWithProfile>>({});

  useEffect(() => {
    if (!profile) return;
    let cancelled = false;
    (async () => {
      const sp = await getMySponsor(profile.id);
      if (cancelled) return;
      if (sp) {
        const { data: reqs } = await supabase
          .from('sponsorship_requests')
          .select('*')
          .eq('sponsor_id', sp.id)
          .order('created_at', { ascending: false });
        if (cancelled) return;
        setRequests((reqs as SponsorshipRequest[]) ?? []);

        const rqs = (reqs as SponsorshipRequest[]) ?? [];
        if (rqs.length > 0) {
          const ids = [...new Set(rqs.map((r) => r.athlete_id))];
          const { data: aths } = await supabase.from('athletes').select('*, profiles:profiles!user_id(*)').in('id', ids);
          if (cancelled) return;
          const map: Record<string, AthleteWithProfile> = {};
          (aths as AthleteWithProfile[])?.forEach((a) => (map[a.id] = a));
          setAthletes(map);
        }
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [profile]);

  if (loading) return <DashboardLayout nav={nav} title="Sponsorship requests"><PageLoader /></DashboardLayout>;

  return (
    <DashboardLayout nav={nav} title="Sponsorship requests">
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sent proposals</h1>
        <p className="text-sm text-slate-500">Track the status of sponsorship proposals you've sent.</p>
      </div>

      {requests.length === 0 ? (
        <EmptyState
          icon={<MailOpen size={40} />}
          title="No proposals sent yet"
          description="Discover athletes and send your first sponsorship proposal."
          action={<Link to="/sponsor/discover"><Button>Discover athletes <ArrowRight size={14} /></Button></Link>}
        />
      ) : (
        <div className="space-y-4">
          {requests.map((r) => {
            const ath = athletes[r.athlete_id];
            return (
              <Card key={r.id} className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-4">
                    <Avatar src={ath?.profiles?.avatar_url} name={ath?.profiles?.full_name} size="lg" />
                    <div>
                      <Link to={`/sponsor/athlete/${r.athlete_id}`}>
                        <p className="text-lg font-semibold text-slate-900 hover:underline">{ath?.profiles?.full_name ?? 'Athlete'}</p>
                      </Link>
                      <p className="text-sm text-slate-500">{ath?.sport ?? '—'} {ath?.location ? `· ${ath.location}` : ''}</p>
                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-600">
                        <span className="flex items-center gap-1.5"><DollarSign size={14} className="text-emerald-500" /> ${r.amount.toLocaleString()}</span>
                        {r.sponsorship_type && <span className="flex items-center gap-1.5"><Trophy size={14} className="text-slate-400" /> {r.sponsorship_type}</span>}
                        <span className="flex items-center gap-1.5"><Calendar size={14} className="text-slate-400" /> {new Date(r.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={r.status === 'accepted' ? 'success' : r.status === 'rejected' ? 'danger' : 'warning'}>
                    {r.status}
                  </Badge>
                </div>

                {r.message && (
                  <div className="mt-4 rounded-xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-600">{r.message}</p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
