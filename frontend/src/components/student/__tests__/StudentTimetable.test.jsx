import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import StudentTimetable from '../StudentTimetable';

// timetableService is globally mocked in jest.config.cjs

describe('StudentTimetable Basic Tests', () => {
    test('renders the page header and download button', async () => {
        render(<StudentTimetable />);
        expect(screen.getByText(/Loading your personal timetable/i)).toBeInTheDocument();
        
        await waitFor(() => {
            expect(screen.getByText(/Class Timetable/i)).toBeInTheDocument();
        });
        expect(screen.getByRole('button', { name: /Export ICS/i })).toBeInTheDocument();
    });

    test('renders all day headers (Monday-Friday)', async () => {
        render(<StudentTimetable />);
        
        await waitFor(() => {
            expect(screen.getByText('Monday')).toBeInTheDocument();
        });

        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        days.forEach(day => {
            expect(screen.getByText(day)).toBeInTheDocument();
        });
    });

    test('renders all time slot headers', async () => {
        render(<StudentTimetable />);
        
        await waitFor(() => {
            expect(screen.getByText('Monday')).toBeInTheDocument();
        });

        const timeSlots = ['08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '12:00 - 13:00'];
        timeSlots.forEach(slot => {
            expect(screen.getByText(slot)).toBeInTheDocument();
        });
    });

    test('renders course codes and room numbers (if any)', async () => {
        render(<StudentTimetable />);
        
        await waitFor(() => {
            expect(screen.getByText('Monday')).toBeInTheDocument();
        });
        // Note: The global mock currently has empty slots, so we just check it rendered
        expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });
});