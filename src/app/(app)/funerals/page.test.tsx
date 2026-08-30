import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('next/link', () => {
  const Component = ({ children, ...props }: { children: React.ReactNode; [k: string]: unknown }) =>
    React.createElement('a', props, children);
  Component.displayName = 'MockLink';
  return Component;
});

const mockAgency = {
  id: 'a1',
  name: 'Funerária Casa Hortas',
  slug: 'casahortas',
  foundedYear: '1998',
  subscriptionPlan: 'PRO',
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

jest.mock('@/context/AgencyContext', () => ({
  useAgency: () => ({ currentAgency: mockAgency }),
}));

const apiErrorMessage = jest.fn();
const funeralsList = jest.fn();
const funeralsCreate = jest.fn();
const funeralsUpdate = jest.fn();
const funeralsRemove = jest.fn();
const deceasedCreate = jest.fn();
const deceasedUpdate = jest.fn();
const publicationsCreate = jest.fn();

jest.mock('@/lib/api', () => ({
  apiErrorMessage: (err: unknown, fallback: string) => apiErrorMessage(err, fallback),
  apiService: {
    funerals: {
      list: (...args: unknown[]) => funeralsList(...args),
      create: (...args: unknown[]) => funeralsCreate(...args),
      update: (...args: unknown[]) => funeralsUpdate(...args),
      remove: (...args: unknown[]) => funeralsRemove(...args),
    },
    deceased: {
      create: (...args: unknown[]) => deceasedCreate(...args),
      update: (...args: unknown[]) => deceasedUpdate(...args),
    },
    publications: {
      create: (...args: unknown[]) => publicationsCreate(...args),
    },
  },
}));

Object.defineProperty(URL, 'createObjectURL', {
  writable: true,
  value: jest.fn().mockReturnValue('blob:mock'),
});
Object.defineProperty(URL, 'revokeObjectURL', {
  writable: true,
  value: jest.fn(),
});

import FuneralsPage from '@/app/(app)/funerals/page';

function makeFuneral(overrides: Record<string, unknown> = {}) {
  return {
    id: 'f1',
    agencyId: 'a1',
    deceasedId: 'd1',
    deceased: { id: 'd1', agencyId: 'a1', fullName: 'MARIA SILVA', age: 82 },
    serviceType: 'CERIMONIA',
    funeralDate: '2026-09-01T10:00:00.000Z',
    funeralTime: '14:00',
    locationParish: 'Lisboa',
    cemeteryLocation: 'Cemitério Municipal',
    wakeLocation: 'Capela Mortuária',
    wakeDate: '2026-08-31T00:00:00.000Z',
    wakeTime: '20:00',
    status: 'SCHEDULED',
    publicNoticeEnabled: true,
    ...overrides,
  };
}

describe('FuneralsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    apiErrorMessage.mockImplementation((_err: unknown, fallback: string) => fallback);
    funeralsList.mockResolvedValue([makeFuneral()]);
    funeralsCreate.mockResolvedValue({ id: 'f1' });
    funeralsUpdate.mockResolvedValue({});
    funeralsRemove.mockResolvedValue({ success: true });
    deceasedCreate.mockResolvedValue({ id: 'd1' });
    deceasedUpdate.mockResolvedValue({});
    publicationsCreate.mockResolvedValue({ id: 'p1' });
  });

  it('renderiza a lista, estatísticas e a data formatada', async () => {
    render(<FuneralsPage />);

    expect(await screen.findByText('MARIA SILVA')).toBeInTheDocument();
    expect(screen.getByText('Gestão de Funerais & Falecidos')).toBeInTheDocument();
    expect(screen.getAllByText('Agendado').length).toBeGreaterThan(0);
    expect(screen.getByText('82 ANOS')).toBeInTheDocument();
    expect(screen.getByText(/terça-feira, 1 de setembro de 2026 • 14:00/)).toBeInTheDocument();
    expect(screen.getByText('Lisboa')).toBeInTheDocument();
    expect(screen.getByText('Cemitério Municipal')).toBeInTheDocument();
    expect(screen.getByText('Serviço: Cerimónia')).toBeInTheDocument();
    expect(screen.getByText(/Velório: 31\/08 20:00 — Capela Mortuária/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Página Pública/ })).toHaveAttribute(
      'href',
      '/public/casahortas/f1',
    );
  });

  it('mostra o estado vazio sem funerais', async () => {
    funeralsList.mockResolvedValue([]);
    render(<FuneralsPage />);

    expect(await screen.findByText('Sem funerais registados')).toBeInTheDocument();
    expect(screen.getByText(/Registe o primeiro funeral para começar/)).toBeInTheDocument();
  });

  it('mostra a mensagem de erro genérica quando o carregamento falha', async () => {
    funeralsList.mockRejectedValue(new Error('network'));
    render(<FuneralsPage />);

    expect(
      await screen.findByText('Não foi possível carregar os funerais.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Tentar novamente')).toBeInTheDocument();
  });

  it('mostra a mensagem do backend no erro de carregamento', async () => {
    apiErrorMessage.mockReturnValue('Erro do servidor.');
    funeralsList.mockRejectedValue({ message: 'server' });
    render(<FuneralsPage />);

    expect(await screen.findByText('Erro do servidor.')).toBeInTheDocument();
    expect(apiErrorMessage).toHaveBeenCalled();
  });

  it('filtra por estado e por pesquisa (com debounce)', async () => {
    const user = userEvent.setup();
    render(<FuneralsPage />);
    await screen.findByText('MARIA SILVA');

    await user.selectOptions(screen.getByRole('combobox'), 'COMPLETED');
    await waitFor(() => expect(funeralsList).toHaveBeenCalledWith({ status: 'COMPLETED' }));

    const search = screen.getByPlaceholderText('Pesquisar por nome do falecido...');
    await user.type(search, 'João');
    await waitFor(() =>
      expect(funeralsList).toHaveBeenCalledWith({ search: 'João', status: 'COMPLETED' }),
    );
  });

  it('abre o modal de registo e valida os campos obrigatórios', async () => {
    const user = userEvent.setup();
    render(<FuneralsPage />);
    await screen.findByText('MARIA SILVA');

    await user.click(screen.getByText('Registar Novo Funeral'));
    expect(screen.getByRole('heading', { name: /Registar Novo Funeral/ })).toBeInTheDocument();

    await user.type(screen.getByLabelText('Nome do Falecido *'), 'Joaquim');
    const form = screen.getByLabelText('Nome do Falecido *').closest('form') as HTMLFormElement;
    fireEvent.submit(form);
    expect(await screen.findByText('Indique a data do funeral.')).toBeInTheDocument();
  });

  it('regista um novo funeral com sucesso (sem data de óbito)', async () => {
    const user = userEvent.setup();
    render(<FuneralsPage />);
    await screen.findByText('MARIA SILVA');

    await user.click(screen.getByText('Registar Novo Funeral'));
    await user.type(screen.getByLabelText('Nome do Falecido *'), 'Joaquim');
    await user.type(screen.getByLabelText('Data do Funeral *'), '2026-09-05');

    await user.click(screen.getByRole('button', { name: 'Registar Funeral' }));

    expect(await screen.findByText('Funeral registado com sucesso.')).toBeInTheDocument();
    expect(deceasedCreate).toHaveBeenCalled();
    expect(funeralsCreate).toHaveBeenCalled();
  });

  it('edita um funeral e guarda as alterações', async () => {
    const user = userEvent.setup();
    render(<FuneralsPage />);
    await screen.findByText('MARIA SILVA');

    await user.click(screen.getByLabelText('Editar funeral de MARIA SILVA'));
    expect(screen.getByRole('heading', { name: /Editar Funeral/ })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Guardar Alterações' }));
    expect(await screen.findByText('Funeral atualizado com sucesso.')).toBeInTheDocument();
    expect(funeralsUpdate).toHaveBeenCalled();
    expect(deceasedUpdate).toHaveBeenCalled();
  });

  it('remove um funeral após confirmação', async () => {
    const user = userEvent.setup();
    render(<FuneralsPage />);
    await screen.findByText('MARIA SILVA');

    await user.click(screen.getByLabelText('Apagar funeral de MARIA SILVA'));
    expect(screen.getByText('Remover Funeral')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Sim, Remover/ }));
    expect(await screen.findByText('Funeral removido.')).toBeInTheDocument();
    expect(funeralsRemove).toHaveBeenCalledWith('f1');
  });

  it('cria uma publicação social a partir da partilha', async () => {
    const user = userEvent.setup();
    render(<FuneralsPage />);
    await screen.findByText('MARIA SILVA');

    await user.click(screen.getByText('Partilhar'));
    expect(screen.getByText('Partilhar Funeral')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Criar Publicação/ }));
    expect(
      await screen.findByText(/Publicação criada com sucesso/),
    ).toBeInTheDocument();
    expect(publicationsCreate).toHaveBeenCalledWith({
      title: 'Funeral de MARIA SILVA',
      caption: expect.stringContaining('Cerimónia funerária de MARIA SILVA') as unknown as string,
      platform: 'FACEBOOK',
      funeralId: 'f1',
      scheduledFor: undefined,
    });
  });

  it('exporta a lista para CSV', async () => {
    const clickSpy = jest
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});
    render(<FuneralsPage />);
    await screen.findByText('MARIA SILVA');

    await userEvent.click(screen.getByText('Exportar CSV'));
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockRestore();
  });
});
