import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { ToastProvider, useToast } from './Toast';

function TriggerButton({ label, type, message }: { label: string; type: 'success' | 'error' | 'info'; message: string }) {
  const { toast } = useToast();
  return (
    <button onClick={() => toast(type, message)}>{label}</button>
  );
}

describe('Toast', () => {
  afterEach(() => {
    act(() => {
      toast.dismiss();
    });
  });

  it('mostra uma mensagem após chamar toast()', async () => {
    render(
      <ToastProvider>
        <TriggerButton label="guardar" type="success" message="Guardado com sucesso" />
      </ToastProvider>,
    );

    expect(screen.queryByText('Guardado com sucesso')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'guardar' }));
    expect(await screen.findByText('Guardado com sucesso')).toBeInTheDocument();
  });

  it('permite várias mensagens em simultâneo', async () => {
    render(
      <ToastProvider>
        <TriggerButton label="mostrar-uma" type="info" message="Mensagem uma" />
        <TriggerButton label="mostrar-duas" type="error" message="Mensagem duas" />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'mostrar-uma' }));
    fireEvent.click(screen.getByRole('button', { name: 'mostrar-duas' }));

    expect(await screen.findByText('Mensagem uma')).toBeInTheDocument();
    expect(await screen.findByText('Mensagem duas')).toBeInTheDocument();
  });

  it('remove uma mensagem ao clicar no botão de fechar', async () => {
    render(
      <ToastProvider>
        <TriggerButton label="mostrar-erro" type="error" message="Erro aqui" />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'mostrar-erro' }));
    expect(await screen.findByText('Erro aqui')).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText('Erro aqui')).not.toBeInTheDocument();
    });
  });

  it('remove a mensagem automaticamente após 4 segundos', () => {
    jest.useFakeTimers();
    try {
      render(
        <ToastProvider>
          <TriggerButton label="auto" type="success" message="Auto remove" />
        </ToastProvider>,
      );

      fireEvent.click(screen.getByRole('button', { name: 'auto' }));
      act(() => {
        jest.advanceTimersByTime(0);
      });
      expect(screen.getByText('Auto remove')).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(5000);
      });
      expect(screen.queryByText('Auto remove')).not.toBeInTheDocument();
    } finally {
      jest.useRealTimers();
    }
  });

  it('lança erro quando useToast é usado fora do provider', () => {
    function Broken() {
      useToast();
      return null;
    }
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Broken />)).toThrow('useToast must be used within ToastProvider');
    spy.mockRestore();
  });
});
