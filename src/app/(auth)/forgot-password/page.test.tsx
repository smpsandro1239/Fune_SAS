import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('next/link', () => {
  const Component = ({ children, ...props }: { children: React.ReactNode; [k: string]: unknown }) =>
    React.createElement('a', props, children);
  Component.displayName = 'MockLink';
  return Component;
});

const forgotPassword = jest.fn();

jest.mock('@/lib/api', () => {
  const actual = jest.requireActual('@/lib/api');
  return {
    ...actual,
    apiService: {
      auth: {
        forgotPassword: (...args: unknown[]) => forgotPassword(...args),
      },
    },
  };
});

import ForgotPasswordPage from '@/app/(auth)/forgot-password/page';

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    forgotPassword.mockReset();
  });

  it('renderiza o formulário de recuperação', () => {
    render(<ForgotPasswordPage />);
    expect(screen.getByText('Recuperar Palavra-passe')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByText('Enviar link de recuperação')).toBeInTheDocument();
  });

  it('marca o campo email como obrigatório para validação nativa', () => {
    render(<ForgotPasswordPage />);
    expect(screen.getByLabelText('Email')).toBeRequired();
  });

  it('envia o email e mostra a confirmação de envio', async () => {
    const user = userEvent.setup();
    forgotPassword.mockResolvedValue({ message: 'ok' });

    render(<ForgotPasswordPage />);
    await user.type(screen.getByLabelText('Email'), 'admin@casahortas.com');
    await user.click(screen.getByText('Enviar link de recuperação'));

    await waitFor(() => {
      expect(forgotPassword).toHaveBeenCalledWith('admin@casahortas.com');
    });
    expect(screen.getByText('Verifique o seu email')).toBeInTheDocument();
    expect(screen.getByText('admin@casahortas.com')).toBeInTheDocument();
    expect(screen.getByText('Voltar ao login')).toBeInTheDocument();
  });

  it('mostra erro vindo do backend e mantém o formulário', async () => {
    const user = userEvent.setup();
    forgotPassword.mockRejectedValue({
      isAxiosError: true,
      response: { data: { message: 'Não existe conta com este email.' } },
    });

    render(<ForgotPasswordPage />);
    await user.type(screen.getByLabelText('Email'), 'x@y.pt');
    await user.click(screen.getByText('Enviar link de recuperação'));

    expect(await screen.findByText('Não existe conta com este email.')).toBeInTheDocument();
    expect(screen.queryByText('Verifique o seu email')).not.toBeInTheDocument();
  });

  it('envia o email mesmo vazio (a página não tem validação client-side)', async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordPage />);

    const form = screen.getByLabelText('Email').closest('form') as HTMLFormElement;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(forgotPassword).toHaveBeenCalledWith('');
    });
  });
});
