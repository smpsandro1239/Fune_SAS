import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  CasaHortasLayout,
  ClassicoOuroLayout,
  SerenoMinimalLayout,
} from './LegacyLayouts';
import { LAYOUT_FIXTURE } from './test-fixture';

const cases: [string, React.ComponentType<React.ComponentProps<typeof CasaHortasLayout>>][] = [
  ['CasaHortasLayout', CasaHortasLayout],
  ['ClassicoOuroLayout', ClassicoOuroLayout],
  ['SerenoMinimalLayout', SerenoMinimalLayout],
];

describe('LegacyLayouts', () => {
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

  it('CasaHortasLayout mostra as iniciais da agência', () => {
    render(<CasaHortasLayout data={LAYOUT_FIXTURE} />);
    expect(screen.getByText(LAYOUT_FIXTURE.agencyInitials)).toBeInTheDocument();
  });
});
