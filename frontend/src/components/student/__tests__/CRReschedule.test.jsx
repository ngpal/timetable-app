import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useOutletContext } from 'react-router-dom';
import '@testing-library/jest-dom';
import CRReschedule from '../CRReschedule';
import { timetableService } from '../../../services/timetableService';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useOutletContext: jest.fn(),
}));

const mockTimetable = {
  _id: 'ca-1',
  timetableSlots: [
    { day: 'Monday', slotNumber: 1, venue: 'AB2-301' }
  ],
  courses: [
    {
      courseCode: 'CS201',
      courseName: 'Data Structures',
      faculty: [{ name: 'Dr. Test', role: 'Incharge' }]
    }
  ]
};

describe('CRReschedule Basic Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useOutletContext.mockReturnValue({ userName: 'CR Student' });
    window.alert = jest.fn();

    timetableService.getStudentPersonalTimetable.mockResolvedValue({
      success: true,
      timetable: mockTimetable,
    });

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Request submitted successfully to Faculty' })
      })
    );
  });

  test('renders the form after loading timetable', async () => {
    render(<CRReschedule />);

    expect(await screen.findByText(/Request Class Rescheduling/i)).toBeInTheDocument();
    expect(screen.getByText(/Select Course/i)).toBeInTheDocument();
  });

  test('allows selecting a course from the dropdown', async () => {
    render(<CRReschedule />);

    await screen.findByText(/Request Class Rescheduling/i);

    const selects = screen.getAllByRole('combobox');
    const courseSelect = selects[0];
    fireEvent.change(courseSelect, { target: { value: 'CS201' } });

    expect(courseSelect.value).toBe('CS201');
  });

  test('triggers alert on valid form submission', async () => {
    render(<CRReschedule />);

    await screen.findByText(/Request Class Rescheduling/i);

    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'CS201' } }); // course
    fireEvent.change(selects[1], { target: { value: 'Monday' } }); // current day
    fireEvent.change(selects[2], { target: { value: '1' } }); // current slot
    fireEvent.change(selects[3], { target: { value: 'Tuesday' } }); // requested day
    fireEvent.change(selects[4], { target: { value: '2' } }); // requested slot

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Guest lecture clash' } });

    const submitBtn = screen.getByRole('button', { name: /Submit Request to Faculty/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Request submitted successfully to Faculty');
    });
  });
});