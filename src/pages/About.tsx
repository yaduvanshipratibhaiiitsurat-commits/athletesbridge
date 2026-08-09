import { Link } from '@/lib/router';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { IMAGES } from '@/lib/images';
import { Target, Trophy, MapPin, DollarSign, BarChart3, ArrowRight, Heart } from 'lucide-react';

export function About() {
  return (
    <div>
      <section className="bg-slate-900 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <Badge variant="success" className="mb-4 bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30">
            Our mission
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Talent shouldn't be limited by visibility.
          </h1>
          <p className="mt-6 text-lg text-slate-300">
            AthleteBridge exists to make sure every athlete with the results to back it up can find a
            sponsor — regardless of how many followers they have.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Why we built this</h2>
              <p className="mt-4 text-lg text-slate-600">
                Sponsorship today is broken. Decisions are made on follower counts and mainstream
                visibility, while athletes in rowing, archery, weightlifting, climbing and dozens of
                other sports are left out — even when their results are world-class.
              </p>
              <p className="mt-4 text-slate-600">
                We believe a national champion deserves the same shot at sponsorship as a social-media
                personality. So we built a marketplace that ranks athletes on what matters: their sport,
                their achievements, their competition level and their fit with a sponsor's goals.
              </p>
            </div>
            <img src={IMAGES.lane} alt="Running track" className="h-80 w-full rounded-2xl object-cover shadow-lg" />
          </div>
        </div>
      </section>

      {/* Matching explained */}
      <section className="bg-slate-50 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="neutral" className="mb-4">How matching works</Badge>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              A transparent compatibility score
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Every athlete-sponsor pairing gets a percentage score based on four weighted factors —
              and we show you exactly why.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: <Trophy size={20} />, label: 'Sport compatibility', weight: '30%', desc: "Does the athlete's sport match the sponsor's preferences?" },
              { icon: <Target size={20} />, label: 'Achievement level', weight: '25%', desc: 'Competition level and medal history vs. sponsor targets.' },
              { icon: <DollarSign size={20} />, label: 'Budget compatibility', weight: '20%', desc: "Does the sponsor's budget meet the athlete's funding range?" },
              { icon: <MapPin size={20} />, label: 'Location', weight: '15%', desc: 'Regional proximity for events, logistics and local relevance.' },
              { icon: <BarChart3 size={20} />, label: 'Audience & engagement', weight: '10%', desc: 'Profile completeness and documented engagement signals.' },
              { icon: <Heart size={20} />, label: '"Why this match?"', weight: 'Always shown', desc: '2–4 plain-English explanations accompany every score.' },
            ].map((f) => (
              <Card key={f.label} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
                    {f.icon}
                  </div>
                  <span className="text-sm font-semibold text-emerald-600">{f.weight}</span>
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">{f.label}</h3>
                <p className="mt-1 text-sm text-slate-600">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 text-center">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Join the bridge</h2>
          <p className="mt-4 text-lg text-slate-600">
            Whether you're an athlete looking for your first sponsor or a company looking for authentic
            talent, AthleteBridge is where the connection happens.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/register">
              <Button size="lg">Create your profile <ArrowRight size={18} /></Button>
            </Link>
            <Link to="/">
              <Button variant="outline" size="lg">Back home</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
