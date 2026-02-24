import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom';
import FacultyDashboard from '../FacultyDashboard';


const mockedUsedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
   ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}));

describe('FacultyDashboard Basic Tests', () => {
  
  const renderDashboard = (initialPath = '/faculty') => {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/faculty" element={<FacultyDashboard />}>
            <Route index element={<div>Dashboard Page Content</div>} />
            <Route path="timetable" element={<div>Timetable Page Content</div>} />
          </Route>
          <Route path="/" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );
  };

  test('renders sidebar navigation items', () => {
    renderDashboard();
    
    expect(screen.getByText(/Faculty Portal/i)).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();

    expect(screen.getAllByText(/Timetable/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Rescheduling Requests/i)).toBeInTheDocument();
    expect(screen.getByText(/Apply Leave/i)).toBeInTheDocument();
  });

  test('highlights the active link based on route', () => {
    renderDashboard('/faculty/timetable');
    

    const timetableLink = screen.getByRole('link', { name: /Timetable/i });
    const dashboardLink = screen.getByRole('link', { name: /Dashboard/i });

    expect(timetableLink).toHaveClass('active');
    expect(dashboardLink).not.toHaveClass('active');
  });

  test('navigates to login page on logout click', () => {
    renderDashboard();
    
    const logoutBtn = screen.getByRole('button', { name: /Logout/i });
    fireEvent.click(logoutBtn);
    
    expect(mockedUsedNavigate).toHaveBeenCalledWith('/');
  });

  test('renders the Outlet content', () => {
    renderDashboard('/faculty');

    expect(screen.getByText('Dashboard Page Content')).toBeInTheDocument();
  });

});