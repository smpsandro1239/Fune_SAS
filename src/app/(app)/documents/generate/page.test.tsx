import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

const toast = jest.fn();

jest.mock('@/components/Toast', () => ({
  useToast: () => ({ toast }),
}));

const apiErrorMessage = jest.fn();
const funeralsList = jest.fn();
const docGenerate = jest.fn();

jest.mock('@/lib/api', () => ({
  apiErrorMessage: (err: unknown, fallback: string) => apiErrorMessage(err, fallback),
  apiService: {
    funerals: {
      list: (...args: unknown[]) => funeralsList(...args),
    },
    docGenerate: {
      generate: (...args: unknown[]) => docGenerate(...args),
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

import GenerateDocumentsPage from '@/app/(app)/documents/generate/page';

jest.setTimeout(60000);

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

describe('GenerateDocumentsPage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    apiErrorMessage.mockImplementation((_err: unknown, fallback: string) => fallback);
    funeralsList.mockResolvedValue([makeFuneral()]);
    docGenerate.mockResolvedValue(new Blob(['pdf'], { type: 'application/pdf' }));
    (URL.createObjectURL as jest.Mock).mockReturnValue('blob:mock');
  });

  async function selectFuneral() {
    fireEvent.focus(screen.getByPlaceholderText('Pesquisar por nome, data, local, estado...'));
    fireEvent.mouseDown(screen.getByRole('button', { name: /Maria Silva/ }));
    fireEvent.click(screen.getByRole('button', { name: /Maria Silva/ }));
    fireEvent.click(screen.getByRole('button', { name: /Declaração de Presença/ }));
  }

  it('renderiza o cabeçalho e carrega os funerais', async () => {
    render(<GenerateDocumentsPage />);

    expect(screen.getByText('Gerar Documento')).toBeInTheDocument();
    expect(
      await screen.findByText(/Selecione um funeral e o tipo de documento/),
    ).toBeInTheDocument();
    expect(funeralsList).toHaveBeenCalled();
  });

  it('mantém o botão de gerar desativado enquanto nada está selecionado', () => {
    render(<GenerateDocumentsPage />);

    expect(
      screen.getByRole('button', { name: /Gerar e Visualizar/ }),
    ).toBeDisabled();
  });

  it('gera o documento mesmo com campos vazios (linha em branco)', async () => {
    render(<GenerateDocumentsPage />);
    await screen.findByText(/Selecione um funeral e o tipo de documento/);

    await selectFuneral();

    fireEvent.click(screen.getByRole('button', { name: /Gerar e Visualizar/ }));

    await waitFor(() => expect(docGenerate).toHaveBeenCalled());
    expect(docGenerate).toHaveBeenCalledWith('f1', 'PRESENCA', {}, 1);
  }, 10000);

  it('gera um documento com sucesso e mostra a pré-visualização', async () => {
    render(<GenerateDocumentsPage />);
    await screen.findByText(/Selecione um funeral e o tipo de documento/);

    await selectFuneral();

    fireEvent.change(screen.getByPlaceholderText('Ex: Maria Silva'), {
      target: { value: 'Joana Silva' },
    });
    fireEvent.change(screen.getByPlaceholderText('Ex: Filha, Amiga, Vizinho...'), {
      target: { value: 'Filha' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Gerar e Visualizar/ }));

    await waitFor(() => expect(docGenerate).toHaveBeenCalled());
    expect(docGenerate).toHaveBeenCalledWith('f1', 'PRESENCA', {
      presentName: 'Joana Silva',
      presentRelation: 'Filha',
    }, 1);
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith(
      'success',
      'Documento gerado com sucesso! Pode visualizar antes de descarregar.',
    );
    expect(await screen.findByText('Descarregar PDF')).toBeInTheDocument();
  }, 10000);

  it('envia o número de cópias selecionado quando gera', async () => {
    render(<GenerateDocumentsPage />);
    await screen.findByText(/Selecione um funeral e o tipo de documento/);

    await selectFuneral();

    fireEvent.change(screen.getByLabelText('Nº de cópias'), { target: { value: '3' } });
    fireEvent.click(screen.getByRole('button', { name: /Gerar e Visualizar/ }));

    await waitFor(() => expect(docGenerate).toHaveBeenCalled());
    expect(docGenerate).toHaveBeenCalledWith('f1', 'PRESENCA', {}, 3);
  }, 10000);

  it('mostra a mensagem de erro quando a geração falha', async () => {
    docGenerate.mockRejectedValue(new Error('network'));
    render(<GenerateDocumentsPage />);
    await screen.findByText(/Selecione um funeral e o tipo de documento/);

    await selectFuneral();

    fireEvent.change(screen.getByPlaceholderText('Ex: Maria Silva'), {
      target: { value: 'Joana Silva' },
    });
    fireEvent.change(screen.getByPlaceholderText('Ex: Filha, Amiga, Vizinho...'), {
      target: { value: 'Filha' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Gerar e Visualizar/ }));

    expect(
      await screen.findByText('Não foi possível gerar o documento.'),
    ).toBeInTheDocument();
    expect(toast).toHaveBeenCalledWith('error', 'Não foi possível gerar o documento.');
  }, 10000);

  it('descarrega o PDF gerado a partir da pré-visualização', async () => {
    const clickSpy = jest
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});
    render(<GenerateDocumentsPage />);
    await screen.findByText(/Selecione um funeral e o tipo de documento/);

    await selectFuneral();

    fireEvent.change(screen.getByPlaceholderText('Ex: Maria Silva'), {
      target: { value: 'Joana Silva' },
    });
    fireEvent.change(screen.getByPlaceholderText('Ex: Filha, Amiga, Vizinho...'), {
      target: { value: 'Filha' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Gerar e Visualizar/ }));

    fireEvent.click(await screen.findByText('Descarregar PDF'));

    expect(clickSpy).toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith('success', 'Download iniciado!');
    clickSpy.mockRestore();
  }, 10000);
});
