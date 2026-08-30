import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiAgency, ApiUser, UserRole } from '@/lib/api';

jest.mock('next/link', () => {
  const Component = ({ children, ...props }: { children: React.ReactNode; [k: string]: unknown }) =>
    React.createElement('a', props, children);
  Component.displayName = 'MockLink';
  return Component;
});

let mockUser: ApiUser;
let mockAgency: any;
let mockAgencyLoading = false;

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: mockUser }),
}));

jest.mock('@/context/AgencyContext', () => ({
  useAgency: () => ({ currentAgency: mockAgency, loading: mockAgencyLoading, reload }),
}));

const apiErrorMessage = jest.fn();
const agenciesUpdate = jest.fn();
const testWhatsApp = jest.fn();
const usersList = jest.fn();
const usersCreate = jest.fn();
const usersUpdate = jest.fn();
const usersRemove = jest.fn();
const reload = jest.fn();

jest.mock('@/lib/api', () => ({
  apiErrorMessage: (...args: unknown[]) => apiErrorMessage(...args),
  apiService: {
    agencies: {
      update: (...args: unknown[]) => agenciesUpdate(...args),
      testWhatsApp: (...args: unknown[]) => testWhatsApp(...args),
    },
    users: {
      list: (...args: unknown[]) => usersList(...args),
      create: (...args: unknown[]) => usersCreate(...args),
      update: (...args: unknown[]) => usersUpdate(...args),
      remove: (...args: unknown[]) => usersRemove(...args),
    },
  },
}));

import AgenciesPage from '@/app/(app)/agencies/page';

const sessionUser: ApiUser = {
  id: 'u1',
  agencyId: 'a1',
  name: 'Ana Oliveira',
  email: 'ana@agencia.pt',
  role: 'ADMIN',
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

function makeAgency(overrides: Partial<Record<string, unknown>> = {}): ApiAgency & { initials?: string } {
  return {
    id: 'a1',
    name: 'Funerária Casa Hortas',
    slug: 'casahortas',
    subscriptionPlan: 'PRO',
    condolenceModeration: false,
    initials: 'CH',
    facebookPageUrl: '',
    instagramPageUrl: '',
    linkedinUrl: '',
    twitterUrl: '',
    youtubeUrl: '',
    tiktokUrl: '',
    facebookPageId: '',
    facebookPageAccessToken: '',
    instagramBusinessId: '',
    whatsappPhoneNumberId: '',
    whatsappAccessToken: '',
    whatsappNotifyNumber: '',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    ...overrides,
  };
}

function makeUser(overrides: Partial<ApiUser> = {}): ApiUser {
  return {
    id: 'u1',
    agencyId: 'a1',
    name: 'Ana Oliveira',
    email: 'ana@agencia.pt',
    role: 'OPERATOR',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    ...overrides,
  };
}

describe('AgenciesPage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    apiErrorMessage.mockImplementation((_err: unknown, fallback: string) => fallback);
    agenciesUpdate.mockResolvedValue({});
    reload.mockResolvedValue(undefined);
    mockUser = { ...sessionUser };
    mockAgency = makeAgency();
    mockAgencyLoading = false;
  });

  it('renderiza o cabeçalho, subtítulo, nome da agência e UI de administrador', async () => {
    usersList.mockResolvedValue([makeUser({ role: 'ADMIN' })]);
    render(<AgenciesPage />);

    expect(screen.getByText('Agência & Utilizadores')).toBeInTheDocument();
    expect(screen.getByText('Perfil da agência, redes sociais, plano e equipa.')).toBeInTheDocument();
    expect(await screen.findByText('Funerária Casa Hortas')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Adicionar Utilizador' })).toBeInTheDocument();
    expect(screen.getByText('Permissões completas (Administrador)')).toBeInTheDocument();
  });

  it('lista os utilizadores com rótulos de função, contagem plural e badge (eu)', async () => {
    usersList.mockResolvedValue([
      makeUser({ id: 'u1', name: 'Ana Oliveira', role: 'ADMIN' }),
      makeUser({ id: 'u2', name: 'João Rocha', email: 'joao@agencia.pt', role: 'OPERATOR' }),
      makeUser({ id: 'u3', name: 'Marta Silva', email: 'marta@agencia.pt', role: 'DESIGNER' }),
    ]);
    render(<AgenciesPage />);

    expect(await screen.findByText('3 utilizadores')).toBeInTheDocument();
    expect(screen.getByText('Administrador')).toBeInTheDocument();
    expect(screen.getByText('Operador')).toBeInTheDocument();
    expect(screen.getByText('Designer')).toBeInTheDocument();
    expect(screen.getByText('(eu)')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Moderação de Condolências' })).toHaveAttribute('href', '/condolences');
  });

  it('mostra a contagem singular "1 utilizador"', async () => {
    usersList.mockResolvedValue([makeUser({})]);
    render(<AgenciesPage />);

    expect(await screen.findByText('1 utilizador')).toBeInTheDocument();
  });

  it('carrega os utilizadores da API no monte', async () => {
    usersList.mockResolvedValue([makeUser({})]);
    render(<AgenciesPage />);

    await screen.findByText('1 utilizador');
    expect(usersList).toHaveBeenCalled();
    expect(usersList).toHaveBeenCalledWith();
  });

  it('mostra a mensagem de fallback quando o carregamento de utilizadores falha', async () => {
    usersList.mockRejectedValue(new Error('network'));
    render(<AgenciesPage />);

    expect(await screen.findByText('Não foi possível carregar os utilizadores.')).toBeInTheDocument();
    expect(apiErrorMessage).toHaveBeenCalled();
  });

  it('mostra a mensagem do backend no erro de carregamento', async () => {
    apiErrorMessage.mockReturnValue('Erro do servidor.');
    usersList.mockRejectedValue({ message: 'Erro do servidor.' });
    render(<AgenciesPage />);

    expect(await screen.findByText('Erro do servidor.')).toBeInTheDocument();
  });

  it('para não-administradores oculta botões/cartão admin e mostra o aviso', async () => {
    mockUser = { ...sessionUser, role: 'OPERATOR' };
    usersList.mockResolvedValue([makeUser({})]);
    render(<AgenciesPage />);

    await screen.findByText('1 utilizador');
    expect(screen.queryByRole('button', { name: 'Adicionar Utilizador' })).not.toBeInTheDocument();
    expect(screen.queryByText('Permissões completas (Administrador)')).not.toBeInTheDocument();
    expect(screen.queryByText('Moderação de Condolências')).not.toBeInTheDocument();
    expect(screen.getByText('Apenas administradores podem gerir utilizadores e redes sociais.')).toBeInTheDocument();
  });

  it('ativa a moderação de condolências ao clicar no switch', async () => {
    usersList.mockResolvedValue([makeUser({})]);
    render(<AgenciesPage />);

    const toggle = await screen.findByRole('switch');
    expect(toggle).toHaveAttribute('aria-checked', 'false');

    await userEvent.click(toggle);

    await waitFor(() => expect(agenciesUpdate).toHaveBeenCalledWith({ condolenceModeration: true }));
    expect(reload).toHaveBeenCalled();
    expect(screen.getByText('Moderação de condolências ativada.')).toBeInTheDocument();
  });

  it('desativa a moderação de condolências quando já está ativa', async () => {
    mockAgency = makeAgency({ condolenceModeration: true });
    usersList.mockResolvedValue([makeUser({})]);
    render(<AgenciesPage />);

    const toggle = await screen.findByRole('switch');
    expect(toggle).toHaveAttribute('aria-checked', 'true');

    await userEvent.click(toggle);

    await waitFor(() => expect(agenciesUpdate).toHaveBeenCalledWith({ condolenceModeration: false }));
    expect(reload).toHaveBeenCalled();
    expect(screen.getByText('Moderação de condolências desativada.')).toBeInTheDocument();
  });

  it('envia uma mensagem de teste WhatsApp com sucesso', async () => {
    mockAgency = makeAgency({ whatsappPhoneNumberId: '12345', whatsappAccessToken: 'EAAG', whatsappNotifyNumber: '351912345678' });
    testWhatsApp.mockResolvedValue({ sent: true, to: '351912345678' });
    usersList.mockResolvedValue([makeUser({})]);
    render(<AgenciesPage />);

    await userEvent.click(await screen.findByRole('button', { name: /Enviar Teste WhatsApp/ }));

    await waitFor(() => expect(testWhatsApp).toHaveBeenCalled());
    expect(screen.getByText('Mensagem de teste enviada para 351912345678.')).toBeInTheDocument();
  });

  it('mostra o erro do backend quando o teste WhatsApp falha', async () => {
    mockAgency = makeAgency({ whatsappPhoneNumberId: '12345', whatsappAccessToken: 'EAAG' });
    testWhatsApp.mockResolvedValue({ sent: false, error: 'Falha no envio.' });
    usersList.mockResolvedValue([makeUser({})]);
    render(<AgenciesPage />);

    await userEvent.click(await screen.findByRole('button', { name: /Enviar Teste WhatsApp/ }));

    expect(await screen.findByText('Falha no envio.')).toBeInTheDocument();
  });

  it('mostra o fallback via apiErrorMessage quando o teste WhatsApp rejeita', async () => {
    mockAgency = makeAgency({ whatsappPhoneNumberId: '12345', whatsappAccessToken: 'EAAG' });
    testWhatsApp.mockRejectedValue(new Error('boom'));
    usersList.mockResolvedValue([makeUser({})]);
    render(<AgenciesPage />);

    await userEvent.click(await screen.findByRole('button', { name: /Enviar Teste WhatsApp/ }));

    expect(await screen.findByText('Não foi possível enviar a mensagem de teste.')).toBeInTheDocument();
    expect(apiErrorMessage).toHaveBeenCalled();
  });

  it('cria um utilizador através do modal', async () => {
    const user = userEvent.setup();
    usersList.mockResolvedValue([makeUser({})]);
    render(<AgenciesPage />);
    await screen.findByText('1 utilizador');

    await user.click(screen.getByRole('button', { name: 'Adicionar Utilizador' }));

    await user.type(screen.getByPlaceholderText('Ex: Maria João Santos'), 'Novo Operador');
    await user.type(screen.getByPlaceholderText('operador@agencia.pt'), 'novo@agencia.pt');
    await user.type(screen.getByPlaceholderText('Mínimo 8 caracteres'), 'password123');
    await user.selectOptions(screen.getByRole('combobox'), 'ADMIN');

    await user.click(screen.getByRole('button', { name: /Criar Utilizador/ }));

    await waitFor(() =>
      expect(usersCreate).toHaveBeenCalledWith({
        name: 'Novo Operador',
        email: 'novo@agencia.pt',
        password: 'password123',
        role: 'ADMIN',
      }),
    );
  });

  it('edita um utilizador através do modal', async () => {
    const user = userEvent.setup();
    usersList.mockResolvedValue([makeUser({})]);
    render(<AgenciesPage />);
    await screen.findByText('1 utilizador');

    await user.click(screen.getByTitle('Editar'));

    const nameInput = screen.getByPlaceholderText('Ex: Maria João Santos');
    await user.clear(nameInput);
    await user.type(nameInput, 'Ana Editada');

    const emailInput = screen.getByPlaceholderText('operador@agencia.pt');
    await user.clear(emailInput);
    await user.type(emailInput, 'ana2@agencia.pt');

    await user.selectOptions(screen.getByRole('combobox'), 'DESIGNER');

    await user.click(screen.getByRole('button', { name: /Guardar Alterações/ }));

    await waitFor(() =>
      expect(usersUpdate).toHaveBeenCalledWith('u1', {
        name: 'Ana Editada',
        email: 'ana2@agencia.pt',
        role: 'DESIGNER',
      }),
    );
  });

  it('remove um utilizador após confirmação', async () => {
    const user = userEvent.setup();
    usersList.mockResolvedValue([
      makeUser({ id: 'u1', name: 'Ana Oliveira' }),
      makeUser({ id: 'u2', name: 'João Rocha', email: 'joao@agencia.pt', role: 'OPERATOR' }),
    ]);
    render(<AgenciesPage />);
    await screen.findByText('2 utilizadores');

    await user.click(screen.getByTitle('Remover'));

    expect(screen.getByText('Remover Utilizador')).toBeInTheDocument();

    const confirmRemove = screen
      .getAllByRole('button', { name: 'Remover' })
      .find((b) => !b.hasAttribute('title'));
    expect(confirmRemove).toBeDefined();
    await user.click(confirmRemove!);

    await waitFor(() => expect(usersRemove).toHaveBeenCalledWith('u2'));
  });

  it('guarda as redes sociais e mostra "Não configurado" quando vazio', async () => {
    const user = userEvent.setup();
    usersList.mockResolvedValue([makeUser({})]);
    render(<AgenciesPage />);
    await screen.findByText('1 utilizador');

    expect(screen.getAllByText('Não configurado')).toHaveLength(6);

    const socialsEdit = screen
      .getAllByRole('button', { name: 'Editar' })
      .find((b) => !b.hasAttribute('title'));
    expect(socialsEdit).toBeDefined();
    await user.click(socialsEdit!);

    await user.type(screen.getByPlaceholderText('https://facebook.com/sua-pagina'), 'https://facebook.com/minhapagina');

    await user.click(screen.getByRole('button', { name: /Guardar Configuração/ }));

    await waitFor(() => expect(agenciesUpdate).toHaveBeenCalled());
    expect(agenciesUpdate.mock.calls[0][0]).toMatchObject({
      facebookPageUrl: 'https://facebook.com/minhapagina',
    });
    expect(await screen.findByText('Redes sociais guardadas com sucesso.')).toBeInTheDocument();
  });

  it('para não-administradores o botão Editar das redes sociais está ausente', async () => {
    mockUser = { ...sessionUser, role: 'OPERATOR' };
    usersList.mockResolvedValue([makeUser({})]);
    render(<AgenciesPage />);
    await screen.findByText('1 utilizador');

    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument();
  });
});
