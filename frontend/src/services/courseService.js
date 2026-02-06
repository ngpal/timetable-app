import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/courses';

// Configure axios defaults
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Include cookies for authentication
    headers: {
        'Content-Type': 'application/json',
    },
});

// Get all courses
export const getAllCourses = async () => {
    try {
        const response = await axiosInstance.get('/all');
        return response.data;
    } catch (error) {
        console.error('Error fetching courses:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch courses');
    }
};

// Add new course
export const addCourse = async (courseData) => {
    try {
        const response = await axiosInstance.post('/add', courseData);
        return response.data;
    } catch (error) {
        console.error('Error adding course:', error);
        throw new Error(error.response?.data?.message || 'Failed to add course');
    }
};

// Update existing course
export const updateCourse = async (id, courseData) => {
    try {
        const response = await axiosInstance.put(`/update/${id}`, courseData);
        return response.data;
    } catch (error) {
        console.error('Error updating course:', error);
        throw new Error(error.response?.data?.message || 'Failed to update course');
    }
};

// Delete course
export const deleteCourse = async (id) => {
    try {
        const response = await axiosInstance.delete(`/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting course:', error);
        throw new Error(error.response?.data?.message || 'Failed to delete course');
    }
};
