import { Link } from '@/lib/router';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
                <span className="text-lg font-bold">A</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Athlete<span className="text-emerald-500">Bridge</span>
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-slate-500">
              Connecting emerging athletes with sponsors who value performance, potential and
              impact — not just follower counts.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900">Platform</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li><Link to="/about" className="hover:text-slate-900">About</Link></li>
              <li><Link to="/register" className="hover:text-slate-900">For athletes</Link></li>
              <li><Link to="/register" className="hover:text-slate-900">For sponsors</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900">Resources</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li><Link to="/about" className="hover:text-slate-900">How it works</Link></li>
              <li><Link to="/about" className="hover:text-slate-900">Matching</Link></li>
              <li><Link to="/about" className="hover:text-slate-900">Success stories</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900">Legal</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li><span className="cursor-default">Privacy</span></li>
              <li><span className="cursor-default">Terms</span></li>
              <li><span className="cursor-default">Contact</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 sm:flex-row">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} AthleteBridge. Talent shouldn't be limited by visibility.
          </p>
          <p className="text-xs text-slate-400">Built for athletes, by believers.</p>
        </div>
      </div>
    </footer>
  );
}
