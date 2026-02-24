import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useOutletContext } from 'react-router-dom';
import '@testing-library/jest-dom';
import CRReschedule from '../CRReschedule';


jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useOutletContext: jest.fn(),
}));

describe('CRReschedule Basic Tests', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    window.alert = jest.fn();
  });

  test('renders Access Denied if user is not a CR', () => {
    useOutletContext.mockReturnValue({ isCR: false });
    render(<CRReschedule />);
    expect(screen.getByText(/Access Denied/i)).toBeInTheDocument();
  });

  test('renders the form if user is a CR', () => {
    useOutletContext.mockReturnValue({ isCR: true });
    render(<CRReschedule />);
    
    expect(screen.getByText(/Request Class Rescheduling/i)).toBeInTheDocument();

    expect(screen.getByText(/Subject \/ Course/i)).toBeInTheDocument();
  });

  test('allows selecting a course from the dropdown', () => {
    useOutletContext.mockReturnValue({ isCR: true });
    render(<CRReschedule />);
    

    const select = screen.getByDisplayValue(/Select Course/i);
    fireEvent.change(select, { target: { value: 'CS201' } });
    
    expect(select.value).toBe('CS201');
  });

  test('triggers alert on valid form submission', () => {
    useOutletContext.mockReturnValue({ isCR: true });
    render(<CRReschedule />);
    

    const courseSelect = screen.getByDisplayValue(/Select Course/i);
    fireEvent.change(courseSelect, { target: { value: 'CS201' } });
    

    const dateInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2026-03-10' } });
    fireEvent.change(dateInputs[1], { target: { value: '2026-03-11' } });
    

    const reasonText = screen.getByPlaceholderText(/Guest lecture clash/i);
    fireEvent.change(reasonText, { target: { value: 'Holiday' } });


    const submitBtn = screen.getByRole('button', { name: /Send Request/i });
    fireEvent.click(submitBtn);
    
    expect(window.alert).toHaveBeenCalledWith("Rescheduling Request Sent to Faculty & Admin for approval.");
  });

});