import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FacultyRequests from '../FacultyRequests';

describe('FacultyRequests Basic Tests', () => {

  beforeEach(() => {
    window.alert = jest.fn();
    global.fetch = jest.fn((url) => {
      if (url === '/api/requests/all') {
        return Promise.resolve({
          json: () => Promise.resolve({
            success: true,
            requests: [
              { _id: '1', subject: 'CS Second Year', studentName: 'John', currentDate: 'Mon', currentSlot: '10-11', targetDate: 'Tue', targetSlot: '2-3', status: 'Pending' },
              { _id: '2', subject: 'IT Final Year', studentName: 'Jane', currentDate: 'Wed', currentSlot: '1-2', targetDate: 'Thu', targetSlot: '3-4', status: 'Pending' }
            ]
          })
        });
      }
      if (url.includes('/status')) {
        const status = url.includes('1') ? 'Approved' : 'Rejected';
        return Promise.resolve({
          json: () => Promise.resolve({ success: true, message: `Request ${status}` })
        });
      }
      return Promise.resolve({ json: () => Promise.resolve({ success: true }) });
    });
  });

  test('renders the page header and initial request cards', async () => {
    render(<FacultyRequests />);

    expect(screen.getByText(/Rescheduling Requests/i)).toBeInTheDocument();


    expect(await screen.findByText('CS Second Year')).toBeInTheDocument();
    expect(screen.getByText('IT Final Year')).toBeInTheDocument();
  });

  test('displays correct slot move information', async () => {
    render(<FacultyRequests />);

    expect(await screen.findByText(/Mon/i)).toBeInTheDocument();
    expect(screen.getByText(/Tue/i)).toBeInTheDocument();
  });

  test('handles "Approve" action correctly', async () => {
    render(<FacultyRequests />);


    const approveBtns = await screen.findAllByText(/Approve/i);
    fireEvent.click(approveBtns[0]);


    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Request Approved');
    });
  });

  test('handles "Reject" action correctly', async () => {
    render(<FacultyRequests />);


    const rejectBtns = await screen.findAllByText(/Reject/i);
    fireEvent.click(rejectBtns[1]);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Request Rejected');
    });
  });

  test('shows empty state message when all requests are cleared', async () => {
    global.fetch = jest.fn(() => Promise.resolve({ json: () => Promise.resolve({ success: true, requests: [] }) }));
    render(<FacultyRequests />);

    expect(await screen.findByText(/No pending requests/i)).toBeInTheDocument();
  });

});