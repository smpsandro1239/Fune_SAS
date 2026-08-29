import React from 'react';
import { render, screen, renderHook } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/context/AuthContext';

const replace = jest.fn();
const mockPathname = jest.fn().mockReturnValue('/');

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  usePathname: () => mockPathname(),
}));

jest.mock('@/lib/api', () => ({
  getAccessToken: () => null,
  getRefreshToken: () => null,
  clearTokens: jest.fn(),
  storeTokens: jest.fn(),
  apiService: {
    auth: {
      login: jest.fn(),
      me: jest.fn(),
      logout: jest.fn(),
    },
  },
}));

function Consumer() {
  useAuth();
  return <span>conteudo renderizado</span>;
}

function renderTree() {
  return render(
    <AuthProvider>
      <Consumer />
    </AuthProvider>,
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    replace.mockClear();
    mockPathname.mockReturnValue('/');
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
    expect(() => renderHook(() => useAuth())).toThrow(/AuthProvider/);
  });
});
