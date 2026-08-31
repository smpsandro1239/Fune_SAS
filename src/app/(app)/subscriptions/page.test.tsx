import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const getParam = jest.fn(() => null);

jest.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: (...args: unknown[]) => getParam(...args) }),
}));

const apiErrorMessage = jest.fn((err: unknown, fallback?: string) =>
  err instanceof Error ? err.message : (fallback ?? ''),
);
const subscriptionCurrent = jest.fn();
const subscriptionUsage = jest.fn();
const checkout = jest.fn();
const changePlan = jest.fn();

jest.mock('@/lib/api', () => ({
  apiErrorMessage: (err: unknown, fallback: string) => apiErrorMessage(err, fallback),
  apiService: {
    subscriptions: {
      current: (...args: unknown[]) => subscriptionCurrent(...args),
      usage: (...args: unknown[]) => subscriptionUsage(...args),
      checkout: (...args: unknown[]) => checkout(...args),
      changePlan: (...args: unknown[]) => changePlan(...args),
    },
  },
}));

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: { role: 'ADMIN' } }),
}));

import SubscriptionsPage from '@/app/(app)/subscriptions/page';

const current = {
  id: 's1',
  plan: 'PRO',
  status: 'ACTIVE',
  validUntil: '2027-01-01T00:00:00.000Z',
  stripeId: null,
  agencyId: 'a1',
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

const usage = {
  plan: 'PRO',
  expired: false,
  validUntil: '2027-01-01T00:00:00.000Z',
  usage: { funerals: 50, users: 3, documents: 100 },
  limits: { maxFunerals: 250, maxUsers: 8, maxDocuments: 500 },
};

describe('SubscriptionsPage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    apiErrorMessage.mockImplementation((err: unknown, fallback?: string) =>
      err instanceof Error ? err.message : (fallback ?? ''),
    );
    getParam.mockReturnValue(null);
    subscriptionCurrent.mockResolvedValue(current);
    subscriptionUsage.mockResolvedValue(usage);
  });

  it('mostra o loading enquanto a subscrição não chega', async () => {
    subscriptionCurrent.mockReturnValue(new Promise(() => {}));
    subscriptionUsage.mockReturnValue(new Promise(() => {}));
    const { container } = render(<SubscriptionsPage />);

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    expect(screen.queryByText('Plano & Subscrição')).not.toBeInTheDocument();
  });

  it('mostra o plano atual e a utilização', async () => {
    render(<SubscriptionsPage />);

    expect(await screen.findByText('Plano Atual: Pro')).toBeInTheDocument();
    expect(screen.getByText('Utilização do Plano')).toBeInTheDocument();
    expect(screen.getByText(/50 \/ 250/)).toBeInTheDocument();
    expect(screen.getByText(/3 \/ 8/)).toBeInTheDocument();
    expect(screen.getByText(/100 \/ 500/)).toBeInTheDocument();
  });

  it('mostra os três planos disponíveis com as suas features', async () => {
    render(<SubscriptionsPage />);

    expect(await screen.findByText('Plano Atual: Pro')).toBeInTheDocument();
    expect(screen.getByText('Free')).toBeInTheDocument();
    expect(screen.getByText('Enterprise')).toBeInTheDocument();
    expect(screen.getAllByText('Pro').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'Escolher Free' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Escolher Enterprise' })).toBeInTheDocument();
  });

  it('não mostra o botão Escolher para o plano atual', async () => {
    subscriptionCurrent.mockResolvedValue({ ...current, plan: 'PRO' });
    render(<SubscriptionsPage />);

    await screen.findByText('Plano Atual: Pro');
    expect(screen.queryByRole('button', { name: 'Escolher Pro' })).not.toBeInTheDocument();
  });

  it('inicia o checkout ao escolher outro plano (modo stripe)', async () => {
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, href: 'http://localhost' },
      writable: true,
    });
    checkout.mockResolvedValue({ url: 'https://checkout.stripe.com/x', demoMode: false });

    render(<SubscriptionsPage />);
    await screen.findByText('Plano Atual: Pro');
    await userEvent.click(screen.getByRole('button', { name: 'Escolher Enterprise' }));

    expect(checkout).toHaveBeenCalledWith('ENTERPRISE');
  });

  it('mostra a mensagem de sucesso quando o checkout veio com success', async () => {
    getParam.mockReturnValue('success');
    render(<SubscriptionsPage />);

    expect(await screen.findByText(/Pagamento recebido/)).toBeInTheDocument();
  });

  it('mostra a mensagem de erro quando o checkout veio cancelado', async () => {
    getParam.mockReturnValue('cancel');
    render(<SubscriptionsPage />);

    expect(
      await screen.findByText('Checkout cancelado — nenhuma alteração foi feita.')
    ).toBeInTheDocument();
  });

  it('mostra a mensagem de erro quando o carregamento falha', async () => {
    subscriptionCurrent.mockRejectedValue(new Error('network'));
    render(<SubscriptionsPage />);

    expect(await screen.findByText('network')).toBeInTheDocument();
  });
});
