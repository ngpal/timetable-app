import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StudentTimetable from '../StudentTimetable';

describe('StudentTimetable Basic Tests', () => {
  

  beforeAll(() => {
    jest.spyOn(global.Math, 'random').mockReturnValue(0.9); // Forces classes to render in every slot
  });

  afterAll(() => {
    jest.spyOn(global.Math, 'random').mockRestore();
  });

  test('renders the page header and download button', () => {
    render(<StudentTimetable />);
    
    expect(screen.getByText(/Class Timetable/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Download Image/i })).toBeInTheDocument();
  });

  test('renders all day headers (Mon-Fri)', () => {
    render(<StudentTimetable />);
    
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    days.forEach(day => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  test('renders all time slot headers', () => {
    render(<StudentTimetable />);
    
    const timeSlots = ['9:00', '10:00', '11:00', '12:00', '1:00', '2:00', '3:00', '4:00'];
    timeSlots.forEach(slot => {
      expect(screen.getByText(slot)).toBeInTheDocument();
    });
  });

  test('renders course codes and room numbers when slots are filled', () => {
    render(<StudentTimetable />);
    
    // With Math.random mocked to 0.9, we expect these patterns to exist
    expect(screen.getAllByText(/CS20/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Room 10/i).length).toBeGreaterThan(0);
  });
});