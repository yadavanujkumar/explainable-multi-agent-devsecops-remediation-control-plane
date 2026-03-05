import { render, screen } from '@testing-library/react';
import { ApprovalQueue } from './ApprovalQueue';
import React from 'react';
import { describe, it, expect } from 'vitest';

describe('ApprovalQueue Component', () => {
  it('renders loading state initially', () => {
    render(<ApprovalQueue />);
    expect(screen.getByText(/Loading.../i)).toBeDefined();
  });
});
