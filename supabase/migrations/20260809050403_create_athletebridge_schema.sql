/*
# AthleteBridge — Core Schema

Creates the full data model for a two-sided sponsorship marketplace connecting
athletes with sponsors/companies.

## Tables

1. `profiles` — one row per authenticated user; stores role (athlete/sponsor), display name, avatar.
2. `athletes` — athlete profile data (sport, category, age, location, bio, competition level,
   years active, social links, sponsorship requirements, budget range, sponsorship types,
   profile view counter).
3. `achievements` — competition results belonging to an athlete (competition, year, level, medal, description).
4. `sponsors` — sponsor/company profile data (company name, logo, industry, description, location,
   website, budget, preferred sports/levels/types).
5. `sponsorship_requests` — proposals sent by sponsors to athletes (amount, type, message, status).
6. `shortlists` — athletes saved/bookmarked by a sponsor.

## Relationships

- `profiles.id` ↔ `auth.users.id` (1:1)
- `athletes.user_id` → `profiles.id`
- `sponsors.user_id` → `profiles.id`
- `achievements.athlete_id` → `athletes.id`
- `sponsorship_requests.sponsor_id` → `sponsors.id`
- `sponsorship_requests.athlete_id` → `athletes.id`
- `shortlists.sponsor_id` → `sponsors.id`
- `shortlists.athlete_id` → `athletes.id`

## Security (RLS)

All tables have RLS enabled. Access model:

- `profiles`: any authenticated user can read (needed to resolve names/avatars in discovery);
  only the owner can update their own row.
- `athletes`: any authenticated user can read (marketplace discovery); only the owner can
  insert/update/delete their own athlete profile.
- `achievements`: any authenticated user can read; only the owner of the parent athlete can
  insert/update/delete.
- `sponsors`: any authenticated user can read; only the owner can insert/update/delete.
- `sponsorship_requests`: a sponsor can read requests they sent; an athlete can read requests
  they received; only the sponsor owner can insert; only the receiving athlete can update status.
- `shortlists`: only the owning sponsor can read/insert/delete their shortlist entries.

## Helper function

- `increment_profile_views(athlete_uuid)` — SECURITY DEFINER function that atomically bumps
  `athletes.profile_views` by 1. Needed because a viewer is not the owner of the athlete row,
  so a plain UPDATE would be blocked by RLS.

## Notes

1. Owner columns (`user_id`) default to `auth.uid()` so frontend inserts that omit the owner
   still satisfy the INSERT `WITH CHECK`.
2. `unique_shortlist` prevents a sponsor from shortlisting the same athlete twice.
3. `sponsorship_requests.status` is constrained to pending/accepted/rejected.
*/

-- profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('athlete','sponsor')),
  full_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- athletes
CREATE TABLE IF NOT EXISTS athletes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  sport text,
  category text,
  age int,
  gender text,
  location text,
  bio text,
  competition_level text,
  years_active int,
  social_links jsonb DEFAULT '{}'::jsonb,
  sponsorship_requirements text,
  min_budget numeric,
  max_budget numeric,
  sponsorship_types text[] DEFAULT '{}',
  profile_views int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- achievements
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  competition text NOT NULL,
  year int,
  level text,
  medal text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- sponsors
CREATE TABLE IF NOT EXISTS sponsors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  company_name text,
  logo_url text,
  industry text,
  description text,
  location text,
  website text,
  sponsorship_budget numeric,
  preferred_sports text[] DEFAULT '{}',
  preferred_levels text[] DEFAULT '{}',
  sponsorship_types text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- sponsorship_requests
CREATE TABLE IF NOT EXISTS sponsorship_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id uuid NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
  athlete_id uuid NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  sponsorship_type text,
  message text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- shortlists
CREATE TABLE IF NOT EXISTS shortlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id uuid NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
  athlete_id uuid NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_shortlist UNIQUE (sponsor_id, athlete_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_athletes_user_id ON athletes(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_athlete_id ON achievements(athlete_id);
CREATE INDEX IF NOT EXISTS idx_sponsors_user_id ON sponsors(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_sponsor_id ON sponsorship_requests(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_requests_athlete_id ON sponsorship_requests(athlete_id);
CREATE INDEX IF NOT EXISTS idx_shortlists_sponsor_id ON shortlists(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_shortlists_athlete_id ON shortlists(athlete_id);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsorship_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE shortlists ENABLE ROW LEVEL SECURITY;

-- profiles policies
DROP POLICY IF EXISTS "profiles_select_authenticated" ON profiles;
CREATE POLICY "profiles_select_authenticated" ON profiles
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- athletes policies
DROP POLICY IF EXISTS "athletes_select_authenticated" ON athletes;
CREATE POLICY "athletes_select_authenticated" ON athletes
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "athletes_insert_own" ON athletes;
CREATE POLICY "athletes_insert_own" ON athletes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "athletes_update_own" ON athletes;
CREATE POLICY "athletes_update_own" ON athletes
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "athletes_delete_own" ON athletes;
CREATE POLICY "athletes_delete_own" ON athletes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- achievements policies (scoped through parent athlete)
DROP POLICY IF EXISTS "achievements_select_authenticated" ON achievements;
CREATE POLICY "achievements_select_authenticated" ON achievements
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "achievements_insert_own" ON achievements;
CREATE POLICY "achievements_insert_own" ON achievements
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM athletes a WHERE a.id = achievements.athlete_id AND a.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "achievements_update_own" ON achievements;
CREATE POLICY "achievements_update_own" ON achievements
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM athletes a WHERE a.id = achievements.athlete_id AND a.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM athletes a WHERE a.id = achievements.athlete_id AND a.user_id = auth.uid()));

DROP POLICY IF EXISTS "achievements_delete_own" ON achievements;
CREATE POLICY "achievements_delete_own" ON achievements
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM athletes a WHERE a.id = achievements.athlete_id AND a.user_id = auth.uid()));

-- sponsors policies
DROP POLICY IF EXISTS "sponsors_select_authenticated" ON sponsors;
CREATE POLICY "sponsors_select_authenticated" ON sponsors
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "sponsors_insert_own" ON sponsors;
CREATE POLICY "sponsors_insert_own" ON sponsors
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "sponsors_update_own" ON sponsors;
CREATE POLICY "sponsors_update_own" ON sponsors
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "sponsors_delete_own" ON sponsors;
CREATE POLICY "sponsors_delete_own" ON sponsors
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- sponsorship_requests policies
-- sponsor can read requests they sent; athlete can read requests they received
DROP POLICY IF EXISTS "requests_select_parties" ON sponsorship_requests;
CREATE POLICY "requests_select_parties" ON sponsorship_requests
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM sponsors s WHERE s.id = sponsorship_requests.sponsor_id AND s.user_id = auth.uid())
    OR
    EXISTS (SELECT 1 FROM athletes a WHERE a.id = sponsorship_requests.athlete_id AND a.user_id = auth.uid())
  );

-- only the sponsor owner can insert a request they send
DROP POLICY IF EXISTS "requests_insert_own_sponsor" ON sponsorship_requests;
CREATE POLICY "requests_insert_own_sponsor" ON sponsorship_requests
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM sponsors s WHERE s.id = sponsorship_requests.sponsor_id AND s.user_id = auth.uid())
  );

-- only the receiving athlete can update the status of a request
DROP POLICY IF EXISTS "requests_update_own_athlete" ON sponsorship_requests;
CREATE POLICY "requests_update_own_athlete" ON sponsorship_requests
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM athletes a WHERE a.id = sponsorship_requests.athlete_id AND a.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM athletes a WHERE a.id = sponsorship_requests.athlete_id AND a.user_id = auth.uid()));

-- shortlists policies (owner sponsor only)
DROP POLICY IF EXISTS "shortlists_select_own" ON shortlists;
CREATE POLICY "shortlists_select_own" ON shortlists
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM sponsors s WHERE s.id = shortlists.sponsor_id AND s.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "shortlists_insert_own" ON shortlists;
CREATE POLICY "shortlists_insert_own" ON shortlists
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM sponsors s WHERE s.id = shortlists.sponsor_id AND s.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "shortlists_delete_own" ON shortlists;
CREATE POLICY "shortlists_delete_own" ON shortlists
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM sponsors s WHERE s.id = shortlists.sponsor_id AND s.user_id = auth.uid())
  );

-- Helper: atomically increment an athlete's profile views (viewer is not the owner)
CREATE OR REPLACE FUNCTION increment_profile_views(p_athlete_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE athletes SET profile_views = profile_views + 1 WHERE id = p_athlete_id;
END;
$$;

GRANT EXECUTE ON FUNCTION increment_profile_views(uuid) TO authenticated;
