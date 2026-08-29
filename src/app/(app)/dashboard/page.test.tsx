import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const replace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  usePathname: () => '/dashboard',
}));

jest.mock('next/link', () => {
  const Component = ({ children, ...props }: { children: React.ReactNode; [k: string]: unknown }) =>
    React.createElement('a', props, children);
  Component.displayName = 'MockLink';
  return Component;
});

const mockUser = { name: 'Ana Oliveira', email: 'admin@casahortas.com', role: 'ADMIN' };
const mockAgency = {
  id: 'a1',
  name: 'Funerária Casa Hortas',
  slug: 'casahortas',
  foundedYear: '1998',
  subscriptionPlan: 'PRO',
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: mockUser }),
}));

jest.mock('@/context/AgencyContext', () => ({
  useAgency: () => ({ currentAgency: mockAgency }),
}));

const apiErrorMessage = jest.fn(
  (_err: unknown, fallback: string) => fallback,
);
const dashboard = jest.fn();
const funeralsList = jest.fn();

jest.mock('@/lib/api', () => ({
  apiErrorMessage: (err: unknown, fallback: string) => apiErrorMessage(err, fallback),
  apiService: {
    reports: { dashboard: (...args: unknown[]) => dashboard(...args) },
    funerals: {
      list: (...args: unknown[]) => funeralsList(...args),
    },
  },
}));

import DashboardPage from '@/app/(app)/dashboard/page';

const summary = {
  funerals: 12,
  completed: 7,
  scheduled: 5,
  documents: 34,
  templates: 9,
};

function makeFuneral(overrides: Record<string, unknown>) {
  return {
    id: 'f1',
    agencyId: 'a1',
    deceasedId: 'd1',
    deceased: { id: 'd1', agencyId: 'a1', fullName: 'Maria Silva', age: 82 },
    serviceType: 'CERIMONIA',
    funeralDate: '2026-09-01T10:00:00.000Z',
    funeralTime: '14:00',
    locationParish: 'Lisboa',
    status: 'SCHEDULED',
    publicNoticeEnabled: true,
    ...overrides,
  };
}

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    apiErrorMessage.mockImplementation((_err: unknown, fallback: string) => fallback);
    dashboard.mockResolvedValue(summary);
    funeralsList.mockResolvedValue([]);
  });

  it('mostra o loading enquanto as métricas não chegam', async () => {
    dashboard.mockReturnValue(new Promise(() => {}));
    funeralsList.mockReturnValue(new Promise(() => {}));
    render(<DashboardPage />);

    expect(await screen.findByText('Painel de Gestão Funerária')).toBeInTheDocument();
    expect(screen.getByText(/Bem-vindo, Ana/)).toBeInTheDocument();
    expect(screen.queryByText('Funerais Registados')).not.toBeInTheDocument();
  });

  it('renderiza o banner, a agência e os cartões de métricas', async () => {
    dashboard.mockResolvedValue(summary);
    funeralsList.mockResolvedValue([]);
    render(<DashboardPage />);

    expect(await screen.findByText('Funerais Registados')).toBeInTheDocument();
    expect(screen.getByText('Funerária Casa Hortas (1998)')).toBeInTheDocument();
    expect(screen.getByText('Painel de Gestão Funerária')).toBeInTheDocument();
    expect(screen.getByText(/Bem-vindo, Ana/)).toBeInTheDocument();

    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('34')).toBeInTheDocument();

    expect(dashboard).toHaveBeenCalled();
    expect(funeralsList).toHaveBeenCalled();
  });

  it('renderiza os funerais recentes (últimos 4 invertidos)', async () => {
    dashboard.mockResolvedValue(summary);
    const list = [1, 2, 3, 4, 5].map((n) => makeFuneral({ id: `f${n}`, deceased: { fullName: `Falecido ${n}` } }));
    funeralsList.mockResolvedValue(list);
    render(<DashboardPage />);

    expect(await screen.findByText('Falecido 5')).toBeInTheDocument();
    expect(screen.getByText('Falecido 2')).toBeInTheDocument();
    expect(screen.getByText('Falecido 4')).toBeInTheDocument();
    expect(screen.queryByText('Falecido 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Sem funerais registados.')).not.toBeInTheDocument();
  });

  it('mostra os rótulos de estado e a idade do falecido', async () => {
    funeralsList.mockResolvedValue([
      makeFuneral({ id: 'comp', status: 'COMPLETED', deceased: { fullName: 'Falecido A', age: 80 } }),
      makeFuneral({ id: 'prog', status: 'IN_PROGRESS', deceased: { fullName: 'Falecido B', age: 70 } }),
      makeFuneral({ id: 'sch', status: 'SCHEDULED', deceased: { fullName: 'Falecido C', age: 88 } }),
    ]);
    render(<DashboardPage />);

    expect(await screen.findByText('Concluído')).toBeInTheDocument();
    expect(screen.getByText('Em Curso')).toBeInTheDocument();
    expect(screen.getByText('Agendado')).toBeInTheDocument();
    expect(screen.getByText('80 ANOS')).toBeInTheDocument();
    expect(screen.getByText('70 ANOS')).toBeInTheDocument();
    expect(screen.getByText('88 ANOS')).toBeInTheDocument();
  });

  it('mostra a data e a freguesia do funeral', async () => {
    funeralsList.mockResolvedValue([makeFuneral({})]);
    render(<DashboardPage />);

    await screen.findByText('Maria Silva');
    expect(screen.getByText(/1 de setembro de 2026, 14:00/)).toBeInTheDocument();
    expect(screen.getByText('Lisboa')).toBeInTheDocument();
  });

  it('mostra a data sem hora quando funeralTime não existe', async () => {
    funeralsList.mockResolvedValue([makeFuneral({ funeralTime: null })]);
    render(<DashboardPage />);

    await screen.findByText('Maria Silva');
    expect(screen.getByText('1 de setembro de 2026')).toBeInTheDocument();
    expect(screen.queryByText(/1 de setembro de 2026, 14:00/)).not.toBeInTheDocument();
  });

  it('mostra mensagem quando não há funerais', async () => {
    dashboard.mockResolvedValue(summary);
    funeralsList.mockResolvedValue([]);
    render(<DashboardPage />);

    expect(await screen.findByText('Sem funerais registados.')).toBeInTheDocument();
  });

  it('mostra a mensagem de fallback quando o carregamento falha', async () => {
    dashboard.mockRejectedValue(new Error('network'));
    funeralsList.mockRejectedValue(new Error('network'));
    render(<DashboardPage />);

    expect(await screen.findByText('Não foi possível carregar o painel.')).toBeInTheDocument();
  });

  it('mostra a mensagem do backend no erro via apiErrorMessage', async () => {
    apiErrorMessage.mockReturnValue('Erro do servidor.');
    dashboard.mockRejectedValue({ message: 'server' });
    funeralsList.mockRejectedValue({ message: 'server' });
    render(<DashboardPage />);

    expect(await screen.findByText('Erro do servidor.')).toBeInTheDocument();
    expect(apiErrorMessage).toHaveBeenCalled();
  });

  it('expõe os CTAs que ligam para as rotas certas', async () => {
    dashboard.mockResolvedValue(summary);
    funeralsList.mockResolvedValue([]);
    render(<DashboardPage />);

    expect(await screen.findByText('Funerais Registados')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Criar Flyer de Participação/ })).toHaveAttribute('href', '/flyers');
    expect(screen.getByRole('link', { name: /Gerir Funerais/ })).toHaveAttribute('href', '/funerals');
    expect(screen.getByRole('link', { name: /Ver Todos/ })).toHaveAttribute('href', '/funerals');
  });
});
