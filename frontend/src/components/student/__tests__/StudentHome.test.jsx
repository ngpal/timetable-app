import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useOutletContext } from 'react-router-dom';
import '@testing-library/jest-dom';
import StudentHome from '../StudentHome';

const mockedUsedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useOutletContext: jest.fn(),
}));

// Mock import.meta.env
jest.mock('../../../../services/timetableService', () => ({
  timetableService: {
    getStudentPersonalTimetable: jest.fn().mockResolvedValue({
      success: true,
      timetable: {
        courses: [
          { courseCode: 'CS201', courseName: 'Data Structures' },
          { courseCode: 'CS202', courseName: 'Operating Systems' }
        ],
        timetableSlots: [
          { day: 'Monday', slotNumber: 1, courseCode: 'CS201', sessionType: 'Theory', venue: 'Room 101', isSpanContinuation: false, facultyName: 'Dr. Smith' },
          { day: 'Monday', slotNumber: 2, courseCode: 'CS202', sessionType: 'Lab', venue: 'Lab 1', isSpanContinuation: false, facultyName: 'Dr. Jones' }
        ]
      }
    })
  }
}));

// Mock Date for consistent tests (Monday 9 AM)
const RealDate = Date;
global.Date = class extends RealDate {
    constructor(date) {
        if (date) return new RealDate(date);
        return new RealDate('2026-03-09T09:00:00Z');
    }
    static now() {
        return new RealDate('2026-03-09T09:00:00Z').getTime();
    }
};

// Mock fetch for dashboard stats
const mockDashboardStats = {
    success: true,
    timetableStats: {
        totalCourses: 6,
        totalWeeklyHours: 24,
        theoryHours: 18,
        labHours: 6,
        facultyCount: 5,
        sectionInfo: 'CSE - Section A'
    },
    requestStats: {
        total: 3,
        pendingFaculty: 1,
        pendingAdmin: 1,
        approved: 1,
        rejected: 0
    },
    recentRequests: [
        {
            _id: '1',
            courseCode: 'CS201',
            courseName: 'Data Structures',
            currentDay: 'Monday',
            currentSlotNumber: 1,
            requestedDay: 'Tuesday',
            requestedSlotNumber: 2,
            status: 'Pending_Faculty',
            createdAt: '2026-03-09T08:00:00Z'
        }
    ],
    notifications: [
        { _id: 'n1', message: 'CS201 moved to Tuesday Slot 2', type: 'Reschedule', isRead: false, createdAt: '2026-03-09T07:00:00Z' }
    ],
    studentDetails: { section: 'A', department: 'CSE', rollNumber: 41 }
};

beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockDashboardStats)
    });
});

describe('StudentHome Dashboard Tests', () => {

    test('renders dashboard header for normal students', async () => {
        useOutletContext.mockReturnValue({ isCR: false, userName: 'John Doe' });

        render(
            <MemoryRouter>
                <StudentHome />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
        });
    });

    test('renders CR specific header', async () => {
        useOutletContext.mockReturnValue({ isCR: true, userName: 'Jane CR' });

        render(
            <MemoryRouter>
                <StudentHome />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('CR Dashboard')).toBeInTheDocument();
        });
    });

    test('displays real course count from API', async () => {
        useOutletContext.mockReturnValue({ isCR: false, userName: 'John' });

        render(
            <MemoryRouter>
                <StudentHome />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('6')).toBeInTheDocument(); // totalCourses
            expect(screen.getByText('Enrolled Courses')).toBeInTheDocument();
        });
    });

    test('displays real weekly hours from API', async () => {
        useOutletContext.mockReturnValue({ isCR: false, userName: 'John' });

        render(
            <MemoryRouter>
                <StudentHome />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('24')).toBeInTheDocument(); // totalWeeklyHours
            expect(screen.getByText('Weekly Hours')).toBeInTheDocument();
        });
    });

    test('displays real request stats from API', async () => {
        useOutletContext.mockReturnValue({ isCR: false, userName: 'John' });

        render(
            <MemoryRouter>
                <StudentHome />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Reschedule Requests')).toBeInTheDocument();
            expect(screen.getByText('Total')).toBeInTheDocument();
            expect(screen.getByText('Pending')).toBeInTheDocument();
            expect(screen.getByText('Approved')).toBeInTheDocument();
        });
    });

    test('displays real notifications from API', async () => {
        useOutletContext.mockReturnValue({ isCR: false, userName: 'John' });

        render(
            <MemoryRouter>
                <StudentHome />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Recent Notifications')).toBeInTheDocument();
            expect(screen.getByText('CS201 moved to Tuesday Slot 2')).toBeInTheDocument();
        });
    });

    test('shows section info badge', async () => {
        useOutletContext.mockReturnValue({ isCR: false, userName: 'John' });

        render(
            <MemoryRouter>
                <StudentHome />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getAllByText('CSE - Section A').length).toBeGreaterThan(0);
        });
    });
});