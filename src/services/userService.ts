import { supabase } from '@/lib/supabase';
import type { UserRole } from '@/types';

export interface ProfileRow {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  unit: string | null;
  condo_id: string | null;
  avatar: string | null;
  created_at: string;
  updated_at: string;
}

export async function getAllProfiles(): Promise<ProfileRow[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, email, role, unit, condo_id, avatar, created_at, updated_at')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as ProfileRow[];
}

export async function updateProfileCondo(
  profileId: string,
  condoId: string | null,
  unit: string | null
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({
      condo_id: condoId || null,
      unit: unit?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', profileId);

  if (error) throw error;
}
