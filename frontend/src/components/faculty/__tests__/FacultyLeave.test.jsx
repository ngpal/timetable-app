import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FacultyLeave from '../FacultyLeave';

describe('FacultyLeave Basic Tests', () => {
  
  beforeEach(() => {
    // Mock alert before each test to track calls
    window.alert = jest.fn();
  });

  test('renders the leave application form headers and labels', () => {
    render(<FacultyLeave />);
    
    expect(screen.getByText(/Apply for Leave/i)).toBeInTheDocument();
    expect(screen.getByText(/Leave Type/i)).toBeInTheDocument();
    expect(screen.getByText(/Date Range/i)).toBeInTheDocument();
  });

  test('allows changing the leave type dropdown', () => {
    render(<FacultyLeave />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'Medical Leave' } });
    
    expect(select.value).toBe('Medical Leave');
  });

  test('triggers alert on form submission', () => {
    render(<FacultyLeave />);
    
    // 1. Fill in the required date inputs to bypass browser validation
    const dateInputs = screen.getAllByRole('textbox', { hidden: true }).filter(
      input => input.type === 'date'
    );
    
    // Fallback search if role matching fails for date types
    const genericInputs = document.querySelectorAll('input[type="date"]');
    
    fireEvent.change(genericInputs[0], { target: { value: '2026-03-01' } });
    fireEvent.change(genericInputs[1], { target: { value: '2026-03-05' } });

    // 2. Click the submit button
    const submitBtn = screen.getByRole('button', { name: /Submit Application/i });
    fireEvent.click(submitBtn);
    
    // 3. Verify alert was called
    expect(window.alert).toHaveBeenCalledWith('Leave Application Submitted to Admin for Approval.');
  });

  test('renders the reason textarea', () => {
    render(<FacultyLeave />);
    expect(screen.getByPlaceholderText(/Please provide a valid reason/i)).toBeInTheDocument();
  });

});