import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('@/components/flyers/FlyerEditor', () => ({
  __esModule: true,
  default: () => <div data-testid="flyer-editor" />,
}));

import FlyersPage from '@/app/(app)/flyers/page';

describe('FlyersPage', () => {
  it('renderiza o editor de flyers', () => {
    render(<FlyersPage />);
    expect(screen.getByTestId('flyer-editor')).toBeInTheDocument();
  });
});
