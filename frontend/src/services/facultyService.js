import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/faculty';

// Configure axios defaults
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Include cookies for authentication
    headers: {
        'Content-Type': 'application/json',
    },
});

// Get all faculty members
export const getAllFaculty = async () => {
    try {
        const response = await axiosInstance.get('/all');
        return response.data;
    } catch (error) {
        console.error('Error fetching faculty:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch faculty');
    }
};

// Add new faculty member
export const addFaculty = async (facultyData) => {
    try {
        const response = await axiosInstance.post('/add', facultyData);
        return response.data;
    } catch (error) {
        console.error('Error adding faculty:', error);
        throw new Error(error.response?.data?.message || 'Failed to add faculty');
    }
};

// Update existing faculty member
export const updateFaculty = async (id, facultyData) => {
    try {
        const response = await axiosInstance.put(`/update/${id}`, facultyData);
        return response.data;
    } catch (error) {
        console.error('Error updating faculty:', error);
        throw new Error(error.response?.data?.message || 'Failed to update faculty');
    }
};

// Delete faculty member
export const deleteFaculty = async (id) => {
    try {
        const response = await axiosInstance.delete(`/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting faculty:', error);
        throw new Error(error.response?.data?.message || 'Failed to delete faculty');
    }
};

