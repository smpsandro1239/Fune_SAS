'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Mail, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { apiErrorMessage, apiService } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await apiService.auth.forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(apiErrorMessage(err, 'Não foi possível processar o pedido.'));
    } finally {
      setSubmitting(false);
    }
  };

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

        <div className="bg-navy-900/90 border border-navy-700/80 rounded-3xl p-7 shadow-2xl space-y-5 backdrop-blur-md">
          {sent ? (
            <div className="space-y-4 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <div>
                <h2 className="text-lg font-bold text-white">Verifique o seu email</h2>
                <p className="text-xs text-navy-300 mt-1 leading-relaxed">
                  Se existir uma conta com <span className="text-white font-semibold">{email}</span>,
                  enviámos um link para redefinir a palavra-passe. O link é válido durante 1 hora.
                </p>
              </div>
              <Link
                href="/login"
                className="inline-block px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-navy-200 text-xs font-semibold transition-all"
              >
                Voltar ao login
              </Link>
            </div>
          ) : (
            <>
              <div>
                <h2 className="text-lg font-bold text-white">Recuperar Palavra-passe</h2>
                <p className="text-xs text-navy-300 mt-0.5">
                  Indique o email da conta e enviaremos um link de recuperação.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-navy-200 font-semibold">Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-navy-400 absolute left-3 top-2.5" />
                    <input
                      id="email"
                      type="email"
                      placeholder="o-seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
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
                    <Mail className="w-4 h-4" />
                  )}
                  <span>{submitting ? 'A enviar...' : 'Enviar link de recuperação'}</span>
                </button>
              </form>

              <p className="text-center text-[11px] text-navy-400 pt-1">
                Lembrou-se da palavra-passe?{' '}
                <Link href="/login" className="text-gold-400 hover:text-gold-300 font-semibold underline underline-offset-2">
                  Voltar ao login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
