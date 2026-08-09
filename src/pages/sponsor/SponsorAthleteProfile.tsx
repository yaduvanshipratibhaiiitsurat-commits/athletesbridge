import { useEffect, useState } from 'react';
import { Link, useRouter } from '@/lib/router';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { Field, Input, Textarea, Select } from '@/components/ui/Field';
import { EmptyState, PageLoader, Spinner } from '@/components/ui/Feedback';
import { supabase } from '@/lib/supabase';
import { getMySponsor } from '@/lib/queries';
import { computeMatch, SPONSORSHIP_TYPES } from '@/lib/types';
import type { Athlete, Profile, Achievement, Sponsor } from '@/lib/types';
import {
  LayoutDashboard, Search, Bookmark, MailOpen, Handshake,
  MapPin, Calendar, Users, DollarSign, Link as LinkIcon, Target,
  Trophy, ArrowLeft, Send, BookmarkCheck,
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

export function SponsorAthleteProfile({ athleteId }: { athleteId: string }) {
  const { profile } = useAuth();
  const { navigate } = useRouter();
  const { notify } = useToast();
  const [loading, setLoading] = useState(true);
  const [athlete, setAthlete] = useState<AthleteWithProfile | null>(null);
  const [sponsor, setSponsor] = useState<Sponsor | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [shortlisted, setShortlisted] = useState(false);
  const [shortlistLoading, setShortlistLoading] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [reqForm, setReqForm] = useState({ amount: '', sponsorship_type: '', message: '' });

  useEffect(() => {
    if (!profile) return;
    let cancelled = false;
    (async () => {
      const sp = await getMySponsor(profile.id);
      if (cancelled) return;
      setSponsor(sp);

      const { data: ath } = await supabase
        .from('athletes')
        .select('*, profiles:profiles!user_id(*)')
        .eq('id', athleteId)
        .maybeSingle();
      if (cancelled) return;
      setAthlete(ath as AthleteWithProfile | null);

      const { data: ach } = await supabase.from('achievements').select('*').eq('athlete_id', athleteId).order('year', { ascending: false });
      if (cancelled) return;
      setAchievements((ach as Achievement[]) ?? []);

      if (sp) {
        const { data: sl } = await supabase.from('shortlists').select('id').eq('sponsor_id', sp.id).eq('athlete_id', athleteId).maybeSingle();
        if (cancelled) return;
        setShortlisted(!!sl);
      }

      // Increment profile views (fire and forget)
      await supabase.rpc('increment_profile_views', { p_athlete_id: athleteId });

      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [profile, athleteId]);

  const toggleShortlist = async () => {
    if (!sponsor) return;
    setShortlistLoading(true);
    if (shortlisted) {
      const { error } = await supabase.from('shortlists').delete().eq('sponsor_id', sponsor.id).eq('athlete_id', athleteId);
      if (!error) setShortlisted(false);
    } else {
      const { error } = await supabase.from('shortlists').insert({ sponsor_id: sponsor.id, athlete_id: athleteId });
      if (!error) setShortlisted(true);
    }
    setShortlistLoading(false);
  };

  const sendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsor || !reqForm.amount) {
      notify('Please enter an amount.', 'error');
      return;
    }
    setSending(true);
    const { error } = await supabase.from('sponsorship_requests').insert({
      sponsor_id: sponsor.id,
      athlete_id: athleteId,
      amount: Number(reqForm.amount),
      sponsorship_type: reqForm.sponsorship_type || null,
      message: reqForm.message || null,
    });
    setSending(false);
    if (error) {
      notify(error.message, 'error');
      return;
    }
    notify('Sponsorship proposal sent!');
    setRequestOpen(false);
    setReqForm({ amount: '', sponsorship_type: '', message: '' });
  };

  if (loading) return <DashboardLayout nav={nav} title="Athlete profile"><PageLoader /></DashboardLayout>;

  if (!athlete) {
    return (
      <DashboardLayout nav={nav} title="Athlete profile">
        <EmptyState icon={<Search size={40} />} title="Athlete not found" description="This profile may have been removed." action={<Link to="/sponsor/discover"><Button>Back to discover</Button></Link>} />
      </DashboardLayout>
    );
  }

  const match = sponsor ? computeMatch(athlete, sponsor, achievements) : null;
  const social = athlete.social_links ?? {};

  return (
    <DashboardLayout nav={nav} title="Athlete profile">
      <Link to="/sponsor/discover" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft size={14} /> Back to discover
      </Link>

      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-to-br from-slate-800 to-slate-900">
          {match && (
            <div className="flex justify-end p-4">
              <div className="rounded-full bg-white/95 px-4 py-1.5 text-sm font-bold text-slate-900 shadow">
                {match.score}% Match
              </div>
            </div>
          )}
        </div>
        <div className="px-6 pb-6">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <Avatar src={athlete.profiles?.avatar_url} name={athlete.profiles?.full_name} size="xl" />
              <div className="pb-1">
                <h1 className="text-2xl font-bold text-slate-900">{athlete.profiles?.full_name ?? 'Unnamed athlete'}</h1>
                <p className="text-slate-500">{athlete.sport ?? '—'} {athlete.category ? `· ${athlete.category}` : ''}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={toggleShortlist} disabled={shortlistLoading}>
                {shortlisted ? <><BookmarkCheck size={16} /> Shortlisted</> : <><Bookmark size={16} /> Shortlist</>}
              </Button>
              <Button size="sm" onClick={() => setRequestOpen(true)}><Send size={16} /> Send proposal</Button>
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

          {match && match.reasons.length > 0 && (
            <div className="mt-6 rounded-xl bg-emerald-50 p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-emerald-700"><Target size={16} /> Why this match?</h3>
              <ul className="mt-2 space-y-1">
                {match.reasons.map((r, i) => (
                  <li key={i} className="text-sm text-emerald-700/80">• {r}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900"><DollarSign size={16} /> Sponsorship requirements</h3>
              <div className="mt-3 rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-600">{athlete.sponsorship_requirements ?? 'No specific requirements listed.'}</p>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-slate-500">Budget range</span>
                  <span className="font-semibold text-slate-900">
                    {athlete.min_budget && athlete.max_budget
                      ? `$${Number(athlete.min_budget).toLocaleString()} – $${Number(athlete.max_budget).toLocaleString()}`
                      : 'Not specified'}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {athlete.sponsorship_types.map((t) => <Badge key={t} variant="neutral">{t}</Badge>)}
                </div>
              </div>
            </div>
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900"><LinkIcon size={16} /> Social links</h3>
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
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Achievements</h2>
        {achievements.length === 0 ? (
          <EmptyState icon={<Trophy size={32} />} title="No achievements listed" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {achievements.map((a) => (
              <Card key={a.id} className="p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-500"><Trophy size={18} /></div>
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

      <Modal open={requestOpen} onClose={() => setRequestOpen(false)} title="Send sponsorship proposal">
        <form onSubmit={sendRequest} className="space-y-4">
          <Field label="Sponsorship amount (USD)">
            <Input type="number" min={0} value={reqForm.amount} onChange={(e) => setReqForm((f) => ({ ...f, amount: e.target.value }))} placeholder="e.g. 10000" required />
          </Field>
          <Field label="Sponsorship type">
            <Select value={reqForm.sponsorship_type} onChange={(e) => setReqForm((f) => ({ ...f, sponsorship_type: e.target.value }))}>
              <option value="">Select a type</option>
              {SPONSORSHIP_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
          </Field>
          <Field label="Message">
            <Textarea rows={4} value={reqForm.message} onChange={(e) => setReqForm((f) => ({ ...f, message: e.target.value }))} placeholder="Introduce your company and what you're offering…" />
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setRequestOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={sending}>{sending ? <Spinner /> : <><Send size={16} /> Send proposal</>}</Button>
          </div>
        </form>
      </Modal>
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
