import { supabase } from '@/lib/supabase';

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
    // Atualiza a sessão para garantir token válido (evita 401)
    const { data: refreshData } = await supabase.auth.refreshSession();
    const session = refreshData?.session ?? (await supabase.auth.getSession()).data?.session;
    if (!session?.access_token) {
      throw new Error('Sessão expirada. Faça login novamente para gerar boletos.');
    }

    const { data, error } = await supabase.functions.invoke('asaas-create-cobranca', {
      body: {
        licenseId,
        sendEmail: options?.sendEmail ?? true,
        createdBy: session.user.id,
      },
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    if (error) {
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        throw new Error('Sessão expirada ou inválida. Faça logout e login novamente.');
      }
      throw error;
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
  },
};
