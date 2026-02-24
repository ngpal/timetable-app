import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AmritaTimetable from '../AmritaTimetable';

// 1. Mock the Service Path
jest.mock('../../../services/courseAssignmentService', () => ({
  getCourseAssignment: jest.fn()
}));

import { getCourseAssignment } from '../../../services/courseAssignmentService';

const mockTimetableData = {
  academicYear: '2025-2026',
  semester: 'Odd',
  department: 'CSE',
  section: 'A',
  timetableSlots: [
    { day: 'Monday', slotNumber: 1, courseCode: '21CS301', sessionType: 'Theory', venue: 'A301' },
    { day: 'Monday', slotNumber: 6, courseCode: '21CS305', sessionType: 'Lab', venue: 'Lab 1' }
  ],
  courses: [
    { courseCode: '21CS301', courseName: 'Data Structures', courseType: 'Theory', faculty: [{ name: 'Dr. Ramesh' }] }
  ]
};

describe('AmritaTimetable Basic Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders generating preview message when previewData is passed', () => {
    render(<AmritaTimetable previewData={mockTimetableData} />);
    
    expect(screen.getByText(/GENERATED PREVIEW/i)).toBeInTheDocument();
    
    // Use getAllByText because these appear in BOTH the grid and the bottom table
    const courseCodes = screen.getAllByText('21CS301');
    const venues = screen.getAllByText('A301');

    expect(courseCodes.length).toBeGreaterThan(0);
    expect(venues.length).toBeGreaterThan(0);
  });

  test('renders standard view and allows loading data', async () => {
    getCourseAssignment.mockResolvedValue(mockTimetableData);
    
    render(<AmritaTimetable />);
    
    expect(screen.getByText('TIME TABLE')).toBeInTheDocument();
    
    const loadBtn = screen.getByText(/Load Timetable/i);
    fireEvent.click(loadBtn);
    
    await waitFor(() => {
      expect(getCourseAssignment).toHaveBeenCalled();
      // Verify at least one instance exists using getAllByText
      expect(screen.getAllByText('21CS301')[0]).toBeInTheDocument();
    });
  });

  test('correctly renders the Lunch Break rowSpan', () => {
    render(<AmritaTimetable previewData={mockTimetableData} />);
    
    const lunchCell = screen.getByText(/Lunch Break/i);
    expect(lunchCell).toBeInTheDocument();
    
    // rowSpan is treated as a property in JSDOM
    expect(lunchCell.rowSpan).toBe(5);
  });

  test('renders course info tables at the bottom', async () => {
    render(<AmritaTimetable previewData={mockTimetableData} />);
    
    expect(screen.getByText(/Core Courses/i)).toBeInTheDocument();
    expect(screen.getByText(/Data Structures/i)).toBeInTheDocument();
    expect(screen.getByText(/Dr. Ramesh/i)).toBeInTheDocument();
  });

  test('shows empty state message when no data is found', async () => {
    getCourseAssignment.mockResolvedValue(null);
    
    render(<AmritaTimetable />);
    
    fireEvent.click(screen.getByText(/Load Timetable/i));
    
    // findByText handles the transition from "loading" to "no data"
    expect(await screen.findByText(/No Timetable Found/i)).toBeInTheDocument();
  });
});