import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FacultyLeave from '../FacultyLeave';
import { createLeaveRequest, getLeaveRequestsByFaculty } from '../../../services/leaveRequestService';

jest.mock('../../../services/leaveRequestService', () => ({
  createLeaveRequest: jest.fn(),
  getLeaveRequestsByFaculty: jest.fn(),
}));

describe('FacultyLeave Basic Tests', () => {
  
  beforeEach(() => {
    window.alert = jest.fn();
    localStorage.setItem('userInfo', JSON.stringify({ id: 'fac-1', name: 'Dr. Test', email: 'dr@test.edu' }));
    createLeaveRequest.mockResolvedValue({ data: { success: true } });
    getLeaveRequestsByFaculty.mockResolvedValue({ data: [] });
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

  test('triggers alert on form submission', async () => {
    render(<FacultyLeave />);

    const genericInputs = document.querySelectorAll('input[type="date"]');
    
    fireEvent.change(genericInputs[0], { target: { value: '2026-03-01' } });
    fireEvent.change(genericInputs[1], { target: { value: '2026-03-05' } });

    fireEvent.change(screen.getByPlaceholderText(/Please provide a valid reason/i), {
      target: { value: 'Medical appointment' }
    });


    const submitBtn = screen.getByRole('button', { name: /Submit Application/i });
    fireEvent.click(submitBtn);
    
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Leave request submitted successfully! Waiting for admin approval.');
    });
  });

  test('renders the reason textarea', () => {
    render(<FacultyLeave />);
    expect(screen.getByPlaceholderText(/Please provide a valid reason/i)).toBeInTheDocument();
  });

});