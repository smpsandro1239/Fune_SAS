'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, Lock, AlertCircle, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { apiErrorMessage, apiService } from '@/lib/api';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('A palavra-passe deve ter pelo menos 8 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As palavras-passe não coincidem.');
      return;
    }
    setSubmitting(true);
    try {
      await apiService.auth.resetPassword(token, password);
      setDone(true);
      setTimeout(() => router.replace('/login'), 2500);
    } catch (err) {
      setError(apiErrorMessage(err, 'Link inválido ou expirado. Peça um novo link de recuperação.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="bg-navy-900/90 border border-navy-700/80 rounded-3xl p-7 shadow-2xl space-y-4 text-center backdrop-blur-md">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Link inválido</h2>
        <p className="text-xs text-navy-300">Este link de recuperação não contém um token válido.</p>
        <Link
          href="/forgot-password"
          className="inline-block px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-bold transition-all"
        >
          Pedir novo link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="bg-navy-900/90 border border-navy-700/80 rounded-3xl p-7 shadow-2xl space-y-4 text-center backdrop-blur-md">
        <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Palavra-passe alterada!</h2>
        <p className="text-xs text-navy-300">A redirecionar para o login...</p>
      </div>
    );
  }

  return (
    <div className="bg-navy-900/90 border border-navy-700/80 rounded-3xl p-7 shadow-2xl space-y-5 backdrop-blur-md">
      <div>
        <h2 className="text-lg font-bold text-white">Nova Palavra-passe</h2>
        <p className="text-xs text-navy-300 mt-0.5">Escolha uma palavra-passe forte com pelo menos 8 caracteres.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="space-y-1.5">
          <label htmlFor="newPassword" className="block text-navy-200 font-semibold">Nova palavra-passe</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-navy-400 absolute left-3 top-2.5" />
            <input
              id="newPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
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

        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="block text-navy-200 font-semibold">Confirmar palavra-passe</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-navy-400 absolute left-3 top-2.5" />
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-white placeholder:text-navy-500 focus:border-gold-400 focus:outline-none"
              required
            />
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
            <Lock className="w-4 h-4" />
          )}
          <span>{submitting ? 'A guardar...' : 'Definir nova palavra-passe'}</span>
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gold-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-navy-700/30 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md space-y-6 animate-in fade-in zoom-in-95">
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
          </div>
        </div>

        <Suspense
          fallback={
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-gold-400" />
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
