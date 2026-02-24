import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FacultyRequests from '../FacultyRequests';

describe('FacultyRequests Basic Tests', () => {
  
  beforeEach(() => {
    // Mock alert to track interactions
    window.alert = jest.fn();
  });

  test('renders the page header and initial request cards', () => {
    render(<FacultyRequests />);
    
    expect(screen.getByText(/Rescheduling Requests/i)).toBeInTheDocument();
    
    // Check for specific class names from mock data
    expect(screen.getByText('CS Second Year')).toBeInTheDocument();
    expect(screen.getByText('IT Final Year')).toBeInTheDocument();
  });

  test('displays correct slot move information', () => {
    render(<FacultyRequests />);
    
    expect(screen.getByText('Mon 10-11')).toBeInTheDocument();
    expect(screen.getByText('Tue 2-3')).toBeInTheDocument();
  });

  test('handles "Approve" action correctly', () => {
    render(<FacultyRequests />);
    
    // Click Approve on the first card
    const approveBtns = screen.getAllByText(/Approve/i);
    fireEvent.click(approveBtns[0]);
    
    // Verify alert call
    expect(window.alert).toHaveBeenCalledWith('Request Accepted');
    
    // Verify the card is removed from the UI
    expect(screen.queryByText('CS Second Year')).not.toBeInTheDocument();
  });

  test('handles "Reject" action correctly', () => {
    render(<FacultyRequests />);
    
    // Click Reject on the second card
    const rejectBtns = screen.getAllByText(/Reject/i);
    fireEvent.click(rejectBtns[1]);
    
    // Verify alert call
    expect(window.alert).toHaveBeenCalledWith('Request Rejected');
    
    // Verify the card is removed from the UI
    expect(screen.queryByText('IT Final Year')).not.toBeInTheDocument();
  });

  test('shows empty state message when all requests are cleared', () => {
    render(<FacultyRequests />);
    
    // Clear all requests by clicking all Approve buttons
    const approveBtns = screen.getAllByText(/Approve/i);
    fireEvent.click(approveBtns[0]);
    fireEvent.click(approveBtns[1]);
    
    expect(screen.getByText(/No pending requests/i)).toBeInTheDocument();
  });

});