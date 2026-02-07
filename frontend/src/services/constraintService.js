const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const constraintService = {
    // Get all constraints
    getAllConstraints: async () => {
        try {
            const response = await fetch(`${API_URL}/api/constraints`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch constraints');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching constraints:', error);
            throw error;
        }
    },

    // Get constraint by ID
    getConstraintById: async (id) => {
        try {
            const response = await fetch(`${API_URL}/api/constraints/${id}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch constraint');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching constraint:', error);
            throw error;
        }
    },

    // Get active constraint for specific parameters
    getActiveConstraint: async (academicYear, semester, department) => {
        try {
            const params = new URLSearchParams({
                academicYear,
                semester,
                department
            });
            
            const response = await fetch(`${API_URL}/api/constraints/active?${params}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                if (response.status === 404) {
                    return null; // No active constraint found
                }
                throw new Error('Failed to fetch active constraint');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching active constraint:', error);
            throw error;
        }
    },

    // Get default constraint template
    getDefaultConstraint: async () => {
        try {
            const response = await fetch(`${API_URL}/api/constraints/default`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch default constraint');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching default constraint:', error);
            throw error;
        }
    },

    // Create new constraint
    createConstraint: async (constraintData) => {
        try {
            const response = await fetch(`${API_URL}/api/constraints`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(constraintData)
            });
            
            if (!response.ok) {
                throw new Error('Failed to create constraint');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error creating constraint:', error);
            throw error;
        }
    },

    // Update constraint
    updateConstraint: async (id, constraintData) => {
        try {
            const response = await fetch(`${API_URL}/api/constraints/${id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(constraintData)
            });
            
            if (!response.ok) {
                throw new Error('Failed to update constraint');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error updating constraint:', error);
            throw error;
        }
    },

    // Delete constraint
    deleteConstraint: async (id) => {
        try {
            const response = await fetch(`${API_URL}/api/constraints/${id}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete constraint');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error deleting constraint:', error);
            throw error;
        }
    }
};
