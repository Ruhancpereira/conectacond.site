import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Moon, Sun, Users, Mail, KeyRound, Loader2, Building2, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SystemLayout } from '@/components/layout/SystemLayout';
import { useTheme } from '@/contexts/ThemeContext';
import { getAllProfiles, updateProfileCondo, type ProfileRow } from '@/services/userService';
import { condoService } from '@/services/condoService';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const roleLabel: Record<string, string> = {
  superAdmin: 'Super admin',
  admin: 'Síndico',
  subAdmin: 'Sub-síndico',
  resident: 'Morador',
};

export default function SystemSettings() {
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const [passwordEmail, setPasswordEmail] = useState('');
  const [sendingReset, setSendingReset] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<ProfileRow | null>(null);

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignProfile, setAssignProfile] = useState<ProfileRow | null>(null);
  const [assignCondoId, setAssignCondoId] = useState<string>('');
  const [assignUnit, setAssignUnit] = useState('');

  const [addUserEmail, setAddUserEmail] = useState('');
  const [addUserCondoId, setAddUserCondoId] = useState('');
  const [addUserUnit, setAddUserUnit] = useState('');

  const { data: profiles = [], isLoading: loadingProfiles } = useQuery({
    queryKey: ['profiles-all'],
    queryFn: () => getAllProfiles(),
  });

  const { data: condos = [] } = useQuery({
    queryKey: ['condos'],
    queryFn: () => condoService.getAll(),
  });

  const updateCondoMutation = useMutation({
    mutationFn: ({
      profileId,
      condoId,
      unit,
    }: {
      profileId: string;
      condoId: string | null;
      unit: string | null;
    }) => updateProfileCondo(profileId, condoId, unit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles-all'] });
      toast.success('Empreendimento e unidade atualizados.');
      setAssignDialogOpen(false);
      setAssignProfile(null);
      setAssignCondoId('');
      setAssignUnit('');
      setAddUserEmail('');
      setAddUserCondoId('');
      setAddUserUnit('');
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Erro ao atualizar.'),
  });

  const handleRequestPasswordReset = async () => {
    const email = selectedProfile?.email ?? passwordEmail.trim();
    if (!email) {
      toast.error('Informe o e-mail do usuário.');
      return;
    }
    setSendingReset(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success(`E-mail de redefinição de senha enviado para ${email}`);
      setResetDialogOpen(false);
      setSelectedProfile(null);
      setPasswordEmail('');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao enviar e-mail de redefinição.');
    } finally {
      setSendingReset(false);
    }
  };

  const openResetDialog = (profile?: ProfileRow) => {
    if (profile) {
      setSelectedProfile(profile);
      setPasswordEmail(profile.email);
    } else {
      setSelectedProfile(null);
      setPasswordEmail('');
    }
    setResetDialogOpen(true);
  };

  const NONE_CONDO = '__none__';

  const openAssignDialog = (profile: ProfileRow) => {
    setAssignProfile(profile);
    setAssignCondoId(profile.condo_id && profile.condo_id.trim() ? profile.condo_id : NONE_CONDO);
    setAssignUnit(profile.unit ?? '');
    setAssignDialogOpen(true);
  };

  const handleAssignSubmit = () => {
    if (!assignProfile) return;
    const condoId = assignCondoId === NONE_CONDO || !assignCondoId.trim() ? null : assignCondoId.trim();
    const unit = assignUnit.trim() || null;
    updateCondoMutation.mutate({ profileId: assignProfile.id, condoId, unit });
  };

  const handleAddUserToCondo = () => {
    const email = addUserEmail.trim().toLowerCase();
    if (!email) {
      toast.error('Informe o e-mail do usuário.');
      return;
    }
    const condoId = addUserCondoId.trim() || null;
    const unit = addUserUnit.trim() || null;
    const profile = profiles.find((p) => p.email.toLowerCase() === email);
    if (!profile) {
      toast.error('Nenhum usuário encontrado com este e-mail. O usuário precisa estar cadastrado no sistema.');
      return;
    }
    updateCondoMutation.mutate({ profileId: profile.id, condoId, unit });
  };

  return (
    <SystemLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground mt-1">Aparência e gestão de usuários</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5" />
              Aparência
            </CardTitle>
            <CardDescription>Ativar modo escuro (dark mode) no painel.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Moon className="h-5 w-5 text-muted-foreground" />
            <Switch
              id="dark-mode"
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
            <Sun className="h-5 w-5 text-muted-foreground" />
            <Label htmlFor="dark-mode" className="text-sm text-muted-foreground">
              {theme === 'dark' ? 'Modo escuro ativado' : 'Modo claro'}
            </Label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Usuários
            </CardTitle>
            <CardDescription>
              Listar usuários, atribuir empreendimento e unidade, e enviar link para redefinição de senha.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border bg-muted/30 dark:bg-muted/10 p-4 space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Adicionar usuário a um empreendimento
              </h4>
              <p className="text-sm text-muted-foreground">
                Informe o e-mail de um usuário já cadastrado, selecione o empreendimento e a unidade. O usuário passará a estar vinculado a esse condomínio.
              </p>
              <div className="flex flex-wrap items-end gap-3">
                <div className="space-y-2 min-w-[200px]">
                  <Label htmlFor="add-user-email">E-mail do usuário</Label>
                  <Input
                    id="add-user-email"
                    type="email"
                    placeholder="usuario@exemplo.com"
                    value={addUserEmail}
                    onChange={(e) => setAddUserEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2 min-w-[220px]">
                  <Label htmlFor="add-user-condo">Empreendimento</Label>
                  <Select value={addUserCondoId} onValueChange={setAddUserCondoId}>
                    <SelectTrigger id="add-user-condo">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {condos.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 w-[120px]">
                  <Label htmlFor="add-user-unit">Unidade</Label>
                  <Input
                    id="add-user-unit"
                    placeholder="Ex: 101"
                    value={addUserUnit}
                    onChange={(e) => setAddUserUnit(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleAddUserToCondo}
                  disabled={updateCondoMutation.isPending}
                >
                  {updateCondoMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <UserPlus className="h-4 w-4 mr-2" />
                  )}
                  Vincular
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => openResetDialog()}>
                <KeyRound className="h-4 w-4 mr-2" />
                Solicitar nova senha (informar e-mail)
              </Button>
            </div>

            {loadingProfiles ? (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando usuários...
              </p>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Perfil</TableHead>
                      <TableHead>Empreendimento</TableHead>
                      <TableHead>Unidade</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profiles.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell>{p.email}</TableCell>
                        <TableCell>{roleLabel[p.role] ?? p.role}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {p.condo_id ? condos.find((c) => c.id === p.condo_id)?.name ?? p.condo_id : '—'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{p.unit ?? '—'}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openAssignDialog(p)}
                            className="mr-1"
                          >
                            <Building2 className="h-4 w-4 mr-1" />
                            Atribuir
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openResetDialog(p)}
                            className="text-primary hover:text-primary"
                          >
                            <KeyRound className="h-4 w-4 mr-1" />
                            Nova senha
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Solicitar nova senha</AlertDialogTitle>
            <AlertDialogDescription>
              Um e-mail com link para redefinir a senha será enviado ao usuário. O link expira em algumas horas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="reset-email">E-mail</Label>
            <input
              id="reset-email"
              type="email"
              value={passwordEmail}
              onChange={(e) => setPasswordEmail(e.target.value)}
              placeholder="usuario@exemplo.com"
              className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!!selectedProfile}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleRequestPasswordReset();
              }}
              disabled={sendingReset}
            >
              {sendingReset ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar e-mail
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atribuir empreendimento e unidade</DialogTitle>
            <DialogDescription>
              {assignProfile
                ? `Vincular ${assignProfile.name} (${assignProfile.email}) a um empreendimento e definir a unidade.`
                : 'Selecione o empreendimento e informe a unidade.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="assign-condo">Empreendimento</Label>
              <Select value={assignCondoId || NONE_CONDO} onValueChange={setAssignCondoId}>
                <SelectTrigger id="assign-condo">
                  <SelectValue placeholder="Selecione o empreendimento..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_CONDO}>Nenhum</SelectItem>
                  {condos.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assign-unit">Unidade</Label>
              <Input
                id="assign-unit"
                placeholder="Ex: 101, Bloco A"
                value={assignUnit}
                onChange={(e) => setAssignUnit(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAssignSubmit}
              disabled={updateCondoMutation.isPending}
            >
              {updateCondoMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Building2 className="h-4 w-4 mr-2" />
              )}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SystemLayout>
  );
}
