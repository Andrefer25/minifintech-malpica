import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './Badge';

describe('StatusBadge', () => {
  it('renderiza Aprobada para APPROVED', () => {
    render(<StatusBadge status="APPROVED" />);
    expect(screen.getByText('Aprobada')).toBeInTheDocument();
  });

  it('renderiza Pendiente para PENDING', () => {
    render(<StatusBadge status="PENDING" />);
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
  });

  it('renderiza Rechazada para REJECTED', () => {
    render(<StatusBadge status="REJECTED" />);
    expect(screen.getByText('Rechazada')).toBeInTheDocument();
  });

  it('renderiza Completada para COMPLETED', () => {
    render(<StatusBadge status="COMPLETED" />);
    expect(screen.getByText('Completada')).toBeInTheDocument();
  });
});
