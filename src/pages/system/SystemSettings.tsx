import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Moon, Sun, Users, Mail, KeyRound, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
import { SystemLayout } from '@/components/layout/SystemLayout';
import { useTheme } from '@/contexts/ThemeContext';
import { getAllProfiles, type ProfileRow } from '@/services/userService';
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
  const [passwordEmail, setPasswordEmail] = useState('');
  const [sendingReset, setSendingReset] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<ProfileRow | null>(null);

  const { data: profiles = [], isLoading: loadingProfiles } = useQuery({
    queryKey: ['profiles-all'],
    queryFn: () => getAllProfiles(),
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
              Listar usuários e enviar link para redefinição de senha. Adicionar ou remover usuários requer uso do Supabase Dashboard (Authentication) ou uma Edge Function com service role.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                      <TableHead>Condomínio</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profiles.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell>{p.email}</TableCell>
                        <TableCell>{roleLabel[p.role] ?? p.role}</TableCell>
                        <TableCell className="text-muted-foreground">{p.condo_id ?? '—'}</TableCell>
                        <TableCell className="text-right">
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
    </SystemLayout>
  );
}
