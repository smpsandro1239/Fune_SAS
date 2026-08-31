'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  return (
    <button
      onClick={toggleTheme}
      aria-label={isLight ? 'Ativar modo escuro' : 'Ativar modo claro'}
      title={isLight ? 'Modo escuro' : 'Modo claro'}
      className="p-2 rounded-lg bg-navy-800 hover:bg-navy-700 text-gold-300 hover:text-gold-200 border border-navy-600 transition-all"
    >
      {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
    </button>
  );
}
