import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { fireEvent } from '@testing-library/react';

const setUser = jest.fn();
const mockUser = { name: 'Ana Oliveira', email: 'admin@casahortas.com', role: 'ADMIN' };
const mockAgency = { id: 'a1', name: 'Funerária Casa Hortas', slug: 'casahortas' };

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: mockUser, setUser }),
}));

jest.mock('@/context/AgencyContext', () => ({
  useAgency: () => ({ currentAgency: mockAgency }),
}));

const apiErrorMessage = jest.fn((_err: unknown, fallback?: string) => fallback);
const updateProfile = jest.fn();
const changePassword = jest.fn();

jest.mock('@/lib/api', () => ({
  apiErrorMessage: (err: unknown, fallback?: string) => apiErrorMessage(err, fallback),
  apiService: {
    auth: {
      updateProfile: (data: Record<string, unknown>) => updateProfile(data),
      changePassword: (current: string, next: string) => changePassword(current, next),
    },
  },
}));

import ProfilePage from '@/app/(app)/profile/page';

describe('ProfilePage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    apiErrorMessage.mockImplementation((_err: unknown, fallback?: string) => fallback);
    updateProfile.mockResolvedValue(mockUser);
    changePassword.mockResolvedValue({ success: true });
  });

  it('renderiza os dados do utilizador e as iniciais', async () => {
    render(<ProfilePage />);

    expect(await screen.findByText('Meu Perfil')).toBeInTheDocument();
    expect(screen.getByText('Ana Oliveira')).toBeInTheDocument();
    expect(screen.getByText('admin@casahortas.com')).toBeInTheDocument();
    expect(screen.getByText('Administrador')).toBeInTheDocument();
    expect(screen.getByText('Funerária Casa Hortas')).toBeInTheDocument();
    expect(screen.getByText('AO')).toBeInTheDocument();
    expect((screen.getByPlaceholderText('O seu nome') as HTMLInputElement).value).toBe('Ana Oliveira');
  });

  it('guarda o perfil e chama updateProfile com nome e email', async () => {
    render(<ProfilePage />);

    await screen.findByPlaceholderText('O seu nome');
    const nameInput = screen.getByPlaceholderText('O seu nome');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Ana Silva');

    await userEvent.click(screen.getByRole('button', { name: /Guardar Alterações/ }));

    await waitFor(() => expect(screen.getByText('Perfil atualizado com sucesso.')).toBeInTheDocument());
    expect(updateProfile).toHaveBeenCalledWith({
      name: 'Ana Silva',
      email: 'admin@casahortas.com',
    });
    expect(setUser).toHaveBeenCalledWith(mockUser);
  });

  it('mostra erro do backend ao guardar o perfil', async () => {
    apiErrorMessage.mockReturnValue('Erro ao guardar.');
    updateProfile.mockRejectedValue({ message: 'server' });
    render(<ProfilePage />);

    await screen.findByPlaceholderText('O seu nome');
    await userEvent.click(screen.getByRole('button', { name: /Guardar Alterações/ }));

    await waitFor(() => expect(screen.getByText('Erro ao guardar.')).toBeInTheDocument());
    expect(apiErrorMessage).toHaveBeenCalled();
  });

  it('valida que as passwords novas coincidem', async () => {
    render(<ProfilePage />);

    const form = (await screen.findAllByText('Alterar Password'))[0].closest('form')!;
    const inputs = form.querySelectorAll('input[type=password]');
    fireEvent.change(inputs[0], { target: { value: 'oldpass' } });
    fireEvent.change(inputs[1], { target: { value: 'nova1234' } });
    fireEvent.change(inputs[2], { target: { value: 'diferente' } });

    await userEvent.click(screen.getByRole('button', { name: 'Alterar Password' }));

    expect(await screen.findByText('As passwords novas não coincidem.')).toBeInTheDocument();
    expect(changePassword).not.toHaveBeenCalled();
  });

  it('valida o comprimento mínimo da password', async () => {
    render(<ProfilePage />);

    const form = (await screen.findAllByText('Alterar Password'))[0].closest('form')!;
    const inputs = form.querySelectorAll('input[type=password]');
    fireEvent.change(inputs[0], { target: { value: 'oldpass' } });
    fireEvent.change(inputs[1], { target: { value: 'curto' } });
    fireEvent.change(inputs[2], { target: { value: 'curto' } });

    await userEvent.click(screen.getByRole('button', { name: 'Alterar Password' }));

    expect(
      await screen.findByText('A nova password deve ter pelo menos 8 caracteres.'),
    ).toBeInTheDocument();
    expect(changePassword).not.toHaveBeenCalled();
  });

  it('altera a password com sucesso e limpa os campos', async () => {
    render(<ProfilePage />);

    const form = (await screen.findAllByText('Alterar Password'))[0].closest('form')!;
    const inputs = form.querySelectorAll('input[type=password]');
    fireEvent.change(inputs[0], { target: { value: 'oldpass' } });
    fireEvent.change(inputs[1], { target: { value: 'novapass123' } });
    fireEvent.change(inputs[2], { target: { value: 'novapass123' } });

    await userEvent.click(screen.getByRole('button', { name: 'Alterar Password' }));

    await waitFor(() =>
      expect(screen.getByText('Password alterada com sucesso.')).toBeInTheDocument(),
    );
    expect(changePassword).toHaveBeenCalledWith('oldpass', 'novapass123');
    for (const input of inputs) {
      expect((input as HTMLInputElement).value).toBe('');
    }
  });

  it('mostra erro do backend ao alterar a password', async () => {
    apiErrorMessage.mockReturnValue('Password atual incorreta.');
    changePassword.mockRejectedValue({ message: 'wrong' });
    render(<ProfilePage />);

    const form = (await screen.findAllByText('Alterar Password'))[0].closest('form')!;
    const inputs = form.querySelectorAll('input[type=password]');
    fireEvent.change(inputs[0], { target: { value: 'errada' } });
    fireEvent.change(inputs[1], { target: { value: 'novapass123' } });
    fireEvent.change(inputs[2], { target: { value: 'novapass123' } });

    await userEvent.click(screen.getByRole('button', { name: 'Alterar Password' }));

    await waitFor(() => expect(screen.getByText('Password atual incorreta.')).toBeInTheDocument());
    expect(apiErrorMessage).toHaveBeenCalled();
  });
});
