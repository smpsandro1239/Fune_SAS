import React from 'react';
import { render, screen } from '@testing-library/react';
import FlyerScaledView from './FlyerScaledView';

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe('FlyerScaledView', () => {
  const originalResizeObserver = globalThis.ResizeObserver;

  beforeAll(() => {
    globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
  });

  afterAll(() => {
    globalThis.ResizeObserver = originalResizeObserver;
  });

  it('renderiza os filhos', () => {
    render(
      <FlyerScaledView>
        <span>conteúdo</span>
      </FlyerScaledView>
    );
    expect(screen.getByText('conteúdo')).toBeInTheDocument();
  });
});
