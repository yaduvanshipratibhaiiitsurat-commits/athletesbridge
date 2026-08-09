import { useEffect, useState } from 'react';
import { Link, useRouter } from '@/lib/router';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea, Select, Label } from '@/components/ui/Field';
import { Spinner, PageLoader } from '@/components/ui/Feedback';
import { supabase } from '@/lib/supabase';
import { getMyAthlete } from '@/lib/queries';
import { SPORTS, COMPETITION_LEVELS, SPONSORSHIP_TYPES } from '@/lib/types';
import type { Athlete } from '@/lib/types';
import {
  LayoutDashboard,
  UserCircle,
  Trophy,
  MailOpen,
  TrendingUp,
  ArrowLeft,
} from 'lucide-react';

const nav = [
  { to: '/athlete/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { to: '/athlete/profile', label: 'My profile', icon: <UserCircle size={18} /> },
  { to: '/athlete/achievements', label: 'Achievements', icon: <Trophy size={18} /> },
  { to: '/athlete/requests', label: 'Sponsorship requests', icon: <MailOpen size={18} /> },
  { to: '/athlete/opportunities', label: 'Opportunities', icon: <TrendingUp size={18} /> },
];

interface FormState {
  sport: string;
  category: string;
  age: string;
  gender: string;
  location: string;
  bio: string;
  competition_level: string;
  years_active: string;
  sponsorship_requirements: string;
  min_budget: string;
  max_budget: string;
  sponsorship_types: string[];
  social_links: Record<string, string>;
}

export function EditProfile() {
  const { profile } = useAuth();
  const { navigate } = useRouter();
  const { notify } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>({
    sport: '', category: '', age: '', gender: '', location: '', bio: '',
    competition_level: '', years_active: '', sponsorship_requirements: '',
    min_budget: '', max_budget: '', sponsorship_types: [], social_links: {},
  });

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const a = await getMyAthlete(profile.id);
      if (a) {
        setForm({
          sport: a.sport ?? '',
          category: a.category ?? '',
          age: a.age != null ? String(a.age) : '',
          gender: a.gender ?? '',
          location: a.location ?? '',
          bio: a.bio ?? '',
          competition_level: a.competition_level ?? '',
          years_active: a.years_active != null ? String(a.years_active) : '',
          sponsorship_requirements: a.sponsorship_requirements ?? '',
          min_budget: a.min_budget != null ? String(a.min_budget) : '',
          max_budget: a.max_budget != null ? String(a.max_budget) : '',
          sponsorship_types: a.sponsorship_types ?? [],
          social_links: a.social_links ?? {},
        });
      }
      setLoading(false);
    })();
  }, [profile]);

  const update = (k: keyof FormState, v: string | string[] | Record<string, string>) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggleType = (t: string) =>
    setForm((f) => ({
      ...f,
      sponsorship_types: f.sponsorship_types.includes(t)
        ? f.sponsorship_types.filter((x) => x !== t)
        : [...f.sponsorship_types, t],
    }));

  const setSocial = (key: string, value: string) =>
    setForm((f) => ({ ...f, social_links: { ...f.social_links, [key]: value } }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    const payload = {
      sport: form.sport || null,
      category: form.category || null,
      age: form.age ? Number(form.age) : null,
      gender: form.gender || null,
      location: form.location || null,
      bio: form.bio || null,
      competition_level: form.competition_level || null,
      years_active: form.years_active ? Number(form.years_active) : null,
      sponsorship_requirements: form.sponsorship_requirements || null,
      min_budget: form.min_budget ? Number(form.min_budget) : null,
      max_budget: form.max_budget ? Number(form.max_budget) : null,
      sponsorship_types: form.sponsorship_types,
      social_links: form.social_links,
    };

    const existing = await getMyAthlete(profile.id);
    let error;
    if (existing) {
      ({ error } = await supabase.from('athletes').update(payload).eq('id', existing.id));
    } else {
      ({ error } = await supabase.from('athletes').insert({ ...payload, user_id: profile.id }));
    }
    setSaving(false);
    if (error) {
      notify(error.message, 'error');
      return;
    }
    notify('Profile saved.');
    navigate('/athlete/profile');
  };

  if (loading) return <DashboardLayout nav={nav} title="Edit profile"><PageLoader /></DashboardLayout>;

  return (
    <DashboardLayout nav={nav} title="Edit profile">
      <Link to="/athlete/profile" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft size={14} /> Back to profile
      </Link>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900">Sport & background</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Sport">
              <Select value={form.sport} onChange={(e) => update('sport', e.target.value)}>
                <option value="">Select a sport</option>
                {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
            <Field label="Category">
              <Input value={form.category} onChange={(e) => update('category', e.target.value)} placeholder="e.g. Sprint, Distance, Freestyle" />
            </Field>
            <Field label="Age">
              <Input type="number" min={0} value={form.age} onChange={(e) => update('age', e.target.value)} placeholder="e.g. 24" />
            </Field>
            <Field label="Gender">
              <Select value={form.gender} onChange={(e) => update('gender', e.target.value)}>
                <option value="">Select</option>
                <option>Female</option>
                <option>Male</option>
                <option>Non-binary</option>
                <option>Prefer not to say</option>
              </Select>
            </Field>
            <Field label="Location">
              <Input value={form.location} onChange={(e) => update('location', e.target.value)} placeholder="City, Country" />
            </Field>
            <Field label="Years active">
              <Input type="number" min={0} value={form.years_active} onChange={(e) => update('years_active', e.target.value)} placeholder="e.g. 8" />
            </Field>
            <Field label="Competition level">
              <Select value={form.competition_level} onChange={(e) => update('competition_level', e.target.value)}>
                <option value="">Select</option>
                {COMPETITION_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </Select>
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Bio">
              <Textarea rows={4} value={form.bio} onChange={(e) => update('bio', e.target.value)} placeholder="Tell sponsors who you are, what you've achieved, and what you're aiming for." />
            </Field>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900">Sponsorship requirements</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Minimum budget (USD)">
              <Input type="number" min={0} value={form.min_budget} onChange={(e) => update('min_budget', e.target.value)} placeholder="e.g. 5000" />
            </Field>
            <Field label="Maximum budget (USD)">
              <Input type="number" min={0} value={form.max_budget} onChange={(e) => update('max_budget', e.target.value)} placeholder="e.g. 20000" />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Sponsorship requirements / notes">
              <Textarea rows={3} value={form.sponsorship_requirements} onChange={(e) => update('sponsorship_requirements', e.target.value)} placeholder="What are you looking for in a sponsor? Equipment, travel funding, etc." />
            </Field>
          </div>
          <div className="mt-4">
            <Label>Sponsorship types</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {SPONSORSHIP_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleType(t)}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    form.sponsorship_types.includes(t)
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900">Social links</h2>
          <p className="mt-1 text-sm text-slate-500">Optional. Add the platforms you're active on.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {['Instagram', 'Twitter', 'LinkedIn', 'Website'].map((k) => (
              <Field key={k} label={k}>
                <Input
                  value={form.social_links[k] ?? ''}
                  onChange={(e) => setSocial(k, e.target.value)}
                  placeholder={`https://${k.toLowerCase()}.com/…`}
                />
              </Field>
            ))}
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Link to="/athlete/profile"><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={saving}>{saving ? <Spinner /> : 'Save profile'}</Button>
        </div>
      </form>
    </DashboardLayout>
  );
}
