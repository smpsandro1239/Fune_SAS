import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const replace = jest.fn();

jest.mock('next/navigation', () => ({
  useParams: () => ({ id: 'doc-1' }),
  useRouter: () => ({ replace }),
}));

jest.mock('next/link', () => {
  const Component = ({ children, ...props }: { children: React.ReactNode; [k: string]: unknown }) =>
    React.createElement('a', props, children);
  Component.displayName = 'MockLink';
  return Component;
});

const apiErrorMessage = jest.fn();
const documentsGet = jest.fn();
const documentsRemove = jest.fn();
const fetchFileBlobUrl = jest.fn();
const formatBytes = jest.fn();

jest.mock('@/lib/api', () => ({
  apiErrorMessage: (err: unknown, fallback: string) => apiErrorMessage(err, fallback),
  apiService: {
    documents: {
      get: (...args: unknown[]) => documentsGet(...args),
      remove: (...args: unknown[]) => documentsRemove(...args),
    },
  },
  fetchFileBlobUrl: (...args: unknown[]) => fetchFileBlobUrl(...args),
  formatBytes: (...args: unknown[]) => formatBytes(...args),
}));

Object.defineProperty(URL, 'createObjectURL', {
  writable: true,
  value: jest.fn().mockReturnValue('blob:mock'),
});
Object.defineProperty(URL, 'revokeObjectURL', {
  writable: true,
  value: jest.fn(),
});

import DocumentDetailPage from '@/app/(app)/documents/[id]/page';

function makeDocument(overrides: Record<string, unknown> = {}) {
  return {
    id: 'doc-1',
    agencyId: 'a1',
    title: 'Certidão de Óbito - Luís Freitas',
    type: 'CERTIFICATE',
    fileName: 'certidao.pdf',
    fileUrl: '/uploads/doc1.pdf',
    fileSize: 2048,
    mimeType: 'application/pdf',
    createdAt: '2026-09-01T10:00:00.000Z',
    funeral: {
      id: 'f1',
      funeralDate: '2026-09-01T10:00:00.000Z',
      deceased: { fullName: 'Luís Freitas' },
    },
    ...overrides,
  };
}

describe('DocumentDetailPage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    apiErrorMessage.mockImplementation((_err: unknown, fallback: string) => fallback);
    documentsGet.mockResolvedValue(makeDocument());
    documentsRemove.mockResolvedValue({ success: true });
    fetchFileBlobUrl.mockResolvedValue('blob:mock');
    formatBytes.mockImplementation((bytes: number) => `${bytes} B`);
  });

  it('busca o documento pelo id do parâmetro de rota', async () => {
    render(<DocumentDetailPage />);

    expect(await screen.findByText('Certidão de Óbito - Luís Freitas')).toBeInTheDocument();
    expect(documentsGet).toHaveBeenCalledWith('doc-1');
  });

  it('mostra o carregamento enquanto o documento não chega', async () => {
    documentsGet.mockReturnValue(new Promise(() => {}));
    render(<DocumentDetailPage />);

    expect(screen.queryByText('Pré-visualização')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Voltar aos documentos/ })).toBeNull();
  });

  it('mostra o link de voltar aos documentos após carregar', async () => {
    render(<DocumentDetailPage />);
    await screen.findByText('Certidão de Óbito - Luís Freitas');

    expect(screen.getByRole('link', { name: /Voltar aos documentos/ })).toHaveAttribute(
      'href',
      '/documents',
    );
  });

  it('mostra a mensagem de erro quando o documento não é encontrado', async () => {
    documentsGet.mockResolvedValue(null);
    render(<DocumentDetailPage />);

    expect(await screen.findByText('Documento não encontrado.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Voltar à listagem/ })).toHaveAttribute(
      'href',
      '/documents',
    );
  });

  it('mostra a mensagem do backend no erro de carregamento', async () => {
    apiErrorMessage.mockReturnValue('Erro do servidor.');
    documentsGet.mockRejectedValue({ message: 'server' });
    render(<DocumentDetailPage />);

    expect(await screen.findByText('Erro do servidor.')).toBeInTheDocument();
    expect(apiErrorMessage).toHaveBeenCalled();
  });

  it('renderiza os metadados do documento', async () => {
    render(<DocumentDetailPage />);

    await screen.findByText('Certidão de Óbito - Luís Freitas');
    expect(screen.getByText('Certidão')).toBeInTheDocument();
    expect(screen.getByText('2048 B')).toBeInTheDocument();
    expect(screen.getByText('Luís Freitas')).toBeInTheDocument();
  });

  it('ativa o link de descarregar quando o blob é resolvido', async () => {
    render(<DocumentDetailPage />);

    await screen.findByText('Certidão de Óbito - Luís Freitas');

    const download = screen.getByRole('link', { name: /Descarregar/ });
    await waitFor(() => expect(download).toHaveAttribute('aria-disabled', 'false'));
    expect(download).toHaveAttribute('href', 'blob:mock');
    expect(fetchFileBlobUrl).toHaveBeenCalledWith('/uploads/doc1.pdf');
  });

  it('remove o documento e redireciona para a listagem', async () => {
    const user = userEvent.setup();
    render(<DocumentDetailPage />);
    await screen.findByText('Certidão de Óbito - Luís Freitas');

    await user.click(screen.getByRole('button', { name: 'Remover' }));
    const modal = screen.getByText(/Tem a certeza que pretende remover/).closest('div')!.parentElement!;
    const confirm = within(modal).getByRole('button', { name: 'Remover' });

    await user.click(confirm);

    await waitFor(() => expect(documentsRemove).toHaveBeenCalledWith('doc-1'));
    expect(replace).toHaveBeenCalledWith('/documents');
  });

  it('cancela a remoção sem chamar o serviço', async () => {
    const user = userEvent.setup();
    render(<DocumentDetailPage />);
    await screen.findByText('Certidão de Óbito - Luís Freitas');

    await user.click(screen.getByRole('button', { name: 'Remover' }));
    const modal = screen.getByText(/Tem a certeza que pretende remover/).closest('div')!.parentElement!;
    await user.click(within(modal).getByRole('button', { name: 'Cancelar' }));

    await waitFor(() =>
      expect(screen.queryByText(/Tem a certeza que pretende remover/)).not.toBeInTheDocument(),
    );
    expect(documentsRemove).not.toHaveBeenCalled();
  });
});
