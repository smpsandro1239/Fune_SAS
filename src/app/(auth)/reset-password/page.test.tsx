import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const replace = jest.fn();
const mockGet = jest.fn();
const resetPassword = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => ({ get: (k: string) => mockGet(k) }),
}));

jest.mock('next/link', () => {
  const Component = ({ children, ...props }: { children: React.ReactNode; [k: string]: unknown }) =>
    React.createElement('a', props, children);
  Component.displayName = 'MockLink';
  return Component;
});

jest.mock('@/lib/api', () => {
  const actual = jest.requireActual('@/lib/api');
  return {
    ...actual,
    apiService: {
      auth: {
        resetPassword: (...args: unknown[]) => resetPassword(...args),
      },
    },
  };
});

import ResetPasswordPage from '@/app/(auth)/reset-password/page';

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    replace.mockClear();
    resetPassword.mockClear();
    mockGet.mockReset();
    mockGet.mockReturnValue('token-1');
    jest.useRealTimers();
  });

  it('mostra link inválido sem token', () => {
    mockGet.mockReturnValue(null);
    render(<ResetPasswordPage />);
    expect(screen.getByText('Link inválido')).toBeInTheDocument();
    expect(screen.getByText('Pedir novo link')).toBeInTheDocument();
  });

  it('marca os campos obrigatórios para validação nativa', () => {
    render(<ResetPasswordPage />);
    expect(screen.getByLabelText('Nova palavra-passe')).toBeRequired();
    expect(screen.getByLabelText('Confirmar palavra-passe')).toBeRequired();
  });

  it('valida o comprimento mínimo da palavra-passe sem chamar o backend', async () => {
    const user = userEvent.setup();
    render(<ResetPasswordPage />);

    await user.type(screen.getByLabelText('Nova palavra-passe'), 'curta');
    await user.type(screen.getByLabelText('Confirmar palavra-passe'), 'curta');
    await user.click(screen.getByText('Definir nova palavra-passe'));

    expect(screen.getByText('A palavra-passe deve ter pelo menos 8 caracteres.')).toBeInTheDocument();
    expect(resetPassword).not.toHaveBeenCalled();
  });

  it('valida que as palavras-passe coincidem', async () => {
    const user = userEvent.setup();
    render(<ResetPasswordPage />);

    await user.type(screen.getByLabelText('Nova palavra-passe'), 'Admin123!');
    await user.type(screen.getByLabelText('Confirmar palavra-passe'), 'Diferente1!');
    await user.click(screen.getByText('Definir nova palavra-passe'));

    expect(screen.getByText('As palavras-passe não coincidem.')).toBeInTheDocument();
    expect(resetPassword).not.toHaveBeenCalled();
  });

  it('redefine a palavra-passe com o token e mostra a confirmação', async () => {
    const user = userEvent.setup();
    resetPassword.mockResolvedValue({ message: 'ok' });

    render(<ResetPasswordPage />);
    await user.type(screen.getByLabelText('Nova palavra-passe'), 'Admin123!');
    await user.type(screen.getByLabelText('Confirmar palavra-passe'), 'Admin123!');
    await user.click(screen.getByText('Definir nova palavra-passe'));

    await waitFor(() => {
      expect(resetPassword).toHaveBeenCalledWith('token-1', 'Admin123!');
    });
    expect(screen.getByText('Palavra-passe alterada!')).toBeInTheDocument();
  });

  it('mostra erro vindo do backend', async () => {
    const user = userEvent.setup();
    resetPassword.mockRejectedValue({
      isAxiosError: true,
      response: { data: { message: 'Link expirado.' } },
    });

    render(<ResetPasswordPage />);
    await user.type(screen.getByLabelText('Nova palavra-passe'), 'Admin123!');
    await user.type(screen.getByLabelText('Confirmar palavra-passe'), 'Admin123!');
    await user.click(screen.getByText('Definir nova palavra-passe'));

    expect(await screen.findByText('Link expirado.')).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it('alterna a visibilidade da palavra-passe', async () => {
    const user = userEvent.setup();
    render(<ResetPasswordPage />);
    const input = screen.getByLabelText('Nova palavra-passe') as HTMLInputElement;

    expect(input).toHaveAttribute('type', 'password');

    await user.click(screen.getByRole('button', { name: 'Mostrar password' }));
    expect(input).toHaveAttribute('type', 'text');
  });
});
