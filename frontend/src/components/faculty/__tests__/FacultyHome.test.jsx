import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import FacultyHome from '../FacultyHome';


const mockedUsedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useOutletContext: jest.fn(() => ({ userName: 'Faculty' }))
}));

describe('FacultyHome Basic Tests', () => {

  const setup = () => {
    return render(
      <MemoryRouter>
        <FacultyHome />
      </MemoryRouter>
    );
  };

  test('renders the welcome header', () => {
    setup();
    expect(screen.getByText(/Welcome/i)).toBeInTheDocument();
  });

  test('displays pending requests card with correct value', () => {
    setup();
    expect(screen.getByText(/Pending Requests/i)).toBeInTheDocument();
    expect(screen.getAllByText(/3/)[0]).toBeInTheDocument();
    expect(screen.getByText(/Total Needed/i)).toBeInTheDocument();
  });

  test('displays weekly workload card with correct value', () => {
    setup();
    expect(screen.getByText(/Weekly Workload/i)).toBeInTheDocument();
    expect(screen.getByText(/16/i)).toBeInTheDocument();
    expect(screen.getByText(/4 Theory/i)).toBeInTheDocument();
  });

  test('navigates to requests page when pending requests card is clicked', () => {
    setup();


    const requestsCard = screen.getByText(/Pending Requests/i).closest('.modern-card');
    fireEvent.click(requestsCard);

    expect(mockedUsedNavigate).toHaveBeenCalledWith('/faculty/requests');
  });

});