import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import FacultyTimetable from '../FacultyTimetable';

const mockTimetableData = {
  success: true,
  facultyName: 'Dr. Test Faculty',
  department: 'Computer Science and Engineering',
  designation: 'Assistant Professor',
  email: 'test@cb.amrita.edu',
  slots: [
    { day: 'Monday', slotNumber: 1, courseCode: '23CSE312', courseName: 'Data Structures', section: 'S5', venue: 'AB2-301', sessionType: 'Theory' }
  ],
  courses: [
    { courseCode: '23CSE312', courseName: 'Data Structures', section: 'S5', sessionType: 'Theory' }
  ]
};

describe('FacultyTimetable Basic Tests', () => {
  beforeEach(() => {
    global.fetch = jest.fn((url) => {
      if (url.includes('/api/timetable/my-timetable')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockTimetableData)
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders the page header and download button', async () => {
    render(<FacultyTimetable />);

    expect(await screen.findByText(/FACULTY TIME TABLE/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Export ICS/i })).toBeInTheDocument();
  });

  test('renders all day headers', async () => {
    render(<FacultyTimetable />);

    await screen.findByText(/FACULTY TIME TABLE/i);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    days.forEach(day => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  test('renders time slot columns', async () => {
    render(<FacultyTimetable />);

    await screen.findByText(/FACULTY TIME TABLE/i);

    const timeSlots = ['08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '12:00 - 13:00'];
    timeSlots.forEach(slot => {
      expect(screen.getByText(slot)).toBeInTheDocument();
    });
  });

  test('renders faculty details from API', async () => {
    render(<FacultyTimetable />);

    expect(await screen.findByText('Dr. Test Faculty')).toBeInTheDocument();
    expect(screen.getByText('CSE')).toBeInTheDocument();
    expect(screen.getByText('Assistant Professor')).toBeInTheDocument();
  });

  test('renders course data from API slots', async () => {
    render(<FacultyTimetable />);

    await screen.findByText(/FACULTY TIME TABLE/i);

    expect(screen.getAllByText(/23CSE312/i).length).toBeGreaterThan(0);
  });
});