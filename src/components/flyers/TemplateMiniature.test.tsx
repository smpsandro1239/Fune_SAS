import React from 'react';
import { render, screen } from '@testing-library/react';
import type { FlyerTemplateConfig } from '@/lib/types';
import TemplateMiniature from './TemplateMiniature';

jest.mock('./FlyerScaledView', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="scaled-view">{children}</div>,
}));

jest.mock('./FlyerCanvasPreview', () => ({
  __esModule: true,
  default: ({ template }: { template: FlyerTemplateConfig }) => (
    <div data-testid="canvas-preview">{template.name}</div>
  ),
}));

const baseTemplate: FlyerTemplateConfig = {
  id: 'test-template',
  name: 'Modelo de Teste',
  plan: 'FREE',
  category: 'PARTICIPACAO',
  description: 'descrição',
  primaryColor: '#000000',
  secondaryColor: '#ffffff',
  accentColor: '#cccccc',
  fontFamily: 'sans',
  layoutStyle: 'elegante-minimal',
};

describe('TemplateMiniature', () => {
  it('renderiza o preview de canvas para layouts comuns', () => {
    render(<TemplateMiniature template={baseTemplate} />);
    expect(screen.getByTestId('scaled-view')).toBeInTheDocument();
    expect(screen.getByTestId('canvas-preview')).toHaveTextContent('Modelo de Teste');
  });

  it('renderiza o thumbnail estático para o layout video-ultra', () => {
    const videoTemplate: FlyerTemplateConfig = {
      ...baseTemplate,
      id: 'video-ultra-template',
      layoutStyle: 'video-ultra',
    };
    render(<TemplateMiniature template={videoTemplate} />);
    expect(screen.getByTestId('scaled-view')).toBeInTheDocument();
    expect(screen.queryByTestId('canvas-preview')).not.toBeInTheDocument();
  });
});
