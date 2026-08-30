import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('next/link', () => {
  const Component = ({ children, ...props }: { children: React.ReactNode; [k: string]: unknown }) =>
    React.createElement('a', props, children);
  Component.displayName = 'MockLink';
  return Component;
});

const toast = jest.fn();

jest.mock('@/components/Toast', () => ({
  useToast: () => ({ toast }),
}));

const apiErrorMessage = jest.fn((_err: unknown, fallback: string) => fallback);
const queue = jest.fn();
const approve = jest.fn();
const reject = jest.fn();
const remove = jest.fn();

jest.mock('@/lib/api', () => ({
  apiErrorMessage: (err: unknown, fallback: string) => apiErrorMessage(err, fallback),
  apiService: {
    condolences: {
      queue: (...args: unknown[]) => queue(...args),
      approve: (...args: unknown[]) => approve(...args),
      reject: (...args: unknown[]) => reject(...args),
      remove: (...args: unknown[]) => remove(...args),
    },
  },
}));

import CondolencesPage from '@/app/(app)/condolences/page';

function makeItem(overrides: Record<string, unknown> = {}) {
  return {
    id: 'c1',
    funeralId: 'f1',
    authorName: 'João Pereira',
    message: 'Sentidas condolências.',
    approved: false,
    createdAt: '2026-09-01T10:00:00.000Z',
    funeral: { id: 'f1', deceased: { fullName: 'Maria Silva' } },
    ...overrides,
  };
}

describe('CondolencesPage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    apiErrorMessage.mockImplementation((_err: unknown, fallback: string) => fallback);
    queue.mockResolvedValue([]);
    approve.mockResolvedValue({});
    reject.mockResolvedValue({});
    remove.mockResolvedValue({ success: true });
  });

  it('mostra o loading enquanto as condolências não chegam', async () => {
    queue.mockReturnValue(new Promise(() => {}));
    render(<CondolencesPage />);

    expect(await screen.findByText('Moderação de Condolências')).toBeInTheDocument();
    expect(screen.queryByText('Sem condolências nesta vista.')).not.toBeInTheDocument();
  });

  it('renderiza o cabeçalho, filtros e a lista de condolências', async () => {
    queue.mockResolvedValue([makeItem()]);
    render(<CondolencesPage />);

    expect(await screen.findByText('João Pereira')).toBeInTheDocument();
    expect(screen.getByText('Moderação de Condolências')).toBeInTheDocument();
    expect(screen.getByText('Sentidas condolências.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pendentes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Aprovadas' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Rejeitadas' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Todas' })).toBeInTheDocument();
    expect(queue).toHaveBeenCalledWith(undefined);
    expect(queue).toHaveBeenCalledTimes(1);
  });

  it('mostra o selo Pendente e liga para o funeral', async () => {
    queue.mockResolvedValue([makeItem()]);
    render(<CondolencesPage />);

    expect(await screen.findByText('Pendente')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: 'Maria Silva' });
    expect(link).toHaveAttribute('href', '/funerals?funeral=f1');
  });

  it('mostra o selo Aprovada quando a condolência foi aprovada', async () => {
    queue.mockResolvedValue([makeItem({ approved: true })]);
    render(<CondolencesPage />);

    expect(await screen.findByText('Aprovada')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Esconder/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Aprovar/ })).not.toBeInTheDocument();
  });

  it('mostra a mensagem vazia quando não há condolências', async () => {
    queue.mockResolvedValue([]);
    render(<CondolencesPage />);

    expect(await screen.findByText('Sem condolências nesta vista.')).toBeInTheDocument();
  });

  it('mostra o erro genérico de carregamento com Tentativa', async () => {
    queue.mockRejectedValue(new Error('network'));
    render(<CondolencesPage />);

    expect(await screen.findByText('Não foi possível carregar as condolências.')).toBeInTheDocument();
  });

  it('mostra o erro do backend via apiErrorMessage', async () => {
    apiErrorMessage.mockReturnValue('Erro do servidor.');
    queue.mockRejectedValue({ message: 'server' });
    render(<CondolencesPage />);

    expect(await screen.findByText('Erro do servidor.')).toBeInTheDocument();
    expect(apiErrorMessage).toHaveBeenCalled();
  });

  it('aprovada remove da lista e notifica sucesso', async () => {
    queue.mockResolvedValue([makeItem()]);
    render(<CondolencesPage />);

    await screen.findByText('João Pereira');
    await userEvent.click(screen.getByRole('button', { name: /Aprovar/ }));

    await waitFor(() => expect(screen.queryByText('João Pereira')).not.toBeInTheDocument());
    expect(approve).toHaveBeenCalledWith('f1', 'c1');
    expect(toast).toHaveBeenCalledWith('success', 'Condolência aprovada.');
  });

  it('aprovada atualiza o selo quando o filtro é Todas', async () => {
    queue.mockResolvedValue([makeItem()]);
    render(<CondolencesPage />);

    await screen.findByText('João Pereira');
    await userEvent.click(screen.getByRole('button', { name: 'Todas' }));

    await waitFor(() => expect(queue).toHaveBeenCalledWith(undefined));
    expect(screen.getByText('João Pereira')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Aprovar/ }));
    await waitFor(() => expect(screen.getByText('Aprovada')).toBeInTheDocument());
    expect(screen.getByText('João Pereira')).toBeInTheDocument();
  });

  it('aprovada falha notifica erro', async () => {
    queue.mockResolvedValue([makeItem()]);
    approve.mockRejectedValue(new Error('network'));
    render(<CondolencesPage />);

    await screen.findByText('João Pereira');
    await userEvent.click(screen.getByRole('button', { name: /Aprovar/ }));

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith('error', 'Não foi possível aprovar a condolência.'),
    );
    expect(screen.getByText('João Pereira')).toBeInTheDocument();
  });

  it('esconder remove da lista e notifica info', async () => {
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);
    queue.mockResolvedValue([makeItem({ approved: true })]);
    render(<CondolencesPage />);

    await screen.findByText('João Pereira');
    await userEvent.click(screen.getByRole('button', { name: /Esconder/ }));

    await waitFor(() => expect(screen.queryByText('João Pereira')).not.toBeInTheDocument());
    expect(reject).toHaveBeenCalledWith('f1', 'c1');
    expect(toast).toHaveBeenCalledWith('info', 'Condolência escondida do público.');
    confirmSpy.mockRestore();
  });

  it('eliminar pede confirmação e remove da lista', async () => {
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
    queue.mockResolvedValue([makeItem()]);
    render(<CondolencesPage />);

    await screen.findByText('João Pereira');
    await userEvent.click(screen.getByRole('button', { name: /Eliminar/ }));

    await waitFor(() => expect(screen.queryByText('João Pereira')).not.toBeInTheDocument());
    expect(remove).toHaveBeenCalledWith('f1', 'c1');
    expect(toast).toHaveBeenCalledWith('success', 'Condolência eliminada.');
    confirmSpy.mockRestore();
  });

  it('eliminar cancela quando a confirmação é recusada', async () => {
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);
    queue.mockResolvedValue([makeItem()]);
    render(<CondolencesPage />);

    await screen.findByText('João Pereira');
    await userEvent.click(screen.getByRole('button', { name: /Eliminar/ }));

    expect(remove).not.toHaveBeenCalled();
    expect(screen.getByText('João Pereira')).toBeInTheDocument();
    confirmSpy.mockRestore();
  });
});
