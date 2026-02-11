import { supabase } from '@/lib/supabase';

export async function sendDownloadLinksToResidents(
  licenseId: string,
  downloadUrl?: string
): Promise<{ sent: number; failed: number; total: number; message: string }> {
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.access_token) {
    throw new Error('Você precisa estar logado para enviar e-mails.');
  }

  const { data, error } = await supabase.functions.invoke('send-download-links', {
    body: { licenseId, downloadUrl },
    headers: { Authorization: `Bearer ${session.session.access_token}` },
  });

  if (error) throw error;

  if (data?.error) {
    throw new Error(data.error);
  }

  return {
    sent: data?.sent ?? 0,
    failed: data?.failed ?? 0,
    total: data?.total ?? 0,
    message: data?.message ?? 'E-mails enviados.',
  };
}
