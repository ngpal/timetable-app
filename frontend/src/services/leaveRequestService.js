import axios from 'axios';

const API_URL = 'http://localhost:3000/api/leave-requests';

// Create a new leave request
export const createLeaveRequest = async (leaveData) => {
    try {
        const response = await axios.post(`${API_URL}/create`, leaveData);
        return response.data;
    } catch (error) {
        console.error('Error creating leave request:', error);
        throw error;
    }
};

// Get all leave requests (for admin)
export const getAllLeaveRequests = async () => {
    try {
        const response = await axios.get(`${API_URL}/all`);
        return response.data;
    } catch (error) {
        console.error('Error fetching leave requests:', error);
        throw error;
    }
};

// Get leave requests by faculty ID
export const getLeaveRequestsByFaculty = async (facultyId) => {
    try {
        const response = await axios.get(`${API_URL}/faculty/${facultyId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching faculty leave requests:', error);
        throw error;
    }
};

// Get pending leave requests count
export const getPendingLeaveRequestsCount = async () => {
    try {
        const response = await axios.get(`${API_URL}/pending-count`);
        return response.data;
    } catch (error) {
        console.error('Error fetching pending count:', error);
        throw error;
    }
};

// Update leave request status (approve/reject)
export const updateLeaveRequestStatus = async (id, status, adminResponse = '') => {
    try {
        const response = await axios.put(`${API_URL}/${id}/status`, {
            status,
            adminResponse
        });
        return response.data;
    } catch (error) {
        console.error('Error updating leave request:', error);
        throw error;
    }
};

// Delete a leave request
export const deleteLeaveRequest = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting leave request:', error);
        throw error;
    }
};
