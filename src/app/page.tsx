'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Palette,
  FileText,
  Calendar,
  ShieldCheck,
  Users,
  ClipboardList,
  ArrowRight,
  LogIn,
  UserPlus,
  Check,
  Menu,
  X,
  MapPin,
  Mail,
  Phone,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const FEATURES = [
  {
    icon: Palette,
    title: 'Editor Visual de Flyers',
    desc: 'Crie participações de falecimento e flyers elegantes com modelos profissionais prontos a personalizar.',
  },
  {
    icon: Calendar,
    title: 'Gestão de Funerais',
    desc: 'Registe serviços, acompanhe o estado das cerimónias e coordene a agenda da sua agência.',
  },
  {
    icon: FileText,
    title: 'Gestão Documental',
    desc: 'Centralize documentos em conformidade com o RGPD e aceda ao histórico completo dos processos.',
  },
  {
    icon: Users,
    title: 'Condolências & Publicações',
    desc: 'Publique participações públicas com páginas de condolências e QR codes para familiares e amigos.',
  },
  {
    icon: ClipboardList,
    title: 'Relatórios & Analytics',
    desc: 'Acompanhe métricas, exporte relatórios e tome decisões com dados concretos da sua agência.',
  },
  {
    icon: ShieldCheck,
    title: 'Multi-Agência Segura',
    desc: 'Plataforma SaaS multi-agência com autenticação segura e controlo de acessos por perfil.',
  },
];

const STEPS = [
  { n: '01', title: 'Crie a sua agência', desc: 'Registe e configure o perfil da sua agência funerária.' },
  { n: '02', title: 'Registe os serviços', desc: 'Adicione funerais, datas e cerimónias de forma organizada.' },
  { n: '03', title: 'Publique e partilhe', desc: 'Gere flyers e participações e partilhe com quem importa.' },
];

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace('/dashboard');
    }
  }, [user, router]);

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col overflow-x-hidden">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-navy-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-gold-600 via-gold-500 to-amber-300 p-0.5 shadow-lg shadow-gold-500/10">
              <div className="w-full h-full bg-navy-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-gold-400" />
              </div>
            </div>
            <span className="font-serif font-bold text-lg text-white tracking-wide">
              Fune<span className="gold-gradient-text">SAS</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-7 text-xs font-semibold text-navy-300">
            <a href="#funcionalidades" className="hover:text-gold-300 transition-colors">Funcionalidades</a>
            <a href="#como-funciona" className="hover:text-gold-300 transition-colors">Como Funciona</a>
            <a href="#sobre" className="hover:text-gold-300 transition-colors">Sobre</a>
          </nav>

          <div className="hidden md:flex items-center space-x-3">
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl border border-navy-700 hover:border-gold-500/40 text-navy-200 hover:text-white font-semibold text-xs flex items-center space-x-2 transition-all"
            >
              <LogIn className="w-3.5 h-3.5 text-gold-400" />
              <span>Entrar</span>
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-gold-500 to-amber-400 hover:from-gold-400 hover:to-amber-300 text-navy-950 font-bold text-xs flex items-center space-x-2 shadow-lg shadow-gold-500/10 transition-all"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Registar Agência</span>
            </Link>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg bg-navy-800 hover:bg-navy-700 text-navy-300 border border-navy-700"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-white/5 bg-navy-950/95 backdrop-blur-md px-4 py-4 space-y-3">
            <a href="#funcionalidades" onClick={() => setMenuOpen(false)} className="block text-sm font-semibold text-navy-200">Funcionalidades</a>
            <a href="#como-funciona" onClick={() => setMenuOpen(false)} className="block text-sm font-semibold text-navy-200">Como Funciona</a>
            <a href="#sobre" onClick={() => setMenuOpen(false)} className="block text-sm font-semibold text-navy-200">Sobre</a>
            <div className="flex gap-3 pt-2">
              <Link
                href="/login"
                className="flex-1 px-4 py-2.5 rounded-xl border border-navy-700 text-navy-200 font-semibold text-xs flex items-center justify-center space-x-2"
              >
                <LogIn className="w-3.5 h-3.5 text-gold-400" />
                <span>Entrar</span>
              </Link>
              <Link
                href="/login"
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-400 text-navy-950 font-bold text-xs flex items-center justify-center space-x-2"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Registar</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-gold-500/10 blur-3xl" />
          <div className="absolute top-40 -left-32 w-96 h-96 rounded-full bg-navy-600/30 blur-3xl" />
          <div className="absolute bottom-0 -right-32 w-96 h-96 rounded-full bg-gold-500/5 blur-3xl" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-300 text-xs font-semibold mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Plataforma SaaS Funerária Multi-Agência</span>
          </div>

          <h1 className="font-serif font-bold text-4xl md:text-6xl tracking-tight text-white leading-tight">
            Digitalize os processos da sua{' '}
            <span className="gold-gradient-text">agência funerária</span>
          </h1>

          <p className="max-w-2xl mx-auto mt-6 text-base md:text-lg text-navy-300 leading-relaxed">
            FuneSAS reúne gestão de funerais, editor visual de participações e flyers, gestão documental e
            publicações públicas numa única plataforma moderna e segura.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="group w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-gold-500 to-amber-400 hover:from-gold-400 hover:to-amber-300 text-navy-950 font-bold text-sm flex items-center justify-center space-x-2 shadow-2xl shadow-gold-500/20 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Registar Agência</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-navy-900/80 border border-navy-700 hover:border-gold-500/40 text-white font-semibold text-sm flex items-center justify-center space-x-2 transition-all"
            >
              <LogIn className="w-4 h-4 text-gold-400" />
              <span>Entrar no Painel</span>
            </Link>
          </div>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { value: '1000+', label: 'Processos digitalizados' },
              { value: '80+', label: 'Modelos de flyers' },
              { value: '100%', label: 'Conformidade RGPD' },
            ].map((s) => (
              <div key={s.label} className="px-6 py-5 rounded-2xl bg-navy-900/50 border border-navy-800 backdrop-blur-sm">
                <div className="font-serif font-bold text-3xl gold-gradient-text">{s.value}</div>
                <div className="mt-1 text-xs text-navy-300">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="funcionalidades" className="relative py-20 md:py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="font-serif font-bold text-3xl md:text-4xl text-white">Tudo o que a sua agência precisa</h2>
            <p className="mt-4 text-sm text-navy-300 leading-relaxed">
              Ferramentas integradas para gerir cada detalhe da atividade funerária com elegância e eficiência.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="group p-7 rounded-3xl bg-navy-900/60 border border-navy-800 hover:border-gold-500/30 transition-all hover:shadow-2xl hover:shadow-navy-900"
                >
                  <div className="w-12 h-12 rounded-2xl bg-navy-950 border border-gold-500/30 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5 text-gold-400" />
                  </div>
                  <h3 className="font-bold text-white text-base">{f.title}</h3>
                  <p className="mt-2 text-[13px] text-navy-300 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-20 md:py-24 bg-navy-900/30 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="font-serif font-bold text-3xl md:text-4xl text-white">Comece em três passos</h2>
            <p className="mt-4 text-sm text-navy-300">Uma plataforma intuitiva que acompanha o seu fluxo de trabalho.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((s) => (
              <div key={s.n} className="relative text-center">
                <div className="font-serif font-bold text-6xl text-gold-500/20 leading-none">{s.n}</div>
                <h3 className="mt-4 font-bold text-white text-base">{s.title}</h3>
                <p className="mt-2 text-[13px] text-navy-300 max-w-xs mx-auto">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="sobre" className="relative py-20 md:py-28 overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-gold-500/10 blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-300 text-xs font-semibold mb-6">
            <Check className="w-3.5 h-3.5" />
            <span>Junte-se à FuneSAS</span>
          </div>
          <h2 className="font-serif font-bold text-3xl md:text-5xl text-white leading-tight">
            Modernize a gestão da sua agência <span className="gold-gradient-text">hoje</span>
          </h2>
          <p className="mt-5 text-base text-navy-300 max-w-2xl mx-auto">
            Crie a sua agência ou inicie sessão para começar a gerir funerais, criar participações e organizar a
            sua documentação.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-gold-500 to-amber-400 hover:from-gold-400 hover:to-amber-300 text-navy-950 font-bold text-sm flex items-center space-x-2 shadow-2xl shadow-gold-500/20 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Registar Agência</span>
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 rounded-2xl bg-navy-900/80 border border-navy-700 hover:border-gold-500/40 text-white font-semibold text-sm flex items-center space-x-2 transition-all"
            >
              <LogIn className="w-4 h-4 text-gold-400" />
              <span>Entrar</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-navy-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-gold-600 via-gold-500 to-amber-300 p-0.5">
                  <div className="w-full h-full bg-navy-950 rounded-[7px] flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                  </div>
                </div>
                <span className="font-serif font-bold text-base text-white tracking-wide">
                  Fune<span className="gold-gradient-text">SAS</span>
                </span>
              </div>
              <p className="mt-4 text-xs text-navy-400 leading-relaxed max-w-sm">
                Plataforma SaaS de gestão funerária multi-agência: funerais, participações gráficas, documentos e
                publicações numa só solução moderna e segura.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Plataforma</h4>
              <ul className="space-y-2.5 text-xs text-navy-400">
                <li><a href="#funcionalidades" className="hover:text-gold-300 transition-colors">Funcionalidades</a></li>
                <li><a href="#como-funciona" className="hover:text-gold-300 transition-colors">Como Funciona</a></li>
                <li><a href="#sobre" className="hover:text-gold-300 transition-colors">Sobre</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Acesso</h4>
              <ul className="space-y-2.5 text-xs text-navy-400">
                <li><Link href="/login" className="hover:text-gold-300 transition-colors">Entrar</Link></li>
                <li><Link href="/login" className="hover:text-gold-300 transition-colors">Registar Agência</Link></li>
              </ul>
              <div className="mt-5 space-y-2 text-xs text-navy-400">
                <div className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-gold-500/70" />
                  <span>geral@funesas.pt</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-gold-500/70" />
                  <span>Portugal</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-navy-500">
            <span>© {new Date().getFullYear()} FuneSAS. Todos os direitos reservados.</span>
            <span className="flex items-center space-x-1.5 mt-2 sm:mt-0">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Dados protegidos e processados em conformidade com o RGPD</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
