import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom';
import StudentDashboard from '../StudentDashboard';


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
          {/*Added children routes so they match the initialPath */}
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

    expect(screen.getByRole('heading', { name: /Edu(\s*)Portal/i })).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Class Timetable')).toBeInTheDocument();


    expect(screen.queryByText(/Reschedule Request/i)).not.toBeInTheDocument();
  });



  test('applies the active class to the current route', () => {
    localStorage.setItem('lastLoginEmail', 'student@test.com');
    localStorage.setItem('users', JSON.stringify([
      { email: 'student@test.com', role: 'student', fullName: 'John Doe' }
    ]));


    renderDashboard('/student/timetable');

    const timetableLink = screen.getByRole('link', { name: 'Class Timetable' });
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