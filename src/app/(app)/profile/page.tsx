'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Lock,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Shield,
  Building2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAgency } from '@/context/AgencyContext';
import { apiService, apiErrorMessage } from '@/lib/api';

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Administrador',
  OPERATOR: 'Operador',
  DESIGNER: 'Designer',
};

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const { currentAgency } = useAgency();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone ?? '');
      setEmailNotifications(user.preferences?.emailNotifications === false ? false : true);
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setSavingProfile(true);
    try {
      const updated = await apiService.auth.updateProfile({
        name,
        email,
        phone,
        preferences: { emailNotifications },
      });
      setUser(updated);
      setProfileSuccess('Perfil atualizado com sucesso.');
    } catch (err) {
      setProfileError(apiErrorMessage(err));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('As passwords novas não coincidem.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('A nova password deve ter pelo menos 8 caracteres.');
      return;
    }

    setSavingPassword(true);
    try {
      await apiService.auth.changePassword(currentPassword, newPassword);
      setPasswordSuccess('Password alterada com sucesso.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(apiErrorMessage(err));
    } finally {
      setSavingPassword(false);
    }
  };

  const initials = user
    ? user.name
        .split(' ')
        .filter(Boolean)
        .map((p) => p[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : '??';

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-white">Meu Perfil</h1>
        <p className="text-sm text-navy-300 mt-1">Gerira os seus dados pessoais e password.</p>
      </div>

      {/* Profile Card */}
      <div className="bg-navy-900/80 border border-navy-700/60 rounded-2xl p-6 md:p-8">
        <div className="flex items-center space-x-4 sm:space-x-5 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-gold-600 via-gold-500 to-amber-300 p-0.5 shadow-lg shadow-gold-500/10 shrink-0">
            <div className="w-full h-full bg-navy-950 rounded-[14px] flex items-center justify-center text-xl font-serif font-bold text-gold-400">
              {initials}
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-lg font-semibold text-white truncate">{user?.name || '...'}</div>
            <div className="text-sm text-navy-300 truncate">{user?.email || '...'}</div>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gold-500/20 text-gold-300 border border-gold-500/30 shrink-0">
                {user ? ROLE_LABELS[user.role] || user.role : ''}
              </span>
              <span className="text-[11px] text-navy-400 flex items-center gap-1 min-w-0">
                <Building2 className="w-3 h-3 shrink-0" />
                <span className="truncate">{currentAgency?.name || '...'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSaveProfile} className="space-y-5">
          <h3 className="text-sm font-semibold text-gold-400 flex items-center gap-2">
            <User className="w-4 h-4" />
            Dados Pessoais
          </h3>

          <div>
            <label htmlFor="profile-name" className="block text-xs font-medium text-navy-300 mb-1.5">Nome</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-navy-800 border border-navy-600 rounded-xl text-sm text-white placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all"
                placeholder="O seu nome"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="profile-email" className="block text-xs font-medium text-navy-300 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
              <input
                id="profile-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-navy-800 border border-navy-600 rounded-xl text-sm text-white placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all"
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="profile-phone" className="block text-xs font-medium text-navy-300 mb-1.5">Telefone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
              <input
                id="profile-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-navy-800 border border-navy-600 rounded-xl text-sm text-white placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all"
                placeholder="+351 912 345 678"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="w-4 h-4 rounded text-gold-500 focus:ring-gold-500/50"
            />
            <span className="text-xs text-navy-300">Receber notificações por email</span>
          </label>

          {profileError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {profileError}
            </div>
          )}
          {profileSuccess && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {profileSuccess}
            </div>
          )}

          <button
            type="submit"
            disabled={savingProfile}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-400 hover:from-gold-400 hover:to-amber-300 text-navy-950 font-bold text-xs transition-all shadow-md shadow-gold-500/10 disabled:opacity-50"
          >
            {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar Alterações
          </button>
        </form>
      </div>

      {/* Password Card */}
      <div className="bg-navy-900/80 border border-navy-700/60 rounded-2xl p-6 md:p-8">
        <form onSubmit={handleChangePassword} className="space-y-5">
          <h3 className="text-sm font-semibold text-gold-400 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Alterar Password
          </h3>

          <div>
            <label htmlFor="current-password" className="block text-xs font-medium text-navy-300 mb-1.5">Password Atual</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
              <input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-navy-800 border border-navy-600 rounded-xl text-sm text-white placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="new-password" className="block text-xs font-medium text-navy-300 mb-1.5">Nova Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-navy-800 border border-navy-600 rounded-xl text-sm text-white placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all"
                placeholder="Mínimo 8 caracteres"
                required
                minLength={8}
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-xs font-medium text-navy-300 mb-1.5">Confirmar Nova Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-navy-800 border border-navy-600 rounded-xl text-sm text-white placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all"
                placeholder="Repita a nova password"
                required
                minLength={8}
              />
            </div>
          </div>

          {passwordError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {passwordSuccess}
            </div>
          )}

          <button
            type="submit"
            disabled={savingPassword}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-400 hover:from-gold-400 hover:to-amber-300 text-navy-950 font-bold text-xs transition-all shadow-md shadow-gold-500/10 disabled:opacity-50"
          >
            {savingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            Alterar Password
          </button>
        </form>
      </div>
    </div>
  );
}
