// Test script to generate sample timetable data
// Run this in browser console after logging in as admin

async function generateSampleData() {
    try {
        const response = await fetch('http://localhost:3000/api/timetable/sample/generate', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Sample data created successfully:', data);
        return data;
    } catch (error) {
        console.error('Error generating sample data:', error);
        throw error;
    }
}

// Run the function
generateSampleData()
    .then(data => {
        console.log(' Sample timetable created!');
        console.log('Navigate to /admin/amrita-timetable to view it');
    })
    .catch(error => {
        console.error(' Failed to create sample data:', error);
    });
