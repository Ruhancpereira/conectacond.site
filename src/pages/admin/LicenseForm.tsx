import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { condoService } from '@/services/condoService';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { SystemLayout } from '@/components/layout/SystemLayout';
import { licenseService } from '@/services/licenseService';
import { PlanType } from '@/types';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const licenseSchema = z.object({
  condoId: z.string().min(1, 'Condomínio é obrigatório'),
  planType: z.enum(['basic', 'premium', 'enterprise']),
  duration: z.number().min(1).max(36),
  maxUnits: z.number().min(1),
  maxUsers: z.number().min(1),
  amount: z.number().min(0),
  isTrial: z.boolean().default(false),
  trialDays: z.number().optional(),
  notes: z.string().optional(),
  residentEmails: z.string().optional(),
});

type LicenseFormData = z.infer<typeof licenseSchema>;

const planLimits = {
  basic: { maxUnits: 50, maxUsers: 200, defaultAmount: 299 },
  premium: { maxUnits: 200, maxUsers: 1000, defaultAmount: 599 },
  enterprise: { maxUnits: 9999, maxUsers: 9999, defaultAmount: 1500 },
};

export default function LicenseForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const { data: condos = [] } = useQuery({
    queryKey: ['condos'],
    queryFn: () => condoService.getAll(),
  });

  const { data: license } = useQuery({
    queryKey: ['license', id],
    queryFn: () => licenseService.getLicenseById(id!),
    enabled: isEditing,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<LicenseFormData>({
    resolver: zodResolver(licenseSchema),
    defaultValues: license
      ? {
          condoId: license.condoId,
          planType: license.planType,
          duration: Math.ceil(
            (license.expiryDate.getTime() - license.startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
          ),
          maxUnits: license.maxUnits,
          maxUsers: license.maxUsers,
          amount: license.amount,
          isTrial: license.isTrial,
          trialDays: license.trialDays,
          notes: license.notes,
          residentEmails: (license.residentEmails || []).join('\n'),
        }
      : {
          planType: 'premium',
          duration: 12,
          maxUnits: 200,
          maxUsers: 1000,
          amount: 599,
          isTrial: false,
          residentEmails: '',
        },
  });

  const planType = watch('planType') as PlanType;
  const isTrial = watch('isTrial');

  const parseEmails = (text: string) =>
    text
      .split(/[\n,;]+/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e && e.includes('@'));

  const createMutation = useMutation({
    mutationFn: (data: LicenseFormData) =>
      licenseService.createLicense({
        ...data,
        residentEmails: parseEmails(data.residentEmails || ''),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      toast.success('Licença criada com sucesso');
      navigate('/system/licenses');
    },
    onError: (error) => {
      toast.error('Erro ao criar licença: ' + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<LicenseFormData>) =>
      licenseService.updateLicense(id!, {
        ...data,
        residentEmails: data.residentEmails ? parseEmails(data.residentEmails) : undefined,
      } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      queryClient.invalidateQueries({ queryKey: ['license', id] });
      toast.success('Licença atualizada com sucesso');
      navigate('/system/licenses');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar licença: ' + error.message);
    },
  });

  const onSubmit = (data: LicenseFormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handlePlanChange = (value: PlanType) => {
    setValue('planType', value);
    const limits = planLimits[value];
    setValue('maxUnits', limits.maxUnits);
    setValue('maxUsers', limits.maxUsers);
    setValue('amount', limits.defaultAmount);
  };

  return (
    <SystemLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/system/licenses">
              <Button variant="ghost" size="icon" className="hover:bg-slate-100">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {isEditing ? 'Editar Licença' : 'Nova Licença'}
              </h1>
              <p className="text-slate-600 mt-1">
                {isEditing ? 'Atualize as informações da licença' : 'Crie uma nova licença para um condomínio'}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-200 bg-slate-50/50">
              <CardTitle className="text-lg font-semibold">Informações Básicas</CardTitle>
              <CardDescription>Dados principais da licença</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              <div className="space-y-2">
                <Label htmlFor="condoId" className="text-slate-700 font-medium">Condomínio *</Label>
                <Select
                  value={watch('condoId') ?? ''}
                  onValueChange={(v) => setValue('condoId', v)}
                  disabled={isEditing}
                >
                  <SelectTrigger className="border-slate-300 focus:border-primary">
                    <SelectValue placeholder="Selecione o condomínio" />
                  </SelectTrigger>
                  <SelectContent>
                    {condos.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} {c.adminEmail ? `– ${c.adminEmail}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {condos.length === 0 && !isEditing && (
                  <p className="text-sm text-amber-600">
                    Cadastre um condomínio antes de criar a licença.
                  </p>
                )}
                {errors.condoId && (
                  <p className="text-sm text-red-600 font-medium">{errors.condoId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="planType" className="text-slate-700 font-medium">Plano *</Label>
                <Select value={planType} onValueChange={handlePlanChange}>
                  <SelectTrigger className="border-slate-300 focus:border-primary">
                    <SelectValue placeholder="Selecione o plano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">📦 Básico - R$ 299/mês</SelectItem>
                    <SelectItem value="premium">⭐ Premium - R$ 599/mês</SelectItem>
                    <SelectItem value="enterprise">👑 Enterprise - R$ 1.500/mês</SelectItem>
                  </SelectContent>
                </Select>
                {errors.planType && (
                  <p className="text-sm text-red-600 font-medium">{errors.planType.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxUnits">Máximo de Unidades</Label>
                  <Input
                    id="maxUnits"
                    type="number"
                    {...register('maxUnits', { valueAsNumber: true })}
                    disabled={planType === 'enterprise'}
                  />
                  {planType === 'enterprise' && (
                    <p className="text-xs text-muted-foreground">Ilimitado no plano Enterprise</p>
                  )}
                  {errors.maxUnits && (
                    <p className="text-sm text-destructive">{errors.maxUnits.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxUsers">Máximo de Usuários</Label>
                  <Input
                    id="maxUsers"
                    type="number"
                    {...register('maxUsers', { valueAsNumber: true })}
                    disabled={planType === 'enterprise'}
                  />
                  {planType === 'enterprise' && (
                    <p className="text-xs text-muted-foreground">Ilimitado no plano Enterprise</p>
                  )}
                  {errors.maxUsers && (
                    <p className="text-sm text-destructive">{errors.maxUsers.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-200 bg-slate-50/50">
              <CardTitle className="text-lg font-semibold">Período e Valor</CardTitle>
              <CardDescription>Configure a duração e o valor da licença</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-slate-700 font-medium">Duração (meses) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    {...register('duration', { valueAsNumber: true })}
                    min={1}
                    max={36}
                    className="border-slate-300 focus:border-primary"
                  />
                  {errors.duration && (
                    <p className="text-sm text-red-600 font-medium">{errors.duration.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-slate-700 font-medium">Valor Mensal (R$) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    {...register('amount', { valueAsNumber: true })}
                    className="border-slate-300 focus:border-primary"
                  />
                  {errors.amount && (
                    <p className="text-sm text-red-600 font-medium">{errors.amount.message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-slate-50/50">
                <div className="space-y-0.5">
                  <Label htmlFor="isTrial" className="text-slate-700 font-medium">Período de Teste</Label>
                  <p className="text-sm text-slate-600">
                    Ative para criar uma licença de teste gratuita
                  </p>
                </div>
                <Switch
                  id="isTrial"
                  checked={isTrial}
                  onCheckedChange={(checked) => setValue('isTrial', checked)}
                />
              </div>

              {isTrial && (
                <div className="space-y-2">
                  <Label htmlFor="trialDays">Dias de Teste</Label>
                  <Input
                    id="trialDays"
                    type="number"
                    {...register('trialDays', { valueAsNumber: true })}
                    placeholder="30"
                  />
                  {errors.trialDays && (
                    <p className="text-sm text-destructive">{errors.trialDays.message}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-200 bg-slate-50/50">
              <CardTitle className="text-lg font-semibold">E-mails dos Condôminos</CardTitle>
              <CardDescription>
                Um e-mail por linha. Os condôminos receberão o link para baixar o app e devem usar este e-mail para cadastro/login.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-2">
                <Label htmlFor="residentEmails">Lista de e-mails</Label>
                <Textarea
                  id="residentEmails"
                  {...register('residentEmails')}
                  placeholder="condomino1@email.com&#10;condomino2@email.com&#10;..."
                  rows={6}
                  className="font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-200 bg-slate-50/50">
              <CardTitle className="text-lg font-semibold">Observações</CardTitle>
              <CardDescription>Informações adicionais sobre a licença</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-slate-700 font-medium">Notas</Label>
                <Textarea
                  id="notes"
                  {...register('notes')}
                  placeholder="Digite observações sobre esta licença..."
                  rows={4}
                  className="border-slate-300 focus:border-primary resize-none"
                />
                {errors.notes && (
                  <p className="text-sm text-red-600 font-medium">{errors.notes.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Link to="/system/licenses">
              <Button type="button" variant="outline" className="border-slate-300">
                Cancelar
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 shadow-md min-w-[160px]"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Salvando...' : isEditing ? 'Atualizar Licença' : 'Criar Licença'}
            </Button>
          </div>
        </form>
      </div>
    </SystemLayout>
  );
}
