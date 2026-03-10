import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FacultyRequests from '../FacultyRequests';

describe('FacultyRequests Basic Tests', () => {

  const mockRequests = [
    { _id: '1', courseCode: '23CSE312', courseName: 'CS Second Year', facultyName: 'Dr. Test', currentDay: 'Monday', currentSlotNumber: 3, requestedDay: 'Tuesday', requestedSlotNumber: 2, reason: 'Free slot', status: 'Pending_Faculty', createdAt: new Date().toISOString() },
    { _id: '2', courseCode: '23IT401', courseName: 'IT Final Year', facultyName: 'Dr. Test', currentDay: 'Wednesday', currentSlotNumber: 1, requestedDay: 'Thursday', requestedSlotNumber: 3, reason: 'Lab conflict', status: 'Pending_Faculty', createdAt: new Date().toISOString() }
  ];

  beforeEach(() => {
    window.alert = jest.fn();
    window.confirm = jest.fn(() => true);
    global.fetch = jest.fn((url) => {
      if (url.includes('/api/slot-change-requests') && !url.includes('/faculty-approve')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockRequests)
        });
      }
      if (url.includes('/faculty-approve')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Faculty endorsed. Request forwarded to Admin for finalization.' })
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders the page header and initial request cards', async () => {
    render(<FacultyRequests />);

    expect(await screen.findByText(/Rescheduling Requests/i)).toBeInTheDocument();

    expect(await screen.findByText('23CSE312 - CS Second Year')).toBeInTheDocument();
    expect(screen.getByText('23IT401 - IT Final Year')).toBeInTheDocument();
  });

  test('displays correct slot move information', async () => {
    render(<FacultyRequests />);

    expect(await screen.findByText('Monday')).toBeInTheDocument();
    expect(screen.getByText('Tuesday')).toBeInTheDocument();
  });

  test('handles "Forward to Admin" action correctly', async () => {
    window.confirm = jest.fn(() => true);
    render(<FacultyRequests />);

    const forwardBtns = await screen.findAllByText(/Forward to Admin/i);
    fireEvent.click(forwardBtns[0]);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Faculty endorsed. Request forwarded to Admin for finalization.');
    });
  });

  test('handles "Reject" action correctly', async () => {
    window.prompt = jest.fn(() => 'Schedule conflict');
    render(<FacultyRequests />);

    const rejectBtns = await screen.findAllByText(/Reject/i);
    fireEvent.click(rejectBtns[0]);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Request rejected');
    });
  });

  test('shows empty state message when no requests exist', async () => {
    global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve([]) }));
    render(<FacultyRequests />);

    expect(await screen.findByText(/No Pending Requests/i)).toBeInTheDocument();
  });

});