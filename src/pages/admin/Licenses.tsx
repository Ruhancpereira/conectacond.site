import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, MoreVertical, Eye, Edit, Ban, CheckCircle, Clock, XCircle, FileText, Download, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SystemLayout } from '@/components/layout/SystemLayout';
import { licenseService } from '@/services/licenseService';
import { License, LicenseStatus, PlanType } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

const statusConfig: Record<LicenseStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; color: string }> = {
  active: { label: 'Ativa', variant: 'default', color: 'bg-green-100 text-green-800 border-green-200' },
  expired: { label: 'Expirada', variant: 'destructive', color: 'bg-red-100 text-red-800 border-red-200' },
  trial: { label: 'Trial', variant: 'secondary', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  suspended: { label: 'Suspensa', variant: 'destructive', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  cancelled: { label: 'Cancelada', variant: 'outline', color: 'bg-gray-100 text-gray-800 border-gray-200' },
};

const planConfig: Record<PlanType, { label: string; color: string; icon: string }> = {
  basic: { label: 'Básico', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: '📦' },
  premium: { label: 'Premium', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: '⭐' },
  enterprise: { label: 'Enterprise', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: '👑' },
};

const paymentStatusConfig: Record<string, { label: string; color: string }> = {
  paid: { label: 'Pago', color: 'bg-green-100 text-green-800' },
  pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
  overdue: { label: 'Atrasado', color: 'bg-red-100 text-red-800' },
  cancelled: { label: 'Cancelado', color: 'bg-gray-100 text-gray-800' },
};

export default function Licenses() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<LicenseStatus | 'all'>('all');
  const [planFilter, setPlanFilter] = useState<PlanType | 'all'>('all');
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: licenses = [], isLoading } = useQuery({
    queryKey: ['licenses'],
    queryFn: () => licenseService.getAllLicenses(),
  });

  const suspendMutation = useMutation({
    mutationFn: (id: string) => licenseService.suspendLicense(id, 'Suspenso pelo administrador'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      toast.success('Licença suspensa com sucesso');
    },
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => licenseService.activateLicense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      toast.success('Licença ativada com sucesso');
    },
  });

  const filteredLicenses = licenses.filter(license => {
    const matchesSearch = 
      license.licenseKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
      license.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      license.condoId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || license.status === statusFilter;
    const matchesPlan = planFilter === 'all' || license.planType === planFilter;
    
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const stats = {
    total: licenses.length,
    active: licenses.filter(l => l.status === 'active').length,
    expired: licenses.filter(l => l.status === 'expired').length,
    trial: licenses.filter(l => l.status === 'trial').length,
    totalRevenue: licenses.reduce((sum, l) => sum + (l.paymentStatus === 'paid' ? l.amount : 0), 0),
  };

  const getDaysUntilExpiry = (expiryDate: Date) => {
    const days = Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <SystemLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between animate-in slide-in-from-bottom-4 duration-500">
          <div>
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent drop-shadow-lg">
              Gestão de Licenças
            </h1>
            <p className="text-slate-600 mt-2 text-lg">Gerencie todas as licenças de condomínios</p>
          </div>
          <Link to="/system/licenses/new">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-700 hover:via-purple-700 hover:to-blue-700 shadow-2xl shadow-purple-500/40 hover:shadow-purple-500/60 transition-all duration-300 hover:scale-110 text-white font-bold text-lg px-8 py-6"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nova Licença
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card 
            className="border-2 border-blue-200 shadow-2xl hover:shadow-blue-300/50 hover:-translate-y-2 transition-all duration-500 bg-gradient-to-br from-blue-50 via-white to-blue-50/30 backdrop-blur-md" 
            style={{ 
              animation: 'fadeIn 0.6s ease-out',
              borderColor: '#93c5fd',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 2px rgba(59, 130, 246, 0.2)'
            }}
          >
            <CardContent className="p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-200/60 rounded-full blur-3xl -mr-20 -mt-20 animate-pulse" />
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-sm font-semibold text-blue-700 mb-3 uppercase tracking-wide">Total</p>
                  <p className="text-4xl font-extrabold text-blue-900 drop-shadow-sm">{stats.total}</p>
                </div>
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 hover:scale-125 transition-transform duration-300">
                  <FileText className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-green-300 shadow-2xl hover:shadow-green-400/50 hover:-translate-y-2 transition-all duration-500 bg-gradient-to-br from-green-50 via-emerald-50 to-green-100/50 backdrop-blur-md" style={{ animation: 'fadeIn 0.7s ease-out' }}>
            <CardContent className="p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-green-300/60 rounded-full blur-3xl -mr-20 -mt-20 animate-pulse" />
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-sm font-semibold text-green-700 mb-3 uppercase tracking-wide">Ativas</p>
                  <p className="text-4xl font-extrabold text-green-800 drop-shadow-sm">{stats.active}</p>
                </div>
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30 hover:scale-125 transition-transform duration-300">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-red-300 shadow-2xl hover:shadow-red-400/50 hover:-translate-y-2 transition-all duration-500 bg-gradient-to-br from-red-50 via-rose-50 to-red-100/50 backdrop-blur-md" style={{ animation: 'fadeIn 0.8s ease-out' }}>
            <CardContent className="p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-red-300/60 rounded-full blur-3xl -mr-20 -mt-20 animate-pulse" />
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-sm font-semibold text-red-700 mb-3 uppercase tracking-wide">Expiradas</p>
                  <p className="text-4xl font-extrabold text-red-800 drop-shadow-sm">{stats.expired}</p>
                </div>
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30 hover:scale-125 transition-transform duration-300">
                  <XCircle className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-yellow-300 shadow-2xl hover:shadow-yellow-400/50 hover:-translate-y-2 transition-all duration-500 bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100/50 backdrop-blur-md" style={{ animation: 'fadeIn 0.9s ease-out' }}>
            <CardContent className="p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-300/60 rounded-full blur-3xl -mr-20 -mt-20 animate-pulse" />
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-sm font-semibold text-yellow-700 mb-3 uppercase tracking-wide">Trial</p>
                  <p className="text-4xl font-extrabold text-yellow-800 drop-shadow-sm">{stats.trial}</p>
                </div>
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/30 hover:scale-125 transition-transform duration-300">
                  <Clock className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-purple-300 shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:-translate-y-2 transition-all duration-500 bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100/50 backdrop-blur-md" style={{ animation: 'fadeIn 1s ease-out' }}>
            <CardContent className="p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-purple-300/60 rounded-full blur-3xl -mr-20 -mt-20 animate-pulse" />
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-sm font-semibold text-purple-700 mb-3 uppercase tracking-wide">Receita Mensal</p>
                  <p className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent drop-shadow-sm">
                    R$ {stats.totalRevenue.toFixed(2)}
                  </p>
                </div>
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30 hover:scale-125 transition-transform duration-300">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border border-slate-200/80 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300">
          <CardHeader className="border-b border-slate-200/80 bg-gradient-to-r from-slate-50/80 to-white/50 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Lista de Licenças
              </CardTitle>
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    placeholder="Buscar por chave, contrato ou condomínio..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-80 border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  />
                </div>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as LicenseStatus | 'all')}>
                  <SelectTrigger className="w-40 border-slate-300">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="active">Ativas</SelectItem>
                    <SelectItem value="expired">Expiradas</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="suspended">Suspensas</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={planFilter} onValueChange={(value) => setPlanFilter(value as PlanType | 'all')}>
                  <SelectTrigger className="w-40 border-slate-300">
                    <SelectValue placeholder="Plano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Planos</SelectItem>
                    <SelectItem value="basic">Básico</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-slate-600">Carregando licenças...</p>
                </div>
              </div>
            ) : filteredLicenses.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 font-medium">Nenhuma licença encontrada</p>
                <p className="text-sm text-slate-500 mt-1">
                  {searchTerm || statusFilter !== 'all' || planFilter !== 'all' 
                    ? 'Tente ajustar os filtros de busca' 
                    : 'Crie sua primeira licença'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableHead className="font-semibold text-slate-700">Chave da Licença</TableHead>
                      <TableHead className="font-semibold text-slate-700">Condomínio</TableHead>
                      <TableHead className="font-semibold text-slate-700">Plano</TableHead>
                      <TableHead className="font-semibold text-slate-700">Status</TableHead>
                      <TableHead className="font-semibold text-slate-700">Expiração</TableHead>
                      <TableHead className="font-semibold text-slate-700">Valor</TableHead>
                      <TableHead className="font-semibold text-slate-700">Pagamento</TableHead>
                      <TableHead className="font-semibold text-slate-700">Downloads</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLicenses.map((license) => {
                      const status = statusConfig[license.status];
                      const plan = planConfig[license.planType];
                      const payment = paymentStatusConfig[license.paymentStatus];
                      const daysUntilExpiry = getDaysUntilExpiry(license.expiryDate);
                      const isExpired = license.expiryDate < new Date();
                      const isExpiringSoon = !isExpired && daysUntilExpiry <= 30;

                      return (
                        <TableRow 
                          key={license.id} 
                          className="hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent transition-all duration-200 cursor-pointer group border-b border-slate-100"
                          onClick={() => navigate(`/system/licenses/${license.id}`)}
                        >
                          <TableCell className="font-medium">
                            <div className="group-hover:translate-x-1 transition-transform duration-200">
                              <div className="font-mono text-sm text-slate-900 font-semibold">{license.licenseKey}</div>
                              <div className="text-xs text-slate-500 font-mono">{license.contractNumber}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-slate-900 font-medium group-hover:text-primary transition-colors">
                              {license.condoId}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${plan.color} border font-medium shadow-sm hover:shadow-md transition-shadow`}>
                              {plan.icon} {plan.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${status.color} border font-medium shadow-sm hover:shadow-md transition-shadow`}>
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className={`text-sm font-medium ${
                                isExpired ? 'text-red-600' : 
                                isExpiringSoon ? 'text-yellow-600' : 
                                'text-slate-900'
                              }`}>
                                {format(license.expiryDate, "dd/MM/yyyy", { locale: ptBR })}
                              </div>
                              {!isExpired && (
                                <div className="text-xs text-slate-500">
                                  {daysUntilExpiry} {daysUntilExpiry === 1 ? 'dia' : 'dias'}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-slate-900 font-semibold">R$ {license.amount.toFixed(2)}</span>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${payment.color} border font-medium`}>
                              {payment.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-slate-700">
                                {license.downloadCount}/{license.maxDownloads}
                              </span>
                              <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full transition-all"
                                  style={{ width: `${Math.min((license.downloadCount / license.maxDownloads) * 100, 100)}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-all duration-200"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem 
                                  className="cursor-pointer"
                                  onClick={() => navigate(`/system/licenses/${license.id}`)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Ver Detalhes
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="cursor-pointer"
                                  onClick={() => navigate(`/system/licenses/${license.id}/edit`)}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {license.isActive ? (
                                  <DropdownMenuItem 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      suspendMutation.mutate(license.id);
                                    }}
                                    className="cursor-pointer text-orange-600"
                                  >
                                    <Ban className="h-4 w-4 mr-2" />
                                    Suspender
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      activateMutation.mutate(license.id);
                                    }}
                                    className="cursor-pointer text-green-600"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Ativar
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
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
      </div>
    </SystemLayout>
  );
}
