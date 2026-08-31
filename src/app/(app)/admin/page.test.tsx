import React from 'react';
import { render, screen } from '@testing-library/react';

const apiErrorMessage = jest.fn((err: unknown, fallback?: string) =>
  err instanceof Error ? err.message : (fallback ?? ''),
);
const adminOverview = jest.fn();
const adminAgencies = jest.fn();

jest.mock('@/lib/api', () => ({
  apiErrorMessage: (err: unknown, fallback: string) => apiErrorMessage(err, fallback),
  apiService: {
    admin: {
      overview: (...args: unknown[]) => adminOverview(...args),
      agencies: (...args: unknown[]) => adminAgencies(...args),
    },
  },
}));

const clearAuth = jest.fn();
jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: clearAuth() }),
}));

import AdminPage from '@/app/(app)/admin/page';

const overview = {
  totalAgencies: 5,
  totalUsers: 12,
  totalFunerals: 40,
  activeSubscriptions: 3,
  revenueEstimate: 315,
};

const agencies = [
  {
    id: 'a1',
    name: 'Casa Hortas',
    slug: 'casa-hortas',
    location: 'Lisboa',
    subscriptionPlan: 'PRO',
    createdAt: '2026-01-01',
    usersCount: 3,
  },
  {
    id: 'a2',
    name: 'Agência B',
    slug: 'agencia-b',
    location: null,
    subscriptionPlan: 'FREE',
    createdAt: '2026-02-01',
    usersCount: 1,
  },
];

describe('AdminPage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    apiErrorMessage.mockImplementation((err: unknown, fallback?: string) =>
      err instanceof Error ? err.message : (fallback ?? ''),
    );
    adminOverview.mockResolvedValue(overview);
    adminAgencies.mockResolvedValue(agencies);
    clearAuth.mockReturnValue({ role: 'SUPER_ADMIN' });
  });

  it('mostra a mensagem de sem permissões para não super admins', async () => {
    clearAuth.mockReturnValue({ role: 'ADMIN' });
    render(<AdminPage />);

    expect(await screen.findByText('Sem permissões')).toBeInTheDocument();
    expect(adminOverview).not.toHaveBeenCalled();
  });

  it('mostra as estatísticas globais para super admins', async () => {
    render(<AdminPage />);

    expect((await screen.findAllByText('Agências')).length).toBeGreaterThan(0);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('40')).toBeInTheDocument();
    expect(screen.getByText('€315/mês')).toBeInTheDocument();
  });

  it('lista as agências com plano e contagem de utilizadores', async () => {
    render(<AdminPage />);

    expect(await screen.findByText('Casa Hortas')).toBeInTheDocument();
    expect(screen.getByText('Agência B')).toBeInTheDocument();
    expect(screen.getByText('Lisboa')).toBeInTheDocument();
    expect(screen.getAllByText('PRO').length).toBeGreaterThan(0);
    expect(screen.getByText('Free')).toBeInTheDocument();
  });

  it('mostra a mensagem de erro quando o carregamento falha', async () => {
    adminOverview.mockRejectedValue(new Error('network'));
    render(<AdminPage />);

    expect(
      await screen.findByText('network'),
    ).toBeInTheDocument();
  });
});
