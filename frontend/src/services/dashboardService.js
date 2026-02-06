import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/dashboard';

// Configure axios defaults
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Include cookies for authentication
    headers: {
        'Content-Type': 'application/json',
    },
});

// Get dashboard statistics
export const getDashboardStats = async () => {
    try {
        const response = await axiosInstance.get('/stats');
        return response.data;
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch dashboard statistics');
    }
};
