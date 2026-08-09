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
import { getMySponsor } from '@/lib/queries';
import { SPORTS, COMPETITION_LEVELS, SPONSORSHIP_TYPES } from '@/lib/types';
import type { Sponsor } from '@/lib/types';
import {
  LayoutDashboard, Search, Bookmark, MailOpen, Handshake, ArrowLeft,
} from 'lucide-react';

const nav = [
  { to: '/sponsor/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { to: '/sponsor/discover', label: 'Discover athletes', icon: <Search size={18} /> },
  { to: '/sponsor/shortlist', label: 'Shortlist', icon: <Bookmark size={18} /> },
  { to: '/sponsor/requests', label: 'Sponsorship requests', icon: <MailOpen size={18} /> },
  { to: '/sponsor/profile', label: 'My profile', icon: <Handshake size={18} /> },
];

interface FormState {
  company_name: string;
  logo_url: string;
  industry: string;
  description: string;
  location: string;
  website: string;
  sponsorship_budget: string;
  preferred_sports: string[];
  preferred_levels: string[];
  sponsorship_types: string[];
}

const emptyForm: FormState = {
  company_name: '', logo_url: '', industry: '', description: '', location: '',
  website: '', sponsorship_budget: '', preferred_sports: [], preferred_levels: [],
  sponsorship_types: [],
};

export function EditSponsorProfile() {
  const { profile } = useAuth();
  const { navigate } = useRouter();
  const { notify } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const sp = await getMySponsor(profile.id);
      if (sp) {
        setForm({
          company_name: sp.company_name ?? '',
          logo_url: sp.logo_url ?? '',
          industry: sp.industry ?? '',
          description: sp.description ?? '',
          location: sp.location ?? '',
          website: sp.website ?? '',
          sponsorship_budget: sp.sponsorship_budget != null ? String(sp.sponsorship_budget) : '',
          preferred_sports: sp.preferred_sports ?? [],
          preferred_levels: sp.preferred_levels ?? [],
          sponsorship_types: sp.sponsorship_types ?? [],
        });
      }
      setLoading(false);
    })();
  }, [profile]);

  const update = (k: keyof FormState, v: string | string[]) => setForm((f) => ({ ...f, [k]: v }));

  const toggleArray = (key: 'preferred_sports' | 'preferred_levels' | 'sponsorship_types', value: string) =>
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter((x) => x !== value) : [...f[key], value],
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    const payload: Omit<Sponsor, 'id' | 'user_id' | 'created_at'> = {
      company_name: form.company_name || null,
      logo_url: form.logo_url || null,
      industry: form.industry || null,
      description: form.description || null,
      location: form.location || null,
      website: form.website || null,
      sponsorship_budget: form.sponsorship_budget ? Number(form.sponsorship_budget) : null,
      preferred_sports: form.preferred_sports,
      preferred_levels: form.preferred_levels,
      sponsorship_types: form.sponsorship_types,
    };

    const existing = await getMySponsor(profile.id);
    let error;
    if (existing) {
      ({ error } = await supabase.from('sponsors').update(payload).eq('id', existing.id));
    } else {
      ({ error } = await supabase.from('sponsors').insert({ ...payload, user_id: profile.id }));
    }
    setSaving(false);
    if (error) {
      notify(error.message, 'error');
      return;
    }
    notify('Profile saved.');
    navigate('/sponsor/profile');
  };

  if (loading) return <DashboardLayout nav={nav} title="Edit profile"><PageLoader /></DashboardLayout>;

  return (
    <DashboardLayout nav={nav} title="Edit profile">
      <Link to="/sponsor/profile" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft size={14} /> Back to profile
      </Link>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900">Company details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Company name">
              <Input value={form.company_name} onChange={(e) => update('company_name', e.target.value)} placeholder="e.g. Nordic Sport Co." />
            </Field>
            <Field label="Industry">
              <Input value={form.industry} onChange={(e) => update('industry', e.target.value)} placeholder="e.g. Sporting Goods" />
            </Field>
            <Field label="Location">
              <Input value={form.location} onChange={(e) => update('location', e.target.value)} placeholder="City, Country" />
            </Field>
            <Field label="Website">
              <Input value={form.website} onChange={(e) => update('website', e.target.value)} placeholder="https://…" />
            </Field>
            <Field label="Logo URL">
              <Input value={form.logo_url} onChange={(e) => update('logo_url', e.target.value)} placeholder="https://…/logo.png" />
            </Field>
            <Field label="Sponsorship budget (USD)">
              <Input type="number" min={0} value={form.sponsorship_budget} onChange={(e) => update('sponsorship_budget', e.target.value)} placeholder="e.g. 50000" />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Description">
              <Textarea rows={4} value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Tell athletes what your company does and what kind of sponsorships you offer." />
            </Field>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900">Sponsorship preferences</h2>
          <p className="mt-1 text-sm text-slate-500">These determine your match scores with athletes.</p>

          <div className="mt-4">
            <Label>Preferred sports</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {SPORTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleArray('preferred_sports', s)}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    form.preferred_sports.includes(s) ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <Label>Preferred competition levels</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {COMPETITION_LEVELS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => toggleArray('preferred_levels', l)}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    form.preferred_levels.includes(l) ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <Label>Sponsorship types</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {SPONSORSHIP_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleArray('sponsorship_types', t)}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    form.sponsorship_types.includes(t) ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Link to="/sponsor/profile"><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={saving}>{saving ? <Spinner /> : 'Save profile'}</Button>
        </div>
      </form>
    </DashboardLayout>
  );
}
