import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/rooms';

// Configure axios defaults
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Include cookies for authentication
    headers: {
        'Content-Type': 'application/json',
    },
});

// Get all classrooms
export const getAllClassrooms = async () => {
    try {
        const response = await axiosInstance.get('/all');
        return response.data;
    } catch (error) {
        console.error('Error fetching classrooms:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch classrooms');
    }
};

// Add new classroom
export const addClassroom = async (classroomData) => {
    try {
        const response = await axiosInstance.post('/add', classroomData);
        return response.data;
    } catch (error) {
        console.error('Error adding classroom:', error);
        throw new Error(error.response?.data?.message || 'Failed to add classroom');
    }
};

// Update existing classroom
export const updateClassroom = async (id, classroomData) => {
    try {
        const response = await axiosInstance.put(`/update/${id}`, classroomData);
        return response.data;
    } catch (error) {
        console.error('Error updating classroom:', error);
        throw new Error(error.response?.data?.message || 'Failed to update classroom');
    }
};

// Delete classroom
export const deleteClassroom = async (id) => {
    try {
        const response = await axiosInstance.delete(`/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting classroom:', error);
        throw new Error(error.response?.data?.message || 'Failed to delete classroom');
    }
};
