import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import type { FlyerTemplateConfig } from '@/lib/types';
import TemplateGallery from './TemplateGallery';

jest.mock('framer-motion', () => {
  const React = require('react');
  const motionDot = new Proxy(
    {},
    {
      get: (_target, tag: string) => {
        const Component = React.forwardRef((props: Record<string, unknown>, ref: React.Ref<unknown>) => {
          const {
            initial: _initial,
            animate: _animate,
            transition: _transition,
            exit: _exit,
            whileHover: _whileHover,
            whileTap: _whileTap,
            ...rest
          } = props;
          return React.createElement(tag, { ...rest, ref }, props.children);
        });
        Component.displayName = `Motion${tag}`;
        return Component;
      },
    }
  );
  return {
    __esModule: true,
    motion: motionDot,
    AnimatePresence: ({ children }: { children?: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
  };
});

jest.mock('./TemplateMiniature', () => ({
  __esModule: true,
  default: () => <div data-testid="miniature" />,
}));

jest.mock('./FlyerScaledView', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="scaled-view">{children}</div>,
}));

jest.mock('./FlyerCanvasPreview', () => ({
  __esModule: true,
  default: () => <div data-testid="canvas-preview" />,
}));

const makeTemplate = (overrides: Partial<FlyerTemplateConfig>): FlyerTemplateConfig => ({
  id: 't1',
  name: 'Modelo Um',
  plan: 'FREE',
  category: 'PARTICIPACAO',
  description: 'descrição um',
  primaryColor: '#000000',
  secondaryColor: '#ffffff',
  accentColor: '#cccccc',
  fontFamily: 'sans',
  layoutStyle: 'elegante-minimal',
  ...overrides,
});

const templates = [
  makeTemplate({ id: 't1', name: 'Modelo Um', plan: 'FREE' }),
  makeTemplate({ id: 't2', name: 'Modelo Dois', plan: 'PREMIUM', layoutStyle: 'dourado-premium' }),
  makeTemplate({ id: 't3', name: 'Modelo Três', plan: 'ULTRA', layoutStyle: 'video-ultra' }),
];

describe('TemplateGallery', () => {
  const onSelect = jest.fn();

  beforeEach(() => {
    onSelect.mockClear();
  });

  it('lista todos os modelos por defeito', () => {
    render(<TemplateGallery templates={templates} selectedId="t1" onSelect={onSelect} />);
    const cards = screen.getAllByRole('button', { name: /Pré-visualizar modelo/i });
    expect(cards).toHaveLength(3);
  });

  it('filtra por plano Premium', () => {
    render(<TemplateGallery templates={templates} selectedId="t1" onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button', { name: 'Premium' }));
    const cards = screen.getAllByRole('button', { name: /Pré-visualizar modelo/i });
    expect(cards).toHaveLength(1);
    expect(cards[0]).toHaveAccessibleName('Pré-visualizar modelo Modelo Dois (Premium)');
  });

  it('marca o modelo selecionado', () => {
    render(<TemplateGallery templates={templates} selectedId="t2" onSelect={onSelect} />);
    const selected = screen.getByRole('button', {
      name: 'Pré-visualizar modelo Modelo Dois (Premium)',
    });
    expect(selected).toHaveAttribute('aria-pressed', 'true');
  });

  it('abre a pré-visualização ao clicar num modelo e chama onSelect', () => {
    render(<TemplateGallery templates={templates} selectedId="t1" onSelect={onSelect} />);
    fireEvent.click(
      screen.getByRole('button', { name: 'Pré-visualizar modelo Modelo Três (Ultra)' })
    );
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 't3' }));
    expect(
      screen.getByRole('dialog', { name: 'Pré-visualização do modelo Modelo Três' })
    ).toBeInTheDocument();
  });

  it('usa o modelo escolhido a partir da pré-visualização', () => {
    render(<TemplateGallery templates={templates} selectedId="t1" onSelect={onSelect} />);
    fireEvent.click(
      screen.getByRole('button', { name: 'Pré-visualizar modelo Modelo Dois (Premium)' })
    );
    fireEvent.click(screen.getByRole('button', { name: 'Usar este modelo' }));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 't2' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('fecha a pré-visualização com o botão de fechar', () => {
    render(<TemplateGallery templates={templates} selectedId="t1" onSelect={onSelect} />);
    fireEvent.click(
      screen.getByRole('button', { name: 'Pré-visualizar modelo Modelo Um (Free)' })
    );
    fireEvent.click(screen.getByLabelText('Fechar pré-visualização'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
