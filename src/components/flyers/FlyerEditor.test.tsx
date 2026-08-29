import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FlyerEditor from './FlyerEditor';
import { apiService } from '@/lib/api';
import { toPng } from 'html-to-image';

jest.mock('framer-motion', () => {
  const React = require('react');
  const motionDot = new Proxy(
    {},
    {
      get: (_t: unknown, tag: string) => {
        const Component = React.forwardRef((props: Record<string, unknown>, ref: React.Ref<unknown>) => {
          const {
            initial: _i,
            animate: _a,
            transition: _t2,
            exit: _e,
            whileHover: _w,
            whileTap: _wt,
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

jest.mock('@/context/AgencyContext', () => ({
  useAgency: () => ({ currentAgency: null }),
}));

jest.mock('html-to-image', () => ({
  toPng: jest.fn(),
}));

jest.mock('jspdf', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    internal: { pageSize: { getWidth: () => 210 } },
    getImageProperties: () => ({ width: 520, height: 760 }),
    addImage: jest.fn(),
    save: jest.fn(),
  })),
}));

jest.mock('@/lib/api', () => ({
  apiService: {
    funerals: { list: jest.fn().mockImplementation(() => new Promise(() => {})) },
    drafts: {
      list: jest.fn().mockResolvedValue([]),
      save: jest.fn().mockResolvedValue({ id: 'd1' }),
      update: jest.fn(),
      get: jest.fn(),
      delete: jest.fn(),
    },
    publications: { create: jest.fn() },
  },
}));

jest.mock('./FlyerCanvasPreview', () => ({
  __esModule: true,
  default: ({ previewRef }: { previewRef?: React.RefObject<HTMLDivElement> }) => (
    <div ref={previewRef} data-testid="canvas">preview</div>
  ),
}));

jest.mock('./TemplateGallery', () => ({
  __esModule: true,
  default: () => <div data-testid="gallery">galeria</div>,
}));

jest.mock('./DateTimePicker', () => ({
  __esModule: true,
  default: () => <div data-testid="datetime">datetime</div>,
}));

jest.mock('./ImageUploader', () => ({
  __esModule: true,
  default: () => <div data-testid="uploader">uploader</div>,
}));

jest.mock('./PhotoAdjuster', () => ({
  __esModule: true,
  default: () => <div data-testid="adjuster">adjuster</div>,
  DEFAULT_PHOTO_TRANSFORM: { x: 0, y: 0, zoom: 1 },
}));

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe('FlyerEditor', () => {
  const toPngMock = toPng as unknown as jest.Mock;
  const draftsMock = (apiService.drafts as unknown) as {
    save: jest.Mock;
    update: jest.Mock;
  };

  beforeAll(() => {
    globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
    toPngMock.mockResolvedValue('data:image/png;base64,AAAA');
    jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  });

  afterAll(() => {
    (HTMLAnchorElement.prototype.click as jest.Mock).mockRestore();
  });

  afterEach(() => {
    toPngMock.mockClear();
    draftsMock.save.mockClear();
    draftsMock.update.mockClear();
  });

  it('renderiza o cabeçalho e as quatro secções de abas', () => {
    render(<FlyerEditor />);
    expect(screen.getByText('Editor Visual de Flyers & Participações')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Falecido & Foto/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Cerimónia/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Logótipo & Marca/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Estilo/ })).toBeInTheDocument();
  });

  it('edita o nome do falecido', () => {
    render(<FlyerEditor />);
    const nameInput = screen.getByLabelText('Nome Completo do Falecido') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'MARIA FERNANDES' } });
    expect(nameInput.value).toBe('MARIA FERNANDES');
  });

  it('alterna para a secção Estilo', () => {
    render(<FlyerEditor />);
    fireEvent.click(screen.getByRole('tab', { name: /Estilo/ }));
    expect(screen.getByRole('radiogroup', { name: 'Família tipográfica' })).toBeInTheDocument();
    expect(screen.getByLabelText('Cor principal do flyer')).toBeInTheDocument();
  });

  it('exporta PNG e mostra a mensagem de sucesso', async () => {
    render(<FlyerEditor />);
    fireEvent.click(screen.getByRole('button', { name: 'Exportar flyer como imagem PNG' }));
    await waitFor(() => expect(toPngMock).toHaveBeenCalled());
    expect(await screen.findByText('PNG exportado com sucesso! (2x resolução)')).toBeInTheDocument();
  });

  it('guarda um rascunho com nome', async () => {
    render(<FlyerEditor />);
    fireEvent.change(screen.getByPlaceholderText('Nome do rascunho...'), {
      target: { value: 'Rascunho teste' },
    });
    fireEvent.click(screen.getByText('Guardar'));
    expect(await screen.findByText('Rascunho guardado com sucesso!')).toBeInTheDocument();
    expect(draftsMock.save).toHaveBeenCalled();
  });
});
