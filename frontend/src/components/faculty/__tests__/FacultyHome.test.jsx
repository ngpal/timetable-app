import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import FacultyHome from '../FacultyHome';

// Mock recharts to avoid DOM measurement issues in test
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="chart-container">{children}</div>,
  BarChart: ({ children }) => <div>{children}</div>,
  Bar: () => <div />,
  Cell: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
}));

const mockedUsedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useOutletContext: jest.fn(() => ({ userName: 'Dr. Test Faculty' }))
}));

const mockTimetableData = {
  success: true,
  facultyName: 'Dr. Test Faculty',
  department: 'Computer Science and Engineering',
  designation: 'Assistant Professor',
  email: 'test@cb.amrita.edu',
  slots: [
    { day: 'Monday', slotNumber: 1, courseCode: '23CSE312', sessionType: 'Theory', venue: 'AB2-301', section: 'S5', department: 'CSE' },
    { day: 'Monday', slotNumber: 3, courseCode: '23CSE314', sessionType: 'Lab', venue: 'LAB-201', section: 'S5', department: 'CSE' },
    { day: 'Tuesday', slotNumber: 2, courseCode: '23CSE312', sessionType: 'Theory', venue: 'AB2-301', section: 'S5', department: 'CSE' },
    { day: 'Wednesday', slotNumber: 1, courseCode: '23CSE314', sessionType: 'Theory', venue: 'AB2-302', section: 'S3', department: 'CSE' },
    { day: 'Thursday', slotNumber: 4, courseCode: '23CSE312', sessionType: 'Theory', venue: 'AB2-301', section: 'S5', department: 'CSE' },
    { day: 'Friday', slotNumber: 2, courseCode: '23CSE314', sessionType: 'Lab', venue: 'LAB-201', section: 'S3', department: 'CSE' },
  ],
  courses: [
    { courseCode: '23CSE312', courseName: 'Data Structures', courseType: 'Core', credits: 4, role: 'Incharge' },
    { courseCode: '23CSE314', courseName: 'Computer Networks', courseType: 'Core', credits: 3, role: 'Incharge' },
  ]
};

const mockRequestsData = {
  requests: [
    {
      courseCode: '23CSE312', courseName: 'Data Structures',
      currentDay: 'Monday', currentSlotNumber: 1,
      requestedDay: 'Tuesday', requestedSlotNumber: 3,
      reason: 'Lab exam conflict', status: 'Pending_Faculty'
    }
  ]
};

describe('FacultyHome Dashboard', () => {
  beforeEach(() => {
    mockedUsedNavigate.mockReset();
    global.fetch = jest.fn((url) => {
      if (url.includes('/api/timetable/my-timetable')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockTimetableData) });
      }
      if (url.includes('/api/slot-change-requests')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockRequestsData) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
  });

  afterEach(() => jest.clearAllMocks());

  const setup = () => render(<MemoryRouter><FacultyHome /></MemoryRouter>);

  test('shows loading initially', () => {
    setup();
    expect(screen.getByText(/loading faculty dashboard/i)).toBeInTheDocument();
  });

  test('renders stat cards with real data after fetch', async () => {
    setup();
    await waitFor(() => {
      expect(screen.getByText('Faculty Dashboard')).toBeInTheDocument();
    });

    // Check stat card values
    expect(screen.getByText('Courses Teaching')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // 2 courses
    expect(screen.getByText('Weekly Hours')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument(); // 6 total slots
    expect(screen.getByText("Today's Classes")).toBeInTheDocument();
    expect(screen.getByText('Pending Requests')).toBeInTheDocument();
  });

  test('shows welcome message with faculty name', async () => {
    setup();
    await waitFor(() => {
      expect(screen.getByText(/Dr. Test Faculty/)).toBeInTheDocument();
    });
    expect(screen.getByText(/Assistant Professor/)).toBeInTheDocument();
  });

  test('navigates to requests page when pending requests card is clicked', async () => {
    setup();
    await waitFor(() => {
      expect(screen.getByText('Pending Requests')).toBeInTheDocument();
    });

    const requestsCard = screen.getByText('Pending Requests').closest('.modern-card');
    fireEvent.click(requestsCard);
    expect(mockedUsedNavigate).toHaveBeenCalledWith('/faculty/requests');
  });

  test('shows error state on API failure', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));
    setup();
    await waitFor(() => {
      expect(screen.getByText(/Error loading dashboard/i)).toBeInTheDocument();
    });
  });

  test('renders pending rescheduling requests section', async () => {
    setup();
    await waitFor(() => {
      expect(screen.getByText(/Pending Rescheduling Requests/i)).toBeInTheDocument();
    });
    expect(screen.getAllByText(/23CSE312/)[0]).toBeInTheDocument();
    expect(screen.getByText(/Awaiting Review/i)).toBeInTheDocument();
  });
});