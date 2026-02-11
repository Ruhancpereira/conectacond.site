import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SystemLayout } from '@/components/layout/SystemLayout';
import { condoService } from '@/services/condoService';
import { toast } from 'sonner';

const condoSchema = z.object({
  id: z.string().min(1, 'Identificador é obrigatório').regex(/^[a-z0-9-]+$/, 'Use apenas letras minúsculas, números e hífens'),
  name: z.string().min(1, 'Nome é obrigatório'),
  address: z.string().min(1, 'Endereço é obrigatório'),
  cnpj: z.string().optional(),
  adminEmail: z.string().min(1, 'E-mail do síndico é obrigatório').email('E-mail inválido'),
});

type CondoFormData = z.infer<typeof condoSchema>;

export default function CondoForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id && id !== 'new';

  const { data: condo } = useQuery({
    queryKey: ['condo', id],
    queryFn: () => condoService.getById(id!),
    enabled: isEditing,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CondoFormData>({
    resolver: zodResolver(condoSchema),
    defaultValues: { id: '', name: '', address: '', cnpj: '', adminEmail: '' },
  });

  useEffect(() => {
    if (condo) {
      reset({
        id: condo.id,
        name: condo.name,
        address: condo.address,
        cnpj: condo.cnpj ?? '',
        adminEmail: condo.adminEmail ?? '',
      });
    }
  }, [condo, reset]);

  const createMutation = useMutation({
    mutationFn: (data: CondoFormData) =>
      condoService.create({
        id: data.id,
        name: data.name,
        address: data.address,
        cnpj: data.cnpj || undefined,
        adminEmail: data.adminEmail,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['condos'] });
      toast.success('Condomínio cadastrado com sucesso');
      navigate('/system/condos');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: (data: CondoFormData) =>
      condoService.update(id!, {
        name: data.name,
        address: data.address,
        cnpj: data.cnpj || undefined,
        adminEmail: data.adminEmail,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['condos'] });
      queryClient.invalidateQueries({ queryKey: ['condo', id] });
      toast.success('Condomínio atualizado');
      navigate('/system/condos');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const onSubmit = (data: CondoFormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const onInvalid = (errs: Partial<Record<keyof CondoFormData, { message?: string }>>) => {
    const firstError = Object.keys(errors)[0] ?? Object.keys(errs)[0];
    if (firstError) {
      toast.error('Verifique os campos destacados e corrija os erros.');
      document.getElementById(firstError)?.focus?.();
    }
  };

  return (
    <SystemLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/system/condos">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {isEditing ? 'Editar Condomínio' : 'Novo Condomínio'}
              </h1>
              <p className="text-slate-600 mt-1">
                {isEditing
                  ? 'Atualize os dados do condomínio'
                  : 'Cadastre o condomínio e o e-mail do síndico (mesmo usado no app)'}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
          <Card>
            <CardHeader>
              <CardTitle>Dados do Condomínio</CardTitle>
              <CardDescription>
                O e-mail do síndico deve ser o mesmo que será usado no app para login
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="id">Identificador *</Label>
                <Input
                  id="id"
                  {...register('id')}
                  placeholder="ex: residencial-vista-mar"
                  disabled={isEditing}
                />
                {errors.id && <p className="text-sm text-destructive">{errors.id.message}</p>}
                {!isEditing && (
                  <p className="text-xs text-muted-foreground">
                    Use letras minúsculas, números e hífens. Ex: residencial-vista-mar
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nome do Condomínio *</Label>
                <Input id="name" {...register('name')} placeholder="Residencial Vista Mar" />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Endereço *</Label>
                <Input
                  id="address"
                  {...register('address')}
                  placeholder="Rua das Flores, 100 - Bairro"
                />
                {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input id="cnpj" {...register('cnpj')} placeholder="00.000.000/0001-00" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminEmail">E-mail do Síndico *</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  {...register('adminEmail')}
                  placeholder="sindico@email.com"
                />
                {errors.adminEmail && <p className="text-sm text-destructive">{errors.adminEmail.message}</p>}
                <p className="text-xs text-muted-foreground">
                  O síndico usará este e-mail para se cadastrar e fazer login no app
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 mt-6">
            <Link to="/system/condos">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Salvando...' : isEditing ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </div>
    </SystemLayout>
  );
}
