import { render, screen } from '@testing-library/react';
import Home from '../page';

describe('Home', () => {
  it('shows upcoming tasks', () => {
    render(<Home />);
    expect(screen.getByText(/Next Up/i)).toBeInTheDocument();
    expect(screen.getByText(/availability intake/i)).toBeInTheDocument();
  });
});
