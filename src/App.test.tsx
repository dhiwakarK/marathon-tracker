import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Marathon Tracker app', () => {
  render(<App />);
  const navigationElement = screen.getByRole('navigation');
  expect(navigationElement).toBeInTheDocument();
});
