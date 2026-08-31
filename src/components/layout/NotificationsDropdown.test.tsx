import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NotificationsDropdown from './NotificationsDropdown';
import { apiService } from '@/lib/api';
import { ApiNotification } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  apiService: {
    notifications: {
      list: jest.fn(),
      markRead: jest.fn(),
      markAllRead: jest.fn(),
    },
  },
}));

const mockedApi = apiService as jest.Mocked<typeof apiService>;

function makeNotification(overrides: Partial<ApiNotification> = {}): ApiNotification {
  return {
    id: 'n1',
    agencyId: 'agency-1',
    userId: 'user-1',
    type: 'SISTEMA',
    title: 'Nova condolência',
    message: 'Alguém deixou uma mensagem',
    readAt: null,
    sentAt: new Date().toISOString(),
    ...overrides,
  };
}

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('NotificationsDropdown', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('mostra o sino e abre o painel com o link para todas as notificações', async () => {
    (mockedApi.notifications.list as jest.Mock).mockResolvedValue([]);
    renderWithProviders(<NotificationsDropdown />);

    fireEvent.click(screen.getByRole('button', { name: /Notificações/i }));
    expect(await screen.findByText('Notificações')).toBeInTheDocument();
    expect(await screen.findByText('Sem notificações.')).toBeInTheDocument();
    expect(screen.getByText('Ver todas as notificações')).toBeInTheDocument();
  });

  it('lista as notificações e mostra o badge de não lidas', async () => {
    (mockedApi.notifications.list as jest.Mock).mockResolvedValue([
      makeNotification({ id: 'n1' }),
      makeNotification({ id: 'n2' }),
      makeNotification({ id: 'n3', readAt: new Date().toISOString() }),
    ]);
    renderWithProviders(<NotificationsDropdown />);

    const badge = await screen.findByText('2');
    expect(badge).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Notificações/i }));
    expect(screen.getAllByText('Nova condolência')).toHaveLength(3);
  });

  it('marca uma notification como lida ao clicar no check individual', async () => {
    (mockedApi.notifications.list as jest.Mock).mockResolvedValue([
      makeNotification({ id: 'n1' }),
    ]);
    (mockedApi.notifications.markRead as jest.Mock).mockResolvedValue({});

    renderWithProviders(<NotificationsDropdown />);
    fireEvent.click(screen.getByRole('button', { name: /Notificações/i }));
    await screen.findByText('Nova condolência');

    const markBtn = screen.getByTitle('Marcar como lida');
    fireEvent.click(markBtn);

    await waitFor(() =>
      expect(mockedApi.notifications.markRead).toHaveBeenCalledWith('n1'),
    );
  });

  it('marca todas como lidas e esconde o botão', async () => {
    (mockedApi.notifications.list as jest.Mock).mockResolvedValue([
      makeNotification({ id: 'n1' }),
      makeNotification({ id: 'n2' }),
    ]);
    (mockedApi.notifications.markAllRead as jest.Mock).mockResolvedValue({ count: 2 });

    renderWithProviders(<NotificationsDropdown />);
    fireEvent.click(screen.getByRole('button', { name: /Notificações/i }));

    const markAll = await screen.findByText('Marcar todas como lidas');
    fireEvent.click(markAll);

    await waitFor(() => expect(mockedApi.notifications.markAllRead).toHaveBeenCalled());
  });
});
