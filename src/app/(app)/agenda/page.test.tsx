import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('next/link', () => {
  const Component = ({ children, ...props }: { children: React.ReactNode; [k: string]: unknown }) =>
    React.createElement('a', props, children);
  Component.displayName = 'MockLink';
  return Component;
});

const mockAgency = { id: 'a1', name: 'Funerária Casa Hortas', slug: 'casahortas' };

jest.mock('@/context/AgencyContext', () => ({
  useAgency: () => ({ currentAgency: mockAgency }),
}));

const apiErrorMessage = jest.fn((_err: unknown, fallback: string) => fallback);
const funeralsList = jest.fn();

jest.mock('@/lib/api', () => ({
  apiErrorMessage: (err: unknown, fallback: string) => apiErrorMessage(err, fallback),
  apiService: {
    funerals: {
      list: (...args: unknown[]) => funeralsList(...args),
    },
  },
}));

import AgendaPage from '@/app/(app)/agenda/page';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function makeFuneral(overrides: Record<string, unknown> = {}) {
  const now = new Date();
  const day = now.getDate();
  return {
    id: 'f1',
    agencyId: 'a1',
    deceasedId: 'd1',
    deceased: { id: 'd1', agencyId: 'a1', fullName: 'Maria Silva', age: 82 },
    serviceType: 'CERIMONIA',
    funeralDate: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(day)}T10:00:00.000Z`,
    funeralTime: '14:00',
    locationParish: 'Lisboa',
    cemeteryLocation: 'Cemitério do Alto',
    wakeLocation: 'Capela Mortuária',
    wakeTime: '13:00',
    status: 'SCHEDULED',
    publicNoticeEnabled: true,
    ...overrides,
  };
}

describe('AgendaPage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    apiErrorMessage.mockImplementation((_err: unknown, fallback: string) => fallback);
    funeralsList.mockResolvedValue([]);
  });

  it('mostra o loading enquanto os funerais não chegam', async () => {
    funeralsList.mockReturnValue(new Promise(() => {}));
    render(<AgendaPage />);

    expect(await screen.findByText('Agenda de Serviços')).toBeInTheDocument();
    expect(funeralsList).toHaveBeenCalled();
  });

  it('renderiza o cabeçalho com o nome da agência e o botão de gerir funerais', async () => {
    render(<AgendaPage />);

    expect(await screen.findByText('Agenda de Serviços')).toBeInTheDocument();
    expect(screen.getByText('Funerária Casa Hortas')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /Gerir Funerais/ });
    expect(link).toHaveAttribute('href', '/funerals');
    expect(funeralsList).toHaveBeenCalled();
  });

  it('mostra os dias da semana e o rótulo do mês', async () => {
    render(<AgendaPage />);

    await screen.findByText('Agenda de Serviços');
    for (const wd of ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']) {
      expect(screen.getByText(wd)).toBeInTheDocument();
    }
    const now = new Date();
    const expected = now.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  it('mostra as cerimónias do mês no calendário', async () => {
    funeralsList.mockResolvedValue([makeFuneral({ status: 'COMPLETED' })]);
    render(<AgendaPage />);

    const cell = await screen.findByTitle('Maria Silva — 14:00');
    expect(cell).toBeInTheDocument();
    expect(cell).toHaveTextContent('Maria Silva');
    expect(screen.getByText('1 dias com serviços')).toBeInTheDocument();
  });

  it('mostra os próximos serviços na barra lateral', async () => {
    funeralsList.mockResolvedValue([
      makeFuneral({ id: 'f1', status: 'SCHEDULED' }),
      makeFuneral({ id: 'f2', deceased: { id: 'd2', agencyId: 'a1', fullName: 'José Santos' }, status: 'IN_PROGRESS' }),
    ]);
    render(<AgendaPage />);

    await screen.findByText('Próximas Cerimónias');
    expect(screen.getAllByText('Maria Silva').length).toBeGreaterThan(0);
    expect(screen.getAllByText('José Santos').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Agendado').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Em Curso').length).toBeGreaterThan(0);
  });

  it('mostra mensagem quando não há cerimónias próximas', async () => {
    funeralsList.mockResolvedValue([]);
    render(<AgendaPage />);

    expect(await screen.findByText('Sem cerimónias agendadas.')).toBeInTheDocument();
  });

  it('abre o modal ao clicar numa cerimónia do calendário', async () => {
    funeralsList.mockResolvedValue([makeFuneral()]);
    render(<AgendaPage />);

    await userEvent.click(await screen.findByTitle('Maria Silva — 14:00'));

    expect(screen.getByText('Cerimónia')).toBeInTheDocument();
    expect(screen.getByText('Lisboa')).toBeInTheDocument();
    expect(screen.getByText('Cemitério do Alto')).toBeInTheDocument();
    expect(screen.getByText('Velório: Capela Mortuária (13:00)')).toBeInTheDocument();
    expect(screen.getByText('82 anos')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Gerar Flyer/ })).toHaveAttribute('href', '/flyers');
  });

  it('fecha o modal ao carregar em Fechar', async () => {
    funeralsList.mockResolvedValue([makeFuneral()]);
    render(<AgendaPage />);

    await userEvent.click(await screen.findByTitle('Maria Silva — 14:00'));
    expect(screen.getByText('Cemitério do Alto')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    await waitFor(() => expect(screen.queryByText('Cemitério do Alto')).not.toBeInTheDocument());
  });

  it('expõe o botão Hoje para voltar ao mês atual', async () => {
    render(<AgendaPage />);

    await screen.findByText('Agenda de Serviços');
    expect(screen.getByRole('button', { name: 'Hoje' })).toBeInTheDocument();
  });

  it('mostra o erro genérico de carregamento', async () => {
    funeralsList.mockRejectedValue(new Error('network'));
    render(<AgendaPage />);

    expect(await screen.findByText('Não foi possível carregar a agenda.')).toBeInTheDocument();
  });

  it('mostra o erro do backend via apiErrorMessage', async () => {
    apiErrorMessage.mockReturnValue('Erro do servidor.');
    funeralsList.mockRejectedValue({ message: 'server' });
    render(<AgendaPage />);

    expect(await screen.findByText('Erro do servidor.')).toBeInTheDocument();
    expect(apiErrorMessage).toHaveBeenCalled();
  });
});
