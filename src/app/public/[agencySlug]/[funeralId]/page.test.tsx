import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockParams = jest.fn().mockReturnValue({ agencySlug: 'funeraria-x', funeralId: 'f1' });

jest.mock('next/navigation', () => ({
  useParams: () => mockParams(),
}));

jest.mock('qrcode.react', () => ({
  QRCodeSVG: () => React.createElement('svg', { 'data-testid': 'qr-code' }),
}));

const mockGet = jest.fn();
const mockPost = jest.fn();
const mockIsAxiosError = jest.fn().mockReturnValue(false);

jest.mock('axios', () => ({
  get: (...args: unknown[]) => mockGet(...args),
  post: (...args: unknown[]) => mockPost(...args),
  isAxiosError: (...args: unknown[]) => mockIsAxiosError(...args),
}));

import PublicObituaryPage from '@/app/public/[agencySlug]/[funeralId]/page';

const baseData = {
  funeral: {
    id: 'f1',
    funeralDate: '2026-05-01T10:00:00',
    funeralTime: '10:00',
    locationParish: 'Igreja Matriz',
    cemeteryLocation: 'Cemitério Central',
    wakeLocation: 'Capela Mortuária',
    wakeDate: '2026-04-30T18:00:00',
    wakeTime: '18:00',
    notes: 'Traje de luto.',
    serviceType: 'CERIMONIA',
    deceased: {
      fullName: 'Maria Silva',
      age: 72,
      dateOfBirth: '1954-01-01',
      dateOfDeath: '2026-04-30',
      placeOfDeath: 'Lisboa',
      photoUrl: null,
    },
    condolences: [
      {
        id: 'c1',
        authorName: 'João',
        message: 'Sentidas condolências.',
        createdAt: new Date().toISOString(),
      },
    ],
  },
  agency: {
    name: 'Funerária Casa Hortas',
    phone: '210000000',
    email: 'info@exemplo.pt',
    address: 'Rua 1',
    location: 'Lisboa',
    website: null,
  },
};

describe('PublicObituaryPage', () => {
  beforeEach(() => {
    mockParams.mockReturnValue({ agencySlug: 'funeraria-x', funeralId: 'f1' });
    mockGet.mockReset();
    mockPost.mockReset();
    mockIsAxiosError.mockReset();
    mockIsAxiosError.mockReturnValue(false);
  });

  it('mostra o loading enquanto carrega sem renderizar o conteúdo', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    render(<PublicObituaryPage />);
    expect(screen.queryByText('Maria Silva')).not.toBeInTheDocument();
    expect(screen.queryByText('Publicação não encontrada')).not.toBeInTheDocument();
  });

  it('renderiza o obituário e a agência após carregar', async () => {
    mockGet.mockResolvedValue({ data: baseData });
    render(<PublicObituaryPage />);

    expect(await screen.findByText('Maria Silva')).toBeInTheDocument();
    expect(screen.getByText('Publicado por Funerária Casa Hortas')).toBeInTheDocument();
    expect(mockGet).toHaveBeenCalledWith(
      expect.stringContaining('/public/funeraria-x/f1'),
    );
  });

  it('mostra a lista de condolências existentes', async () => {
    mockGet.mockResolvedValue({ data: baseData });
    render(<PublicObituaryPage />);

    expect(await screen.findByText('João')).toBeInTheDocument();
    expect(screen.getByText('Sentidas condolências.')).toBeInTheDocument();
  });

  it('mostra mensagem genérica quando o carregamento falha sem detalhes', async () => {
    mockGet.mockRejectedValue(new Error('network'));
    render(<PublicObituaryPage />);

    expect(await screen.findByText('Publicação não encontrada')).toBeInTheDocument();
    expect(screen.getByText('Não foi possível carregar os dados deste funeral.')).toBeInTheDocument();
  });

  it('mostra a mensagem do backend quando o carregamento falha com erro axios', async () => {
    mockIsAxiosError.mockReturnValue(true);
    mockGet.mockRejectedValue({
      isAxiosError: true,
      response: { data: { message: 'Funeral não encontrado.' } },
    });
    render(<PublicObituaryPage />);

    expect(await screen.findByText('Funeral não encontrado.')).toBeInTheDocument();
  });

  it('adiciona a condolência à lista quando o envio não é moderado', async () => {
    mockGet.mockResolvedValue({ data: baseData });
    mockPost.mockResolvedValue({ data: { message: 'Condolência registada.' } });
    const user = userEvent.setup();
    render(<PublicObituaryPage />);

    await screen.findByText('Maria Silva');
    await user.type(screen.getByPlaceholderText('O seu nome ou família...'), 'Ana');
    await user.type(
      screen.getByPlaceholderText('Escreva a sua mensagem de condolências para a família...'),
      'Que descanse em paz.',
    );
    await user.click(screen.getByText('Enviar Condolências'));

    expect(await screen.findByText('Condolência registada.')).toBeInTheDocument();
    expect(mockPost).toHaveBeenCalledWith(
      expect.stringContaining('/public/funeraria-x/f1/condolences'),
      expect.objectContaining({ authorName: 'Ana', message: 'Que descanse em paz.' }),
    );
    expect(screen.getByText('Ana')).toBeInTheDocument();
  });

  it('não adiciona a condolência quando a moderação está ativa', async () => {
    mockGet.mockResolvedValue({ data: baseData });
    mockPost.mockResolvedValue({ data: { moderated: true, message: 'A mensagem aguarda aprovação.' } });
    const user = userEvent.setup();
    render(<PublicObituaryPage />);

    await screen.findByText('Maria Silva');
    await user.type(screen.getByPlaceholderText('O seu nome ou família...'), 'Ana');
    await user.type(
      screen.getByPlaceholderText('Escreva a sua mensagem de condolências para a família...'),
      'Mensagem moderada.',
    );
    await user.click(screen.getByText('Enviar Condolências'));

    expect(await screen.findByText('Maria Silva')).toBeInTheDocument();
    expect(screen.queryByText('Ana')).not.toBeInTheDocument();
    expect(mockPost).toHaveBeenCalledWith(
      expect.stringContaining('/public/funeraria-x/f1/condolences'),
      expect.objectContaining({ authorName: 'Ana', message: 'Mensagem moderada.' }),
    );
  });

  it('mostra erro do backend ao enviar a condolência', async () => {
    mockGet.mockResolvedValue({ data: baseData });
    mockIsAxiosError.mockReturnValue(true);
    mockPost.mockRejectedValue({
      isAxiosError: true,
      response: { data: { message: 'Erro ao guardar a mensagem.' } },
    });
    const user = userEvent.setup();
    render(<PublicObituaryPage />);

    await screen.findByText('Maria Silva');
    await user.type(screen.getByPlaceholderText('O seu nome ou família...'), 'Ana');
    await user.type(
      screen.getByPlaceholderText('Escreva a sua mensagem de condolências para a família...'),
      'Mensagem.',
    );
    await user.click(screen.getByText('Enviar Condolências'));

    expect(await screen.findByText('Erro ao guardar a mensagem.')).toBeInTheDocument();
  });

  it('alterna a visibilidade do código QR', async () => {
    mockGet.mockResolvedValue({ data: baseData });
    const user = userEvent.setup();
    render(<PublicObituaryPage />);

    await screen.findByText('Maria Silva');
    expect(screen.queryByTestId('qr-code')).not.toBeInTheDocument();

    await user.click(screen.getByText('Código QR'));
    expect(screen.getByTestId('qr-code')).toBeInTheDocument();
  });
});
