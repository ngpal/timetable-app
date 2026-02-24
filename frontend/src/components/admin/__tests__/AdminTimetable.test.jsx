import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminTimetable from '../AdminTimetable';

// 1. Basic Service Mocks
jest.mock('../../../services/constraintService', () => ({
  constraintService: {
    getActiveConstraint: jest.fn().mockResolvedValue({
      hardConstraints: { dailyStartTime: '09:00' },
      softConstraints: { minimizeGaps: { enabled: true, weight: 5 } }
    }),
    getDefaultConstraint: jest.fn().mockResolvedValue({})
  }
}));

jest.mock('../../../services/generatorService', () => ({
  generateTimetable: jest.fn()
}));

jest.mock('../../../services/courseAssignmentService', () => ({
  getAllCourseAssignments: jest.fn().mockResolvedValue([]),
  updateCourseAssignment: jest.fn()
}));

// 2. Mock Child Component & Icons (to avoid rendering errors)
jest.mock('../AmritaTimetable', () => () => <div>Timetable Display</div>);
jest.mock('lucide-react', () => ({
  Save: () => <span>Save</span>,
  RefreshCw: () => <span>Refresh</span>,
  AlertTriangle: () => <span>Alert</span>,
  CheckCircle: () => <span>Check</span>,
}));

describe('AdminTimetable Basic Tests', () => {
  
  test('renders the page title', async () => {
    render(<AdminTimetable />);
    // Use findBy to wait for the "Loading..." state to finish
    const title = await screen.findByText(/Timetable Generator/i);
    expect(title).toBeInTheDocument();
  });

  test('settings button exists and can be clicked', async () => {
    render(<AdminTimetable />);
    const btn = await screen.findByText(/Hide Settings/i);
    expect(btn).toBeInTheDocument();
    
    fireEvent.click(btn);
    expect(btn).toHaveTextContent(/Settings/i);
  });

  test('shows warning when no assignment is found', async () => {
    render(<AdminTimetable />);
    const warning = await screen.findByText(/No matching course assignment found/i);
    expect(warning).toBeInTheDocument();
  });

  test('displays hard constraints section by default', async () => {
    render(<AdminTimetable />);
    const sectionHeader = await screen.findByText(/Hard Constraints/i);
    expect(sectionHeader).toBeInTheDocument();
  });

});