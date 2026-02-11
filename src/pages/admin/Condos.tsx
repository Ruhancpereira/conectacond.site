import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Building2, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SystemLayout } from '@/components/layout/SystemLayout';
import { condoService } from '@/services/condoService';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function Condos() {
  const queryClient = useQueryClient();

  const { data: condos = [], isLoading } = useQuery({
    queryKey: ['condos'],
    queryFn: () => condoService.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => condoService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['condos'] });
      toast.success('Condomínio removido');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <SystemLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Condomínios</h1>
            <p className="text-slate-600 mt-1">
              Cadastre os condomínios antes de criar licenças
            </p>
          </div>
          <Link to="/system/condos/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Condomínio
            </Button>
          </Link>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-slate-500">Carregando...</div>
          ) : condos.length === 0 ? (
            <div className="p-12 text-center">
              <Building2 className="h-12 w-12 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-600">Nenhum condomínio cadastrado</p>
              <Link to="/system/condos/new">
                <Button variant="outline" className="mt-4">
                  Cadastrar primeiro condomínio
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead>E-mail do Síndico</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[120px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {condos.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-slate-600">{c.address}</TableCell>
                    <TableCell className="text-slate-600">
                      {c.adminEmail || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={c.isActive ? 'default' : 'secondary'}>
                        {c.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link to={`/system/condos/${c.id}/edit`}>
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remover condomínio?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. O condomínio e dados vinculados serão removidos.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => deleteMutation.mutate(c.id)}
                              >
                                Remover
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </SystemLayout>
  );
}
