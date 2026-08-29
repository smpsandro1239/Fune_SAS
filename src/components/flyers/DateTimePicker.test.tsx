import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import DateTimePicker from './DateTimePicker';

beforeAll(() => {
  Element.prototype.getBoundingClientRect = jest.fn(
    () =>
      ({ left: 100, top: 100, right: 200, bottom: 160, width: 100, height: 60 } as DOMRect),
  );
});

describe('DateTimePicker', () => {
  const onDateChange = jest.fn();
  const onTimeChange = jest.fn();

  beforeEach(() => {
    onDateChange.mockClear();
    onTimeChange.mockClear();
  });

  const openDate = () =>
    fireEvent.click(document.getElementById('death') as HTMLElement);

  const openTime = () =>
    fireEvent.click(document.getElementById('death-time') as HTMLElement);

  const renderAt = (props: Partial<React.ComponentProps<typeof DateTimePicker>> = {}) =>
    render(
      <DateTimePicker
        id="death"
        label="Data do falecimento"
        date="2026-07-08"
        time="17:00"
        onDateChange={onDateChange}
        onTimeChange={onTimeChange}
        {...props}
      />,
    );

  it('mostra a label', () => {
    renderAt();
    expect(screen.getByText('Data do falecimento')).toBeInTheDocument();
  });

  it('abre o calendário e escolhe um dia', () => {
    renderAt();
    openDate();

    fireEvent.click(screen.getByRole('button', { name: '15' }));
    const iso = onDateChange.mock.calls[0][0] as string;
    const picked = new Date(iso);
    expect(picked.getFullYear()).toBe(2026);
    expect(picked.getMonth()).toBe(6);
    expect(picked.getDate()).toBe(15);
  });

  it('navega para o mês seguinte', () => {
    renderAt();
    openDate();

    fireEvent.click(screen.getByLabelText('Mês seguinte'));
    expect(screen.getByText(/agosto de 2026/i)).toBeInTheDocument();
  });

  it('navega para o mês anterior', () => {
    renderAt();
    openDate();

    fireEvent.click(screen.getByLabelText('Mês anterior'));
    expect(screen.getByText(/junho de 2026/i)).toBeInTheDocument();
  });

  it('abre o seletor de hora e escolhe uma opção', () => {
    renderAt();
    openTime();

    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: '18:30' }));
    expect(onTimeChange).toHaveBeenCalledWith('18:30');
  });

  it('desabilita dias anteriores ao minDate', () => {
    renderAt({ minDate: new Date(2026, 6, 10) });
    openDate();

    const dialog = screen.getByRole('dialog');
    const before = within(dialog).getByRole('button', { name: '5' });
    expect(before).toBeDisabled();
  });
});
