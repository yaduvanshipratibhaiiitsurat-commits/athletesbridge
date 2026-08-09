import { Link } from '@/lib/router';
import { Button } from '@/components/ui/Button';

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl font-bold tracking-tight text-slate-900">404</p>
      <p className="mt-4 text-lg text-slate-600">This page doesn't exist.</p>
      <Link to="/" className="mt-8">
        <Button>Back home</Button>
      </Link>
    </div>
  );
}
