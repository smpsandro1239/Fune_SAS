import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Providers from '@/components/Providers';
import { LocaleProvider } from '@/context/I18nContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ServiceWorkerRegistrar } from '@/components/ServiceWorkerRegistrar';

export const metadata: Metadata = {
  title: 'FuneSAS - Plataforma SaaS Funerária Multi-Agência',
  description: 'Gestão integrada de agências funerárias, editor visual de flyers, participações de falecimento, gestão documental e agenda.',
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt">
      <body className="bg-navy-950 text-slate-100 min-h-screen flex flex-col font-sans antialiased">
        <ThemeProvider>
          <AuthProvider>
            <LocaleProvider>
              <Providers>{children}</Providers>
            </LocaleProvider>
          </AuthProvider>
        </ThemeProvider>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
