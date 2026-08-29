import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const replace = jest.fn();
const mockLoginResult = jest.fn().mockResolvedValue(undefined);

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}));

jest.mock('next/link', () => {
  const Component = ({ children, ...props }: { children: React.ReactNode; [k: string]: unknown }) =>
    React.createElement('a', props, children);
  Component.displayName = 'MockLink';
  return Component;
});

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: null, login: mockLoginResult }),
}));

jest.mock('@/lib/api', () => {
  const actual = jest.requireActual('@/lib/api');
  return {
    ...actual,
  };
});

import LoginPage from '@/app/(auth)/login/page';

describe('LoginPage', () => {
  beforeEach(() => {
    replace.mockClear();
    mockLoginResult.mockReset();
  });

  it('renderiza o formulário de sessão', () => {
    render(<LoginPage />);
    expect(screen.getByText('Iniciar Sessão')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByText('Entrar no Painel')).toBeInTheDocument();
  });

  it('marca os campos obrigatórios para validação nativa do browser', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText('Email')).toBeRequired();
    expect(screen.getByLabelText('Password')).toBeRequired();
  });

  it('chama login com as credenciais preenchidas', async () => {
    const user = userEvent.setup();
    mockLoginResult.mockResolvedValue(undefined);
    render(<LoginPage />);

    await user.type(screen.getByLabelText('Email'), 'admin@casahortas.com');
    await user.type(screen.getByLabelText('Password'), 'Admin123!');
    await user.click(screen.getByText('Entrar no Painel'));

    await waitFor(() => {
      expect(mockLoginResult).toHaveBeenCalledWith('admin@casahortas.com', 'Admin123!');
    });
  });

  it('mostra erro vindo do backend quando a autenticação falha', async () => {
    const user = userEvent.setup();
    mockLoginResult.mockRejectedValue({
      isAxiosError: true,
      response: { data: { message: 'Credenciais inválidas.' } },
    });
    render(<LoginPage />);

    await user.type(screen.getByLabelText('Email'), 'admin@casahortas.com');
    await user.type(screen.getByLabelText('Password'), 'wrong');
    await user.click(screen.getByText('Entrar no Painel'));

    expect(await screen.findByText('Credenciais inválidas.')).toBeInTheDocument();
  });

  it('mostra erro de validação quando falta a password (bypass do required nativo)', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText('Email'), 'admin@casahortas.com');
    const form = screen.getByLabelText('Email').closest('form') as HTMLFormElement;
    fireEvent.submit(form);

    expect(screen.getByText('Introduza o email e a password.')).toBeInTheDocument();
    expect(mockLoginResult).not.toHaveBeenCalled();
  });

  it('alterna a visibilidade da password', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;

    expect(passwordInput).toHaveAttribute('type', 'password');

    await user.click(screen.getByRole('button', { name: 'Mostrar password' }));
    expect(passwordInput).toHaveAttribute('type', 'text');

    await user.click(screen.getByRole('button', { name: 'Ocultar password' }));
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
