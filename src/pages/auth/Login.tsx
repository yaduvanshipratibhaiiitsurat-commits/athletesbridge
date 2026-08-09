import { useState } from 'react';
import { Link, useRouter } from '@/lib/router';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Field';
import { Spinner } from '@/components/ui/Feedback';
import { IMAGES } from '@/lib/images';
import { Trophy, Building2 } from 'lucide-react';

export function Login() {
  const { navigate } = useRouter();
  const { refreshProfile } = useAuth();
  const { notify } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      notify(error.message, 'error');
      setLoading(false);
      return;
    }
    await refreshProfile();
    notify('Welcome back!');
    navigate('/');
  };

  return (
    <div className="flex min-h-screen">
      {/* Left visual */}
      <div className="relative hidden w-1/2 lg:block">
        <img src={IMAGES.heroRunner} alt="Athlete" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 to-slate-900/60" />
        <div className="absolute inset-0 flex flex-col justify-end p-12">
          <h2 className="text-3xl font-bold text-white">Talent shouldn't be limited by visibility.</h2>
          <p className="mt-3 max-w-md text-slate-300">
            Welcome back. Your next sponsorship could be one login away.
          </p>
        </div>
      </div>

      {/* Right form */}
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

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Log in to your account</h1>
          <p className="mt-2 text-sm text-slate-500">Welcome back. Please enter your details.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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
            <Field label="Password">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </Field>
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? <Spinner /> : 'Log in'}
            </Button>
          </form>

          <div className="mt-6 rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-500">Two sides of the bridge:</p>
            <div className="mt-2 flex gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><Trophy size={14} className="text-emerald-500" /> Athletes</span>
              <span className="flex items-center gap-1.5"><Building2 size={14} className="text-blue-500" /> Sponsors</span>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-slate-900 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
