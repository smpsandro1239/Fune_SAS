import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PhotoAdjuster, { DEFAULT_PHOTO_TRANSFORM } from './PhotoAdjuster';

describe('PhotoAdjuster', () => {
  const renderAt = (transform = DEFAULT_PHOTO_TRANSFORM) => {
    const onChange = jest.fn();
    const utils = render(<PhotoAdjuster transform={transform} onChange={onChange} />);
    return { onChange, ...utils };
  };

  it('aumenta o zoom em passos de 0.25 ao clicar em Aumentar', () => {
    const { onChange } = renderAt({ x: 50, y: 50, zoom: 1 });
    fireEvent.click(screen.getByLabelText('Aumentar zoom'));
    expect(onChange).toHaveBeenCalledWith({ x: 50, y: 50, zoom: 1.25 });
  });

  it('diminui o zoom em passos de 0.25 ao clicar em Diminuir', () => {
    const { onChange } = renderAt({ x: 50, y: 50, zoom: 2 });
    fireEvent.click(screen.getByLabelText('Diminuir zoom'));
    expect(onChange).toHaveBeenCalledWith({ x: 50, y: 50, zoom: 1.75 });
  });

  it('impede zoom acima do máximo (3)', () => {
    const { onChange } = renderAt({ x: 50, y: 50, zoom: 3 });
    const btn = screen.getByLabelText('Aumentar zoom');
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('impede zoom abaixo do mínimo (1)', () => {
    const { onChange } = renderAt({ x: 50, y: 50, zoom: 1 });
    const btn = screen.getByLabelText('Diminuir zoom');
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('desabilita o pan quando zoom é 1', () => {
    renderAt({ x: 50, y: 50, zoom: 1 });
    expect(screen.getByLabelText('Mover fotografia para cima')).toBeDisabled();
    expect(screen.getByLabelText('Mover fotografia para baixo')).toBeDisabled();
    expect(screen.getByLabelText('Mover fotografia para a esquerda')).toBeDisabled();
    expect(screen.getByLabelText('Mover fotografia para a direita')).toBeDisabled();
  });

  it('move a fotografia em passos de 10 quando ampliada', () => {
    const { onChange } = renderAt({ x: 50, y: 50, zoom: 2 });
    fireEvent.click(screen.getByLabelText('Mover fotografia para a direita'));
    expect(onChange).toHaveBeenCalledWith({ x: 60, y: 50, zoom: 2 });
    fireEvent.click(screen.getByLabelText('Mover fotografia para cima'));
    expect(onChange).toHaveBeenCalledWith({ x: 50, y: 40, zoom: 2 });
  });

  it('limita o pan a 0-100', () => {
    const { onChange } = renderAt({ x: 95, y: 5, zoom: 2 });
    fireEvent.click(screen.getByLabelText('Mover fotografia para a direita'));
    expect(onChange).toHaveBeenCalledWith({ x: 100, y: 5, zoom: 2 });
    fireEvent.click(screen.getByLabelText('Mover fotografia para cima'));
    expect(onChange).toHaveBeenCalledWith({ x: 95, y: 0, zoom: 2 });
  });

  it('repõe a posição e zoom ao clicar em Repor', () => {
    const { onChange } = renderAt({ x: 80, y: 20, zoom: 2.5 });
    fireEvent.click(screen.getByRole('button', { name: /Repor/ }));
    expect(onChange).toHaveBeenCalledWith({ x: 50, y: 50, zoom: 1 });
  });

  it('mostra a percentagem de zoom atual', () => {
    renderAt({ x: 50, y: 50, zoom: 1.5 });
    expect(screen.getByText('150%')).toBeInTheDocument();
  });
});
