import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Edit, Download, Share2, Copy, Ban, CheckCircle, Calendar, DollarSign, Users, Building, FileText, Plus, Power, PowerOff, Clock, Mail, Receipt } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SystemLayout } from '@/components/layout/SystemLayout';
import { licenseService } from '@/services/licenseService';
import { sendDownloadLinksToResidents } from '@/services/emailService';
import { asaasService } from '@/services/asaasService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  active: { label: 'Ativa', variant: 'default' },
  expired: { label: 'Expirada', variant: 'destructive' },
  trial: { label: 'Trial', variant: 'secondary' },
  suspended: { label: 'Suspensa', variant: 'destructive' },
  cancelled: { label: 'Cancelada', variant: 'outline' },
};

const planConfig: Record<string, { label: string; color: string; icon: string }> = {
  basic: { label: 'Básico', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: '📦' },
  premium: { label: 'Premium', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: '⭐' },
  enterprise: { label: 'Enterprise', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: '👑' },
};

const paymentStatusConfig: Record<string, { label: string; color: string }> = {
  paid: { label: 'Pago', color: 'bg-green-100 text-green-800 border-green-200' },
  pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  overdue: { label: 'Atrasado', color: 'bg-red-100 text-red-800 border-red-200' },
  cancelled: { label: 'Cancelado', color: 'bg-gray-100 text-gray-800 border-gray-200' },
};

export default function LicenseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: license, isLoading } = useQuery({
    queryKey: ['license', id],
    queryFn: async () => {
      const result = await licenseService.getLicenseById(id!);
      if (!result) throw new Error('Licença não encontrada');
      return result;
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: contracts = [] } = useQuery({
    queryKey: ['contracts', id],
    queryFn: () => licenseService.getContracts(id!),
    enabled: !!id,
  });

  const { data: downloadLinks = [] } = useQuery({
    queryKey: ['downloadLinks', id],
    queryFn: () => licenseService.getDownloadLinks(id!),
    enabled: !!id,
  });

  const { data: cobrancas = [] } = useQuery({
    queryKey: ['licenseCobrancas', id],
    queryFn: () => asaasService.getCobrancasByLicense(id!),
    enabled: !!id,
  });

  const suspendMutation = useMutation({
    mutationFn: () => {
      if (!id) throw new Error('ID não encontrado');
      return licenseService.suspendLicense(id, 'Suspenso pelo administrador');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['license', id] });
      toast.success('Licença suspensa com sucesso');
    },
  });

  const activateMutation = useMutation({
    mutationFn: () => licenseService.activateLicense(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['license', id] });
      toast.success('Licença ativada com sucesso');
    },
  });

  const revokeLinkMutation = useMutation({
    mutationFn: (linkId: string) => licenseService.revokeDownloadLink(linkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['downloadLinks', id] });
      toast.success('Link desativado com sucesso');
    },
  });

  const activateLinkMutation = useMutation({
    mutationFn: (linkId: string) => licenseService.activateDownloadLink(linkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['downloadLinks', id] });
      toast.success('Link ativado com sucesso');
    },
  });

  const sendEmailsMutation = useMutation({
    mutationFn: () => sendDownloadLinksToResidents(id!, undefined),
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error((error as Error).message);
    },
  });

  const createCobrancaMutation = useMutation({
    mutationFn: () => asaasService.createCobranca(id!, { sendEmail: true }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['license', id] });
      queryClient.invalidateQueries({ queryKey: ['licenseCobrancas', id] });
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error((error as Error).message);
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para a área de transferência');
  };

  if (isLoading) {
    return (
      <SystemLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando licença...</p>
          </div>
        </div>
      </SystemLayout>
    );
  }

  if (!license) {
    return (
      <SystemLayout>
        <div className="text-center py-12">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Licença não encontrada</h2>
          <p className="text-muted-foreground mb-6">A licença solicitada não existe ou foi removida.</p>
          <Link to="/system/licenses">
            <Button>Voltar para Licenças</Button>
          </Link>
        </div>
      </SystemLayout>
    );
  }

  const status = statusConfig[license.status] || statusConfig.active;
  const plan = planConfig[license.planType] || planConfig.basic;
  const isExpired = license.expiryDate < new Date();
  const daysUntilExpiry = Math.ceil((license.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isExpiringSoon = !isExpired && daysUntilExpiry <= 30;

  return (
    <SystemLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/system/licenses">
              <Button variant="ghost" size="icon" className="hover:bg-slate-100">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{license.licenseKey}</h1>
              <p className="text-slate-600 mt-1 font-mono text-sm">{license.contractNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to={`/system/licenses/${id}/edit`}>
              <Button variant="outline" className="border-2 border-slate-300">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </Link>
            {license.isActive ? (
              <Button 
                variant="destructive" 
                onClick={() => suspendMutation.mutate()}
                className="bg-red-600 hover:bg-red-700"
              >
                <Ban className="h-4 w-4 mr-2" />
                Suspender
              </Button>
            ) : (
              <Button 
                onClick={() => activateMutation.mutate()}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Ativar
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-lg ${plan.color} border flex items-center justify-center`}>
                  <span className="text-lg">{planConfig[license.planType]?.icon || '📦'}</span>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-1">Plano</p>
                  <p className="text-lg font-bold text-slate-900">{plan.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-lg ${
                  status.variant === 'default' ? 'bg-green-100' :
                  status.variant === 'destructive' ? 'bg-red-100' :
                  'bg-yellow-100'
                } flex items-center justify-center`}>
                  <Calendar className={`h-6 w-6 ${
                    status.variant === 'default' ? 'text-green-700' :
                    status.variant === 'destructive' ? 'text-red-700' :
                    'text-yellow-700'
                  }`} />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-1">Status</p>
                  <Badge className={`${statusConfig[license.status]?.color || 'bg-slate-100 text-slate-800'} border font-medium`}>
                    {status.label}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-700" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-1">Valor Mensal</p>
                  <p className="text-lg font-bold text-green-700">R$ {license.amount.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={`border shadow-sm ${
            isExpired ? 'border-red-200 bg-red-50/50' :
            isExpiringSoon ? 'border-yellow-200 bg-yellow-50/50' :
            'border-slate-200'
          }`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                  isExpired ? 'bg-red-100' :
                  isExpiringSoon ? 'bg-yellow-100' :
                  'bg-slate-100'
                }`}>
                  <Clock className={`h-6 w-6 ${
                    isExpired ? 'text-red-700' :
                    isExpiringSoon ? 'text-yellow-700' :
                    'text-slate-700'
                  }`} />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-1">Expira em</p>
                  <p className={`text-lg font-bold ${
                    isExpired ? 'text-red-700' :
                    isExpiringSoon ? 'text-yellow-700' :
                    'text-slate-900'
                  }`}>
                    {format(license.expiryDate, "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                  {!isExpired && (
                    <p className="text-xs text-slate-500 mt-1">{daysUntilExpiry} dias restantes</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-slate-100 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white">Visão Geral</TabsTrigger>
            <TabsTrigger value="contracts" className="data-[state=active]:bg-white">Contratos</TabsTrigger>
            <TabsTrigger value="downloads" className="data-[state=active]:bg-white">Links de Download</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-200 bg-slate-50/50">
                  <CardTitle className="text-lg font-semibold">Informações da Licença</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 p-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-600">Chave da Licença</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono font-semibold text-slate-900">{license.licenseKey}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:bg-slate-100"
                        onClick={() => copyToClipboard(license.licenseKey)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-600">Número do Contrato</p>
                    <p className="font-semibold text-slate-900 font-mono">{license.contractNumber}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-600">Condomínio</p>
                    <p className="font-semibold text-slate-900">{license.condoId}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-600">Data de Início</p>
                    <p className="font-semibold text-slate-900">
                      {format(license.startDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-600">Data de Expiração</p>
                    <p className={`font-semibold ${isExpired ? 'text-red-600' : daysUntilExpiry <= 30 ? 'text-yellow-600' : 'text-slate-900'}`}>
                      {format(license.expiryDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                    {!isExpired && (
                      <p className="text-xs text-slate-500">{daysUntilExpiry} dias restantes</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-200 bg-slate-50/50">
                  <CardTitle className="text-lg font-semibold">Limites e Uso</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 p-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-600 flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Unidades
                      </p>
                      <p className="font-semibold text-slate-900">
                        {license.maxUnits === 9999 ? 'Ilimitado' : `0 / ${license.maxUnits}`}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-600 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Usuários
                      </p>
                      <p className="font-semibold text-slate-900">
                        {license.maxUsers === 9999 ? 'Ilimitado' : `0 / ${license.maxUsers}`}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-600 flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Downloads
                      </p>
                      <p className="font-semibold text-slate-900">
                        {license.downloadCount} / {license.maxDownloads}
                      </p>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                      <div
                        className="bg-primary h-2.5 rounded-full transition-all"
                        style={{ width: `${Math.min((license.downloadCount / license.maxDownloads) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-200 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">Pagamento</CardTitle>
                    <Button
                      onClick={() => createCobrancaMutation.mutate()}
                      disabled={createCobrancaMutation.isPending || license.isTrial}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {createCobrancaMutation.isPending ? (
                        <>
                          <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Gerando...
                        </>
                      ) : (
                        <>
                          <Receipt className="h-4 w-4 mr-2" />
                          Gerar e enviar boleto
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5 p-6">
                  {license.isTrial && (
                    <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                      Licenças em período de trial não geram boleto. Após o trial, use o botão acima.
                    </div>
                  )}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-600">Status do Pagamento</p>
                    <Badge
                      className={`${paymentStatusConfig[license.paymentStatus]?.color || 'bg-slate-100 text-slate-800'} border font-medium`}
                    >
                      {paymentStatusConfig[license.paymentStatus]?.label || license.paymentStatus}
                    </Badge>
                  </div>
                  {license.lastPaymentDate && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-600">Último Pagamento</p>
                      <p className="font-semibold text-slate-900">
                        {format(license.lastPaymentDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  )}
                  {license.nextPaymentDate && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-600">Próximo Pagamento</p>
                      <p className="font-semibold text-slate-900">
                        {format(license.nextPaymentDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-600">Valor Mensal</p>
                    <p className="font-bold text-xl text-green-700">R$ {license.amount.toFixed(2)}</p>
                  </div>
                  {cobrancas.length > 0 && (
                    <div className="space-y-2 pt-3 border-t border-slate-200">
                      <p className="text-sm font-medium text-slate-600">Boletos emitidos</p>
                      <div className="space-y-1">
                        {cobrancas.slice(0, 3).map((c) => (
                          <div key={c.id} className="flex items-center justify-between text-sm">
                            <span>{format(new Date(c.dueDate), 'dd/MM/yyyy', { locale: ptBR })}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant={c.status === 'received' ? 'default' : 'secondary'} className="text-xs">
                                {c.status === 'received' ? 'Pago' : c.status === 'pending' ? 'Pendente' : c.status}
                              </Badge>
                              {(c.asaasInvoiceUrl || c.asaasBankSlipUrl) && (
                                <Button variant="ghost" size="sm" asChild>
                                  <a href={c.asaasInvoiceUrl || c.asaasBankSlipUrl || '#'} target="_blank" rel="noopener noreferrer">
                                    Ver boleto
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {license.notes && (
                <Card className="border border-slate-200 shadow-sm lg:col-span-2">
                  <CardHeader className="border-b border-slate-200 bg-slate-50/50">
                    <CardTitle className="text-lg font-semibold">Observações</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{license.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="contracts" className="space-y-6">
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-200 bg-slate-50/50">
                <CardTitle className="text-lg font-semibold">Contratos</CardTitle>
                <CardDescription>Histórico de contratos desta licença</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {contracts.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">Nenhum contrato encontrado</p>
                    <p className="text-sm text-slate-500 mt-1">Os contratos aparecerão aqui quando forem criados</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 hover:bg-slate-50">
                          <TableHead className="font-semibold text-slate-700">Contrato</TableHead>
                          <TableHead className="font-semibold text-slate-700">Tipo</TableHead>
                          <TableHead className="font-semibold text-slate-700">Status</TableHead>
                          <TableHead className="font-semibold text-slate-700">Duração</TableHead>
                          <TableHead className="font-semibold text-slate-700">Valor</TableHead>
                          <TableHead className="font-semibold text-slate-700">Criado em</TableHead>
                          <TableHead className="font-semibold text-slate-700 text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {contracts.map((contract) => (
                          <TableRow key={contract.id} className="hover:bg-slate-50/50">
                            <TableCell className="font-medium">
                              {contract.contractNumber || `Contrato ${contract.id}`}
                            </TableCell>
                            <TableCell>
                              <span className="text-slate-700 capitalize">{contract.contractType}</span>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-slate-100 text-slate-800 border font-medium">
                                {contract.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-slate-700">{contract.terms.duration} meses</span>
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold text-slate-900">R$ {contract.terms.price.toFixed(2)}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-slate-700">
                                {format(contract.createdAt, "dd/MM/yyyy", { locale: ptBR })}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              {contract.contractPdfUrl && (
                                <Button variant="outline" size="sm" asChild>
                                  <a href={contract.contractPdfUrl} download>
                                    <Download className="h-4 w-4 mr-2" />
                                    PDF
                                  </a>
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="downloads" className="space-y-6">
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-200 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      E-mails
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Condôminos recebem link de download. Síndico recebe a chave de licença para cadastro no app.
                    </CardDescription>
                  </div>
                  {((license.residentEmails && license.residentEmails.length > 0) || license.syndicEmail) ? (
                    <Button
                      onClick={() => sendEmailsMutation.mutate()}
                      disabled={sendEmailsMutation.isPending}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {sendEmailsMutation.isPending ? (
                        <>
                          <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-2" />
                          Enviar e-mails
                        </>
                      )}
                    </Button>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="p-4">
                {!license.syndicEmail && (
                  <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                    Para o síndico receber a chave de licença por e-mail, cadastre o <strong>E-mail do Síndico</strong> no condomínio vinculado a esta licença (Condomínios → editar).
                  </div>
                )}
                {license.syndicEmail && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Síndico</p>
                    <p className="font-mono text-sm text-slate-700 truncate">{license.syndicEmail}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Recebe a chave de licença para cadastro no app.</p>
                  </div>
                )}
                {license.residentEmails && license.residentEmails.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                        Condôminos ({license.residentEmails.length})
                      </p>
                      <ul className="text-sm text-slate-700 space-y-1">
                        {license.residentEmails.map((email) => (
                          <li key={email} className="font-mono truncate">
                            {email}
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs text-slate-500 mt-1">Recebem o link de download. Use o e-mail para se cadastrar no app.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

            <Card className="border-2 border-slate-200 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300">
              <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-50/80 to-white/50 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                      Links de Download
                    </CardTitle>
                    <CardDescription className="mt-1">Gerencie os links de download do app para os condôminos</CardDescription>
                  </div>
                  <Link to={`/system/licenses/${id}/download-links/new`}>
                    <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 transition-all duration-300 hover:scale-105 text-white font-semibold">
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Link
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {downloadLinks.length === 0 ? (
                  <div className="text-center py-12">
                    <Download className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">Nenhum link de download criado</p>
                    <p className="text-sm text-slate-500 mt-1">Crie um link para compartilhar o app com os condôminos</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 hover:bg-slate-50">
                          <TableHead className="font-semibold text-slate-700">Link</TableHead>
                          <TableHead className="font-semibold text-slate-700">Plataforma</TableHead>
                          <TableHead className="font-semibold text-slate-700">Status</TableHead>
                          <TableHead className="font-semibold text-slate-700">Usos</TableHead>
                          <TableHead className="font-semibold text-slate-700">Expira em</TableHead>
                          <TableHead className="font-semibold text-slate-700">Criado em</TableHead>
                          <TableHead className="font-semibold text-slate-700 text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {downloadLinks.map((link) => {
                          const isExpired = link.expiresAt < new Date();
                          const isNearExpiry = !isExpired && (link.expiresAt.getTime() - new Date().getTime()) < 7 * 24 * 60 * 60 * 1000;
                          const usagePercentage = (link.currentUses / link.maxUses) * 100;
                          const isNearLimit = usagePercentage >= 80;
                          
                          return (
                          <TableRow 
                            key={link.id} 
                            className={`hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent transition-all duration-200 ${
                              !link.isActive ? 'opacity-60' : ''
                            }`}
                          >
                            <TableCell>
                              <div className="max-w-md">
                                <p className="font-mono text-xs text-slate-900 font-semibold break-all">{link.downloadUrl}</p>
                                <p className="text-xs text-slate-500 mt-1 font-mono">Token: {link.linkToken}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={`${
                                link.platform === 'both' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                                link.platform === 'ios' ? 'bg-gray-100 text-gray-800 border-gray-200' :
                                'bg-green-100 text-green-800 border-green-200'
                              } border font-medium capitalize`}>
                                {link.platform === 'both' ? '🌐 Ambas' : link.platform === 'ios' ? '🍎 iOS' : '🤖 Android'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {link.isActive && !isExpired ? (
                                <Badge className="bg-green-100 text-green-800 border-green-200 font-medium">
                                  Ativo
                                </Badge>
                              ) : isExpired ? (
                                <Badge className="bg-red-100 text-red-800 border-red-200 font-medium">
                                  Expirado
                                </Badge>
                              ) : (
                                <Badge className="bg-slate-100 text-slate-800 border font-medium">
                                  Inativo
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className={`font-semibold ${
                                  isNearLimit ? 'text-orange-600' : 'text-slate-700'
                                }`}>
                                  {link.currentUses}/{link.maxUses}
                                </span>
                                <div className="w-20 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      isNearLimit ? 'bg-orange-500' : 'bg-primary'
                                    }`}
                                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                                  />
                                </div>
                                {isNearLimit && (
                                  <span className="text-xs text-orange-600 font-medium">⚠️</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <span className={`font-medium ${
                                  isExpired ? 'text-red-600' : 
                                  isNearExpiry ? 'text-yellow-600' : 
                                  'text-slate-700'
                                }`}>
                                  {format(link.expiresAt, "dd/MM/yyyy", { locale: ptBR })}
                                </span>
                                {isNearExpiry && !isExpired && (
                                  <p className="text-xs text-yellow-600 mt-1">Expira em breve</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-slate-700">
                                {format(link.createdAt, "dd/MM/yyyy", { locale: ptBR })}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                  onClick={() => copyToClipboard(link.downloadUrl)}
                                  title="Copiar link"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 hover:bg-green-50 hover:text-green-600 transition-colors"
                                  onClick={() => {
                                    if (navigator.share) {
                                      navigator.share({ 
                                        title: 'Download ConectaCond',
                                        text: 'Baixe o app ConectaCond',
                                        url: link.downloadUrl 
                                      });
                                    } else {
                                      copyToClipboard(link.downloadUrl);
                                      toast.success('Link copiado! Compartilhe com os condôminos');
                                    }
                                  }}
                                  title="Compartilhar"
                                >
                                  <Share2 className="h-4 w-4" />
                                </Button>
                                {link.isActive ? (
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                                    onClick={() => revokeLinkMutation.mutate(link.id)}
                                    title="Desativar link"
                                  >
                                    <PowerOff className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-green-50 hover:text-green-600 transition-colors"
                                    onClick={() => activateLinkMutation.mutate(link.id)}
                                    title="Ativar link"
                                  >
                                    <Power className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SystemLayout>
  );
}
