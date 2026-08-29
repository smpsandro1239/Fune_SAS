import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const replace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  usePathname: () => '/',
}));

jest.mock('next/link', () => {
  const Component = ({ children, ...props }: { children: React.ReactNode; [k: string]: unknown }) =>
    React.createElement('a', props, children);
  Component.displayName = 'MockLink';
  return Component;
});

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: null }),
}));

import LandingPage from '@/app/page';

describe('LandingPage', () => {
  beforeEach(() => {
    replace.mockClear();
  });

  it('renderiza a marca e a headline principal', () => {
    render(<LandingPage />);
    expect(screen.getByRole('link', { name: /Fune\s?SAS/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Digitalize/i })).toBeInTheDocument();
  });

  it('expõe CTAs de registar e entrar que ligam às rotas corretas', () => {
    render(<LandingPage />);
    expect(screen.getAllByText('Registar Agência').length).toBeGreaterThan(0);
    expect(screen.getByText('Entrar no Painel')).toBeInTheDocument();

    const registerLinks = screen.getAllByRole('link', { name: 'Registar Agência' });
    expect(registerLinks.length).toBeGreaterThan(0);
    registerLinks.forEach((link) => expect(link).toHaveAttribute('href', '/register'));

    const loginLinks = screen.getAllByRole('link', { name: 'Entrar' });
    expect(loginLinks.length).toBeGreaterThan(0);
    loginLinks.forEach((link) => expect(link).toHaveAttribute('href', '/login'));
  });

  it('lista as funcionalidades principais', () => {
    render(<LandingPage />);
    expect(screen.getByText('Editor Visual de Flyers')).toBeInTheDocument();
    expect(screen.getByText('Gestão de Funerais')).toBeInTheDocument();
    expect(screen.getByText('Gestão Documental')).toBeInTheDocument();
    expect(screen.getByText('Condolências & Publicações')).toBeInTheDocument();
  });

  it('não redireciona quando não há utilizador autenticado', () => {
    render(<LandingPage />);
    expect(replace).not.toHaveBeenCalled();
  });
});
