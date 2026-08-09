import { useState } from 'react';
import { Link, useRouter } from '@/lib/router';
import { useToast } from '@/components/ui/Toast';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Field';
import { Spinner } from '@/components/ui/Feedback';
import { IMAGES } from '@/lib/images';
import { Trophy, Building2, Check } from 'lucide-react';
import type { UserRole } from '@/lib/types';

export function Register() {
  const { navigate } = useRouter();
  const { notify } = useToast();
  const [role, setRole] = useState<UserRole | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !fullName || !email || !password) {
      notify('Please fill in all fields and choose a role.', 'error');
      return;
    }
    if (password.length < 6) {
      notify('Password must be at least 6 characters.', 'error');
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role, full_name: fullName } },
    });
    if (error) {
      notify(error.message, 'error');
      setLoading(false);
      return;
    }
    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        email,
        role,
        full_name: fullName,
      });
      if (profileError) {
        notify(profileError.message, 'error');
        setLoading(false);
        return;
      }
    }
    notify('Account created! Welcome to AthleteBridge.');
    navigate('/');
  };

  return (
    <div className="flex min-h-screen">
      <div className="flex w-full items-center justify-center px-4 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
              <span className="text-lg font-bold">A</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              Athlete<span className="text-emerald-500">Bridge</span>
            </span>
          </Link>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create your account</h1>
          <p className="mt-2 text-sm text-slate-500">Join the marketplace that values performance over followers.</p>

          {/* Role selector */}
          <div className="mt-6">
            <p className="mb-2 text-sm font-medium text-slate-700">I am a…</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('athlete')}
                className={`flex flex-col items-start gap-2 rounded-2xl border-2 p-4 text-left transition-all ${
                  role === 'athlete'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white">
                  <Trophy size={20} />
                </div>
                <span className="font-semibold text-slate-900">Athlete</span>
                <span className="text-xs text-slate-500">Find sponsors for your sport</span>
                {role === 'athlete' && <Check size={16} className="text-emerald-600" />}
              </button>
              <button
                type="button"
                onClick={() => setRole('sponsor')}
                className={`flex flex-col items-start gap-2 rounded-2xl border-2 p-4 text-left transition-all ${
                  role === 'sponsor'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-white">
                  <Building2 size={20} />
                </div>
                <span className="font-semibold text-slate-900">Sponsor</span>
                <span className="text-xs text-slate-500">Discover athletes to back</span>
                {role === 'sponsor' && <Check size={16} className="text-blue-600" />}
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Field label="Full name">
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                required
              />
            </Field>
            <Field label="Email">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </Field>
            <Field label="Password" hint="At least 6 characters.">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />
            </Field>
            <Button type="submit" size="lg" className="w-full" disabled={loading || !role}>
              {loading ? <Spinner /> : 'Create account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-slate-900 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>

      <div className="relative hidden w-1/2 lg:block">
        <img src={IMAGES.cyclistRace} alt="Cyclist race" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-bl from-slate-900/90 to-slate-900/50" />
        <div className="absolute inset-0 flex flex-col justify-end p-12">
          <h2 className="text-3xl font-bold text-white">Your performance is your platform.</h2>
          <p className="mt-3 max-w-md text-slate-300">
            Build a profile around achievements, get matched with sponsors who care about results, and
            start the partnerships that move your career forward.
          </p>
        </div>
      </div>
    </div>
  );
}
