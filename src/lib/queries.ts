import { supabase } from './supabase';
import type { Athlete, Sponsor, Achievement } from './types';

export async function getMyAthlete(userId: string): Promise<Athlete | null> {
  const { data } = await supabase
    .from('athletes')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  return (data as Athlete) ?? null;
}

export async function getMySponsor(userId: string): Promise<Sponsor | null> {
  const { data } = await supabase
    .from('sponsors')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  return (data as Sponsor) ?? null;
}

export async function getAthleteAchievements(athleteId: string): Promise<Achievement[]> {
  const { data } = await supabase
    .from('achievements')
    .select('*')
    .eq('athlete_id', athleteId)
    .order('year', { ascending: false });
  return (data as Achievement[]) ?? [];
}

export async function getAthleteWithProfile(athleteId: string) {
  const { data } = await supabase
    .from('athletes')
    .select('*, profiles:profiles!user_id(*)')
    .eq('id', athleteId)
    .maybeSingle();
  return data;
}

export async function getProfile(userId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  return data;
}
