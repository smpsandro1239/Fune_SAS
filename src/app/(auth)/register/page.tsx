'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  LogIn,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  User,
  Building2,
  MapPin,
  Hash,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiErrorMessage, apiService, storeTokens } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    agencyName: '',
    agencySlug: '',
    agencyAddress: '',
    agencyLocation: '',
  });
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

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.email.trim() || !form.password || !form.agencyName.trim()) {
      setError('Preencha o nome, email, password e nome da agência.');
      return;
    }
    setSubmitting(true);
    try {
      const tokens = await apiService.auth.register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        agencyName: form.agencyName.trim(),
        agencySlug: form.agencySlug.trim() || undefined,
        agencyAddress: form.agencyAddress.trim() || undefined,
        agencyLocation: form.agencyLocation.trim() || undefined,
      });
      storeTokens(tokens);
      const profile = await apiService.auth.me();
      setUser(profile);
      router.replace('/dashboard');
    } catch (err) {
      setError(apiErrorMessage(err, 'Não foi possível registar a agência.'));
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full pl-9 pr-4 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-white placeholder:text-navy-500 focus:border-gold-400 focus:outline-none';

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decoração de fundo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gold-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-navy-700/30 blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg space-y-6 animate-in fade-in zoom-in-95">
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
            <p className="text-xs text-navy-300 mt-1">Registar nova agência funerária</p>
          </div>
        </div>

        {/* Cartão de registo */}
        <div className="bg-navy-900/90 border border-navy-700/80 rounded-3xl p-7 shadow-2xl space-y-5 backdrop-blur-md">
          <div>
            <h2 className="text-lg font-bold text-white">Criar Conta</h2>
            <p className="text-xs text-navy-300 mt-0.5">
              Crie a sua agência e o primeiro utilizador administrador.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="name" className="block text-navy-200 font-semibold">Nome</label>
                <div className="relative">
                  <User className="w-4 h-4 text-navy-400 absolute left-3 top-2.5" />
                  <input
                    id="name"
                    type="text"
                    placeholder="Ana Oliveira"
                    value={form.name}
                    onChange={update('name')}
                    autoComplete="name"
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-navy-200 font-semibold">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-navy-400 absolute left-3 top-2.5" />
                  <input
                    id="email"
                    type="email"
                    placeholder="admin@agencia.pt"
                    value={form.email}
                    onChange={update('email')}
                    autoComplete="email"
                    className={inputClass}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-navy-200 font-semibold">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-navy-400 absolute left-3 top-2.5" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  value={form.password}
                  onChange={update('password')}
                  autoComplete="new-password"
                  className={`${inputClass} pr-10`}
                  required
                  minLength={8}
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
              <label htmlFor="agencyName" className="block text-navy-200 font-semibold">Nome da Agência</label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-navy-400 absolute left-3 top-2.5" />
                <input
                  id="agencyName"
                  type="text"
                  placeholder="Funerária Casa Hortas, Lda"
                  value={form.agencyName}
                  onChange={update('agencyName')}
                  autoComplete="organization"
                  className={inputClass}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="agencySlug" className="block text-navy-200 font-semibold">Slug (opcional)</label>
                <div className="relative">
                  <Hash className="w-4 h-4 text-navy-400 absolute left-3 top-2.5" />
                  <input
                    id="agencySlug"
                    type="text"
                    placeholder="casa-hortas"
                    value={form.agencySlug}
                    onChange={update('agencySlug')}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="agencyLocation" className="block text-navy-200 font-semibold">Localização (opcional)</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-navy-400 absolute left-3 top-2.5" />
                  <input
                    id="agencyLocation"
                    type="text"
                    placeholder="Braga"
                    value={form.agencyLocation}
                    onChange={update('agencyLocation')}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="agencyAddress" className="block text-navy-200 font-semibold">Morada (opcional)</label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-navy-400 absolute left-3 top-2.5" />
                <input
                  id="agencyAddress"
                  type="text"
                  placeholder="Rua das Maceirinhas, Cabreiros, Braga"
                  value={form.agencyAddress}
                  onChange={update('agencyAddress')}
                  className={inputClass}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 leading-relaxed">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
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
              <span>{submitting ? 'A criar conta...' : 'Criar Agência'}</span>
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-navy-400">
          Já tem conta?{' '}
          <Link href="/login" className="text-gold-400 hover:text-gold-300 font-semibold underline underline-offset-2">
            Iniciar Sessão
          </Link>
        </p>

        <p className="text-center">
          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 text-[11px] text-navy-400 hover:text-gold-300 font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar à página inicial</span>
          </Link>
        </p>
      </div>
    </div>
  );
}
