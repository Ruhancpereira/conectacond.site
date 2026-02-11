import { supabase } from '@/lib/supabase';

export interface Condo {
  id: string;
  name: string;
  address: string;
  cnpj?: string;
  adminEmail?: string;
  adminId?: string;
  subAdminId?: string;
  totalUnits: number;
  isActive: boolean;
  licenseKey?: string;
  licenseExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const mapFromDb = (row: Record<string, unknown>): Condo => ({
  id: row.id as string,
  name: row.name as string,
  address: row.address as string,
  cnpj: row.cnpj as string | undefined,
  adminEmail: row.admin_email as string | undefined,
  adminId: row.admin_id as string | undefined,
  subAdminId: row.sub_admin_id as string | undefined,
  totalUnits: (row.total_units as number) ?? 0,
  isActive: (row.is_active as boolean) ?? true,
  licenseKey: row.license_key as string | undefined,
  licenseExpiry: row.license_expiry ? new Date(row.license_expiry as string) : undefined,
  createdAt: new Date((row.created_at as string) ?? ''),
  updatedAt: new Date((row.updated_at as string) ?? ''),
});

export const condoService = {
  async getAll(): Promise<Condo[]> {
    const { data, error } = await supabase
      .from('condos')
      .select('*')
      .order('name');

    if (error) throw error;
    return (data ?? []).map(mapFromDb);
  },

  async getById(id: string): Promise<Condo | null> {
    const { data, error } = await supabase
      .from('condos')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data ? mapFromDb(data) : null;
  },

  async create(input: {
    id: string;
    name: string;
    address: string;
    cnpj?: string;
    adminEmail: string;
  }): Promise<Condo> {
    const { data, error } = await supabase
      .from('condos')
      .insert({
        id: input.id,
        name: input.name,
        address: input.address,
        cnpj: input.cnpj ?? null,
        admin_email: input.adminEmail,
        is_active: true,
        total_units: 0,
      })
      .select()
      .single();

    if (error) throw error;
    return mapFromDb(data);
  },

  async update(id: string, input: Partial<{
    name: string;
    address: string;
    cnpj: string;
    adminEmail: string;
    adminId: string;
    subAdminId: string;
    totalUnits: number;
    isActive: boolean;
    licenseKey: string;
    licenseExpiry: string;
  }>): Promise<Condo> {
    const updateData: Record<string, unknown> = {};
    if (input.name != null) updateData.name = input.name;
    if (input.address != null) updateData.address = input.address;
    if (input.cnpj != null) updateData.cnpj = input.cnpj;
    if (input.adminEmail != null) updateData.admin_email = input.adminEmail;
    if (input.adminId != null) updateData.admin_id = input.adminId;
    if (input.subAdminId != null) updateData.sub_admin_id = input.subAdminId;
    if (input.totalUnits != null) updateData.total_units = input.totalUnits;
    if (input.isActive != null) updateData.is_active = input.isActive;
    if (input.licenseKey != null) updateData.license_key = input.licenseKey;
    if (input.licenseExpiry != null) updateData.license_expiry = input.licenseExpiry;

    const { data, error } = await supabase
      .from('condos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapFromDb(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('condos').delete().eq('id', id);
    if (error) throw error;
  },
};
