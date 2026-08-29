import React from 'react';
import { render, screen, renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/context/AuthContext';

const replace = jest.fn();
const mockPathname = jest.fn().mockReturnValue('/');

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  usePathname: () => mockPathname(),
}));

const login = jest.fn();
const me = jest.fn();
const logout = jest.fn();
const getRefreshToken = jest.fn().mockReturnValue(null);

jest.mock('@/lib/api', () => ({
  getAccessToken: () => null,
  getRefreshToken: () => getRefreshToken(),
  clearTokens: jest.fn(),
  storeTokens: jest.fn(),
  apiService: {
    auth: {
      login: (...args: unknown[]) => login(...args),
      me: (...args: unknown[]) => me(...args),
      logout: (...args: unknown[]) => logout(...args),
    },
  },
}));

function Consumer() {
  useAuth();
  return <span>conteudo renderizado</span>;
}

function Actions() {
  const { login: doLogin, logout: doLogout, user } = useAuth();
  return (
    <div>
      <button onClick={() => doLogin('admin@casahortas.com', 'Admin123!')}>login</button>
      <button onClick={doLogout}>logout</button>
      <span data-testid="user">{user ? user.email : 'anon'}</span>
    </div>
  );
}

function renderTree() {
  return render(
    <AuthProvider>
      <Consumer />
      <Actions />
    </AuthProvider>,
  );
}

const profile = {
  id: 'u1',
  agencyId: 'a1',
  name: 'Ana Oliveira',
  email: 'admin@casahortas.com',
  role: 'ADMIN',
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

const tokens = {
  accessToken: 'at',
  refreshToken: 'rt',
  accessExpiresIn: '15m',
  refreshExpiresIn: '7d',
};

describe('AuthProvider', () => {
  beforeEach(() => {
    replace.mockClear();
    me.mockClear();
    login.mockClear();
    logout.mockClear();
    getRefreshToken.mockClear();
    getRefreshToken.mockReturnValue(null);
    mockPathname.mockReturnValue('/');
    window.localStorage.clear();
  });

  it('redireciona para /login em rotas privadas sem sessão e não renderiza os filhos', async () => {
    mockPathname.mockReturnValue('/dashboard');
    renderTree();

    expect(replace).toHaveBeenCalledWith('/login');
    expect(screen.queryByText('conteudo renderizado')).not.toBeInTheDocument();
  });

  it.each(['/', '/login', '/register', '/public/agencia/funeral-1'])(
    'não redireciona e renderiza os filhos em %s',
    async (path) => {
      mockPathname.mockReturnValue(path);
      renderTree();

      expect(await screen.findByText('conteudo renderizado')).toBeInTheDocument();
      expect(replace).not.toHaveBeenCalled();
    },
  );

  it('lança erro ao usar useAuth fora do AuthProvider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      expect(() => renderHook(() => useAuth())).toThrow(/AuthProvider/);
    } finally {
      spy.mockRestore();
    }
  });

  it('inicia sessão: chama login + me, guarda tokens, define o utilizador e redireciona', async () => {
    login.mockResolvedValue(tokens);
    me.mockResolvedValue(profile);

    renderTree();
    await screen.findByText('conteudo renderizado');

    await act(async () => {
      screen.getByText('login').click();
    });

    expect(login).toHaveBeenCalledWith('admin@casahortas.com', 'Admin123!');
    expect(me).toHaveBeenCalled();
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('admin@casahortas.com'));
    expect(replace).toHaveBeenCalledWith('/dashboard');
  });

  it('termina sessão: chama logout com o refresh token, limpa e redireciona', async () => {
    getRefreshToken.mockReturnValue('rt');
    renderTree();
    await screen.findByText('conteudo renderizado');

    await act(async () => {
      screen.getByText('logout').click();
    });

    expect(logout).toHaveBeenCalledWith('rt');
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('anon'));
    expect(replace).toHaveBeenCalledWith('/login');
  });

  it('termina sessão sem refresh token e ignora erros do servidor', async () => {
    logout.mockRejectedValue(new Error('network'));
    renderTree();
    await screen.findByText('conteudo renderizado');

    await act(async () => {
      screen.getByText('logout').click();
    });

    expect(logout).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('anon'));
    expect(replace).toHaveBeenCalledWith('/login');
  });
});
