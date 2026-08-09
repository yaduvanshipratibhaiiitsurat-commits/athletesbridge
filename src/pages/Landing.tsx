import { Link } from '@/lib/router';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { IMAGES } from '@/lib/images';
import {
  TrendingUp,
  Trophy,
  Target,
  Users,
  ArrowRight,
  Search,
  Handshake,
  BarChart3,
  Eye,
  Star,
  CheckCircle2,
  Zap,
  Globe,
  ShieldCheck,
} from 'lucide-react';

export function Landing() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0">
          <img
            src={IMAGES.heroRunner}
            alt="Athlete on track"
            className="h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-900/70" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="max-w-3xl">
            <Badge variant="success" className="mb-5 bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30">
              <Zap size={12} /> The sponsorship marketplace for real athletes
            </Badge>
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Talent shouldn't be limited by visibility.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300 sm:text-xl">
              Connect emerging athletes with sponsors who value performance, potential and impact —
              not just follower counts.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to="/athlete/opportunities">
                <Button size="lg" className="w-full sm:w-auto">
                  Find Sponsors <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/sponsor/discover">
                <Button size="lg" className="w-full sm:w-auto">
                  Discover Athletes <ArrowRight size={18} />
                </Button>
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-slate-400">
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-400" /> Achievement-based matching</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-400" /> Transparent compatibility scores</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-400" /> Direct sponsor connections</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 lg:grid-cols-4 lg:px-8">
          {[
            { label: 'Athletes registered', value: '1,200+' },
            { label: 'Sponsor companies', value: '340+' },
            { label: 'Active sponsorships', value: '480+' },
            { label: 'Sports represented', value: '20+' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold tracking-tight text-slate-900">{s.value}</p>
              <p className="mt-1 text-sm text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Problem */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="neutral" className="mb-4">The problem</Badge>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Great athletes go unseen.
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Sponsorship decisions are driven by follower counts and mainstream visibility —
              leaving talented athletes in less commercial sports without the support they deserve.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            <Card className="p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
                <Eye size={24} />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-slate-900">Athletes struggle to be seen</h3>
              <p className="mt-2 text-slate-600">
                Strong competitive achievements mean little when discovery depends on social-media
                reach. Athletes in rowing, archery, weightlifting and dozens of other sports are
                locked out of sponsorship simply because they're not "viral."
              </p>
            </Card>
            <Card className="p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                <Search size={24} />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-slate-900">Sponsors struggle to find them</h3>
              <p className="mt-2 text-slate-600">
                Companies want to back authentic, high-performing athletes — but the tools to discover
                talent outside mainstream sports barely exist. The result is missed partnerships on
                both sides.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="neutral" className="mb-4">How it works</Badge>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              From profile to partnership in three steps
            </h2>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {[
              {
                icon: <Users size={22} />,
                step: '01',
                title: 'Create your profile',
                desc: 'Athletes build a profile around achievements, competition level and sponsorship needs. Sponsors define what they are looking for.',
              },
              {
                icon: <BarChart3 size={22} />,
                step: '02',
                title: 'Get matched',
                desc: "Our transparent compatibility score ranks athletes against a sponsor's preferences — sport, level, budget and location.",
              },
              {
                icon: <Handshake size={22} />,
                step: '03',
                title: 'Connect & sponsor',
                desc: 'Sponsors send proposals, athletes accept or decline, and partnerships begin — all in one place.',
              },
            ].map((s) => (
              <div key={s.step} className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
                  {s.icon}
                </div>
                <span className="absolute right-0 top-0 text-5xl font-bold text-slate-200">{s.step}</span>
                <h3 className="mt-5 text-lg font-semibold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-slate-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why AthleteBridge */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <Badge variant="neutral" className="mb-4">Why AthleteBridge</Badge>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Built on achievement, not algorithms
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                We replace follower-count gatekeeping with a transparent compatibility score based on
                what actually matters: sport, achievement level, budget fit and location.
              </p>
              <ul className="mt-8 space-y-5">
                {[
                  { icon: <Trophy size={20} />, title: 'Achievement-first discovery', desc: 'Athletes are ranked by competition results and level, not reach.' },
                  { icon: <Target size={20} />, title: 'Transparent matching', desc: 'Every score comes with a clear "why this match" explanation.' },
                  { icon: <ShieldCheck size={20} />, title: 'Direct & private', desc: 'Sponsorship proposals go straight to the athlete. No middlemen.' },
                  { icon: <Globe size={20} />, title: 'Every sport welcome', desc: 'From archery to weightlifting — visibility is not a prerequisite.' },
                ].map((f) => (
                  <li key={f.title} className="flex gap-4">
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      {f.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{f.title}</p>
                      <p className="text-sm text-slate-600">{f.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <img src={IMAGES.swimmer} alt="Swimmer" className="h-72 w-full rounded-2xl object-cover shadow-lg" />
                <img src={IMAGES.cyclist} alt="Cyclist" className="mt-8 h-72 w-full rounded-2xl object-cover shadow-lg" />
              </div>
              <Card className="absolute -bottom-6 -left-6 hidden p-5 sm:block">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 text-white">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">92%</p>
                    <p className="text-xs text-slate-500">Average match score</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Preview cards */}
      <section className="bg-slate-900 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="neutral" className="mb-4 bg-white/10 text-slate-200">Preview</Badge>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Meet a few of our athletes & sponsors
            </h2>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {SAMPLE_ATHLETES.map((a) => (
              <div key={a.name} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:bg-white/10">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 font-semibold text-white">
                    {a.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{a.name}</p>
                    <p className="text-sm text-slate-400">{a.sport} · {a.location}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {a.achievements.map((ach) => (
                    <span key={ach} className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-300">
                      {ach}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="text-sm text-slate-400">Budget range</span>
                  <span className="text-sm font-semibold text-white">{a.budget}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {SAMPLE_SPONSORS.map((s) => (
              <div key={s.name} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-lg font-bold text-white">
                    {s.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{s.name}</p>
                    <p className="text-sm text-slate-400">{s.industry}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-slate-300">{s.desc}</p>
                <div className="mt-4 flex items-center gap-2 text-sm text-emerald-300">
                  <Star size={14} /> Looking for: {s.looking}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 px-8 py-16 text-center sm:px-16">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="relative">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to bridge the gap?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-slate-300">
                Join AthleteBridge today. Create your profile, get matched, and start the conversation
                that could define a career.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto">Get started — it's free</Button>
                </Link>
                <Link to="/about">
                  <Button variant="outline" size="lg" className="w-full border-white/30 text-white hover:border-white hover:bg-white/10 sm:w-auto">
                    Learn more
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const SAMPLE_ATHLETES = [
  { name: 'Maya Okonkwo', sport: 'Rowing', location: 'Lagos, Nigeria', achievements: ['National Gold', 'African Champs Bronze'], budget: '$5k–$20k' },
  { name: 'Liam Bergström', sport: 'Archery', location: 'Stockholm, Sweden', achievements: ['World Cup Silver', 'European 4th'], budget: '$8k–$30k' },
  { name: 'Aisha Patel', sport: 'Weightlifting', location: 'Mumbai, India', achievements: ['Commonwealth Gold', 'Asian Bronze'], budget: '$3k–$15k' },
];

const SAMPLE_SPONSORS = [
  { name: 'Nordic Sport Co.', industry: 'Sporting Goods', desc: 'We back precision athletes in endurance and target sports.', looking: 'Archery, Rowing' },
  { name: 'Peak Nutrition', industry: 'Nutrition', desc: 'Fueling champions across 15 disciplines worldwide.', looking: 'Weightlifting, Athletics' },
  { name: 'Atlas Gear', industry: 'Apparel', desc: 'Performance apparel for athletes who compete, not pose.', looking: 'Cycling, Triathlon' },
];
