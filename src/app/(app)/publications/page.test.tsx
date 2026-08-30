import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const toast = jest.fn();

jest.mock('@/components/Toast', () => ({
  useToast: () => ({ toast }),
}));

const apiErrorMessage = jest.fn((_err: unknown, fallback: string) => fallback);
const pubsList = jest.fn();
const pubsCreate = jest.fn();
const pubsUpdate = jest.fn();
const pubsRemove = jest.fn();
const funeralsList = jest.fn();
const socialPublish = jest.fn();

jest.mock('@/lib/api', () => ({
  apiErrorMessage: (err: unknown, fallback: string) => apiErrorMessage(err, fallback),
  apiService: {
    publications: {
      list: (...args: unknown[]) => pubsList(...args),
      create: (...args: unknown[]) => pubsCreate(...args),
      update: (...args: unknown[]) => pubsUpdate(...args),
      remove: (...args: unknown[]) => pubsRemove(...args),
    },
    funerals: {
      list: (...args: unknown[]) => funeralsList(...args),
    },
    social: {
      publish: (...args: unknown[]) => socialPublish(...args),
    },
  },
}));

import PublicationsPage from '@/app/(app)/publications/page';

function makePub(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 'p1',
    agencyId: 'a1',
    funeralId: null,
    funeral: null,
    title: 'Participação em missa',
    caption: 'Velório de Maria Silva.',
    imageUrl: null,
    platform: 'FACEBOOK',
    status: 'DRAFT',
    scheduledFor: null,
    publishedAt: null,
    externalPostId: null,
    errorMessage: null,
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
    ...overrides,
  };
}

function makeFuneral(overrides: Record<string, unknown> = {}) {
  return {
    id: 'f1',
    deceased: { fullName: 'Maria Silva' },
    funeralDate: '2026-09-02T10:00:00.000Z',
    ...overrides,
  };
}

describe('PublicationsPage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    apiErrorMessage.mockImplementation((_err: unknown, fallback: string) => fallback);
    pubsList.mockResolvedValue([]);
    pubsCreate.mockResolvedValue({});
    pubsUpdate.mockResolvedValue({});
    pubsRemove.mockResolvedValue({ success: true });
    funeralsList.mockResolvedValue([]);
    socialPublish.mockResolvedValue({ success: true });
  });

  it('mostra o loading enquanto as publicações não chegam', async () => {
    pubsList.mockReturnValue(new Promise(() => {}));
    render(<PublicationsPage />);

    expect(await screen.findByText('Publicações Sociais')).toBeInTheDocument();
    expect(screen.queryByText('Nenhuma publicação encontrada')).not.toBeInTheDocument();
    expect(pubsList).toHaveBeenCalledWith(undefined);
  });

  it('renderiza o cabeçalho, filtros e a lista de publicações', async () => {
    pubsList.mockResolvedValue([makePub()]);
    render(<PublicationsPage />);

    expect(await screen.findByText('Participação em missa')).toBeInTheDocument();
    expect(screen.getByText('Velório de Maria Silva.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Todas' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Rascunho' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Agendada' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Publicada' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Nova Publicação' })).toBeInTheDocument();
  });

  it('mostra a mensagem vazia quando não há publicações', async () => {
    pubsList.mockResolvedValue([]);
    render(<PublicationsPage />);

    expect(await screen.findByText('Nenhuma publicação encontrada')).toBeInTheDocument();
  });

  it('mostra o erro genérico quando o carregamento falha', async () => {
    pubsList.mockRejectedValue(new Error('x'));
    render(<PublicationsPage />);

    expect(await screen.findByText('Não foi possível carregar publicações.')).toBeInTheDocument();
  });

  it('passa o filtro para a API ao clique', async () => {
    pubsList.mockResolvedValue([makePub()]);
    render(<PublicationsPage />);
    await screen.findByText('Participação em missa');

    await userEvent.click(screen.getByRole('button', { name: 'Agendada' }));
    await waitFor(() => expect(pubsList).toHaveBeenCalledWith('SCHEDULED'));
  });

  it('pagina a lista quando há mais publicações que o tamanho da página', async () => {
    const many = Array.from({ length: 20 }, (_, i) =>
      makePub({ id: `p${i}`, title: `Publicação ${i + 1}`, status: 'DRAFT' }),
    );
    pubsList.mockResolvedValue(many);
    render(<PublicationsPage />);

    expect(await screen.findByText('Publicação 1')).toBeInTheDocument();
    expect(screen.getByText('Publicação 9')).toBeInTheDocument();
    expect(screen.queryByText('Publicação 10')).not.toBeInTheDocument();
    expect(screen.getByText('20 itens')).toBeInTheDocument();
    expect(screen.getByText('Página 1 de 3')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Página seguinte' }));

    expect(await screen.findByText('Publicação 10')).toBeInTheDocument();
    expect(screen.getByText('Publicação 18')).toBeInTheDocument();
    expect(screen.queryByText('Publicação 19')).not.toBeInTheDocument();
    expect(screen.getByText('Página 2 de 3')).toBeInTheDocument();
  });

  it('filtra e reseta a página para a 1', async () => {
    const many = Array.from({ length: 12 }, (_, i) =>
      makePub({ id: `p${i}`, title: `Pub ${i + 1}` }),
    );
    pubsList.mockResolvedValue(many);
    render(<PublicationsPage />);

    expect(await screen.findByText('Pub 1')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Página seguinte' }));
    expect(await screen.findByText('Pub 10')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Publicada' }));
    await waitFor(() => expect(pubsList).toHaveBeenCalledWith('PUBLISHED'));
    expect(screen.getByText('Página 1 de 2')).toBeInTheDocument();
  });

  it('cria uma publicação através do modal', async () => {
    pubsList.mockResolvedValue([makePub()]);
    render(<PublicationsPage />);
    await screen.findByText('Participação em missa');

    await userEvent.click(screen.getByRole('button', { name: 'Nova Publicação' }));
    await userEvent.type(screen.getByPlaceholderText('Ex: Funeral de João Silva'), 'Novo título');
    await userEvent.type(screen.getByPlaceholderText('Texto da publicação...'), 'Nova legenda');
    await userEvent.click(screen.getByRole('button', { name: 'Criar Publicação' }));

    await waitFor(() =>
      expect(pubsCreate).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Novo título', caption: 'Nova legenda', platform: 'FACEBOOK' }),
      ),
    );
  });

  it('publica imediatamente e notifica sucesso', async () => {
    pubsList.mockResolvedValue([makePub({ status: 'DRAFT' })]);
    render(<PublicationsPage />);
    await screen.findByText('Participação em missa');

    await userEvent.click(screen.getByRole('button', { name: 'Publicar agora' }));

    await waitFor(() => expect(socialPublish).toHaveBeenCalledWith('p1', 'FACEBOOK'));
    expect(socialPublish).toHaveBeenCalled();
  });
});
