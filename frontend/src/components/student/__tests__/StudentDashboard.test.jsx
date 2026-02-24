import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom';
import StudentDashboard from '../StudentDashboard';

// Mock useNavigate
const mockedUsedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}));

describe('StudentDashboard Basic Tests', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  const renderDashboard = (initialPath = '/student') => {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          {/* THE FIX: Added children routes so they match the initialPath */}
          <Route path="/student" element={<StudentDashboard />}>
            <Route index element={<div>Dashboard Page</div>} />
            <Route path="timetable" element={<div>Timetable Page</div>} />
            <Route path="reschedule" element={<div>Reschedule Page</div>} />
          </Route>
          <Route path="/" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );
  };

  test('renders standard student navigation', () => {
    localStorage.setItem('lastLoginEmail', 'student@test.com');
    localStorage.setItem('users', JSON.stringify([
        { email: 'student@test.com', role: 'student', fullName: 'Normal Student' }
    ]));

    renderDashboard();
    
    expect(screen.getByText(/Student Portal/i)).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText(/Class Timetable/i)).toBeInTheDocument();
    
    // Reschedule link should not be visible for normal student
    expect(screen.queryByText(/Reschedule Request/i)).not.toBeInTheDocument();
  });

  test('renders extra options for Class Representative (CR)', () => {
    localStorage.setItem('lastLoginEmail', 'cr@test.com');
    localStorage.setItem('users', JSON.stringify([
        { email: 'cr@test.com', role: 'class_rep', fullName: 'Jane CR' }
    ]));

    renderDashboard();
    
    expect(screen.getByText(/Class Rep/i)).toBeInTheDocument();
    expect(screen.getByText(/Reschedule Request/i)).toBeInTheDocument();
  });

  test('applies the active class to the current route', () => {
    localStorage.setItem('lastLoginEmail', 'student@test.com');
    localStorage.setItem('users', JSON.stringify([
        { email: 'student@test.com', role: 'student', fullName: 'John Doe' }
    ]));

    // This now works because the /student/timetable route is defined in renderDashboard
    renderDashboard('/student/timetable');
    
    const timetableLink = screen.getByRole('link', { name: /Class Timetable/i });
    expect(timetableLink).toHaveClass('active');
  });

  test('clears local storage and redirects on logout', () => {
    localStorage.setItem('lastLoginEmail', 'student@test.com');
    renderDashboard();
    
    const logoutBtn = screen.getByRole('button', { name: /Logout/i });
    fireEvent.click(logoutBtn);
    
    expect(localStorage.getItem('lastLoginEmail')).toBeNull();
    expect(mockedUsedNavigate).toHaveBeenCalledWith('/');
  });
});