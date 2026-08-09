import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState, PageLoader, Spinner } from '@/components/ui/Feedback';
import { supabase } from '@/lib/supabase';
import { getMyAthlete } from '@/lib/queries';
import type { SponsorshipRequest, Sponsor } from '@/lib/types';
import {
  LayoutDashboard, UserCircle, Trophy, MailOpen, TrendingUp,
  Check, X, DollarSign, Calendar,
} from 'lucide-react';

const nav = [
  { to: '/athlete/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { to: '/athlete/profile', label: 'My profile', icon: <UserCircle size={18} /> },
  { to: '/athlete/achievements', label: 'Achievements', icon: <Trophy size={18} /> },
  { to: '/athlete/requests', label: 'Sponsorship requests', icon: <MailOpen size={18} /> },
  { to: '/athlete/opportunities', label: 'Opportunities', icon: <TrendingUp size={18} /> },
];

export function AthleteRequests() {
  const { profile } = useAuth();
  const { notify } = useToast();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<SponsorshipRequest[]>([]);
  const [sponsors, setSponsors] = useState<Record<string, Sponsor>>({});
  const [acting, setActing] = useState<string | null>(null);

  const load = async (athleteId: string) => {
    const { data } = await supabase
      .from('sponsorship_requests')
      .select('*')
      .eq('athlete_id', athleteId)
      .order('created_at', { ascending: false });
    const reqs = (data as SponsorshipRequest[]) ?? [];
    setRequests(reqs);
    if (reqs.length > 0) {
      const ids = [...new Set(reqs.map((r) => r.sponsor_id))];
      const { data: sp } = await supabase.from('sponsors').select('*').in('id', ids);
      const map: Record<string, Sponsor> = {};
      (sp as Sponsor[])?.forEach((s) => (map[s.id] = s));
      setSponsors(map);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const a = await getMyAthlete(profile.id);
      if (a) await load(a.id);
      else setLoading(false);
    })();
  }, [profile]);

  const updateStatus = async (id: string, status: 'accepted' | 'rejected') => {
    setActing(id);
    const { error } = await supabase.from('sponsorship_requests').update({ status }).eq('id', id);
    setActing(null);
    if (error) {
      notify(error.message, 'error');
      return;
    }
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    notify(status === 'accepted' ? 'Sponsorship accepted!' : 'Request rejected.');
  };

  if (loading) return <DashboardLayout nav={nav} title="Sponsorship requests"><PageLoader /></DashboardLayout>;

  return (
    <DashboardLayout nav={nav} title="Sponsorship requests">
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sponsorship requests</h1>
        <p className="text-sm text-slate-500">Review and respond to proposals from sponsors.</p>
      </div>

      {requests.length === 0 ? (
        <EmptyState icon={<MailOpen size={40} />} title="No requests yet" description="When sponsors send you proposals, they'll appear here for you to accept or reject." />
      ) : (
        <div className="space-y-4">
          {requests.map((r) => {
            const sp = sponsors[r.sponsor_id];
            return (
              <Card key={r.id} className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-4">
                    <Avatar name={sp?.company_name} src={sp?.logo_url} size="lg" />
                    <div>
                      <p className="text-lg font-semibold text-slate-900">{sp?.company_name ?? 'A sponsor'}</p>
                      <p className="text-sm text-slate-500">{sp?.industry ?? '—'} {sp?.location ? `· ${sp.location}` : ''}</p>
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

                {r.status === 'pending' && (
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" onClick={() => updateStatus(r.id, 'accepted')} disabled={acting === r.id}>
                      {acting === r.id ? <Spinner /> : <><Check size={16} /> Accept</>}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => updateStatus(r.id, 'rejected')} disabled={acting === r.id}>
                      <X size={16} /> Reject
                    </Button>
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
