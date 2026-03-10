import axios from 'axios';

const API_URL = `${process.env.VITE_API_URL || ''}/api/timetable`;

// Configure axios instance with credentials
const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Include cookies for authentication
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getAllCourseAssignments = async () => {
    const response = await axiosInstance.get('/');
    return response.data;
};

export const getCourseAssignment = async (params) => {
    const response = await axiosInstance.get('/find', { params });
    return response.data;
};

export const createCourseAssignment = async (assignmentData) => {
    const response = await axiosInstance.post('/', assignmentData);
    return response.data;
};

export const updateCourseAssignment = async (id, assignmentData) => {
    const response = await axiosInstance.put(`/${id}`, assignmentData);
    return response.data;
};

export const deleteCourseAssignment = async (id) => {
    const response = await axiosInstance.delete(`/${id}`);
    return response.data;
};

// Update a specific timetable slot
export const updateSlot = async (assignmentId, day, slotNumber, slotData) => {
    const response = await axiosInstance.put(`/${assignmentId}/slots`, {
        day,
        slotNumber,
        slotData
    });
    return response.data;
};

// Get timetable aggregated for a specific faculty
export const getFacultyTimetable = async (facultyId) => {
    const response = await axiosInstance.get('/faculty-timetable', { params: { facultyId } });
    return response.data;
};
