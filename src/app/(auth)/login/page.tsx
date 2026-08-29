'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn, Sparkles, Lock, Mail, Eye, EyeOff, AlertCircle, Loader2, Info } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiErrorMessage } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace('/dashboard');
    }
  }, [user, router]);

  if (user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Introduza o email e a password.');
      return;
    }
    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(apiErrorMessage(err, 'Não foi possível iniciar sessão.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decoração de fundo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gold-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-navy-700/30 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md space-y-6 animate-in fade-in zoom-in-95">
        {/* Marca */}
        <div className="flex flex-col items-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-gold-600 via-gold-500 to-amber-300 p-0.5 shadow-lg shadow-gold-500/20">
            <div className="w-full h-full bg-navy-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-gold-400" />
            </div>
          </div>
          <div className="text-center">
            <h1 className="font-serif font-bold text-2xl text-white tracking-wide">
              Fune<span className="gold-gradient-text">SAS</span>
            </h1>
            <p className="text-xs text-navy-300 mt-1">Plataforma Funerária Multi-Agência</p>
          </div>
        </div>

        {/* Cartão de login */}
        <div className="bg-navy-900/90 border border-navy-700/80 rounded-3xl p-7 shadow-2xl space-y-5 backdrop-blur-md">
          <div>
            <h2 className="text-lg font-bold text-white">Iniciar Sessão</h2>
            <p className="text-xs text-navy-300 mt-0.5">Aceda ao painel da sua agência funerária.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="block text-navy-200 font-semibold">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-navy-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  placeholder="admin@casahortas.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-white placeholder:text-navy-500 focus:border-gold-400 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-navy-200 font-semibold">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-navy-400 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-white placeholder:text-navy-500 focus:border-gold-400 focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-navy-400 hover:text-white"
                  aria-label={showPassword ? 'Ocultar password' : 'Mostrar password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-400 hover:from-gold-400 hover:to-amber-300 text-navy-950 font-bold shadow-lg shadow-gold-500/10 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              <span>{submitting ? 'A entrar...' : 'Entrar no Painel'}</span>
            </button>
          </form>

          <div className="flex items-center justify-between pt-1 text-[11px]">
            <Link
              href="/forgot-password"
              className="text-navy-400 hover:text-gold-300 font-medium transition-colors"
            >
              Esqueceu a palavra-passe?
            </Link>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-navy-400">
            <Info className="w-3.5 h-3.5 text-gold-500/70" />
            <span>
              Demo: <span className="text-navy-200 font-medium">admin@casahortas.com</span> /{' '}
              <span className="text-navy-200 font-medium">Admin123!</span>
            </span>
          </div>
        </div>

        <p className="text-center text-[11px] text-navy-400">
          Não tem conta?{' '}
          <Link href="/login" className="text-gold-400 hover:text-gold-300 font-semibold underline underline-offset-2">
            Contacte a equipa FuneSAS
          </Link>
        </p>
      </div>
    </div>
  );
}
