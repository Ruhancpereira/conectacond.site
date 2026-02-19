import { supabase } from '@/lib/supabase';

const EDGE_FUNCTION_TIMEOUT_MS = 120_000; // 2 min (Asaas + Resend podem demorar)

export interface LicenseCobranca {
  id: string;
  licenseId: string;
  condoId: string;
  asaasPaymentId: string;
  asaasInvoiceUrl: string | null;
  asaasBankSlipUrl: string | null;
  amount: number;
  dueDate: string;
  status: 'pending' | 'received' | 'confirmed' | 'overdue' | 'refunded' | 'cancelled';
  emailSentAt: string | null;
  paidAt: string | null;
  createdAt: string;
}

const mapFromDb = (row: Record<string, unknown>): LicenseCobranca => ({
  id: row.id as string,
  licenseId: row.license_id as string,
  condoId: row.condo_id as string,
  asaasPaymentId: row.asaas_payment_id as string,
  asaasInvoiceUrl: row.asaas_invoice_url as string | null,
  asaasBankSlipUrl: row.asaas_bank_slip_url as string | null,
  amount: parseFloat(String(row.amount ?? 0)),
  dueDate: row.due_date as string,
  status: row.status as LicenseCobranca['status'],
  emailSentAt: row.email_sent_at as string | null,
  paidAt: row.paid_at as string | null,
  createdAt: row.created_at as string,
});

export const asaasService = {
  async getCobrancasByLicense(licenseId: string): Promise<LicenseCobranca[]> {
    const { data, error } = await supabase
      .from('license_cobrancas')
      .select('*')
      .eq('license_id', licenseId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(mapFromDb);
  },

  async createCobranca(
    licenseId: string,
    options?: { sendEmail?: boolean }
  ): Promise<{
    success: boolean;
    asaasPaymentId?: string;
    invoiceUrl?: string;
    dueDate?: string;
    emailSent?: boolean;
    message: string;
  }> {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.access_token) {
      throw new Error('Você precisa estar logado para gerar boletos.');
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '');
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const url = `${supabaseUrl}/functions/v1/asaas-create-cobranca`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), EDGE_FUNCTION_TIMEOUT_MS);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': anonKey ?? '',
          'Authorization': `Bearer ${session.session.access_token}`,
        },
        body: JSON.stringify({
          licenseId,
          sendEmail: options?.sendEmail ?? true,
          createdBy: session.session.user.id,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || `Erro ${res.status}`);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      return {
        success: data?.success ?? true,
        asaasPaymentId: data?.asaasPaymentId,
        invoiceUrl: data?.invoiceUrl,
        dueDate: data?.dueDate,
        emailSent: data?.emailSent,
        message: data?.message ?? 'Boleto gerado com sucesso.',
      };
    } catch (err) {
      clearTimeout(timeoutId);
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          throw new Error('A requisição demorou muito. O boleto pode ter sido criado – verifique no Asaas ou tente novamente.');
        }
        throw err;
      }
      throw err;
    }
  },
};
