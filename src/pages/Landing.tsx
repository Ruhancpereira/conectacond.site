import { Link } from "react-router-dom";
import { MessageSquare, FileText, ClipboardList, CreditCard, Bell, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import conectacondLogo from "@/assets/conectacond-logo.png";

const features = [
  { icon: MessageSquare, title: "Comunicados", desc: "Envie e receba avisos do condomínio em tempo real." },
  { icon: ClipboardList, title: "Chamados", desc: "Abra e acompanhe solicitações de manutenção." },
  { icon: FileText, title: "Documentos", desc: "Centralize atas, regulamentos e arquivos." },
  { icon: CreditCard, title: "Boletos", desc: "Consulte e acesse segunda via pelo app." },
  { icon: Bell, title: "Notificações", desc: "Alertas de comunicados e atualizações." },
  { icon: Users, title: "Perfis", desc: "Síndico, subsíndico ou condômino – cada um com seu painel." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      <header className="sticky top-0 z-50 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <img src={conectacondLogo} alt="ConectaCond" className="h-9 w-auto" />
            <span className="text-lg font-semibold">
              <span className="text-primary-foreground">Conecta</span>
              <span className="text-primary">Cond</span>
            </span>
          </div>
          <nav className="flex items-center gap-4">
            <a href="#funcionalidades" className="text-sm text-slate-300 hover:text-white">Funcionalidades</a>
            <a href="#sobre" className="text-sm text-slate-300 hover:text-white">Sobre</a>
            <a href="#contato" className="text-sm text-slate-300 hover:text-white">Contato</a>
            <Link to="/system/login">
              <Button variant="default" size="sm" className="gap-2">
                <Shield className="h-4 w-4" />
                Acessar painel
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden px-4 py-20 md:py-28">
          <div className="mx-auto max-w-6xl text-center">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Gestão do seu condomínio{" "}
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                no celular
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
              Comunicados, chamados, boletos e documentos em um só lugar. Para síndicos e condôminos.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link to="/system/login">
                <Button size="lg" className="gap-2 text-base">
                  <Shield className="h-5 w-5" />
                  Acessar painel administrativo
                </Button>
              </Link>
              <a href="#funcionalidades">
                <Button variant="outline" size="lg" className="border-slate-600 text-slate-200 hover:bg-slate-700/50">
                  Conhecer o app
                </Button>
              </a>
            </div>
          </div>
        </section>

        <section id="funcionalidades" className="border-t border-slate-700/50 px-4 py-16 md:py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-3xl font-bold md:text-4xl">Tudo que o condomínio precisa</h2>
            <p className="mt-2 text-center text-slate-400">Funcionalidades pensadas para síndicos e condôminos.</p>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-6 transition hover:border-primary/30 hover:bg-slate-800/80"
                >
                  <div className="mb-4 inline-flex rounded-lg bg-primary/20 p-3 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="mt-1 text-sm text-slate-400">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="sobre" className="border-t border-slate-700/50 px-4 py-16 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold md:text-3xl">Sobre o ConectaCond</h2>
            <p className="mt-4 text-slate-400 leading-relaxed">
              O ConectaCond é um aplicativo de gestão de condomínio que aproxima síndicos e condôminos. Com foco em
              simplicidade e segurança, oferecemos comunicados, chamados, documentos e boletos em um único lugar, com
              notificações para você não perder nenhuma informação importante. Em conformidade com a LGPD.
            </p>
          </div>
        </section>

        <section id="contato" className="border-t border-slate-700/50 px-4 py-16 md:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold md:text-3xl">Pronto para conectar seu condomínio?</h2>
            <p className="mt-2 text-slate-400">Entre em contato para conhecer planos e tirar dúvidas.</p>
            <a
              href="mailto:contato@conectacond.com"
              className="mt-6 inline-block rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:bg-primary/90"
            >
              contato@conectacond.com
            </a>
            <div className="mt-8">
              <Link to="/system/login">
                <Button variant="outline" className="border-slate-600 text-slate-200 hover:bg-slate-700/50">
                  Acessar painel administrativo
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-700/50 px-4 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="font-medium">
            <span className="text-slate-400">Conecta</span>
            <span className="text-primary">Cond</span>
          </span>
          <div className="flex gap-6 text-sm text-slate-400">
            <Link to="/system/login" className="hover:text-white">Admin</Link>
            <a href="mailto:contato@conectacond.com" className="hover:text-white">Contato</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
