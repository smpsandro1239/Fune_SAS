import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/components/Toast';

export const metadata: Metadata = {
  title: 'FuneSAS - Plataforma SaaS Funerária Multi-Agência',
  description: 'Gestão integrada de agências funerárias, editor visual de flyers, participações de falecimento, gestão documental e agenda.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt">
      <body className="bg-navy-950 text-slate-100 min-h-screen flex flex-col font-sans antialiased">
        <AuthProvider><ToastProvider>{children}</ToastProvider></AuthProvider>
      </body>
    </html>
  );
}
