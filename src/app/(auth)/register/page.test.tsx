import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const replace = jest.fn();
const setUser = jest.fn();
const register = jest.fn();
const me = jest.fn();
const storeTokens = jest.fn();

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
  useAuth: () => ({ user: null, setUser }),
}));

jest.mock('@/lib/api', () => {
  const actual = jest.requireActual('@/lib/api');
  return {
    ...actual,
    apiService: {
      auth: {
        register: (...args: unknown[]) => register(...args),
        me: (...args: unknown[]) => me(...args),
      },
    },
    storeTokens: (...args: unknown[]) => storeTokens(...args),
  };
});

import RegisterPage from '@/app/(auth)/register/page';

describe('RegisterPage', () => {
  beforeEach(() => {
    replace.mockClear();
    setUser.mockClear();
    register.mockClear();
    me.mockClear();
    storeTokens.mockClear();
  });

  it('renderiza o formulário de registo com os campos principais', () => {
    render(<RegisterPage />);
    expect(screen.getByText('Criar Conta')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome da Agência')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Criar Agência' })).toBeInTheDocument();
  });

  it('marca os campos obrigatórios para validação nativa do browser', () => {
    render(<RegisterPage />);
    expect(screen.getByLabelText('Nome')).toBeRequired();
    expect(screen.getByLabelText('Email')).toBeRequired();
    expect(screen.getByLabelText('Password')).toBeRequired();
    expect(screen.getByLabelText('Nome da Agência')).toBeRequired();
  });

  it('regista a agência e redireciona para o dashboard', async () => {
    const user = userEvent.setup();
    const tokens = {
      accessToken: 'at',
      refreshToken: 'rt',
      accessExpiresIn: '15m',
      refreshExpiresIn: '7d',
    };
    const profile = {
      id: 'u1',
      agencyId: 'a1',
      name: 'Ana Oliveira',
      email: 'ana@agencia.pt',
      role: 'ADMIN',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    };
    register.mockResolvedValue(tokens);
    me.mockResolvedValue(profile);

    render(<RegisterPage />);
    await user.type(screen.getByLabelText('Nome'), 'Ana Oliveira');
    await user.type(screen.getByLabelText('Email'), 'ana@agencia.pt');
    await user.type(screen.getByLabelText('Password'), 'Admin123!');
    await user.type(screen.getByLabelText('Nome da Agência'), 'Funerária Casa Hortas, Lda');
    await user.click(screen.getByRole('button', { name: 'Criar Agência' }));

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith({
        name: 'Ana Oliveira',
        email: 'ana@agencia.pt',
        password: 'Admin123!',
        agencyName: 'Funerária Casa Hortas, Lda',
        agencySlug: undefined,
        agencyAddress: undefined,
        agencyLocation: undefined,
      });
    });
    expect(me).toHaveBeenCalled();
    expect(storeTokens).toHaveBeenCalledWith(tokens);
    expect(setUser).toHaveBeenCalledWith(profile);
    expect(replace).toHaveBeenCalledWith('/dashboard');
  });

  it('mostra erro quando o email já existe', async () => {
    const user = userEvent.setup();
    register.mockRejectedValue({
      isAxiosError: true,
      response: { data: { message: 'Já existe um utilizador com este email.' } },
    });

    render(<RegisterPage />);
    await user.type(screen.getByLabelText('Nome'), 'Ana Oliveira');
    await user.type(screen.getByLabelText('Email'), 'ana@agencia.pt');
    await user.type(screen.getByLabelText('Password'), 'Admin123!');
    await user.type(screen.getByLabelText('Nome da Agência'), 'Agência Teste');
    await user.click(screen.getByRole('button', { name: 'Criar Agência' }));

    expect(
      await screen.findByText('Já existe um utilizador com este email.'),
    ).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});
