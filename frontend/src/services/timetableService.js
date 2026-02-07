const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const timetableService = {
    // Get all timetables
    getAllTimetables: async () => {
        try {
            const response = await fetch(`${API_URL}/api/timetable`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch timetables');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching timetables:', error);
            throw error;
        }
    },

    // Get timetable by parameters
    getTimetable: async (academicYear, semester, department, section) => {
        try {
            const params = new URLSearchParams({
                academicYear,
                semester,
                department,
                section
            });
            
            const response = await fetch(`${API_URL}/api/timetable/find?${params}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                if (response.status === 404) {
                    return null;
                }
                throw new Error('Failed to fetch timetable');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching timetable:', error);
            throw error;
        }
    },

    // Create new timetable
    createTimetable: async (timetableData) => {
        try {
            const response = await fetch(`${API_URL}/api/timetable`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(timetableData)
            });
            
            if (!response.ok) {
                throw new Error('Failed to create timetable');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error creating timetable:', error);
            throw error;
        }
    },

    // Update timetable
    updateTimetable: async (id, timetableData) => {
        try {
            const response = await fetch(`${API_URL}/api/timetable/${id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(timetableData)
            });
            
            if (!response.ok) {
                throw new Error('Failed to update timetable');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error updating timetable:', error);
            throw error;
        }
    },

    // Update specific slot
    updateSlot: async (id, day, slotNumber, slotData) => {
        try {
            const response = await fetch(`${API_URL}/api/timetable/${id}/slot`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ day, slotNumber, slotData })
            });
            
            if (!response.ok) {
                throw new Error('Failed to update slot');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error updating slot:', error);
            throw error;
        }
    },

    // Delete timetable
    deleteTimetable: async (id) => {
        try {
            const response = await fetch(`${API_URL}/api/timetable/${id}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete timetable');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error deleting timetable:', error);
            throw error;
        }
    }
};
