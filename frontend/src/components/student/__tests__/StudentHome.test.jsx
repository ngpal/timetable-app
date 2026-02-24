import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useOutletContext } from 'react-router-dom';
import '@testing-library/jest-dom';
import StudentHome from '../StudentHome';

// 1. Mock the react-router-dom hooks
const mockedUsedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useOutletContext: jest.fn(),
}));

describe('StudentHome Basic Tests', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders standard welcome message for normal students', () => {
    // Mock context for a standard student
    useOutletContext.mockReturnValue({ isCR: false, userName: 'John Doe' });

    render(
      <MemoryRouter>
        <StudentHome />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Welcome')).toBeInTheDocument();
    expect(screen.getByText('Attendance')).toBeInTheDocument();
    // Request Stats card should NOT be visible
    expect(screen.queryByText(/Request Stats/i)).not.toBeInTheDocument();
  });

  test('renders CR specific header and stats card', () => {
    // Mock context for a Class Representative
    useOutletContext.mockReturnValue({ isCR: true, userName: 'Jane CR' });

    render(
      <MemoryRouter>
        <StudentHome />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Class Representative Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Request Stats')).toBeInTheDocument();
    expect(screen.getByText('3 Total')).toBeInTheDocument();
  });

  test('navigates to reschedule page when CR clicks the request card', () => {
    useOutletContext.mockReturnValue({ isCR: true, userName: 'Jane CR' });

    render(
      <MemoryRouter>
        <StudentHome />
      </MemoryRouter>
    );
    
    const requestCard = screen.getByText('Request Stats').closest('.stat-card');
    fireEvent.click(requestCard);
    
    expect(mockedUsedNavigate).toHaveBeenCalledWith('/student/reschedule');
  });

  test('displays correct attendance value', () => {
    useOutletContext.mockReturnValue({ isCR: false, userName: 'John' });

    render(
      <MemoryRouter>
        <StudentHome />
      </MemoryRouter>
    );
    
    expect(screen.getByText('85%')).toBeInTheDocument();
  });
});