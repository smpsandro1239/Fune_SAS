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

  it('controla o menu móvel: fechado por defeito e alterna no clique', async () => {
    const user = userEvent.setup();
    const { container } = render(<LandingPage />);
    const mobileLinks = () =>
      container.querySelectorAll('a[class*="block text-sm font-semibold text-navy-200"]');

    expect(screen.getByRole('button', { name: 'Abrir menu' })).toBeInTheDocument();
    expect(mobileLinks()).toHaveLength(0);

    await user.click(screen.getByRole('button', { name: 'Abrir menu' }));
    expect(screen.getByRole('button', { name: 'Fechar menu' })).toBeInTheDocument();
    expect(mobileLinks()).toHaveLength(3);

    await user.click(screen.getByRole('button', { name: 'Fechar menu' }));
    expect(screen.getByRole('button', { name: 'Abrir menu' })).toBeInTheDocument();
    expect(mobileLinks()).toHaveLength(0);
  });

  it('fecha o menu móvel ao navegar através de uma âncora', async () => {
    const user = userEvent.setup();
    const { container } = render(<LandingPage />);
    const mobileLinks = () =>
      container.querySelectorAll('a[class*="block text-sm font-semibold text-navy-200"]');

    await user.click(screen.getByRole('button', { name: 'Abrir menu' }));
    expect(mobileLinks()).toHaveLength(3);

    await user.click(screen.getByText('Funcionalidades', { selector: 'a[class*="block text-sm"]' }));
    expect(screen.getByRole('button', { name: 'Abrir menu' })).toBeInTheDocument();
    expect(mobileLinks()).toHaveLength(0);
  });

  it('expõe CTAs de registar/entrar dentro do menu móvel', async () => {
    const user = userEvent.setup();
    render(<LandingPage />);
    await user.click(screen.getByRole('button', { name: 'Abrir menu' }));

    expect(screen.getAllByText('Entrar').length).toBeGreaterThan(0);
    const registerMobile = screen.getAllByRole('link', { name: 'Registar' });
    expect(registerMobile.length).toBeGreaterThan(0);
    registerMobile.forEach((link) => expect(link).toHaveAttribute('href', '/register'));
  });
});
