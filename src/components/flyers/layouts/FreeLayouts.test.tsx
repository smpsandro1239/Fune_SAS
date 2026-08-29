import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  EleganteMinimalLayout,
  ClassicoSobrioLayout,
  FloralSuaveLayout,
} from './FreeLayouts';
import { LAYOUT_FIXTURE } from './test-fixture';

const cases: [string, React.ComponentType<React.ComponentProps<typeof EleganteMinimalLayout>>][] = [
  ['EleganteMinimalLayout', EleganteMinimalLayout],
  ['ClassicoSobrioLayout', ClassicoSobrioLayout],
  ['FloralSuaveLayout', FloralSuaveLayout],
];

describe('FreeLayouts', () => {
  it.each(cases)('%s renderiza os dados do flyer', (_name, Layout) => {
    const ref = React.createRef<HTMLDivElement>();
    const { container } = render(<Layout data={LAYOUT_FIXTURE} previewRef={ref} />);
    expect(screen.getByText(LAYOUT_FIXTURE.deceasedName)).toBeInTheDocument();
    expect(screen.getByText(LAYOUT_FIXTURE.agencyName)).toBeInTheDocument();
    expect(
      screen.getByText((c: string) => c.includes(LAYOUT_FIXTURE.funeralDateFormatted))
    ).toBeInTheDocument();
    expect(ref.current).toBe(container.firstChild);
  });

  it('ClassicoSobrioLayout mostra os dados do velório quando definidos', () => {
    render(<ClassicoSobrioLayout data={LAYOUT_FIXTURE} />);
    expect(screen.getByText(LAYOUT_FIXTURE.wakeDetailsFormatted)).toBeInTheDocument();
  });
});
