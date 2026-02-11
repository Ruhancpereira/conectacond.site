import { License, Contract, DownloadLink, PlanType, PaymentStatus, LicenseStatus } from '@/types';
import { supabase } from '@/lib/supabase';

const mapLicenseFromDb = (row: Record<string, unknown>): License => ({
  id: row.id as string,
  condoId: (row.condo_id as string) ?? '',
  licenseKey: (row.license_key as string) ?? '',
  contractNumber: (row.contract_number as string) ?? '',
  planType: (row.plan_type as PlanType) ?? 'basic',
  maxUnits: (row.max_units as number) ?? 0,
  maxUsers: (row.max_users as number) ?? 0,
  startDate: new Date((row.start_date as string) ?? ''),
  expiryDate: new Date((row.expiry_date as string) ?? ''),
  isActive: (row.is_active as boolean) ?? true,
  isTrial: (row.is_trial as boolean) ?? false,
  trialDays: row.trial_days as number | undefined,
  autoRenew: (row.auto_renew as boolean) ?? false,
  paymentStatus: (row.payment_status as PaymentStatus) ?? 'pending',
  lastPaymentDate: row.last_payment_date ? new Date(row.last_payment_date as string) : undefined,
  nextPaymentDate: row.next_payment_date ? new Date(row.next_payment_date as string) : undefined,
  amount: parseFloat(String(row.amount ?? 0)),
  currency: (row.currency as string) ?? 'BRL',
  downloadCount: (row.download_count as number) ?? 0,
  maxDownloads: (row.max_downloads as number) ?? 100,
  createdAt: new Date((row.created_at as string) ?? ''),
  updatedAt: new Date((row.updated_at as string) ?? ''),
  createdBy: (row.created_by as string) ?? '',
  notes: row.notes as string | undefined,
  status: (row.status as LicenseStatus) ?? 'active',
  residentEmails: Array.isArray(row.resident_emails) ? (row.resident_emails as string[]) : [],
});

const mapContractFromDb = (row: Record<string, unknown>): Contract => ({
  id: row.id as string,
  licenseId: row.license_id as string,
  condoId: (row.condo_id as string) ?? '',
  contractType: (row.contract_type as Contract['contractType']) ?? 'new',
  status: (row.status as Contract['status']) ?? 'draft',
  contractPdfUrl: row.contract_pdf_url as string | undefined,
  signedAt: row.signed_at ? new Date(row.signed_at as string) : undefined,
  signedBy: row.signed_by as string | undefined,
  terms: typeof row.terms === 'string' ? JSON.parse(row.terms) : (row.terms as Contract['terms'] ?? { duration: 0, price: 0, features: [], restrictions: [] }),
  createdAt: new Date((row.created_at as string) ?? ''),
  updatedAt: new Date((row.updated_at as string) ?? ''),
});

const mapDownloadLinkFromDb = (row: Record<string, unknown>): DownloadLink => ({
  id: row.id as string,
  licenseId: row.license_id as string,
  condoId: (row.condo_id as string) ?? '',
  linkToken: (row.link_token as string) ?? '',
  downloadUrl: (row.download_url as string) ?? '',
  platform: (row.platform as 'ios' | 'android' | 'both') ?? 'both',
  expiresAt: new Date((row.expires_at as string) ?? ''),
  maxUses: (row.max_uses as number) ?? 0,
  currentUses: (row.current_uses as number) ?? 0,
  isActive: (row.is_active as boolean) ?? true,
  createdAt: new Date((row.created_at as string) ?? ''),
  createdBy: (row.created_by as string) ?? '',
});

export const licenseService = {
  async getAllLicenses(): Promise<License[]> {
    const { data, error } = await supabase
      .from('licenses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(mapLicenseFromDb);
  },

  async getLicenseById(id: string): Promise<License | null> {
    const { data, error } = await supabase
      .from('licenses')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    const license = mapLicenseFromDb(data);
    if (license.condoId) {
      const { data: condo } = await supabase
        .from('condos')
        .select('admin_email')
        .eq('id', license.condoId)
        .maybeSingle();
      if (condo?.admin_email) {
        license.syndicEmail = condo.admin_email;
      }
    }
    return license;
  },

  async getLicenseByCondoId(condoId: string): Promise<License | null> {
    const { data, error } = await supabase
      .from('licenses')
      .select('*')
      .eq('condo_id', condoId)
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return mapLicenseFromDb(data);
  },

  async createLicense(data: {
    condoId: string;
    planType: PlanType;
    duration: number;
    maxUnits: number;
    maxUsers: number;
    amount: number;
    isTrial?: boolean;
    trialDays?: number;
    notes?: string;
    residentEmails?: string[];
  }): Promise<License> {
    const now = new Date();
    const expiryDate = new Date(now);
    expiryDate.setMonth(expiryDate.getMonth() + data.duration);

    const licenseKey = `LIC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    const contractNumber = `CT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id ?? 'system';

    const insertData = {
      condo_id: data.condoId,
      license_key: licenseKey,
      contract_number: contractNumber,
      plan_type: data.planType,
      max_units: data.maxUnits,
      max_users: data.maxUsers,
      start_date: now.toISOString(),
      expiry_date: expiryDate.toISOString(),
      is_active: true,
      is_trial: data.isTrial ?? false,
      trial_days: data.trialDays ?? null,
      auto_renew: false,
      payment_status: 'pending' as PaymentStatus,
      next_payment_date: expiryDate.toISOString(),
      amount: data.amount,
      currency: 'BRL',
      download_count: 0,
      max_downloads: 100,
      created_by: userId,
      notes: data.notes ?? null,
      status: (data.isTrial ? 'trial' : 'active') as LicenseStatus,
      resident_emails: data.residentEmails ?? [],
    };

    const { data: inserted, error } = await supabase
      .from('licenses')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    if (!inserted) throw new Error('Erro ao criar licença: resposta inválida');
    return mapLicenseFromDb(inserted);
  },

  async updateLicense(id: string, data: Partial<License>): Promise<License> {
    const updateData: Record<string, unknown> = {};

    const fieldMapping: Record<string, string> = {
      condoId: 'condo_id',
      licenseKey: 'license_key',
      contractNumber: 'contract_number',
      planType: 'plan_type',
      maxUnits: 'max_units',
      maxUsers: 'max_users',
      isActive: 'is_active',
      isTrial: 'is_trial',
      trialDays: 'trial_days',
      autoRenew: 'auto_renew',
      paymentStatus: 'payment_status',
      amount: 'amount',
      currency: 'currency',
      downloadCount: 'download_count',
      maxDownloads: 'max_downloads',
      createdBy: 'created_by',
      notes: 'notes',
      status: 'status',
      residentEmails: 'resident_emails',
    };

    const dateKeys = ['startDate', 'expiryDate', 'lastPaymentDate', 'nextPaymentDate'];

    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined) return;
      const dbKey = fieldMapping[key] ?? key;
      if (dateKeys.includes(key) && value instanceof Date) {
        updateData[dbKey] = value.toISOString();
      } else if (fieldMapping[key] || !dateKeys.includes(key)) {
        updateData[dbKey] = value;
      }
    });

    const { data: updated, error } = await supabase
      .from('licenses')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!updated) throw new Error('Licença não encontrada');
    return mapLicenseFromDb(updated);
  },

  async suspendLicense(id: string, reason?: string): Promise<License> {
    const license = await this.getLicenseById(id);
    if (!license) throw new Error('Licença não encontrada');
    return this.updateLicense(id, {
      isActive: false,
      status: 'suspended',
      notes: reason ? `${license.notes || ''}\n[Suspenso: ${reason}]` : license.notes,
    });
  },

  async activateLicense(id: string): Promise<License> {
    const license = await this.getLicenseById(id);
    if (!license) throw new Error('Licença não encontrada');
    const status: LicenseStatus = license.expiryDate > new Date() ? 'active' : 'expired';
    return this.updateLicense(id, { isActive: true, status });
  },

  async renewLicense(id: string, duration: number): Promise<License> {
    const license = await this.getLicenseById(id);
    if (!license) throw new Error('Licença não encontrada');
    const newExpiryDate = new Date(license.expiryDate);
    newExpiryDate.setMonth(newExpiryDate.getMonth() + duration);
    return this.updateLicense(id, {
      expiryDate: newExpiryDate,
      paymentStatus: 'pending',
      nextPaymentDate: newExpiryDate,
      status: 'active',
    });
  },

  async getContracts(licenseId: string): Promise<Contract[]> {
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('license_id', licenseId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(mapContractFromDb);
  },

  async generateDownloadLink(data: {
    licenseId: string;
    condoId: string;
    platform: 'ios' | 'android' | 'both';
    maxUses?: number;
    expiryDays?: number;
  }): Promise<DownloadLink> {
    const token = `DL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (data.expiryDays ?? 30));

    const baseUrl = window.location.origin;
    const downloadUrl = `${baseUrl}/download?token=${token}&license=${data.licenseId}&platform=${data.platform}`;

    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id ?? 'system';

    const insertData = {
      license_id: data.licenseId,
      condo_id: data.condoId,
      link_token: token,
      download_url: downloadUrl,
      platform: data.platform,
      expires_at: expiresAt.toISOString(),
      max_uses: data.maxUses ?? 100,
      current_uses: 0,
      is_active: true,
      created_by: userId,
    };

    const { data: inserted, error } = await supabase
      .from('download_links')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    if (!inserted) throw new Error('Erro ao criar link de download: resposta inválida');
    return mapDownloadLinkFromDb(inserted);
  },

  async getDownloadLinks(licenseId: string): Promise<DownloadLink[]> {
    const { data, error } = await supabase
      .from('download_links')
      .select('*')
      .eq('license_id', licenseId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(mapDownloadLinkFromDb);
  },

  async revokeDownloadLink(linkId: string): Promise<void> {
    const { error } = await supabase
      .from('download_links')
      .update({ is_active: false })
      .eq('id', linkId);
    if (error) throw error;
  },

  async activateDownloadLink(linkId: string): Promise<void> {
    const { error } = await supabase
      .from('download_links')
      .update({ is_active: true })
      .eq('id', linkId);
    if (error) throw error;
  },
};
