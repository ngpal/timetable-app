import axios from 'axios';

const API_URL = 'http://localhost:3000/api/generator';

// Validate a timetable against constraints
export const validateTimetable = async (courseAssignmentId) => {
  try {
    const response = await axios.post(`${API_URL}/validate`, { courseAssignmentId });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Generate a new timetable using Genetic Algorithm
export const generateTimetable = async (courseAssignmentId, config = {}) => {
  try {
    const response = await axios.post(`${API_URL}/generate`, { 
      courseAssignmentId,
      config 
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get all constraint definitions
export const getConstraints = async () => {
  try {
    const response = await axios.get(`${API_URL}/constraints`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
