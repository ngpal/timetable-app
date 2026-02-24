import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import FacultyTimetable from '../FacultyTimetable';

describe('FacultyTimetable Basic Tests', () => {
  

  beforeAll(() => {
    jest.spyOn(global.Math, 'random').mockReturnValue(0.9); // Forces a class to appear in every slot
  });

  afterAll(() => {
    jest.spyOn(global.Math, 'random').mockRestore();
  });

  test('renders the page header and download button', () => {
    render(<FacultyTimetable />);
    
    expect(screen.getByText(/Timetable/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Download PDF/i })).toBeInTheDocument();
  });

  test('renders all day headers', () => {
    render(<FacultyTimetable />);
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    days.forEach(day => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  test('renders time slot columns', () => {
    render(<FacultyTimetable />);
    
    const timeSlots = ['9-10', '10-11', '11-12', '12-1', '1-2', '2-3', '3-4', '4-5'];
    timeSlots.forEach(slot => {
      expect(screen.getByText(slot)).toBeInTheDocument();
    });
  });

  test('renders course data when Math.random is high', () => {
    render(<FacultyTimetable />);
    

    expect(screen.getAllByText(/R-101/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/CS10/i).length).toBeGreaterThan(0);
  });

});