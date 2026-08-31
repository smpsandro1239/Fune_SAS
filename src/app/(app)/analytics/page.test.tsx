import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const apiErrorMessage = jest.fn((_err: unknown, fallback: string) => fallback);
const dashboard = jest.fn();
const funeralsPerPeriod = jest.fn();
const servicesUsage = jest.fn();
const exportReport = jest.fn();

jest.mock('@/lib/api', () => ({
  apiErrorMessage: (err: unknown, fallback: string) => apiErrorMessage(err, fallback),
  apiService: {
    reports: {
      dashboard: (...args: unknown[]) => dashboard(...args),
      funeralsPerPeriod: (...args: unknown[]) => funeralsPerPeriod(...args),
      servicesUsage: (...args: unknown[]) => servicesUsage(...args),
      export: (...args: unknown[]) => exportReport(...args),
    },
  },
}));

import AnalyticsPage from '@/app/(app)/analytics/page';

const summary = {
  funerals: 12,
  completed: 7,
  scheduled: 5,
  documents: 34,
  templates: 27,
};

const period = {
  total: 4,
  periods: [
    { period: '2026-07', count: 2 },
    { period: '2026-08', count: 2 },
  ],
};

const usage = {
  total: 6,
  services: [
    { serviceType: 'CERIMONIA', count: 3, percentage: 50 },
    { serviceType: 'VELORIO', count: 3, percentage: 50 },
  ],
};

describe('AnalyticsPage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    apiErrorMessage.mockImplementation((_err: unknown, fallback: string) => fallback);
    dashboard.mockResolvedValue(summary);
    funeralsPerPeriod.mockResolvedValue(period);
    servicesUsage.mockResolvedValue(usage);
  });

  it('mostra o loading enquanto os relatórios não chegam', async () => {
    dashboard.mockReturnValue(new Promise(() => {}));
    funeralsPerPeriod.mockReturnValue(new Promise(() => {}));
    servicesUsage.mockReturnValue(new Promise(() => {}));
    const { container } = render(<AnalyticsPage />);

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    expect(screen.queryByText('Funerais Registados')).not.toBeInTheDocument();
  });

  it('renderiza o cabeçalho e os cartões de métricas', async () => {
    render(<AnalyticsPage />);

    expect(await screen.findByText('Funerais Registados')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('34')).toBeInTheDocument();
    expect(screen.getByText(/27 modelos de flyer/)).toBeInTheDocument();
  });

  it('mostra as secções de gráficos com totais', async () => {
    render(<AnalyticsPage />);

    expect(await screen.findByText('Funerais por Mês')).toBeInTheDocument();
    expect(screen.getByText('Total: 4')).toBeInTheDocument();
    expect(screen.getByText('Serviços Mais Utilizados')).toBeInTheDocument();
    expect(screen.getByText('Total: 6')).toBeInTheDocument();
  });

  it('mostra mensagens de vazio quando não há dados de gráficos', async () => {
    funeralsPerPeriod.mockResolvedValue({ total: 0, periods: [] });
    servicesUsage.mockResolvedValue({ total: 0, services: [] });
    render(<AnalyticsPage />);

    expect(await screen.findByText('Sem dados para o período.')).toBeInTheDocument();
    expect(screen.getByText('Sem dados de serviços.')).toBeInTheDocument();
  });

  it('mostra a mensagem de erro quando o carregamento falha', async () => {
    dashboard.mockRejectedValue(new Error('network'));
    render(<AnalyticsPage />);

    expect(
      await screen.findByText('Não foi possível carregar os relatórios.')
    ).toBeInTheDocument();
  });

  it('exporta o CSV ao clicar no botão', async () => {
    exportReport.mockResolvedValue({ filename: 'relatorio.csv', content: 'a,b\n1,2' });

    render(<AnalyticsPage />);
    await screen.findByText('Funerais Registados');

    Object.defineProperty(window, 'URL', {
      value: { createObjectURL: jest.fn(() => 'blob:x'), revokeObjectURL: jest.fn() },
      writable: true,
    });
    const origCreateElement = document.createElement.bind(document);
    const mockAnchor = { click: jest.fn(), remove: jest.fn() } as any;
    jest.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') return mockAnchor;
      return origCreateElement(tag);
    });
    jest.spyOn(document.body, 'appendChild').mockImplementation(() => ({} as any));

    const btn = screen.getByRole('button', { name: /Exportar CSV/ });
    await userEvent.click(btn);

    await screen.findByRole('button', { name: /Exportar CSV/ });
    expect(exportReport).toHaveBeenCalled();
  });
});
