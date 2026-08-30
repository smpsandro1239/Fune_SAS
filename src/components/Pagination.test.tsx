import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from './Pagination';

describe('Pagination', () => {
  it('renderiza nada quando há apenas uma página', () => {
    const { container } = render(
      <Pagination page={1} pageCount={1} total={3} onPageChange={jest.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('mostra o total e a página atual', () => {
    render(<Pagination page={2} pageCount={5} total={42} onPageChange={jest.fn()} />);
    expect(screen.getByText('42 itens')).toBeInTheDocument();
    expect(screen.getByText('Página 2 de 5')).toBeInTheDocument();
  });

  it('desativa o botão anterior na primeira página', () => {
    render(<Pagination page={1} pageCount={5} total={42} onPageChange={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Página seguinte' })).not.toBeDisabled();
  });

  it('desativa o botão seguinte na última página', () => {
    render(<Pagination page={5} pageCount={5} total={42} onPageChange={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Página seguinte' })).toBeDisabled();
  });

  it('chama onPageChange ao avançar e recuar', () => {
    const onPageChange = jest.fn();
    render(<Pagination page={3} pageCount={5} total={42} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Página anterior' }));
    expect(onPageChange).toHaveBeenCalledWith(2);
    fireEvent.click(screen.getByRole('button', { name: 'Página seguinte' }));
    expect(onPageChange).toHaveBeenCalledWith(4);
  });
});
