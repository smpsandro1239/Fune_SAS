import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  MemorialCampoLayout,
  GratidaoLuzLayout,
  VeladaOrquideaLayout,
  MissaSetimoDiaLayout,
  CeuEternoLayout,
} from './ProLayoutsE';
import { LAYOUT_FIXTURE } from './test-fixture';

const cases: [string, React.ComponentType<React.ComponentProps<typeof MemorialCampoLayout>>][] = [
  ['MemorialCampoLayout', MemorialCampoLayout],
  ['GratidaoLuzLayout', GratidaoLuzLayout],
  ['VeladaOrquideaLayout', VeladaOrquideaLayout],
  ['MissaSetimoDiaLayout', MissaSetimoDiaLayout],
  ['CeuEternoLayout', CeuEternoLayout],
];

describe('ProLayoutsE', () => {
  it.each(cases)('%s renderiza os dados do flyer', (_name, Layout) => {
    const ref = React.createRef<HTMLDivElement>();
    const { container } = render(<Layout data={LAYOUT_FIXTURE} previewRef={ref} />);
    expect(screen.getByText(LAYOUT_FIXTURE.deceasedName)).toBeInTheDocument();
    expect(screen.getByText(LAYOUT_FIXTURE.agencyName)).toBeInTheDocument();
    expect(ref.current).toBe(container.firstChild);
  });
});
