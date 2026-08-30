import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const toast = jest.fn();

jest.mock('@/components/Toast', () => ({
  useToast: () => ({ toast }),
}));

const apiErrorMessage = jest.fn((_err: unknown, fallback: string) => fallback);
const list = jest.fn();
const markRead = jest.fn();
const markAllRead = jest.fn();

jest.mock('@/lib/api', () => ({
  apiErrorMessage: (err: unknown, fallback: string) => apiErrorMessage(err, fallback),
  apiService: {
    notifications: {
      list: (...args: unknown[]) => list(...args),
      markRead: (...args: unknown[]) => markRead(...args),
      markAllRead: (...args: unknown[]) => markAllRead(...args),
    },
  },
}));

import NotificationsPage from '@/app/(app)/notifications/page';

function makeItem(overrides: Record<string, unknown> = {}) {
  return {
    id: 'n1',
    agencyId: 'a1',
    userId: null,
    type: 'TAREFA',
    title: 'Nova condolência',
    message: 'Recebeu uma nova condolência.',
    readAt: null,
    sentAt: '2026-09-01T10:00:00.000Z',
    ...overrides,
  };
}

describe('NotificationsPage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    apiErrorMessage.mockImplementation((_err: unknown, fallback: string) => fallback);
    list.mockResolvedValue([]);
    markRead.mockResolvedValue({});
    markAllRead.mockResolvedValue({ count: 0 });
  });

  it('mostra o loading enquanto as notificações não chegam', async () => {
    list.mockReturnValue(new Promise(() => {}));
    render(<NotificationsPage />);

    expect(await screen.findByText('Notificações')).toBeInTheDocument();
    expect(screen.queryByText('Sem notificações.')).not.toBeInTheDocument();
    expect(list).toHaveBeenCalled();
  });

  it('renderiza o cabeçalho, o tipo e a mensagem da notificação', async () => {
    list.mockResolvedValue([makeItem()]);
    render(<NotificationsPage />);

    expect(await screen.findByText('Nova condolência')).toBeInTheDocument();
    expect(screen.getByText('Notificações')).toBeInTheDocument();
    expect(screen.getByText('Recebeu uma nova condolência.')).toBeInTheDocument();
    expect(screen.getByText('Tarefa')).toBeInTheDocument();
    expect(screen.getByText('Marcar lida')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Marcar todas como lidas \(1\)/ })).toBeInTheDocument();
  });

  it('mostra a mensagem vazia quando não há notificações', async () => {
    list.mockResolvedValue([]);
    render(<NotificationsPage />);

    expect(await screen.findByText('Sem notificações.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Marcar todas como lidas/ })).not.toBeInTheDocument();
  });

  it('mostra o erro genérico de carregamento', async () => {
    list.mockRejectedValue(new Error('network'));
    render(<NotificationsPage />);

    expect(await screen.findByText('Não foi possível carregar as notificações.')).toBeInTheDocument();
  });

  it('mostra o erro do backend via apiErrorMessage', async () => {
    apiErrorMessage.mockReturnValue('Erro do servidor.');
    list.mockRejectedValue({ message: 'server' });
    render(<NotificationsPage />);

    expect(await screen.findByText('Erro do servidor.')).toBeInTheDocument();
    expect(apiErrorMessage).toHaveBeenCalled();
  });

  it('marca uma notificação como lida e remove o botão', async () => {
    list.mockResolvedValue([makeItem()]);
    render(<NotificationsPage />);

    await screen.findByText('Nova condolência');
    await userEvent.click(screen.getByRole('button', { name: /Marcar lida/ }));

    await waitFor(() => expect(screen.queryByText('Marcar lida')).not.toBeInTheDocument());
    expect(markRead).toHaveBeenCalledWith('n1');
    expect(toast).toHaveBeenCalledWith('success', 'Notificação marcada como lida.');
    expect(screen.queryByRole('button', { name: /Marcar todas como lidas/ })).not.toBeInTheDocument();
  });

  it('erro ao marcar como lida notifica falha e mantém o botão', async () => {
    list.mockResolvedValue([makeItem()]);
    markRead.mockRejectedValue(new Error('network'));
    render(<NotificationsPage />);

    await screen.findByText('Nova condolência');
    await userEvent.click(screen.getByRole('button', { name: /Marcar lida/ }));

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith('error', 'Não foi possível marcar como lida.'),
    );
    expect(screen.getByRole('button', { name: /Marcar lida/ })).toBeInTheDocument();
  });

  it('marca todas como lidas', async () => {
    list.mockResolvedValue([
      makeItem({ id: 'n1' }),
      makeItem({ id: 'n2', type: 'SISTEMA', title: 'Outra' }),
    ]);
    render(<NotificationsPage />);

    await screen.findByText('Nova condolência');
    await userEvent.click(screen.getByRole('button', { name: /Marcar todas como lidas \(2\)/ }));

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith('success', 'Todas as notificações marcadas como lidas.'),
    );
    expect(markAllRead).toHaveBeenCalled();
    expect(screen.queryByText('Marcar lida')).not.toBeInTheDocument();
  });

  it('não chama markAllRead quando não há não lidas', async () => {
    list.mockResolvedValue([makeItem({ readAt: '2026-09-01T11:00:00.000Z' })]);
    render(<NotificationsPage />);

    await screen.findByText('Nova condolência');
    expect(screen.queryByRole('button', { name: /Marcar todas como lidas/ })).not.toBeInTheDocument();
    expect(markAllRead).not.toHaveBeenCalled();
  });
});
