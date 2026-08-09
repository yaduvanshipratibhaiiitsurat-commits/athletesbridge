import { Link } from '@/lib/router';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { MapPin, Trophy, Bookmark, BookmarkCheck } from 'lucide-react';
import type { Athlete, Achievement, Profile, MatchBreakdown } from '@/lib/types';

interface AthleteCardProps {
  athlete: Athlete;
  profile?: Profile;
  achievements?: Achievement[];
  match?: MatchBreakdown;
  shortlisted?: boolean;
  onShortlist?: () => void;
  shortlistLoading?: boolean;
}

export function AthleteCard({
  athlete,
  profile,
  achievements = [],
  match,
  shortlisted,
  onShortlist,
  shortlistLoading,
}: AthleteCardProps) {
  const topAchievements = achievements.slice(0, 2);

  return (
    <Card hover className="flex flex-col overflow-hidden">
      <div className="relative h-28 bg-gradient-to-br from-slate-800 to-slate-900">
        {match && (
          <div className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-slate-900 shadow">
            {match.score}% Match
          </div>
        )}
        <div className="absolute -bottom-8 left-5">
          <Avatar src={profile?.avatar_url} name={profile?.full_name} size="xl" />
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-10">
        <Link to={`/sponsor/athlete/${athlete.id}`}>
          <h3 className="text-lg font-semibold text-slate-900 hover:underline">
            {profile?.full_name ?? 'Unnamed athlete'}
          </h3>
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
          <span className="font-medium text-slate-700">{athlete.sport ?? '—'}</span>
          {athlete.location && (
            <span className="flex items-center gap-1">
              <MapPin size={13} /> {athlete.location}
            </span>
          )}
        </div>

        {topAchievements.length > 0 && (
          <div className="mt-3 space-y-1">
            {topAchievements.map((a) => (
              <div key={a.id} className="flex items-center gap-2 text-sm text-slate-600">
                <Trophy size={14} className="text-amber-500" />
                <span className="truncate">
                  {a.medal ? `${a.medal} · ` : ''}
                  {a.competition}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-1.5">
          {athlete.competition_level && (
            <Badge variant="info">{athlete.competition_level}</Badge>
          )}
          {athlete.sponsorship_types.slice(0, 2).map((t) => (
            <Badge key={t} variant="neutral">{t}</Badge>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
          <div>
            <p className="text-xs text-slate-400">Sponsorship range</p>
            <p className="text-sm font-semibold text-slate-900">
              {athlete.min_budget && athlete.max_budget
                ? `$${Number(athlete.min_budget).toLocaleString()} – $${Number(athlete.max_budget).toLocaleString()}`
                : 'Not specified'}
            </p>
          </div>
        </div>

        {match && match.reasons.length > 0 && (
          <div className="mt-3 rounded-xl bg-emerald-50 p-3">
            <p className="text-xs font-semibold text-emerald-700">Why this match?</p>
            <ul className="mt-1 space-y-0.5">
              {match.reasons.slice(0, 2).map((r, i) => (
                <li key={i} className="text-xs text-emerald-700/80">• {r}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <Link to={`/sponsor/athlete/${athlete.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">View profile</Button>
          </Link>
          {onShortlist && (
            <Button
              variant={shortlisted ? 'secondary' : 'ghost'}
              size="sm"
              onClick={onShortlist}
              disabled={shortlistLoading}
              title={shortlisted ? 'Shortlisted' : 'Shortlist'}
            >
              {shortlisted ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
