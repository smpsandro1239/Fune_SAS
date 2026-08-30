import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('next/link', () => {
  const Component = ({ children, ...props }: { children: React.ReactNode; [k: string]: unknown }) =>
    React.createElement('a', props, children);
  Component.displayName = 'MockLink';
  return Component;
});

const apiErrorMessage = jest.fn();
const documentsList = jest.fn();
const documentsUpload = jest.fn();
const documentsRemove = jest.fn();
const funeralsList = jest.fn();
const fetchFileBlobUrl = jest.fn();
const formatBytes = jest.fn();

jest.mock('@/lib/api', () => ({
  apiErrorMessage: (err: unknown, fallback: string) => apiErrorMessage(err, fallback),
  apiService: {
    documents: {
      list: (...args: unknown[]) => documentsList(...args),
      upload: (...args: unknown[]) => documentsUpload(...args),
      remove: (...args: unknown[]) => documentsRemove(...args),
    },
    funerals: {
      list: (...args: unknown[]) => funeralsList(...args),
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

import DocumentsPage from '@/app/(app)/documents/page';

function makeDocument(overrides: Record<string, unknown> = {}) {
  return {
    id: 'd1',
    agencyId: 'a1',
    title: 'Certidão de Óbito - Luís Freitas',
    type: 'CERTIFICATE',
    fileName: 'certidao.pdf',
    fileUrl: '/uploads/doc1.pdf',
    fileSize: 2048,
    mimeType: 'application/pdf',
    createdAt: '2026-09-01T10:00:00.000Z',
    funeral: null,
    ...overrides,
  };
}

function makeFuneral(overrides: Record<string, unknown> = {}) {
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

describe('DocumentsListPage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    apiErrorMessage.mockImplementation((_err: unknown, fallback: string) => fallback);
    documentsList.mockResolvedValue([makeDocument()]);
    documentsUpload.mockResolvedValue({ id: 'd1' });
    documentsRemove.mockResolvedValue({ success: true });
    funeralsList.mockResolvedValue([makeFuneral()]);
    fetchFileBlobUrl.mockResolvedValue('blob:mock');
    formatBytes.mockImplementation((bytes: number) => `${bytes} B`);
  });

  it('mostra o carregamento durante o fetch inicial', async () => {
    documentsList.mockReturnValue(new Promise(() => {}));
    render(<DocumentsPage />);

    expect(screen.getByText('Gestão Documental & RGPD')).toBeInTheDocument();
  });

  it('renderiza o cabeçalho e a lista de documentos', async () => {
    render(<DocumentsPage />);

    expect(await screen.findByText('Certidão de Óbito - Luís Freitas')).toBeInTheDocument();
    expect(screen.getByText('Gestão Documental & RGPD')).toBeInTheDocument();
    expect(screen.getByText('Carregar Documento')).toBeInTheDocument();
    expect(screen.getAllByText('Certidões').length).toBeGreaterThan(0);
    expect(documentsList).toHaveBeenCalledWith({});
  });

  it('mostra o estado vazio sem documentos', async () => {
    documentsList.mockResolvedValue([]);
    render(<DocumentsPage />);

    expect(await screen.findByText('Sem documentos')).toBeInTheDocument();
    expect(
      screen.getByText(/Carregue certidões, autorizações ou contratos/),
    ).toBeInTheDocument();
  });

  it('mostra a mensagem de erro genérica quando o carregamento falha', async () => {
    documentsList.mockRejectedValue(new Error('network'));
    render(<DocumentsPage />);

    expect(
      await screen.findByText('Não foi possível carregar os documentos.'),
    ).toBeInTheDocument();
  });

  it('mostra a mensagem do backend no erro via apiErrorMessage', async () => {
    apiErrorMessage.mockReturnValue('Erro do servidor.');
    documentsList.mockRejectedValue({ message: 'server' });
    render(<DocumentsPage />);

    expect(await screen.findByText('Erro do servidor.')).toBeInTheDocument();
    expect(apiErrorMessage).toHaveBeenCalled();
  });

  it('refaz a pesquisa após o debounce', async () => {
    const user = userEvent.setup();
    render(<DocumentsPage />);
    await screen.findByText('Certidão de Óbito - Luís Freitas');

    const search = screen.getByPlaceholderText('Pesquisar por título...');
    await user.type(search, 'João');

    await waitFor(() => expect(documentsList).toHaveBeenCalledWith({ search: 'João' }));
  }, 5000);

  it('valida os campos obrigatórios no modal de upload', async () => {
    const user = userEvent.setup();
    render(<DocumentsPage />);
    await screen.findByText('Certidão de Óbito - Luís Freitas');

    await user.click(screen.getByText('Carregar Documento'));
    expect(screen.getByRole('heading', { name: /Carregar Documento/ })).toBeInTheDocument();

    fireEvent.submit(screen.getByRole('button', { name: 'Carregar' }).closest('form')!);
    expect(await screen.findByText('Selecione um ficheiro para carregar.')).toBeInTheDocument();
  });

  it('valida o título no modal de upload', async () => {
    const user = userEvent.setup();
    render(<DocumentsPage />);
    await screen.findByText('Certidão de Óbito - Luís Freitas');

    await user.click(screen.getByText('Carregar Documento'));

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, {
      target: {
        files: [new File(['x'], 'declaracao.pdf', { type: 'application/pdf' })],
      },
    });

    await waitFor(() =>
      expect(
        (screen.getByPlaceholderText('Ex: Certidão de Óbito - Luís Freitas') as HTMLInputElement)
          .value,
      ).toBe('declaracao'),
    );
    fireEvent.change(screen.getByPlaceholderText('Ex: Certidão de Óbito - Luís Freitas'), {
      target: { value: '' },
    });

    fireEvent.submit(screen.getByRole('button', { name: 'Carregar' }).closest('form')!);
    expect(await screen.findByText('Indique um título para o documento.')).toBeInTheDocument();
    expect(documentsUpload).not.toHaveBeenCalled();
  });

  it('carrega um documento com sucesso', async () => {
    const user = userEvent.setup();
    render(<DocumentsPage />);
    await screen.findByText('Certidão de Óbito - Luís Freitas');

    await user.click(screen.getByText('Carregar Documento'));

    await user.type(
      screen.getByPlaceholderText('Ex: Certidão de Óbito - Luís Freitas'),
      'Autorização de Cremação',
    );

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, {
      target: {
        files: [new File(['x'], 'selo.pdf', { type: 'application/pdf' })],
      },
    });

    const combos = screen.getAllByRole('combobox');
    await user.selectOptions(combos[1], 'f1');

    fireEvent.submit(screen.getByRole('button', { name: 'Carregar' }).closest('form')!);

    await waitFor(() => expect(documentsUpload).toHaveBeenCalled());
    expect(documentsUpload).toHaveBeenCalledWith(expect.any(FormData));
  });

  it('remove um documento após confirmação', async () => {
    const user = userEvent.setup();
    render(<DocumentsPage />);
    await screen.findByText('Certidão de Óbito - Luís Freitas');

    await user.click(screen.getByTitle('Remover'));
    expect(screen.getByText('Remover Documento')).toBeInTheDocument();

    const modal = screen.getByText(/Tem a certeza que pretende remover/).closest('div')!.parentElement!;
    await user.click(within(modal).getByRole('button', { name: 'Remover' }));

    await waitFor(() => expect(documentsRemove).toHaveBeenCalledWith('d1'));
  });

  it('cancela a remoção sem chamar o serviço', async () => {
    const user = userEvent.setup();
    render(<DocumentsPage />);
    await screen.findByText('Certidão de Óbito - Luís Freitas');

    await user.click(screen.getByTitle('Remover'));
    expect(screen.getByText('Remover Documento')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    await waitFor(() =>
      expect(screen.queryByText('Remover Documento')).not.toBeInTheDocument(),
    );
    expect(documentsRemove).not.toHaveBeenCalled();
  });

  it('descarrega o ficheiro do documento', async () => {
    const clickSpy = jest
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});
    render(<DocumentsPage />);
    await screen.findByText('Certidão de Óbito - Luís Freitas');

    fireEvent.click(screen.getByTitle('Descarregar / Ver'));

    await waitFor(() => expect(clickSpy).toHaveBeenCalled());
    expect(fetchFileBlobUrl).toHaveBeenCalledWith('/uploads/doc1.pdf');
    clickSpy.mockRestore();
  });

  it('mostra erro quando o download falha', async () => {
    fetchFileBlobUrl.mockRejectedValue(new Error('network'));
    render(<DocumentsPage />);
    await screen.findByText('Certidão de Óbito - Luís Freitas');

    fireEvent.click(screen.getByTitle('Descarregar / Ver'));

    expect(
      await screen.findByText('Não foi possível descarregar o ficheiro.'),
    ).toBeInTheDocument();
  });
});
