import React from 'react';
import { render, screen } from '@testing-library/react';
import PhotoImage from './PhotoImage';

describe('PhotoImage', () => {
  it('usa photoUrl quando não há photoDataUrl', () => {
    render(
      <PhotoImage
        data={{ photoUrl: 'https://x/foto.jpg', photoDataUrl: '', photoTransform: undefined } as never}
        alt="Retrato"
      />,
    );
    const img = screen.getByAltText('Retrato');
    expect(img).toHaveAttribute('src', 'https://x/foto.jpg');
  });

  it('prioriza photoDataUrl sobre photoUrl', () => {
    render(
      <PhotoImage
        data={{ photoUrl: 'https://x/a.jpg', photoDataUrl: 'data:image/png;base64,x' } as never}
        alt="Retrato"
      />,
    );
    expect(screen.getByAltText('Retrato')).toHaveAttribute('src', 'data:image/png;base64,x');
  });

  it('aplica o estilo de objectPosition a partir do transform', () => {
    render(
      <PhotoImage
        data={{ photoUrl: 'https://x/a.jpg', photoTransform: { x: 25, y: 75, zoom: 1.5 } } as never}
        alt="Retrato"
      />,
    );
    const img = screen.getByAltText('Retrato');
    expect(img).toHaveStyle({ objectPosition: '25% 75%' });
    expect(img).toHaveStyle({ transform: 'scale(1.5)' });
  });
});
