import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Field, Input, Textarea, Select } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { EmptyState, PageLoader, Spinner } from '@/components/ui/Feedback';
import { supabase } from '@/lib/supabase';
import { getMyAthlete, getAthleteAchievements } from '@/lib/queries';
import { COMPETITION_LEVELS } from '@/lib/types';
import type { Achievement } from '@/lib/types';
import {
  LayoutDashboard, UserCircle, Trophy, MailOpen, TrendingUp,
  Plus, Pencil, Trash2, Medal,
} from 'lucide-react';

const nav = [
  { to: '/athlete/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { to: '/athlete/profile', label: 'My profile', icon: <UserCircle size={18} /> },
  { to: '/athlete/achievements', label: 'Achievements', icon: <Trophy size={18} /> },
  { to: '/athlete/requests', label: 'Sponsorship requests', icon: <MailOpen size={18} /> },
  { to: '/athlete/opportunities', label: 'Opportunities', icon: <TrendingUp size={18} /> },
];

interface FormState {
  competition: string;
  year: string;
  level: string;
  medal: string;
  description: string;
}

const empty: FormState = { competition: '', year: '', level: '', medal: '', description: '' };

export function Achievements() {
  const { profile } = useAuth();
  const { notify } = useToast();
  const [loading, setLoading] = useState(true);
  const [athleteId, setAthleteId] = useState<string | null>(null);
  const [items, setItems] = useState<Achievement[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Achievement | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const a = await getMyAthlete(profile.id);
      if (a) {
        setAthleteId(a.id);
        setItems(await getAthleteAchievements(a.id));
      }
      setLoading(false);
    })();
  }, [profile]);

  const openNew = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (a: Achievement) => {
    setEditing(a);
    setForm({
      competition: a.competition,
      year: a.year != null ? String(a.year) : '',
      level: a.level ?? '',
      medal: a.medal ?? '',
      description: a.description ?? '',
    });
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!athleteId || !form.competition) {
      notify('Competition name is required.', 'error');
      return;
    }
    setSaving(true);
    const payload = {
      athlete_id: athleteId,
      competition: form.competition,
      year: form.year ? Number(form.year) : null,
      level: form.level || null,
      medal: form.medal || null,
      description: form.description || null,
    };
    let error;
    if (editing) {
      ({ error } = await supabase.from('achievements').update(payload).eq('id', editing.id));
    } else {
      ({ error } = await supabase.from('achievements').insert(payload));
    }
    setSaving(false);
    if (error) {
      notify(error.message, 'error');
      return;
    }
    setItems(await getAthleteAchievements(athleteId));
    notify(editing ? 'Achievement updated.' : 'Achievement added.');
    setOpen(false);
  };

  const remove = async (a: Achievement) => {
    if (!confirm('Delete this achievement?')) return;
    const { error } = await supabase.from('achievements').delete().eq('id', a.id);
    if (error) {
      notify(error.message, 'error');
      return;
    }
    setItems((prev) => prev.filter((x) => x.id !== a.id));
    notify('Achievement deleted.');
  };

  if (loading) return <DashboardLayout nav={nav} title="Achievements"><PageLoader /></DashboardLayout>;

  if (!athleteId) {
    return (
      <DashboardLayout nav={nav} title="Achievements">
        <EmptyState icon={<Trophy size={40} />} title="Create your athlete profile first" description="Add your athlete profile before adding achievements." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout nav={nav} title="Achievements">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Achievements</h1>
          <p className="text-sm text-slate-500">Show sponsors your competition results.</p>
        </div>
        <Button onClick={openNew}><Plus size={16} /> Add achievement</Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<Trophy size={40} />}
          title="No achievements yet"
          description="Add your competition results — medals, podiums, rankings — to strengthen your profile."
          action={<Button onClick={openNew}><Plus size={16} /> Add your first achievement</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((a) => (
            <Card key={a.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                    <Medal size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{a.competition}</p>
                    <p className="text-sm text-slate-500">{a.medal ?? '—'} · {a.year ?? '—'}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(a)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900"><Pencil size={16} /></button>
                  <button onClick={() => remove(a)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"><Trash2 size={16} /></button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {a.level && <Badge variant="info">{a.level}</Badge>}
                {a.medal && <Badge variant="warning">{a.medal}</Badge>}
              </div>
              {a.description && <p className="mt-3 text-sm text-slate-600">{a.description}</p>}
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit achievement' : 'Add achievement'}>
        <form onSubmit={save} className="space-y-4">
          <Field label="Competition" >
            <Input value={form.competition} onChange={(e) => setForm((f) => ({ ...f, competition: e.target.value }))} placeholder="e.g. National Championships" required />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Year">
              <Input type="number" value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))} placeholder="e.g. 2024" />
            </Field>
            <Field label="Level">
              <Select value={form.level} onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}>
                <option value="">Select</option>
                {COMPETITION_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </Select>
            </Field>
          </div>
          <Field label="Medal / Result">
            <Input value={form.medal} onChange={(e) => setForm((f) => ({ ...f, medal: e.target.value }))} placeholder="e.g. Gold, Silver, 4th place" />
          </Field>
          <Field label="Description">
            <Textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Optional details about the result." />
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? <Spinner /> : editing ? 'Save changes' : 'Add achievement'}</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
