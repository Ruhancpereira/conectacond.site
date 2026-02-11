import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, Smartphone, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SystemLayout } from '@/components/layout/SystemLayout';
import { licenseService } from '@/services/licenseService';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const downloadLinkSchema = z.object({
  platform: z.enum(['ios', 'android', 'both']),
  maxUses: z.number().min(1).max(10000),
  expiryDays: z.number().min(1).max(365),
});

type DownloadLinkFormData = z.infer<typeof downloadLinkSchema>;

export default function DownloadLinkForm() {
  const { id: licenseId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: license } = useQuery({
    queryKey: ['license', licenseId],
    queryFn: () => licenseService.getLicenseById(licenseId!),
    enabled: !!licenseId,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<DownloadLinkFormData>({
    resolver: zodResolver(downloadLinkSchema),
    defaultValues: {
      platform: 'both',
      maxUses: 100,
      expiryDays: 30,
    },
  });

  const platform = watch('platform');

  const createMutation = useMutation({
    mutationFn: (data: DownloadLinkFormData) => {
      if (!licenseId || !license) {
        throw new Error('Licença não encontrada');
      }
      return licenseService.generateDownloadLink({
        licenseId,
        condoId: license.condoId,
        platform: data.platform,
        maxUses: data.maxUses,
        expiryDays: data.expiryDays,
      });
    },
    onSuccess: (link) => {
      queryClient.invalidateQueries({ queryKey: ['downloadLinks', licenseId] });
      queryClient.invalidateQueries({ queryKey: ['license', licenseId] });
      toast.success('Link de download criado com sucesso!');
      navigate(`/system/licenses/${licenseId}`);
    },
    onError: (error) => {
      toast.error('Erro ao criar link: ' + (error as Error).message);
    },
  });

  const onSubmit = (data: DownloadLinkFormData) => {
    createMutation.mutate(data);
  };

  if (!license) {
    return (
      <SystemLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Carregando licença...</p>
          </div>
        </div>
      </SystemLayout>
    );
  }

  return (
    <SystemLayout>
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-4">
            <Link to={`/system/licenses/${licenseId}`}>
              <Button variant="ghost" size="icon" className="hover:bg-slate-100">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-primary to-slate-900 bg-clip-text text-transparent">
                Novo Link de Download
              </h1>
              <p className="text-slate-600 mt-1">Gere um link para compartilhar o app com os condôminos</p>
            </div>
          </div>
        </div>

        <Card className="border-2 border-slate-200 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300">
          <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-50/80 to-white/50 backdrop-blur-sm">
            <CardTitle className="text-xl font-semibold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Informações do Link
            </CardTitle>
            <CardDescription>
              Licença: <span className="font-mono font-semibold">{license.licenseKey}</span> - Condomínio: <span className="font-semibold">{license.condoId}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="platform" className="text-slate-700 font-medium flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Plataforma *
                </Label>
                <Select value={platform} onValueChange={(value) => setValue('platform', value as 'ios' | 'android' | 'both')}>
                  <SelectTrigger className="border-slate-300 focus:border-primary h-12">
                    <SelectValue placeholder="Selecione a plataforma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="both">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <span>Ambas (iOS e Android)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="ios">
                      <div className="flex items-center gap-2">
                        <span>🍎</span>
                        <span>iOS (Apple)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="android">
                      <div className="flex items-center gap-2">
                        <span>🤖</span>
                        <span>Android (Google)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.platform && (
                  <p className="text-sm text-red-600 font-medium">{errors.platform.message}</p>
                )}
                <p className="text-xs text-slate-500 mt-1">
                  Selecione para qual plataforma o link será válido
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxUses" className="text-slate-700 font-medium">
                    Máximo de Usos *
                  </Label>
                  <Input
                    id="maxUses"
                    type="number"
                    {...register('maxUses', { valueAsNumber: true })}
                    min={1}
                    max={10000}
                    className="border-slate-300 focus:border-primary h-12"
                    placeholder="100"
                  />
                  {errors.maxUses && (
                    <p className="text-sm text-red-600 font-medium">{errors.maxUses.message}</p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">
                    Quantas vezes o link pode ser usado para download
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryDays" className="text-slate-700 font-medium">
                    Validade (dias) *
                  </Label>
                  <Input
                    id="expiryDays"
                    type="number"
                    {...register('expiryDays', { valueAsNumber: true })}
                    min={1}
                    max={365}
                    className="border-slate-300 focus:border-primary h-12"
                    placeholder="30"
                  />
                  {errors.expiryDays && (
                    <p className="text-sm text-red-600 font-medium">{errors.expiryDays.message}</p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">
                    Quantos dias o link ficará válido
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 border-2 border-blue-200 rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2 text-lg">
                  <Globe className="h-5 w-5" />
                  Informações do Link
                </h3>
                <div className="space-y-3 text-sm text-blue-800">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">•</span>
                    <p className="flex-1">O link será gerado automaticamente após a criação com um token único e seguro</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">•</span>
                    <p className="flex-1">Você poderá copiar e compartilhar o link com os condôminos via WhatsApp, e-mail, etc.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">•</span>
                    <p className="flex-1">
                      O link expirará após <span className="font-bold text-blue-900">{watch('expiryDays') || 30} dias</span> ou <span className="font-bold text-blue-900">{watch('maxUses') || 100} usos</span>
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">•</span>
                    <p className="flex-1">Você pode ativar/desativar o link a qualquer momento na página de detalhes da licença</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <Link to={`/system/licenses/${licenseId}`}>
                  <Button type="button" variant="outline" className="border-slate-300">
                    Cancelar
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 transition-all duration-300 hover:scale-105 text-white font-semibold min-w-[160px]"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Gerando...' : 'Gerar Link'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </SystemLayout>
  );
}
