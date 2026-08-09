export type UserRole = 'athlete' | 'sponsor';

export type SponsorshipType =
  | 'Financial'
  | 'Equipment'
  | 'Apparel'
  | 'Event'
  | 'Travel'
  | 'Nutrition'
  | 'Media';

export const SPONSORSHIP_TYPES: SponsorshipType[] = [
  'Financial',
  'Equipment',
  'Apparel',
  'Event',
  'Travel',
  'Nutrition',
  'Media',
];

export const COMPETITION_LEVELS = [
  'Local',
  'Regional',
  'National',
  'International',
  'Olympic',
] as const;

export const SPORTS = [
  'Athletics',
  'Swimming',
  'Cycling',
  'Rowing',
  'Boxing',
  'Judo',
  'Wrestling',
  'Archery',
  'Shooting',
  'Fencing',
  'Table Tennis',
  'Badminton',
  'Weightlifting',
  'Triathlon',
  'Climbing',
  'Sailing',
  'Equestrian',
  'Gymnastics',
  'Karate',
  'Taekwondo',
] as const;

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Athlete {
  id: string;
  user_id: string;
  sport: string | null;
  category: string | null;
  age: number | null;
  gender: string | null;
  location: string | null;
  bio: string | null;
  competition_level: string | null;
  years_active: number | null;
  social_links: Record<string, string>;
  sponsorship_requirements: string | null;
  min_budget: number | null;
  max_budget: number | null;
  sponsorship_types: string[];
  profile_views: number;
  created_at: string;
}

export interface Achievement {
  id: string;
  athlete_id: string;
  competition: string;
  year: number | null;
  level: string | null;
  medal: string | null;
  description: string | null;
  created_at: string;
}

export interface Sponsor {
  id: string;
  user_id: string;
  company_name: string | null;
  logo_url: string | null;
  industry: string | null;
  description: string | null;
  location: string | null;
  website: string | null;
  sponsorship_budget: number | null;
  preferred_sports: string[];
  preferred_levels: string[];
  sponsorship_types: string[];
  created_at: string;
}

export type RequestStatus = 'pending' | 'accepted' | 'rejected';

export interface SponsorshipRequest {
  id: string;
  sponsor_id: string;
  athlete_id: string;
  amount: number;
  sponsorship_type: string | null;
  message: string | null;
  status: RequestStatus;
  created_at: string;
  sponsor?: Sponsor;
  athlete?: Athlete & { profiles?: Profile };
}

export interface Shortlist {
  id: string;
  sponsor_id: string;
  athlete_id: string;
  created_at: string;
  athlete?: Athlete & { profiles?: Profile; achievements?: Achievement[] };
}

export interface MatchBreakdown {
  score: number;
  reasons: string[];
}

export function computeMatch(
  athlete: Athlete,
  sponsor: Sponsor,
  achievements: Achievement[] = [],
): MatchBreakdown {
  const reasons: string[] = [];
  let score = 0;

  // Sport compatibility 30%
  if (sponsor.preferred_sports.length === 0) {
    score += 15;
  } else if (athlete.sport && sponsor.preferred_sports.includes(athlete.sport)) {
    score += 30;
    reasons.push(`Sport match: ${athlete.sport} is one of the sponsor's preferred sports.`);
  } else {
    score += 6;
  }

  // Achievement level 25%
  const topLevel = achievements
    .map((a) => a.level)
    .filter(Boolean)
    .sort((a, b) => {
      const order = COMPETITION_LEVELS as unknown as string[];
      return order.indexOf(b as string) - order.indexOf(a as string);
    })[0];
  const effectiveLevel = topLevel || athlete.competition_level;
  if (effectiveLevel && sponsor.preferred_levels.length > 0) {
    if (sponsor.preferred_levels.includes(effectiveLevel)) {
      score += 25;
      reasons.push(`Competes at ${effectiveLevel} level — matches sponsor's target.`);
    } else {
      score += 10;
    }
  } else if (effectiveLevel) {
    score += 18;
    reasons.push(`Proven ${effectiveLevel}-level competitor.`);
  } else {
    score += 8;
  }

  // Budget compatibility 20%
  if (
    athlete.min_budget != null &&
    athlete.max_budget != null &&
    sponsor.sponsorship_budget != null
  ) {
    if (sponsor.sponsorship_budget >= athlete.min_budget) {
      const overlap = Math.min(sponsor.sponsorship_budget, athlete.max_budget) - athlete.min_budget;
      if (overlap >= 0) {
        score += 20;
        reasons.push(`Budget aligned: sponsor can meet the athlete's funding range.`);
      } else {
        score += 12;
      }
    } else {
      score += 5;
    }
  } else {
    score += 10;
  }

  // Location 15%
  if (athlete.location && sponsor.location) {
    const aCountry = athlete.location.split(',').pop()?.trim().toLowerCase();
    const sCountry = sponsor.location.split(',').pop()?.trim().toLowerCase();
    if (aCountry && sCountry && aCountry === sCountry) {
      score += 15;
      reasons.push(`Same region (${athlete.location.split(',').pop()?.trim()}).`);
    } else {
      score += 6;
    }
  } else {
    score += 7;
  }

  // Audience/engagement 10% — proxy: profile completeness + views
  let completeness = 0;
  if (athlete.bio) completeness += 1;
  if (athlete.sport) completeness += 1;
  if (athlete.location) completeness += 1;
  if (athlete.sponsorship_types.length > 0) completeness += 1;
  if (achievements.length > 0) completeness += 1;
  score += Math.round((completeness / 5) * 10);
  if (completeness >= 4) reasons.push('Well-documented profile with verified achievements.');

  if (reasons.length === 0) {
    reasons.push('General compatibility based on profile data.');
  }
  if (reasons.length < 2) {
    reasons.push('Potential for a strong sponsorship partnership.');
  }

  return { score: Math.min(100, Math.round(score)), reasons: reasons.slice(0, 4) };
}
